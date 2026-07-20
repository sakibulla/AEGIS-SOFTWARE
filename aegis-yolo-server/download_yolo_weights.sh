#!/bin/bash
# Download YOLOv3 weights and configuration files
# Run this script once to download the ~240MB weights file and config

set -e

echo "Downloading YOLOv3 configuration and weights..."

# Create weights directory if it doesn't exist
mkdir -p weights

# Download YOLOv3 config
echo "Downloading yolov3.cfg..."
curl -L -o yolov3.cfg https://raw.githubusercontent.com/pjreddie/darknet/master/cfg/yolov3.cfg
if [ $? -ne 0 ]; then
    echo "Error downloading yolov3.cfg"
    exit 1
fi

# Download COCO names
echo "Downloading coco.names..."
curl -L -o coco.names https://raw.githubusercontent.com/pjreddie/darknet/master/data/coco.names
if [ $? -ne 0 ]; then
    echo "Error downloading coco.names"
    exit 1
fi

# Download YOLOv3 weights (~240MB)
echo "Downloading yolov3.weights (this may take a few minutes)..."
curl -L -o yolov3.weights https://pjreddie.com/media/files/yolov3.weights
if [ $? -ne 0 ]; then
    echo "Error downloading yolov3.weights"
    exit 1
fi

# Verify downloads
if [ -f yolov3.cfg ] && [ -f coco.names ] && [ -f yolov3.weights ]; then
    echo "✓ Download complete!"
    echo "Files saved:"
    ls -lh yolov3.*
else
    echo "Error: Some files are missing"
    exit 1
fi
