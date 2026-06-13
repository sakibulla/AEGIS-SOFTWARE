# A.E.G.I.S. Mobile App

**Autonomous Emergency Ground Intelligence Swarm — React Native (Expo)**

A real-time mobile command center for managing autonomous ground robot swarms with live telemetry, video feeds, SLAM mapping, and emergency control capabilities.

---

## Table of Contents

- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Connecting to the Python Backend](#connecting-to-the-python-backend)
- [Screens](#screens)
- [Available Commands](#available-commands)
- [Troubleshooting](#troubleshooting)
- [Next Steps](#next-steps)

---

## Prerequisites

Before you begin, ensure you have the following installed on your system:

- **Node.js** (v16 or higher) — [Download](https://nodejs.org/)
- **npm** (comes with Node.js) or **yarn**
- **Expo CLI** — Install globally with: `npm install -g expo-cli`
- **Git** (optional, for version control)

### For Mobile Testing:
- **Expo Go app** — Download from [App Store](https://apps.apple.com/app/expo-go/id1079144686) or [Google Play](https://play.google.com/store/apps/details?id=host.exp.exponent)
- **Android Emulator** or **iOS Simulator** (for desktop testing)
- Same Wi-Fi network as your development machine (for Expo Go)

---

## Installation

### 1. Clone or Download the Project

```bash
git clone <repository-url>
cd aegis-app
```

Or if you already have the project folder, navigate to it:

```bash
cd c:\Projects\aegis-app
```

### 2. Install Dependencies

```bash
npm install
```

This will install all required packages listed in `package.json`, including:
- React Native & Expo framework
- Navigation libraries (React Navigation)
- Native modules (Maps, Gesture Handler, Reanimated)
- Icon library (Expo Vector Icons)

### 3. Verify Installation

Check that Expo is properly set up:

```bash
npx expo --version
```

---

## Getting Started

### Quick Start (5 minutes)

```bash
# Start the Expo development server
npm start
```

This will display a QR code and menu options:

```
› Metro waiting on port 8081.
› Using Expo Go
› To run the app with a development build or custom Expo client, follow the instructions here: https://docs.expo.dev/development-client/installation
› Press 's' to switch to development build.
› Press 'a' to open Android
› Press 'i' to open iOS
› Press 'w' to open web
› Press 'c' to clear cache
› Press 'q' to quit
```

### Option 1: Test on Your Phone (Recommended for Development)

1. Install **Expo Go** app on your phone (iOS or Android)
2. Ensure your phone and computer are on the **same Wi-Fi network**
3. From the Expo menu, press **'s'** to display the QR code
4. Open Expo Go and tap **Scan QR Code**
5. Point your phone camera at the QR code
6. The app will load on your phone in real-time

**Live Reload**: Any changes to your code will automatically reload on your phone.

### Option 2: Test on Android Emulator

```bash
npm run android
```

Or from the Expo menu, press **'a'**

Requirements:
- Android Studio installed with emulator configured
- Emulator running before you start Expo

### Option 3: Test on iOS Simulator (macOS Only)

```bash
npm run ios
```

Or from the Expo menu, press **'i'**

### Option 4: Test in Web Browser

```bash
npm run web
```

Or from the Expo menu, press **'w'**

⚠️ **Note**: Some React Native APIs (Maps, Video) may have limited support in the web version.

---

---

## Project Structure

```
aegis-app/
├── App.js                          ← Main entry point
├── package.json                    ← Dependencies & scripts
├── src/
│   ├── screens/
│   │   ├── DashboardScreen.js      ← Home — swarm overview, alerts, incident log
│   │   ├── MapScreen.js            ← Live SLAM occupancy map + bot positions
│   │   ├── FeedsScreen.js          ← Live video feeds (OpenCV MJPEG)
│   │   └── ControlScreen.js        ← Manual RC D-pad + quick commands
│   ├── components/
│   │   └── SwarmUI.js              ← Reusable UI: BotCard, AlertBanner, IncidentRow…
│   ├── navigation/
│   │   └── AppNavigator.js         ← Bottom tab navigation setup
│   ├── services/
│   │   └── AegisService.js         ← REST + WebSocket client for backend
│   └── constants/
│       ├── theme.js                ← Colors, typography, spacing tokens
│       └── mockData.js             ← Mock bot/alert/incident data
└── .expo/                          ← Expo configuration
```

### File Descriptions

| File | Purpose |
|------|---------|
| `App.js` | Entry point; wraps the app with SafeAreaProvider and StatusBar |
| `AppNavigator.js` | Bottom tab navigation connecting all screens |
| `DashboardScreen.js` | Overview of all bots, alerts, and incidents |
| `MapScreen.js` | SLAM occupancy grid visualization with bot positions |
| `FeedsScreen.js` | Real-time MJPEG video streams from swarm bots |
| `ControlScreen.js` | Manual RC control D-pad and telemetry display |
| `SwarmUI.js` | Reusable UI components (cards, banners, rows) |
| `AegisService.js` | Backend API client (REST + WebSocket) |
| `theme.js` | Design tokens (colors, fonts, spacing) |
| `mockData.js` | Placeholder data for development |

## Connecting to the Python Backend

The app communicates with a Python backend (Flask/FastAPI) for swarm control and telemetry. Follow these steps:

### Step 1: Find Your Local IP Address

On **Windows**, open Command Prompt and run:

```bash
ipconfig
```

Look for "IPv4 Address" under your Wi-Fi adapter (e.g., `192.168.x.x`).

### Step 2: Update the Server URL

Open `src/services/AegisService.js` and update the `SERVER_URL`:

```javascript
const SERVER_URL = 'http://192.168.1.100:5000';  // Replace with your IP
```

Make sure:
- Your phone/emulator and PC are on the **same Wi-Fi network**
- The Python backend is running on port 5000 (or update accordingly)
- The firewall allows connections to port 5000

### Step 3: Backend API Endpoints

Your Flask/FastAPI server should expose these endpoints:

| Endpoint | Method | Purpose | Expected Response |
|----------|--------|---------|-------------------|
| `/api/bots` | GET | Fetch all bot status & telemetry | `{ bots: [...] }` |
| `/api/incidents` | GET | Fetch incident log | `{ incidents: [...] }` |
| `/api/bots/:id/command` | POST | Send movement/mode command | `{ status: "success" }` |
| `/api/emergency` | POST | Trigger emergency services | `{ status: "active" }` |
| `/api/map` | GET | Fetch SLAM occupancy grid | `{ gridData: [...] }` |
| `/video/:botId` | GET | MJPEG stream (OpenCV) | Binary video stream |
| `ws://…/ws` | WebSocket | Live telemetry updates | Real-time JSON telemetry |

### Example Backend Command Format

```python
# POST /api/bots/bot-001/command
{
  "command": "move",
  "direction": "forward",
  "speed": 0.8
}
```

---

## Available Commands

### npm Scripts

```bash
npm start       # Start Expo development server
npm run android # Start Expo on Android emulator
npm run ios     # Start Expo on iOS simulator
npm run web     # Start Expo web version
```

### Expo CLI Commands (During Development)

While `npm start` is running:

| Key | Action |
|-----|--------|
| `a` | Open Android Emulator |
| `i` | Open iOS Simulator |
| `w` | Open Web Browser |
| `s` | Show QR Code |
| `c` | Clear cache |
| `r` | Reload app |
| `q` | Quit |

---

## Screens

| Screen | Purpose | Key Features |
|--------|---------|--------------|
| **Dashboard** | Central command hub | Bot status cards, active alerts, swarm statistics, incident log, SOS button |
| **Map** | Spatial awareness | SVG occupancy grid from SLAM, real-time bot positions, navigation overlay |
| **Feeds** | Visual monitoring | MJPEG video streams from all bots, per-feed controls, resolution/quality settings |
| **Control** | Manual operation | Per-bot D-pad RC, speed slider, quick command buttons, live telemetry display |

### Navigation

The app uses **bottom tab navigation**. Swipe or tap tabs to switch between screens:

```
┌─ Dashboard ─ Map ─ Feeds ─ Control ─┐
└──────────────────────────────────────┘
```

---

## Troubleshooting

### Common Issues

#### 1. "Cannot find module 'expo'"
**Solution**: Run `npm install` again to ensure all dependencies are installed.

```bash
npm install
```

#### 2. Metro server crashes on startup
**Solution**: Clear cache and restart:

```bash
npm start -- --clear
```

Or manually clear cache:

```bash
rm -rf node_modules/.expo
npm start
```

#### 3. App won't load on phone
**Solution**: 
- Ensure phone and PC are on the **same Wi-Fi network**
- Check if your PC's firewall allows Expo connections (port 8081)
- Try using your computer's IP address instead of `localhost` in `AegisService.js`

#### 4. Cannot connect to backend server
**Solution**:
- Verify your Python backend is running
- Check your local IP address with `ipconfig` (Windows) or `ifconfig` (macOS/Linux)
- Ensure the backend is listening on `0.0.0.0` (all interfaces), not just `localhost`
- Test the backend with Postman or curl:
  ```bash
  curl http://192.168.1.100:5000/api/bots
  ```

#### 5. Video feeds not loading
**Solution**:
- Ensure OpenCV server is running on backend
- Check MJPEG stream URL: `http://192.168.1.100:5000/video/bot-001`
- Verify CORS is enabled on backend for video routes

#### 6. WebSocket connection fails
**Solution**:
- Change WebSocket URL in `AegisService.js` from `ws://` to `wss://` if using HTTPS
- Ensure backend WebSocket server is running
- Check browser console for connection errors

### Debug Mode

Enable verbose logging by modifying `src/services/AegisService.js`:

```javascript
const DEBUG = true; // Set to true for console logs
```

---

## Next Steps

### Phase 1: Core Integration
- [ ] Replace `mockData.js` with real API calls
- [ ] Wire WebSocket live telemetry updates into each screen
- [ ] Test MJPEG video stream rendering

### Phase 2: Enhanced Features
- [ ] Add Expo AV or WebView for video fallbacks
- [ ] Implement PDF report export (incidents → backend ReportLab)
- [ ] Add push notifications for emergency alerts (Expo Notifications)

### Phase 3: Polish
- [ ] Add dedicated Alerts screen with full incident history
- [ ] Implement gesture controls (swipe to navigate, pinch-to-zoom on map)
- [ ] Add data persistence (local storage for offline incidents)
- [ ] Performance optimization (memoization, lazy loading)
