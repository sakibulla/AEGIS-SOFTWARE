# AEGIS Live Camera Streaming & Object Detection

## Overview
Add live MJPEG video streaming with YOLOv3 object detection to the AEGIS React Native app. Users configure per-bot stream URLs from a standalone Python vision server, view live feeds, and see real-time object detections.

## Architecture
- **Frontend**: React Native (Expo) — hooks for URL persistence, FeedsScreen with live streaming UI
- **Backend**: Python Flask + OpenCV + YOLOv3 — standalone vision server with MJPEG streaming and detection JSON endpoints

## Key Features
1. Per-bot stream URL management (AsyncStorage persistence)
2. MJPEG video rendering via WebView
3. Real-time object detection polling and display
4. YOLOv3-powered detection server with multi-bot support
5. Dark theme integration with existing design system

## Requirements Met
✓ React hook for stream URL state management and persistence
✓ FeedsScreen UI with feed cards, URL configuration modal, expanded view
✓ Detection polling and chip display
✓ Stream status list and info card
✓ Python Flask server with YOLOv3 detection
✓ MJPEG streaming endpoint
✓ Detection JSON endpoint
✓ Multi-bot CLI support with local IP detection
✓ All existing code unchanged
