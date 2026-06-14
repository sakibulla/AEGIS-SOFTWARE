# AEGIS YOLO Server - Project Index

## 📖 Documentation Files

Start here based on your needs:

### 🚀 **New to the Project?**
→ Read **[SETUP_GUIDE.md](SETUP_GUIDE.md)** (5 min read)
- Quick 3-step setup
- Feature overview
- Configuration examples

### 📚 **Need Complete Documentation?**
→ Read **[README.md](README.md)** (20 min read)
- Full setup instructions
- API reference
- Troubleshooting guide
- Performance optimization
- Multi-bot deployment
- Future upgrade path

### 🏗️ **Want Architecture Details?**
→ Read **[PROJECT_SUMMARY.md](PROJECT_SUMMARY.md)** (15 min read)
- Architecture overview
- Component descriptions
- Technical specifications
- Design decisions
- Data flow diagrams

---

## 📂 Source Code Files

### 🎯 **Main Application**
**[yolo_server.py](yolo_server.py)** (~600 lines)
- YoloDetector class - Object detection
- CameraStream class - Threaded streaming
- Flask web server - REST endpoints
- Command-line interface
- Startup configuration

**Key Classes:**
```python
YoloDetector(cfg_path, weights_path, names_path)
CameraStream(camera_source, bot_name, detector)
Flask app with routes: /video_feed, /detections, /health
```

### 🛠️ **Setup & Testing**
**[download_yolo_weights.sh](download_yolo_weights.sh)** (~90 lines)
- Downloads YOLOv3 model files (~237MB)
- Validates downloads
- Error handling

Run once:
```bash
bash download_yolo_weights.sh
```

**[test_setup.py](test_setup.py)** (~130 lines)
- Verifies all dependencies
- Checks model files
- Tests camera
- Provides helpful errors

Run to verify setup:
```bash
python test_setup.py
```

### 📦 **Dependencies**
**[requirements.txt](requirements.txt)**
- Flask 2.3.3
- opencv-python 4.8.1.78
- NumPy 1.24.3
- Werkzeug 2.3.7

Install with:
```bash
pip install -r requirements.txt
```

---

## 🚀 Quick Start

### 1️⃣ Setup (One time)
```bash
# Install dependencies
pip install -r requirements.txt

# Download model files (~237MB, takes 5-10 min)
bash download_yolo_weights.sh

# Verify setup (optional)
python test_setup.py
```

### 2️⃣ Start Server
```bash
# Basic start (uses webcam, default port 8000)
python yolo_server.py

# With options
python yolo_server.py --bot Guardian --camera 0 --port 8000
```

### 3️⃣ Integrate with AEGIS App
1. Note the `/video_feed` URL from server output
2. Open AEGIS app → Feeds screen
3. Select a feed → Tap gear icon
4. Paste the URL
5. Live video appears!

---

## 📊 File Overview

| File | Lines | Purpose | Notes |
|------|-------|---------|-------|
| yolo_server.py | ~600 | Main application | Core functionality |
| download_yolo_weights.sh | ~90 | Model downloader | Run once |
| test_setup.py | ~130 | Setup verification | Optional |
| requirements.txt | 4 | Dependencies | pip install |
| README.md | 400+ | Full documentation | Reference |
| SETUP_GUIDE.md | 200+ | Quick start guide | For beginners |
| PROJECT_SUMMARY.md | 300+ | Architecture details | For developers |
| .gitignore | 40 | Git configuration | Ignores large files |
| INDEX.md | This file | Navigation guide | Quick reference |

**Total:** 1,760+ lines of production-ready code and documentation

---

## 🎯 Common Tasks

### Run with Built-in Webcam
```bash
python yolo_server.py --bot MyBot
```

### Run with USB Camera
```bash
python yolo_server.py --bot MyBot --camera 1
```

### Run with IP Camera
```bash
python yolo_server.py --bot MyBot --camera "http://192.168.1.100:8080/video"
```

### Run on Different Port
```bash
python yolo_server.py --port 8001
```

### Run Multiple Bots
```bash
# Terminal 1
python yolo_server.py --bot Scout --camera 0 --port 8000

# Terminal 2
python yolo_server.py --bot Guard --camera 1 --port 8001

# Terminal 3
python yolo_server.py --bot Warden --camera 2 --port 8002
```

### Test Detection Endpoint
```bash
curl http://localhost:8000/detections
```

### Test Health Endpoint
```bash
curl http://localhost:8000/health
```

---

## 🔍 API Reference

### /video_feed
MJPEG video stream
- **URL:** `http://<IP>:<PORT>/video_feed`
- **Method:** GET
- **Returns:** MJPEG stream (multipart/x-mixed-replace)
- **Use:** Paste into AEGIS app feeds

### /detections
Current object detections
- **URL:** `http://<IP>:<PORT>/detections`
- **Method:** GET
- **Returns:** JSON with detected objects and confidence scores
- **Example:**
```json
{
  "detections": [
    {"label": "person", "confidence": 0.95},
    {"label": "car", "confidence": 0.87}
  ],
  "count": 2
}
```

### /health
Server health and metrics
- **URL:** `http://<IP>:<PORT>/health`
- **Method:** GET
- **Returns:** Server status, FPS, frames processed
- **Example:**
```json
{
  "status": "ok",
  "bot": "Guardian",
  "frame_rate": 12.5,
  "frames_processed": 1450
}
```

---

## 🎓 Understanding the Code

### Data Flow
```
Camera → CameraStream (threaded) → Detection → Drawing → JPEG Encoding
    ↓                                                           ↓
   Thread-Safe Storage ← Flask Routes → MJPEG/JSON → Network → AEGIS App
```

### Key Classes

**YoloDetector**
- Loads model from yolov3.cfg and yolov3.weights
- `detect(frame)` - runs inference, returns detections
- `draw(frame, detections)` - annotates frame

**CameraStream**
- Runs in background thread
- `start()` - begins streaming
- `get_frame()` - returns latest JPEG
- `get_detections()` - returns latest detections
- `get_fps()` - returns current frame rate

**Flask Routes**
- `/video_feed` - MJPEG stream
- `/detections` - JSON detections
- `/health` - server health

---

## 🚨 Troubleshooting

### Model files not found
```bash
bash download_yolo_weights.sh
```

### Camera not detected
```bash
python test_setup.py
```

### Can't connect to server
- Verify server is running
- Check IP from startup banner
- Ensure firewall allows port 8000

### Low frame rate
- Increase confidence threshold
- Reduce input resolution
- Use GPU if available

See **README.md** for complete troubleshooting.

---

## 🔗 Useful Resources

- **OpenCV Documentation:** https://docs.opencv.org
- **YOLOv3 Paper:** https://pjreddie.com/darknet/yolo/
- **COCO Dataset:** https://cocodataset.org/
- **Flask Documentation:** https://flask.palletsprojects.com/
- **MJPEG Streaming:** https://en.wikipedia.org/wiki/Motion_JPEG

---

## 📋 Checklist for First Run

- [ ] Python 3.7+ installed
- [ ] `pip install -r requirements.txt` completed
- [ ] `bash download_yolo_weights.sh` completed
- [ ] `python test_setup.py` passes all checks
- [ ] Webcam or camera connected
- [ ] `python yolo_server.py --bot Guardian` runs
- [ ] Server output shows local IP and URLs
- [ ] `/video_feed` URL pasted into AEGIS app
- [ ] Live video appears in app

---

## ✅ Project Status

✅ Complete and production-ready
- Core functionality implemented
- All documentation included
- Error handling in place
- Multi-bot support working
- Performance optimized
- Ready to deploy

---

## 📞 Getting Help

1. **Quick questions?** → Check SETUP_GUIDE.md
2. **Technical details?** → Read README.md
3. **Architecture questions?** → See PROJECT_SUMMARY.md
4. **Setup issues?** → Run test_setup.py
5. **Integration issues?** → Check README.md Troubleshooting

---

**Made for AEGIS** - Real-time multi-bot coordination and monitoring

Last updated: 2024
