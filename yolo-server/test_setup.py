#!/usr/bin/env python3
"""
Test script to verify AEGIS YOLO Server setup
Checks all dependencies and model files before starting server
"""

import sys
import os

def check_python_version():
    """Check Python version"""
    version = sys.version_info
    if version.major < 3 or (version.major == 3 and version.minor < 7):
        print(f"❌ Python 3.7+ required (you have {version.major}.{version.minor})")
        return False
    print(f"✓ Python {version.major}.{version.minor}.{version.micro}")
    return True

def check_dependencies():
    """Check if all required packages are installed"""
    dependencies = {
        'flask': 'Flask',
        'cv2': 'OpenCV',
        'numpy': 'NumPy',
        'werkzeug': 'Werkzeug'
    }
    
    all_ok = True
    for module, name in dependencies.items():
        try:
            __import__(module)
            print(f"✓ {name} installed")
        except ImportError:
            print(f"❌ {name} not installed")
            print(f"   Fix: pip install -r requirements.txt")
            all_ok = False
    
    return all_ok

def check_model_files():
    """Check if YOLO model files exist"""
    script_dir = os.path.dirname(os.path.abspath(__file__))
    files_to_check = {
        'yolov3.cfg': 237000,
        'coco.names': 600,
        'yolov3.weights': 248000000
    }
    
    all_ok = True
    for filename, min_size in files_to_check.items():
        filepath = os.path.join(script_dir, filename)
        if os.path.exists(filepath):
            size = os.path.getsize(filepath)
            if size > min_size * 0.8:  # Allow 20% margin
                size_mb = size / (1024 * 1024)
                print(f"✓ {filename} ({size_mb:.1f} MB)")
            else:
                print(f"❌ {filename} exists but too small ({size} bytes)")
                all_ok = False
        else:
            print(f"❌ {filename} not found")
            print(f"   Fix: bash download_yolo_weights.sh")
            all_ok = False
    
    return all_ok

def check_camera():
    """Check if camera is available"""
    try:
        import cv2
        cap = cv2.VideoCapture(0)
        if cap.isOpened():
            ret, _ = cap.read()
            cap.release()
            if ret:
                print("✓ Camera detected")
                return True
            else:
                print("⚠ Camera exists but cannot read frames")
                print("   (This is OK - might be permission issue on macOS)")
                return True
        else:
            print("⚠ No camera detected on index 0")
            print("   (This is OK if you plan to use IP camera)")
            return True
    except Exception as e:
        print(f"⚠ Cannot test camera: {e}")
        return True

def main():
    print("╔═══════════════════════════════════════╗")
    print("║  AEGIS YOLO Server Setup Test         ║")
    print("╚═══════════════════════════════════════╝")
    print()
    
    checks = [
        ("Python Version", check_python_version),
        ("Dependencies", check_dependencies),
        ("Model Files", check_model_files),
        ("Camera", check_camera)
    ]
    
    results = []
    for name, check_func in checks:
        print(f"{name}:")
        try:
            result = check_func()
            results.append((name, result))
        except Exception as e:
            print(f"  Error: {e}")
            results.append((name, False))
        print()
    
    # Summary
    print("╔═══════════════════════════════════════╗")
    passed = sum(1 for _, r in results if r)
    total = len(results)
    
    if passed == total:
        print("║  ✓ All checks passed! Ready to go   ║")
        print("╠═══════════════════════════════════════╣")
        print("║  Run:                                 ║")
        print("║  python yolo_server.py --bot Guardian ║")
        print("╚═══════════════════════════════════════╝")
        return 0
    else:
        print(f"║  {passed}/{total} checks passed                    ║")
        print("╠═══════════════════════════════════════╣")
        print("║  Fix issues above and try again       ║")
        print("╚═══════════════════════════════════════╝")
        return 1

if __name__ == '__main__':
    sys.exit(main())
