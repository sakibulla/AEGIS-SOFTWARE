#!/bin/bash

# AEGIS YOLO Weights Download Script
# Downloads YOLOv3 model files for object detection

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "╔═══════════════════════════════════════╗"
echo "║  AEGIS YOLO Weights Download         ║"
echo "╚═══════════════════════════════════════╝"
echo ""

# Check for wget or curl
if ! command -v wget &> /dev/null && ! command -v curl &> /dev/null; then
    echo "❌ Error: Neither wget nor curl is available."
    echo "   Please install one of them:"
    echo "   - Ubuntu/Debian: sudo apt-get install wget"
    echo "   - macOS: brew install wget"
    echo "   - Or use: brew install curl"
    exit 1
fi

DOWNLOAD_CMD="wget"
if ! command -v wget &> /dev/null; then
    DOWNLOAD_CMD="curl -L -o"
fi

# Function to download file
download_file() {
    local url=$1
    local filename=$2
    local expected_size=$3
    
    echo "📥 Downloading $filename..."
    
    if [ "$DOWNLOAD_CMD" = "wget" ]; then
        if ! wget -q --show-progress "$url" -O "$filename"; then
            echo "❌ Failed to download $filename from $url"
            return 1
        fi
    else
        if ! curl -L -o "$filename" "$url"; then
            echo "❌ Failed to download $filename from $url"
            return 1
        fi
    fi
    
    # Verify file exists
    if [ ! -f "$filename" ]; then
        echo "❌ File $filename was not created"
        return 1
    fi
    
    local file_size=$(stat -f%z "$filename" 2>/dev/null || stat -c%s "$filename" 2>/dev/null)
    echo "✓ Downloaded $filename ($file_size bytes)"
    
    return 0
}

# Download yolov3.cfg
download_file \
    "https://raw.githubusercontent.com/pjreddie/darknet/master/cfg/yolov3.cfg" \
    "yolov3.cfg" \
    "0"

# Download coco.names
download_file \
    "https://raw.githubusercontent.com/pjreddie/darknet/master/data/coco.names" \
    "coco.names" \
    "0"

# Download yolov3.weights (large file ~237MB)
echo ""
echo "⚠️  About to download yolov3.weights (~237MB). This may take a few minutes..."
download_file \
    "https://pjreddie.com/media/files/yolov3.weights" \
    "yolov3.weights" \
    "248007883"

echo ""
echo "╔═══════════════════════════════════════╗"
echo "║  ✓ Download Complete!                ║"
echo "╠═══════════════════════════════════════╣"
echo "║  Files created:                       ║"
echo "║  - yolov3.cfg                        ║"
echo "║  - coco.names                        ║"
echo "║  - yolov3.weights                    ║"
echo "║                                       ║"
echo "║  Ready to run: python yolo_server.py ║"
echo "╚═══════════════════════════════════════╝"
