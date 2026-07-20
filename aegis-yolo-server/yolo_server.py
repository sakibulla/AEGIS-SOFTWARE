#!/usr/bin/env python3
"""
AEGIS YOLO Vision Server
Streams MJPEG video with real-time YOLOv3 object detection
"""

import cv2
import numpy as np
import threading
import json
import socket
import argparse
from io import BytesIO
from flask import Flask, Response, jsonify
import time


class YoloDetector:
    """YOLOv3 object detection wrapper"""

    def __init__(self, config_path='yolov3.cfg', weights_path='yolov3.weights', names_path='coco.names'):
        """Initialize YOLO detector with config, weights, and class names"""
        try:
            print("[YOLO] Loading network...")
            self.net = cv2.dnn.readNetFromDarknet(config_path, weights_path)
            self.net.setPreferableBackend(cv2.dnn.DNN_BACKEND_CPU)
            
            # Load class names
            with open(names_path, 'r') as f:
                self.classes = [line.strip() for line in f.readlines()]
            
            print(f"[YOLO] Loaded {len(self.classes)} classes")
        except FileNotFoundError as e:
            print(f"[ERROR] YOLO file not found: {e}")
            print("Run download_yolo_weights.sh first")
            raise

    def detect(self, frame, confidence_threshold=0.5, nms_threshold=0.4):
        """
        Run detection on frame
        Returns list of {label, confidence, box: [x, y, w, h]}
        """
        h, w, _ = frame.shape
        blob = cv2.dnn.blobFromImage(frame, 1/255.0, (416, 416), swapRB=True, crop=False)
        
        self.net.setInput(blob)
        outputs = self.net.forward(self.net.getUnconnectedOutLayersNames())
        
        boxes = []
        confidences = []
        class_ids = []
        
        for output in outputs:
            for detection in output:
                scores = detection[5:]
                class_id = np.argmax(scores)
                confidence = scores[class_id]
                
                if confidence > confidence_threshold:
                    box = detection[:4] * np.array([w, h, w, h])
                    x, y, w_box, h_box = box.astype('int')
                    
                    boxes.append([max(0, x), max(0, y), int(w_box), int(h_box)])
                    confidences.append(float(confidence))
                    class_ids.append(class_id)
        
        # NMS
        indices = cv2.dnn.NMSBoxes(boxes, confidences, confidence_threshold, nms_threshold)
        
        detections = []
        if len(indices) > 0:
            for i in indices.flatten():
                detections.append({
                    'label': self.classes[class_ids[i]],
                    'confidence': confidences[i],
                    'box': boxes[i]
                })
        
        return detections

    def draw(self, frame, detections):
        """Draw bounding boxes and labels on frame"""
        h, w, _ = frame.shape
        
        for det in detections:
            x, y, w_box, h_box = det['box']
            label = det['label']
            conf = det['confidence']
            
            # Different color for 'person'
            color = (0, 255, 0) if label == 'person' else (0, 255, 255)  # BGR
            
            # Draw box
            cv2.rectangle(frame, (x, y), (x + w_box, y + h_box), color, 2)
            
            # Draw label
            text = f"{label} {conf:.2f}"
            font = cv2.FONT_HERSHEY_SIMPLEX
            font_scale = 0.5
            thickness = 1
            text_size = cv2.getTextSize(text, font, font_scale, thickness)[0]
            
            cv2.rectangle(frame, (x, y - text_size[1] - 4), 
                         (x + text_size[0], y), color, -1)
            cv2.putText(frame, text, (x, y - 2), font, font_scale, (0, 0, 0), thickness)
        
        return frame


class CameraStream:
    """Threaded camera stream with detection"""

    def __init__(self, detector, camera_source=0, bot_name="YOLO-Bot"):
        self.detector = detector
        self.bot_name = bot_name
        self.cap = cv2.VideoCapture(camera_source)
        
        if not self.cap.isOpened():
            raise RuntimeError(f"Failed to open camera: {camera_source}")
        
        # Set camera properties
        self.cap.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
        self.cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)
        self.cap.set(cv2.CAP_PROP_FPS, 30)
        
        self.lock = threading.Lock()
        self.frame = None
        self.detections = []
        self.running = False
        self.thread = None

    def update(self):
        """Background thread: read frames and run detection"""
        while self.running:
            ret, frame = self.cap.read()
            if not ret:
                print("[STREAM] Camera read error, restarting...")
                continue
            
            # Run detection
            detections = self.detector.detect(frame)
            
            # Draw annotations
            annotated = self.detector.draw(frame.copy(), detections)
            
            # Add HUD: bot name + object count
            text = f"{self.bot_name} | Detected: {len(detections)}"
            cv2.putText(annotated, text, (10, 30), cv2.FONT_HERSHEY_SIMPLEX,
                       0.7, (0, 255, 255), 2)
            
            # Store frame and detections thread-safely
            with self.lock:
                self.frame = annotated
                self.detections = detections

    def start(self):
        """Start background thread"""
        if not self.running:
            self.running = True
            self.thread = threading.Thread(target=self.update, daemon=True)
            self.thread.start()
            print(f"[STREAM] Started capture thread for {self.bot_name}")

    def stop(self):
        """Stop background thread"""
        self.running = False
        if self.thread:
            self.thread.join()
        self.cap.release()

    def get_frame_jpg(self):
        """Get current frame as JPEG bytes"""
        with self.lock:
            if self.frame is None:
                return None
            ret, buffer = cv2.imencode('.jpg', self.frame)
            return buffer.tobytes() if ret else None

    def get_detections(self):
        """Get current detections"""
        with self.lock:
            return self.detections.copy()


# Flask app
app = Flask(__name__)
stream = None


def get_local_ip():
    """Detect local LAN IP"""
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        ip = s.getsockname()[0]
        s.close()
        return ip
    except Exception:
        return "127.0.0.1"


@app.route('/video_feed')
def video_feed():
    """MJPEG video stream endpoint"""
    def generate():
        while True:
            frame_jpg = stream.get_frame_jpg()
            if frame_jpg is None:
                time.sleep(0.01)
                continue
            
            yield (b'--frame\r\n'
                   b'Content-Type: image/jpeg\r\n'
                   b'Content-Length: ' + str(len(frame_jpg)).encode() + b'\r\n\r\n'
                   + frame_jpg + b'\r\n')
    
    return Response(generate(), mimetype='multipart/x-mixed-replace; boundary=frame')


@app.route('/detections')
def detections():
    """JSON detections endpoint"""
    dets = stream.get_detections()
    return jsonify({
        'detections': [
            {
                'label': d['label'],
                'confidence': d['confidence'],
                'box': d['box']
            }
            for d in dets
        ]
    })


@app.route('/health')
def health():
    """Health check endpoint"""
    return jsonify({
        'status': 'ok',
        'bot': stream.bot_name if stream else 'unknown'
    })


def main():
    global stream
    
    parser = argparse.ArgumentParser(description='AEGIS YOLO Vision Server')
    parser.add_argument('--bot', default='bot-1', help='Bot name (default: bot-1)')
    parser.add_argument('--camera', type=int, default=0, help='Camera index (default: 0)')
    parser.add_argument('--port', type=int, default=8000, help='Port (default: 8000)')
    parser.add_argument('--host', default='0.0.0.0', help='Host (default: 0.0.0.0)')
    
    args = parser.parse_args()
    
    try:
        print("[INIT] Initializing YOLO detector...")
        detector = YoloDetector()
        
        print(f"[INIT] Starting camera stream for {args.bot}...")
        stream = CameraStream(detector, camera_source=args.camera, bot_name=args.bot)
        stream.start()
        
        # Print setup info
        local_ip = get_local_ip()
        video_url = f"http://{local_ip}:{args.port}/video_feed"
        det_url = f"http://{local_ip}:{args.port}/detections"
        
        print("\n" + "="*60)
        print("✓ AEGIS YOLO Server Started")
        print("="*60)
        print(f"Bot Name:      {args.bot}")
        print(f"Local IP:      {local_ip}")
        print(f"Port:          {args.port}")
        print(f"\nStream URLs:")
        print(f"  Video Feed:  {video_url}")
        print(f"  Detections:  {det_url}")
        print(f"  Health:      http://{local_ip}:{args.port}/health")
        print("\nPaste this URL into the AEGIS app:")
        print(f"  {video_url}")
        print("="*60 + "\n")
        
        app.run(host=args.host, port=args.port, threaded=True)
        
    except KeyboardInterrupt:
        print("\n[SHUTDOWN] Received interrupt...")
    except Exception as e:
        print(f"[ERROR] {e}")
        raise
    finally:
        if stream:
            stream.stop()
        print("[SHUTDOWN] Server stopped.")


if __name__ == '__main__':
    main()
