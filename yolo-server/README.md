# AEGIS YOLO Vision Server

A Flask-based MJPEG server for real-time YOLOv3 object detection. Streams live video with object detection to the AEGIS mobile app for multi-bot coordination and monitoring.

## Features

- **Real-time Object Detection**: YOLOv3-based detection with 80 object classes
- **MJPEG Streaming**: Low-latency video stream suitable for mobile apps
- **Multi-Bot Support**: Run multiple servers on different ports for coordinated fleet operations
- **REST API**: `/detections` endpoint for programmatic access
- **Thread-Safe**: Concurrent frame processing and API requests
- **Easy Integration**: Simple paste-and-play URL integration with AEGIS app

## Prerequisites

- **Python 3.7+**
- **pip** (Python package manager)
- **wget** or **curl** (for downloading model weights)

Supported systems:
- macOS (Intel or Apple Silicon)
- Linux (Ubuntu, Debian, etc.)
- Windows (with WSL or Python 3.7+ installed)

## Setup Instructions

### 1. Install Dependencies

```bash
pip install -r requirements.txt
```

This installs:
- `flask` - Web server framework
- `opencv-python` - Computer vision and camera access
- `numpy` - Numerical array operations
- `Werkzeug` - WSGI utilities (included with Flask)

### 2. Download YOLO Model Files

The model weights are large (~237MB) and must be downloaded separately:

```bash
bash download_yolo_weights.sh
```

This script downloads three files:
- `yolov3.cfg` - Model configuration (~237 KB)
- `coco.names` - Class names file (~625 B)
- `yolov3.weights` - Pre-trained weights (~237 MB)

**Note**: First download may take 5-10 minutes depending on connection speed.

**Troubleshooting download script:**
- If you get "command not found: wget", the script will fall back to `curl`
- On macOS, install wget: `brew install wget`
- On Linux, install wget: `sudo apt-get install wget`

### 3. Verify Installation

Confirm all files exist in the yolo-server directory:

```bash
ls -la yolov3.cfg coco.names yolov3.weights
```

You should see:
```
yolov3.cfg       (237 KB)
coco.names       (625 B)
yolov3.weights   (237 MB)
```

## Running the Server

### Basic Usage

Start the server with default settings:

```bash
python yolo_server.py
```

This will:
- Use webcam (camera 0) as input
- Name the bot "BotName"
- Run on localhost:8000
- Print startup information with URLs

### With Custom Options

```bash
python yolo_server.py --bot Guardian --camera 0 --port 8000 --host 0.0.0.0
```

**Available Arguments:**

| Argument | Default | Description |
|----------|---------|-------------|
| `--bot` | `BotName` | Name of the bot (appears in UI) |
| `--camera` | `0` | Camera source (see Camera Sources below) |
| `--port` | `8000` | Port to run server on |
| `--host` | `0.0.0.0` | Host to bind to (0.0.0.0 = all interfaces) |

### Expected Output

```
╔═══════════════════════════════════════════════════════════╗
║  AEGIS YOLO Vision Server                                ║
║  Bot: Guardian                                            ║
║  Local IP: 192.168.1.45                                   ║
╠═══════════════════════════════════════════════════════════╣
║                                                           ║
║  /video_feed:                                            ║
║  http://192.168.1.45:8000/video_feed                     ║
║                                                           ║
║  /detections:                                            ║
║  http://192.168.1.45:8000/detections                     ║
║                                                           ║
║  /health:                                                ║
║  http://192.168.1.45:8000/health                         ║
║                                                           ║
╠═══════════════════════════════════════════════════════════╣
║  📱 AEGIS App Integration: [Instructions...]             ║
║  🤖 Running Multiple Bots: [Instructions...]             ║
╚═══════════════════════════════════════════════════════════╝

🚀 Starting Flask server on 0.0.0.0:8000...
```

## How to Use with AEGIS App

### Quick Start

1. **Run the server:**
   ```bash
   python yolo_server.py --bot Guardian
   ```

2. **Note the `/video_feed` URL** from the startup output (e.g., `http://192.168.1.45:8000/video_feed`)

3. **In AEGIS App:**
   - Open the app on your mobile device
   - Navigate to **Feeds** screen
   - Select a feed
   - Tap the **gear icon** (settings)
   - Paste the `/video_feed` URL into the feed URL field
   - The live stream with object detection will appear

4. **Verify it's working:**
   - You should see live video with bounding boxes
   - Object counts appear in the top-right corner
   - Bot name appears in the top-left corner

### API Endpoints

The server provides three endpoints:

#### 1. `/video_feed` - MJPEG Video Stream

**URL:** `http://<IP>:<PORT>/video_feed`

**Response:** MJPEG stream (multipart/x-mixed-replace)

**Use:** Paste this URL into AEGIS app's feed settings

**Example:**
```
http://192.168.1.45:8000/video_feed
```

#### 2. `/detections` - Current Object Detections

**URL:** `http://<IP>:<PORT>/detections`

**Method:** GET

**Response:**
```json
{
  "detections": [
    {
      "label": "person",
      "confidence": 0.95
    },
    {
      "label": "car",
      "confidence": 0.87
    }
  ],
  "count": 2
}
```

**Use:** Query this endpoint to get detected objects programmatically

#### 3. `/health` - Server Health Check

**URL:** `http://<IP>:<PORT>/health`

**Method:** GET

**Response:**
```json
{
  "status": "ok",
  "bot": "Guardian",
  "frame_rate": 28.5,
  "frames_processed": 1450
}
```

**Use:** Monitor server status and performance

## Camera Sources

### Local Webcam

Use the camera index (0 for built-in webcam):

```bash
python yolo_server.py --camera 0
```

### USB Camera

If you have a USB camera connected as a second device:

```bash
python yolo_server.py --camera 1
```

Multiple cameras:
```bash
python yolo_server.py --camera 2  # Third camera
```

### Network Camera / IP Camera

Use the RTSP or HTTP stream URL:

```bash
python yolo_server.py --camera "http://192.168.1.100:8080/video"
```

Or with RTSP:
```bash
python yolo_server.py --camera "rtsp://192.168.1.100:554/stream"
```

### Discover Available Cameras

**On Linux/macOS:**
```bash
ls /dev/video*
```

**On macOS with FFmpeg:**
```bash
ffmpeg -f avfoundation -list_devices true -i "" 2>&1 | grep "^\[" | grep -i camera
```

**On Windows with Python:**
```python
import cv2
for i in range(10):
    cap = cv2.VideoCapture(i)
    if cap.isOpened():
        print(f"Camera {i}: Available")
        cap.release()
```

## Running Multiple Bots

To run a coordinated fleet of bots, start multiple servers on different ports:

### Terminal 1 - Pathfinder (Scout)
```bash
python yolo_server.py --bot Pathfinder --camera 0 --port 8000
```

### Terminal 2 - Guardian (Leader)
```bash
python yolo_server.py --bot Guardian --camera 1 --port 8001
```

### Terminal 3 - Warden (Guard)
```bash
python yolo_server.py --bot Warden --camera 2 --port 8002
```

Each server:
- Runs independently
- Has its own camera source
- Streams on a different port
- Can be added to AEGIS app separately

**In AEGIS App:**
- Add each `/video_feed` URL to a different feed
- Each feed shows the video from that bot
- Coordinate actions across all bots in real-time

## Troubleshooting

### "Cannot find yolov3.weights"
**Solution:** Run the download script:
```bash
bash download_yolo_weights.sh
```

### Camera not detected
**Check if camera is available:**
```bash
# Linux/macOS
ls /dev/video*

# Or test with OpenCV
python -c "import cv2; cap = cv2.VideoCapture(0); print(cap.isOpened())"
```

**On macOS**, grant camera permissions:
1. System Preferences → Security & Privacy → Camera
2. Add Terminal or your IDE to allowed apps

### Slow performance / Low FPS
**Optimization tips:**
1. **Lower input resolution:** Server already uses 640x480
2. **Increase confidence threshold:** Edit `CONFIDENCE_THRESHOLD` in `yolo_server.py` (default: 0.5)
   - Higher values (0.7-0.9) = fewer detections, faster
   - Lower values (0.3-0.4) = more detections, slower
3. **Increase NMS threshold:** Edit `NMS_THRESHOLD` (default: 0.4)
   - Higher values = fewer duplicate boxes, faster
4. **Use GPU:** If available, change DNN backend:
   ```python
   self.net.setPreferableBackend(cv2.dnn.DNN_BACKEND_CUDA)  # NVIDIA GPU
   ```

### "Connection refused" or "Network unreachable"
1. Ensure server is running
2. Check IP address from startup banner
3. Ensure device can reach the IP (same network)
4. Check firewall isn't blocking the port
5. Try `http://localhost:8000/health` from same machine

### Frame rate drops while streaming
- This is normal under heavy load
- Network bandwidth limits MJPEG streaming
- Can reduce impact by:
  - Lowering JPEG quality (edit `yolo_server.py`)
  - Running on 5GHz WiFi or wired connection
  - Reducing number of concurrent streams

### YOLO model takes long to load
- This is normal on first run (~30 seconds)
- Model is cached in memory after that
- If loading fails, check:
  - Disk space (need ~500MB free)
  - File permissions: `chmod 644 yolov3.weights`
  - OpenCV/NumPy installation: `python -c "import cv2; import numpy; print('OK')"`

## Performance Specifications

### Typical Performance (Intel i7, GPU-less)
- **FPS:** 10-15 FPS at 640x480
- **Latency:** ~100ms per frame
- **Memory:** ~800MB for Python process
- **Detectable Classes:** 80 (COCO dataset)

### Performance Factors
1. **Input Resolution:** Higher = slower but more detail
2. **Confidence Threshold:** Higher = faster but misses detections
3. **Hardware:** GPU (CUDA/OpenCL) significantly faster than CPU
4. **Network:** MJPEG streaming bandwidth limited to network speed

## Object Classes Detected

YOLOv3 trained on COCO dataset can detect 80 object classes:

**People & Animals:**
- person, bicycle, car, motorcycle, airplane, bus, train, truck, boat, traffic light, fire hydrant, stop sign, parking meter, bench, cat, dog, horse, sheep, cow, elephant, bear, zebra, giraffe

**Vehicles & Transport:**
- backpack, umbrella, handbag, tie, suitcase, frisbee, skis, snowboard, sports ball, kite, baseball bat, baseball glove, skateboard, surfboard, tennis racket, bottle, wine glass, cup, fork, knife, spoon, bowl, banana, apple, sandwich, orange, broccoli, carrot, hot dog, pizza, donut, cake, chair, couch, potted plant, bed, dining table, toilet, tv, laptop, mouse, remote, keyboard, microwave, oven, toaster, sink, refrigerator, book, clock, vase, scissors, teddy bear, hair drier, toothbrush

## Future: Upgrading to YOLOv8

This server uses YOLOv3 with OpenCV DNN module for compatibility and ease of setup. YOLOv8 from Ultralytics is newer and faster but requires different setup.

### Why YOLOv3 for This Project
- **Compatible:** Works with standard OpenCV (no special dependencies)
- **Stable:** Well-tested, mature codebase
- **Simple:** No Python version constraints

### Upgrading to YOLOv8 (Future)

When you're ready to upgrade:

1. **Install ultralytics:**
   ```bash
   pip install ultralytics
   ```

2. **Update YoloDetector class:**
   ```python
   from ultralytics import YOLO
   
   class YoloDetector:
       def __init__(self):
           self.model = YOLO('yolov8m.pt')  # Auto-downloads
       
       def detect(self, frame):
           results = self.model(frame)
           detections = []
           for r in results:
               for box in r.boxes:
                   detections.append({
                       'label': self.model.names[int(box.cls)],
                       'confidence': float(box.conf),
                       'box': [int(x) for x in box.xywh[0]]
                   })
           return detections
   ```

3. **Benefits of YOLOv8:**
   - Simpler API (no manual blob conversion)
   - Automatic NMS
   - ~30% faster inference
   - Better accuracy

4. **Flask endpoints remain the same** - no app changes needed!

## Dependencies & Licenses

### Software Dependencies
- **Flask** - BSD License
- **OpenCV** - Apache 2 License
- **NumPy** - BSD License
- **Werkzeug** - BSD License

### Models & Data
- **YOLOv3** - Model by [Joseph Redmon and Ali Farhadi](https://pjreddie.com/darknet/yolo/)
- **COCO Dataset** - [Microsoft Common Objects in Context](https://cocodataset.org/) - CC BY 4.0 License

## Contributing

To improve this project:

1. Test with different cameras and networks
2. Report issues on the AEGIS project repository
3. Submit pull requests for enhancements

## Support

For issues or questions:
1. Check Troubleshooting section above
2. Review logs from Flask server output
3. Check AEGIS app repository for integration issues
4. Verify network connectivity between devices

---

**Made for AEGIS** - Real-time multi-bot coordination and monitoring
