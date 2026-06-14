# AEGIS Live Streaming Tasks

## Task 1: Create useStreamUrls Hook
**Status**: not_started

Create `src/hooks/useStreamUrls.js` with:
- State: `{ botId → streamUrl }` map in AsyncStorage under "aegis_stream_urls"
- Load on mount from AsyncStorage
- Export: `{ urls, setUrl, loading }` where `setUrl(botId, url)` updates state and persists
- Export helper: `detectionsUrlFor(streamUrl)` — converts "/video_feed" → "/detections"

## Task 2: Rewrite FeedsScreen
**Status**: not_started
**Dependencies**: Task 1

Replace `src/screens/FeedsScreen.js` with:
- Render feed cards for each bot (pathfinder, guardian, warden) from mockData
- Each card shows bot name, live badge, settings gear icon
- No URL → placeholder (camera-off icon, "No stream URL set")
- Has URL → WebView with MJPEG <img> tag (object-fit: cover)
- Settings icon opens modal (TextInput) to paste/save URL via useStreamUrls
- Tap feed to expand: shows Collapse, Set URL, Reload buttons
- When expanded with URL: poll detections every 1s, display as chips (label + confidence %)
- Bottom section: Stream Status list (bot name, URL or "Tap to set URL", SET/EMPTY badge)
- Info card explaining setup
- Match dark theme from constants/theme.js

## Task 3: Create Python Project Structure
**Status**: not_started

Create directory structure for `aegis-yolo-server/`:
- `requirements.txt` — flask, opencv-python, numpy
- `download_yolo_weights.sh` — bash script to download yolov3.cfg, coco.names, yolov3.weights
- `yolo_server.py` — Flask app with YOLOv3 detection
- `README.md` — setup and usage instructions

## Task 4: Implement YOLO Detection & Streaming
**Status**: not_started
**Dependencies**: Task 3

Implement `aegis-yolo-server/yolo_server.py` with:
- `YoloDetector` class:
  - Load YOLOv3 (cfg, weights, coco.names)
  - `detect(frame)` → list of {label, confidence, box: [x,y,w,h]} (threshold 0.5, NMS 0.4)
  - `draw(frame, detections)` → frame with boxes and labels (person in different color)
- `CameraStream` class (threaded):
  - Read from cv2.VideoCapture(source)
  - Run detection, draw annotations, add HUD (bot name, object count)
  - Store latest frame + detections thread-safely
- Flask app:
  - GET /video_feed → MJPEG stream (multipart/x-mixed-replace)
  - GET /detections → JSON {detections: [{label, confidence}, ...]}
  - GET /health → status check
  - CLI args: --bot, --camera, --port (8000), --host (0.0.0.0)
  - On startup: detect local LAN IP, print formatted box with all URLs
  - Print note to paste /video_feed URL into app

## Task 5: Create Download Script
**Status**: not_started
**Dependencies**: Task 3

Create `aegis-yolo-server/download_yolo_weights.sh`:
- Download yolov3.cfg from pjreddie.com/darknet
- Download coco.names from official source
- Download yolov3.weights from pjreddie.com
- Save all to current directory
- Handle errors gracefully

## Task 6: Create Python Server README
**Status**: not_started
**Dependencies**: Task 5

Create `aegis-yolo-server/README.md` with:
- Setup instructions (install deps, download weights, run command)
- How to paste /video_feed URL into AEGIS app
- Running multiple bots on different ports
- Upgrading to YOLOv8 later (ultralytics package)
- Keep existing Flask structure
