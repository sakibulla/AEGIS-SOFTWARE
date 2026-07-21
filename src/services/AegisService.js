// AegisService — connects to your Python Flask / FastAPI backend
// Replace SERVER_URL with your PC's IP on the same Wi-Fi network

const SERVER_URL = 'http://192.168.1.100:5000';   // ← change this

// ─── REST helpers ───────────────────────────────────────────────

export async function fetchBotStatus() {
  const res = await fetch(`${SERVER_URL}/api/bots`);
  return res.json();
}

export async function fetchIncidents() {
  const res = await fetch(`${SERVER_URL}/api/incidents`);
  return res.json();
}

export async function sendBotCommand(botId, command, payload = {}) {
  // command: 'move' | 'stop' | 'mode_autonomous' | 'mode_manual' | 'return_base' | 'ai_scan' | 'share_map' | 'emergency_ping'
  const res = await fetch(`${SERVER_URL}/api/bots/${botId}/command`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ command, ...payload }),
  });
  return res.json();
}

export async function triggerEmergency(type = 'sos') {
  // type: 'sos' | 'fire' | 'police' | 'ambulance'
  const res = await fetch(`${SERVER_URL}/api/emergency`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type }),
  });
  return res.json();
}

export async function fetchMap() {
  // Returns occupancy grid JSON from Pathfinder's SLAM output
  const res = await fetch(`${SERVER_URL}/api/map`);
  return res.json();
}

// ─── WebSocket for live telemetry ───────────────────────────────

export function createSwarmSocket(onMessage) {
  const ws = new WebSocket(`ws://${SERVER_URL.replace('http://', '')}/ws`);

  ws.onopen    = () => console.log('[AEGIS] Swarm socket connected');
  ws.onmessage = (e) => {
    try {
      const data = JSON.parse(e.data);
      onMessage(data);
    } catch (err) {
      console.warn('[AEGIS] Bad socket message', err);
    }
  };
  ws.onerror   = (e) => console.warn('[AEGIS] Socket error', e.message);
  ws.onclose   = ()  => console.log('[AEGIS] Socket closed');

  return ws;
}

// ─── Video stream URL builder ────────────────────────────────────

export function getVideoStreamUrl(botId) {
  // Your Flask server should expose MJPEG streams via OpenCV
  // e.g.  /video/pathfinder  →  MJPEG stream
  return `${SERVER_URL}/video/${botId}`;
}
