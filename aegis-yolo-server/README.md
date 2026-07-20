# AEGIS YOLO Vision Server

Real-time YOLOv3 object detection with MJPEG video streaming for the AEGIS mobile dashboard.

## Quick Start

### 1. Install Dependencies

```bash
pip install -r requirements.txt
```

### 2. Download YOLOv3 Weights

```bash
bash download_yolo_weights.sh
```

This downloads the ~240MB YOLOv3 weights file and configuration. Run this once.

### 3. Start the Server

```bash
python yolo_server.py --bot pathfinder --camera 0 --port 8000
```

Replace `pathfinder` with your bot name (e.g., `guardian`, `warden`).

### 4. Copy Stream URL to App

Once the server starts, you'll see:

```
✓ AEGIS YOLO Server Started
======================================================
Bot Name:      pathfinder
Local IP:      192.168.1.100
Port:          8000

Stream URLs:
  Video Feed:  http://192.168.1.100:8000/video_feed
  Detections:  http://192.168.1.100:8000/detections
======================================================
```

Copy the **Video Feed URL** and paste it into the AEGIS app:

1. Open the app
2. Tap the ⚙ icon on a feed card
3. Paste the URL
4. Save — you'll see live video + detections

## Running Multiple Bots

Each robot gets a different port:

```bash
# Robot 1 - Pathfinder
python yolo_server.py --bot pathfinder --camera 0 --port 8000 &

# Robot 2 - Guardian
python yolo_server.py --bot guardian --camera 1 --port 8001 &

# Robot 3 - Warden
python yolo_server.py --bot warden --camera 2 --port 8002 &
```

Then in the app, set URLs for each bot:
- Pathfinder: `http://192.168.1.100:8000/video_feed`
- Guardian: `http://192.168.1.100:8001/video_feed`
- Warden: `http://192.168.1.100:8002/video_feed`

## API Endpoints

### `GET /video_feed`
MJPEG video stream. Point your WebView at this URL.

### `GET /detections`
JSON array of detected objects:

```json
{
  "detections": [
    {
      "label": "person",
      "confidence": 0.95,
      "box": [100, 150, 50, 80]
    }
  ]
}
```

### `GET /health`
Health check:

```json
{
  "status": "ok",
  "bot": "pathfinder"
}
```

## Command-Line Options

```bash
python yolo_server.py [options]

  --bot NAME       Bot name displayed in HUD (default: bot-1)
  --camera INDEX   Camera index (default: 0)
  --port PORT      Server port (default: 8000)
  --host HOST      Bind host (default: 0.0.0.0)
```

## Troubleshooting

### Camera Not Found

```
RuntimeError: Failed to open camera: 0
```

- Check camera index: `--camera 0`, `--camera 1`, etc.
- Verify camera is not in use by another app
- On Linux, check permissions: `sudo usermod -aG video $USER`

### YOLO Files Missing

```
FileNotFoundError: [Errno 2] No such file or directory: 'yolov3.weights'
```

Run the download script:
```bash
bash download_yolo_weights.sh
```

### Slow Frame Rate

- Reduce resolution: Set lower camera resolution in `yolo_server.py`
- Use lower confidence threshold: Adjust in `detect()` method
- Run on GPU (if available): Add `self.net.setPreferableBackend(cv2.dnn.DNN_BACKEND_CUDA)`

### Can't Reach Server from App

- Verify local IP: `ipconfig` (Windows) or `ifconfig` (Linux/Mac)
- Check firewall allows port 8000
- Ensure phone/emulator is on same network as server
- Test URL in browser first: `http://<server-ip>:8000/health`

## Upgrading to YOLOv8

To use the newer YOLOv8 (Ultralytics), install and modify:

```bash
pip install ultralytics
```

Then update `yolo_server.py`:

```python
from ultralytics import YOLO

class YoloDetector:
    def __init__(self):
        self.model = YOLO('yolov8n.pt')  # nano model
    
    def detect(self, frame, confidence_threshold=0.5):
        results = self.model(frame)
        detections = []
        for result in results:
            for box in result.boxes:
                if box.conf[0] > confidence_threshold:
                    detections.append({
                        'label': result.names[int(box.cls[0])],
                        'confidence': float(box.conf[0]),
                        'box': box.xywh[0].tolist()
                    })
        return detections
```

The Flask app structure stays the same.

## Architecture

```
Camera
  ↓
[CameraStream] (threaded)
  ├→ cv2.VideoCapture
  ├→ YoloDetector.detect()
  ├→ YoloDetector.draw()
  └→ Store frame + detections
       ↓
[Flask Routes]
  ├→ /video_feed (MJPEG)
  ├→ /detections (JSON)
  └→ /health
       ↓
[Mobile App] (React Native)
  ├→ WebView (MJPEG stream)
  ├→ fetch() /detections (every 1s)
  └→ Display live video + detection chips
```

## Performance Notes

- **YOLOv3**: ~50ms per frame on CPU, ~10ms on GPU
- **Video encoding**: ~30ms (MJPEG JPEG compression)
- **Network latency**: 10–50ms (LAN)
- **Total latency**: ~100–130ms (CPU), ~50–80ms (GPU)

For best performance:
- Use dedicated GPU or edge TPU
- Reduce video resolution to 480p
- Increase detection threshold (fewer detections = faster)

## License

Part of the A.E.G.I.S. project.

---

Questions? Check main repo README or open an issue.
