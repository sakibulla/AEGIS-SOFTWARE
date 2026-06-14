#!/usr/bin/env python3
"""
AEGIS YOLO Vision Server
A Flask-based MJPEG server for YOLOv3 object detection
Streams live video with real-time object detection to AEGIS app
"""

import cv2
import numpy as np
import threading
import argparse
import socket
import os
import sys
from flask import Flask, Response, jsonify
from collections import defaultdict
import time

# =============================================================================
# YOLO DETECTOR CLASS
# =============================================================================

class YoloDetector:
    """YOLOv3 object detector using OpenCV DNN module"""
    
    CONFIDENCE_THRESHOLD = 0.5
    NMS_THRESHOLD = 0.4
    
    def __init__(self, cfg_path, weights_path, names_path):
        """
        Initialize YOLOv3 detector
        
        Args:
            cfg_path: Path to yolov3.cfg
            weights_path: Path to yolov3.weights
            names_path: Path to coco.names
        """
        print(f"Loading YOLO model from {cfg_path} and {weights_path}...")
        
        # Load the network
        self.net = cv2.dnn.readNetFromDarknet(cfg_path, weights_path)
        self.net.setPreferableBackend(cv2.dnn.DNN_BACKEND_OPENCV)
        self.net.setPreferableTarget(cv2.dnn.DNN_TARGET_CPU)
        
        # Load class names
        with open(names_path, 'r') as f:
            self.classes = [line.strip() for line in f.readlines()]
        
        # Get output layer names
        self.layer_names = self.net.getLayerNames()
        self.output_layers = [self.layer_names[i - 1] for i in self.net.getUnconnectedOutLayers()]
        
        # Colors for each class (BGR format)
        np.random.seed(42)
        self.colors = np.random.randint(0, 256, size=(len(self.classes), 3), dtype=np.uint8)
        
        print(f"✓ Loaded {len(self.classes)} object classes")
        print(f"✓ YOLO model ready")
    
    def detect(self, frame):
        """
        Run object detection on a frame
        
        Args:
            frame: Input image (BGR format from OpenCV)
            
        Returns:
            List of detections: [
                {
                    'label': str (class name),
                    'confidence': float (0-1),
                    'box': [x, y, w, h] (pixels)
                },
                ...
            ]
        """
        height, width, channels = frame.shape
        
        # Create blob from image
        blob = cv2.dnn.blobFromImage(
            frame,
            1/255.0,
            (416, 416),
            swapRB=True,
            crop=False
        )
        
        # Forward pass
        self.net.setInput(blob)
        outputs = self.net.forward(self.output_layers)
        
        # Parse detections
        boxes = []
        confidences = []
        class_ids = []
        
        for output in outputs:
            for detection in output:
                scores = detection[5:]
                class_id = np.argmax(scores)
                confidence = scores[class_id]
                
                if confidence > self.CONFIDENCE_THRESHOLD:
                    # Detection box is in normalized coordinates (0-1)
                    center_x = int(detection[0] * width)
                    center_y = int(detection[1] * height)
                    w = int(detection[2] * width)
                    h = int(detection[3] * height)
                    
                    # Convert to top-left corner
                    x = int(center_x - w / 2)
                    y = int(center_y - h / 2)
                    
                    boxes.append([x, y, w, h])
                    confidences.append(float(confidence))
                    class_ids.append(class_id)
        
        # Apply non-maximum suppression
        indices = cv2.dnn.NMSBoxes(boxes, confidences, self.CONFIDENCE_THRESHOLD, self.NMS_THRESHOLD)
        
        # Build detections list
        detections = []
        if len(indices) > 0:
            indices = indices.flatten()
            for i in indices:
                detections.append({
                    'label': self.classes[class_ids[i]],
                    'confidence': confidences[i],
                    'box': boxes[i]
                })
        
        return detections
    
    def draw(self, frame, detections):
        """
        Draw detections on frame
        
        Args:
            frame: Input image (BGR)
            detections: List of detections from detect()
            
        Returns:
            Annotated frame with bounding boxes and labels
        """
        result = frame.copy()
        
        for detection in detections:
            label = detection['label']
            confidence = detection['confidence']
            x, y, w, h = detection['box']
            
            # Choose color - red for person, green for others
            if label == 'person':
                color = (0, 0, 255)  # Red for persons (BGR)
            else:
                color = (0, 255, 0)  # Green for other objects
            
            # Draw bounding box
            cv2.rectangle(result, (x, y), (x + w, y + h), color, 2)
            
            # Prepare text
            text = f"{label}: {confidence:.2%}"
            
            # Get text size for background
            font = cv2.FONT_HERSHEY_SIMPLEX
            font_scale = 0.6
            thickness = 2
            text_size = cv2.getTextSize(text, font, font_scale, thickness)
            text_width = text_size[0][0]
            text_height = text_size[0][1]
            
            # Draw text background
            cv2.rectangle(
                result,
                (x, y - text_height - 10),
                (x + text_width + 10, y),
                color,
                -1
            )
            
            # Draw text
            cv2.putText(
                result,
                text,
                (x + 5, y - 5),
                font,
                font_scale,
                (255, 255, 255),
                thickness
            )
        
        return result


# =============================================================================
# CAMERA STREAM CLASS
# =============================================================================

class CameraStream:
    """Threaded camera stream with YOLOv3 detection"""
    
    def __init__(self, camera_source, bot_name, detector):
        """
        Initialize camera stream
        
        Args:
            camera_source: Camera index (int) or URL (str)
            bot_name: Name of the bot
            detector: YoloDetector instance
        """
        self.camera_source = camera_source
        self.bot_name = bot_name
        self.detector = detector
        
        self.cap = cv2.VideoCapture(camera_source)
        if not self.cap.isOpened():
            raise RuntimeError(f"Failed to open camera source: {camera_source}")
        
        # Set camera properties
        self.cap.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
        self.cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)
        self.cap.set(cv2.CAP_PROP_FPS, 30)
        
        self.frame = None
        self.detections = []
        self.frame_count = 0
        self.fps = 0
        self.lock = threading.Lock()
        self.running = False
        self.thread = None
        
        # Time tracking for FPS
        self.last_time = time.time()
        self.frame_times = []
    
    def start(self):
        """Start the camera stream thread"""
        self.running = True
        self.thread = threading.Thread(target=self._run, daemon=True)
        self.thread.start()
        print("✓ Camera stream started")
    
    def stop(self):
        """Stop the camera stream thread"""
        self.running = False
        if self.thread:
            self.thread.join(timeout=5)
        self.cap.release()
        print("✓ Camera stream stopped")
    
    def _run(self):
        """Main camera stream loop (runs in separate thread)"""
        while self.running:
            ret, frame = self.cap.read()
            if not ret:
                print("Warning: Failed to read frame from camera")
                continue
            
            # Run detection
            detections = self.detector.detect(frame)
            
            # Draw on frame
            annotated = self.detector.draw(frame, detections)
            
            # Add HUD text
            # Top-left: "AEGIS // <BOTNAME>"
            cv2.putText(
                annotated,
                f"AEGIS // {self.bot_name}",
                (10, 30),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.8,
                (0, 255, 255),
                2
            )
            
            # Top-right: object count
            object_count = len(detections)
            count_text = f"Objects: {object_count}"
            text_size = cv2.getTextSize(count_text, cv2.FONT_HERSHEY_SIMPLEX, 0.7, 2)
            text_width = text_size[0][0]
            cv2.putText(
                annotated,
                count_text,
                (annotated.shape[1] - text_width - 10, 30),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.7,
                (0, 255, 255),
                2
            )
            
            # Encode to JPEG
            ret, jpeg = cv2.imencode('.jpg', annotated)
            frame_bytes = jpeg.tobytes()
            
            # Update thread-safe storage
            with self.lock:
                self.frame = frame_bytes
                self.detections = detections
                self.frame_count += 1
                
                # Calculate FPS
                current_time = time.time()
                self.frame_times.append(current_time)
                # Keep only last 30 frames for FPS calculation
                if len(self.frame_times) > 30:
                    self.frame_times.pop(0)
                
                if len(self.frame_times) > 1:
                    fps = len(self.frame_times) / (self.frame_times[-1] - self.frame_times[0])
                    self.fps = fps
    
    def get_frame(self):
        """Get the latest frame as JPEG bytes (thread-safe)"""
        with self.lock:
            return self.frame
    
    def get_detections(self):
        """Get the latest detections list (thread-safe)"""
        with self.lock:
            return self.detections
    
    def get_fps(self):
        """Get current frame rate"""
        with self.lock:
            return self.fps
    
    def get_frame_count(self):
        """Get total frames processed"""
        with self.lock:
            return self.frame_count


# =============================================================================
# UTILITY FUNCTIONS
# =============================================================================

def get_local_ip():
    """
    Detect local LAN IP address (non-loopback, non-127.0.0.1)
    
    Returns:
        str: Local IP address, or "localhost" if detection fails
    """
    try:
        # Create a socket and connect to a public DNS server
        # We don't actually send anything, just use this to determine local IP
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        ip = s.getsockname()[0]
        s.close()
        return ip
    except Exception:
        # Fallback methods
        try:
            hostname = socket.gethostname()
            ip = socket.gethostbyname(hostname)
            if ip != "127.0.0.1":
                return ip
        except Exception:
            pass
        return "localhost"


def print_startup_banner(bot_name, host, port, local_ip):
    """Print formatted startup information banner"""
    
    # Determine the actual host for URLs
    if host == "0.0.0.0":
        url_host = local_ip
    else:
        url_host = host
    
    video_feed_url = f"http://{url_host}:{port}/video_feed"
    detections_url = f"http://{url_host}:{port}/detections"
    health_url = f"http://{url_host}:{port}/health"
    
    banner = f"""
╔═══════════════════════════════════════════════════════════╗
║  AEGIS YOLO Vision Server                                ║
║  Bot: {bot_name:<44} ║
║  Local IP: {local_ip:<40} ║
╠═══════════════════════════════════════════════════════════╣
║                                                           ║
║  /video_feed:                                            ║
║  {video_feed_url:<53} ║
║                                                           ║
║  /detections:                                            ║
║  {detections_url:<53} ║
║                                                           ║
║  /health:                                                ║
║  {health_url:<53} ║
║                                                           ║
╠═══════════════════════════════════════════════════════════╣
║  📱 AEGIS App Integration:                               ║
║                                                           ║
║  1. Open AEGIS app                                       ║
║  2. Go to Feeds screen                                   ║
║  3. Tap gear icon on a feed                              ║
║  4. Paste the /video_feed URL above                      ║
║  5. Stream will appear live                              ║
║                                                           ║
╠═══════════════════════════════════════════════════════════╣
║  🤖 Running Multiple Bots:                               ║
║                                                           ║
║  Terminal 1:                                             ║
║  python yolo_server.py --bot Pathfinder --port 8000      ║
║                                                           ║
║  Terminal 2:                                             ║
║  python yolo_server.py --bot Guardian --port 8001        ║
║                                                           ║
║  Terminal 3:                                             ║
║  python yolo_server.py --bot Warden --port 8002          ║
║                                                           ║
║  Each server runs independently on different ports       ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
"""
    print(banner)


# =============================================================================
# FLASK APPLICATION
# =============================================================================

def create_app(bot_name, camera_source, host, port, detector, camera_stream):
    """Create and configure Flask application"""
    app = Flask(__name__)
    
    @app.route('/video_feed')
    def video_feed():
        """MJPEG video stream endpoint"""
        def generate():
            while True:
                frame = camera_stream.get_frame()
                if frame is None:
                    continue
                
                yield (b'--frame\r\n'
                       b'Content-Type: image/jpeg\r\n'
                       b'Content-Length: ' + str(len(frame)).encode() + b'\r\n\r\n'
                       + frame + b'\r\n')
        
        return Response(
            generate(),
            mimetype='multipart/x-mixed-replace; boundary=frame'
        )
    
    @app.route('/detections')
    def detections():
        """Get latest object detections as JSON"""
        dets = camera_stream.get_detections()
        
        # Remove box field from detections for API response
        api_detections = [
            {
                'label': d['label'],
                'confidence': d['confidence']
            }
            for d in dets
        ]
        
        return jsonify({
            'detections': api_detections,
            'count': len(api_detections)
        })
    
    @app.route('/health')
    def health():
        """Health check endpoint"""
        return jsonify({
            'status': 'ok',
            'bot': bot_name,
            'frame_rate': round(camera_stream.get_fps(), 2),
            'frames_processed': camera_stream.get_frame_count()
        })
    
    return app


# =============================================================================
# MAIN
# =============================================================================

def main():
    parser = argparse.ArgumentParser(
        description='AEGIS YOLO Vision Server - Real-time object detection',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python yolo_server.py
  python yolo_server.py --bot Guardian --camera 0 --port 8000
  python yolo_server.py --bot Pathfinder --camera 1 --port 8001
  python yolo_server.py --camera "http://192.168.1.100:8080/video"
        """
    )
    
    parser.add_argument('--bot', type=str, default='BotName',
                        help='Name of the bot (default: BotName)')
    parser.add_argument('--camera', default='0',
                        help='Camera source: index (0, 1, ...) or URL (default: 0)')
    parser.add_argument('--port', type=int, default=8000,
                        help='Port to run server on (default: 8000)')
    parser.add_argument('--host', type=str, default='0.0.0.0',
                        help='Host to bind to (default: 0.0.0.0)')
    
    args = parser.parse_args()
    
    # Convert camera to int if it's a number
    try:
        camera_source = int(args.camera)
    except ValueError:
        camera_source = args.camera
    
    # Check for required YOLO files
    script_dir = os.path.dirname(os.path.abspath(__file__))
    cfg_path = os.path.join(script_dir, 'yolov3.cfg')
    weights_path = os.path.join(script_dir, 'yolov3.weights')
    names_path = os.path.join(script_dir, 'coco.names')
    
    for path, name in [(cfg_path, 'yolov3.cfg'), (weights_path, 'yolov3.weights'), (names_path, 'coco.names')]:
        if not os.path.exists(path):
            print(f"❌ Error: {name} not found at {path}")
            print(f"   Run: bash download_yolo_weights.sh")
            sys.exit(1)
    
    print("╔═══════════════════════════════════════╗")
    print("║  AEGIS YOLO Vision Server             ║")
    print("║  Initializing...                      ║")
    print("╚═══════════════════════════════════════╝")
    print()
    
    # Initialize detector
    try:
        detector = YoloDetector(cfg_path, weights_path, names_path)
    except Exception as e:
        print(f"❌ Error loading YOLO model: {e}")
        sys.exit(1)
    
    # Initialize camera stream
    try:
        camera_stream = CameraStream(camera_source, args.bot, detector)
        camera_stream.start()
    except Exception as e:
        print(f"❌ Error initializing camera stream: {e}")
        sys.exit(1)
    
    # Get local IP
    local_ip = get_local_ip()
    
    # Create Flask app
    app = create_app(args.bot, camera_source, args.host, args.port, detector, camera_stream)
    
    # Print startup banner
    print_startup_banner(args.bot, args.host, args.port, local_ip)
    
    try:
        print(f"🚀 Starting Flask server on {args.host}:{args.port}...")
        app.run(host=args.host, port=args.port, threaded=True, debug=False)
    except KeyboardInterrupt:
        print("\n\n👋 Shutting down...")
        camera_stream.stop()
        sys.exit(0)
    except Exception as e:
        print(f"❌ Server error: {e}")
        camera_stream.stop()
        sys.exit(1)


if __name__ == '__main__':
    main()
