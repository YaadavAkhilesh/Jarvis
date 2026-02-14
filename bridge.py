"""
JARVIS Hardware Bridge - Flask server for PC control, IoT Mesh, Smart Home, Mobile.
Run: python bridge.py  ->  http://0.0.0.0:5000
Mobile: open http://<PC_IP>:5000/mobile on your phone (same WiFi).
"""
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import os
import sys
import subprocess
import platform

app = Flask(__name__, static_folder=None)
CORS(app)

# In-memory store for PC->Mobile notifications (mobile polls /notifications)
_notifications = []
_app_dir = os.path.dirname(os.path.abspath(__file__))

# ---------------------------------------------------------------------------
# Status & Health
# ---------------------------------------------------------------------------

def _local_ip():
    try:
        import socket
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.settimeout(0)
        s.connect(("10.255.255.255", 1))
        ip = s.getsockname()[0]
        s.close()
        return ip
    except Exception:
        return "localhost"


@app.route('/status', methods=['GET'])
def status():
    return jsonify({
        "status": "Online",
        "version": "4.3.0",
        "bridge_ready": True,
        "mobile_url": f"http://{_local_ip()}:5000/mobile",
    })


# ---------------------------------------------------------------------------
# Print
# ---------------------------------------------------------------------------

@app.route('/print', methods=['POST'])
def print_document():
    data = request.json or {}
    file_path = data.get('path', 'test.txt')
    try:
        if platform.system() == 'Windows':
            try:
                import win32api
                win32api.ShellExecute(0, "print", file_path, None, ".", 0)
            except ImportError:
                subprocess.run(["start", "/wait", "notepad", "/p", file_path], shell=True)
        else:
            subprocess.run(["lp", file_path], check=True)
        return jsonify({"success": True, "message": f"Sent {file_path} to default printer."})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


# ---------------------------------------------------------------------------
# Generic command (legacy)
# ---------------------------------------------------------------------------

@app.route('/command', methods=['POST'])
def handle_command():
    data = request.json or {}
    cmd = data.get('cmd', '')
    if not cmd:
        return jsonify({"success": False, "error": "Missing 'cmd'"}), 400
    try:
        if platform.system() == 'Windows':
            os.system(cmd)
        else:
            subprocess.run(cmd, shell=True)
        return jsonify({"success": True, "executed": cmd})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


# ---------------------------------------------------------------------------
# IoT Mesh / Mobile Control - Run commands, open apps, shutdown
# ---------------------------------------------------------------------------

@app.route('/api/run', methods=['POST'])
def api_run():
    """Run a shell command. Mobile -> PC."""
    data = request.json or {}
    cmd = data.get('command', data.get('cmd', ''))
    if not cmd:
        return jsonify({"success": False, "error": "Missing 'command'"}), 400
    try:
        if platform.system() == 'Windows':
            subprocess.Popen(cmd, shell=True, creationflags=subprocess.CREATE_NO_WINDOW if hasattr(subprocess, 'CREATE_NO_WINDOW') else 0)
        else:
            subprocess.Popen(cmd, shell=True)
        return jsonify({"success": True, "executed": cmd})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@app.route('/api/open', methods=['POST'])
def api_open_app():
    """Open an application by name or path. Mobile -> PC."""
    data = request.json or {}
    app_name = data.get('app', data.get('name', '')).strip()
    if not app_name:
        return jsonify({"success": False, "error": "Missing 'app' or 'name'"}), 400
    try:
        if platform.system() == 'Windows':
            try:
                import win32api
                win32api.ShellExecute(0, "open", app_name, None, ".", 1)
            except ImportError:
                subprocess.Popen(["start", "", app_name], shell=True)
        elif sys.platform == 'darwin':
            subprocess.Popen(["open", "-a", app_name])
        else:
            subprocess.Popen([app_name], shell=True)
        return jsonify({"success": True, "opened": app_name})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@app.route('/api/shutdown', methods=['POST'])
def api_shutdown():
    """Shutdown or restart the PC. Mobile -> PC."""
    data = request.json or {}
    action = (data.get('action') or 'shutdown').lower()
    try:
        if platform.system() == 'Windows':
            if action == 'restart':
                os.system("shutdown /r /t 5")
            else:
                os.system("shutdown /s /t 5")
        elif platform.system() == 'Darwin':
            if action == 'restart':
                os.system("sudo shutdown -r now")
            else:
                os.system("sudo shutdown -h now")
        else:
            if action == 'restart':
                os.system("shutdown -r now")
            else:
                os.system("shutdown -h now")
        return jsonify({"success": True, "action": action})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


# ---------------------------------------------------------------------------
# Smart Home (bridge layer – plug in Tuya/Hue/Arduino later)
# ---------------------------------------------------------------------------

@app.route('/api/smart/home', methods=['GET'])
def api_smart_home_status():
    """Get smart home state (lights, fan, etc.)."""
    return jsonify({
        "lights": False,
        "fan": False,
        "ac": False,
        "bedroom": False,
    })


@app.route('/api/smart/home', methods=['POST'])
def api_smart_home_control():
    """Control smart home. Body: { "lights": true/false, "fan": true/false, ... }."""
    data = request.json or {}
    # Here you would call Tuya/Hue/Arduino APIs. For now we just echo success.
    return jsonify({
        "success": True,
        "lights": data.get('lights'),
        "fan": data.get('fan'),
        "ac": data.get('ac'),
        "bedroom": data.get('bedroom'),
    })


# ---------------------------------------------------------------------------
# PC -> Mobile: Notifications (mobile polls this)
# ---------------------------------------------------------------------------

@app.route('/api/notifications', methods=['GET'])
def api_notifications():
    """Mobile polls this to get pending notifications from PC."""
    global _notifications
    out = list(_notifications)
    _notifications.clear()
    return jsonify({"notifications": out})


@app.route('/api/notifications', methods=['POST'])
def api_send_notification():
    """PC sends a notification to mobile (stored until mobile polls)."""
    data = request.json or {}
    title = data.get('title', 'Jarvis')
    body = data.get('body', '')
    global _notifications
    _notifications.append({"title": title, "body": body})
    return jsonify({"success": True})


# ---------------------------------------------------------------------------
# Mobile web UI – simple control page
# ---------------------------------------------------------------------------

MOBILE_HTML = """
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Jarvis Mobile Control</title>
  <style>
    * { box-sizing: border-box; }
    body { font-family: system-ui; background: #0f172a; color: #e2e8f0; margin: 0; padding: 16px; }
    h1 { color: #22d3ee; font-size: 1.25rem; }
    .card { background: #1e293b; border-radius: 12px; padding: 16px; margin-bottom: 12px; border: 1px solid #334155; }
    input, button { padding: 12px; border-radius: 8px; margin: 4px; font-size: 1rem; }
    input { background: #0f172a; border: 1px solid #475569; color: #e2e8f0; width: 100%; max-width: 280px; }
    button { background: #0891b2; color: #fff; border: none; cursor: pointer; }
    button.danger { background: #dc2626; }
    #log { font-size: 12px; color: #94a3b8; margin-top: 12px; max-height: 200px; overflow-y: auto; }
  </style>
</head>
<body>
  <h1>JARVIS Mobile Control</h1>
  <p>Same WiFi as PC. Commands run on your PC.</p>

  <div class="card">
    <h3>Run command</h3>
    <input type="text" id="cmd" placeholder="e.g. notepad" />
    <button onclick="runCmd()">Run</button>
  </div>

  <div class="card">
    <h3>Open app</h3>
    <input type="text" id="app" placeholder="e.g. chrome, notepad" />
    <button onclick="openApp()">Open</button>
  </div>

  <div class="card">
    <h3>Power</h3>
    <button onclick="shutdown()">Shutdown PC</button>
    <button class="danger" onclick="restart()">Restart PC</button>
  </div>

  <div class="card">
    <h3>Notifications from PC</h3>
    <div id="notifications"></div>
    <button onclick="pollNotifications()">Refresh</button>
  </div>

  <div id="log"></div>

  <script>
    const base = '';
    function log(msg, isErr) {
      const el = document.getElementById('log');
      el.innerHTML = (isErr ? '<span style="color:#f87171">' + msg + '</span>' : msg) + '<br>' + el.innerHTML;
    }
    async function runCmd() {
      const cmd = document.getElementById('cmd').value.trim();
      if (!cmd) return;
      try {
        const r = await fetch(base + '/api/run', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ command: cmd }) });
        const j = await r.json();
        log(j.success ? 'Ran: ' + cmd : 'Error: ' + (j.error || r.status));
      } catch (e) { log('Error: ' + e.message, true); }
    }
    async function openApp() {
      const app = document.getElementById('app').value.trim();
      if (!app) return;
      try {
        const r = await fetch(base + '/api/open', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ app: app }) });
        const j = await r.json();
        log(j.success ? 'Opened: ' + app : 'Error: ' + (j.error || r.status));
      } catch (e) { log('Error: ' + e.message, true); }
    }
    async function shutdown() {
      if (!confirm('Shutdown PC in 5 seconds?')) return;
      try {
        const r = await fetch(base + '/api/shutdown', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'shutdown' }) });
        const j = await r.json();
        log(j.success ? 'Shutdown sent.' : 'Error: ' + (j.error || r.status));
      } catch (e) { log('Error: ' + e.message, true); }
    }
    async function restart() {
      if (!confirm('Restart PC?')) return;
      try {
        const r = await fetch(base + '/api/shutdown', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'restart' }) });
        const j = await r.json();
        log(j.success ? 'Restart sent.' : 'Error: ' + (j.error || r.status));
      } catch (e) { log('Error: ' + e.message, true); }
    }
    async function pollNotifications() {
      try {
        const r = await fetch(base + '/api/notifications');
        const j = await r.json();
        const div = document.getElementById('notifications');
        div.innerHTML = (j.notifications || []).map(n => '<p><b>' + (n.title || '') + '</b> ' + (n.body || '') + '</p>').join('') || '<p>None</p>';
      } catch (e) { log('Notifications error: ' + e.message, true); }
    }
    setInterval(pollNotifications, 5000);
    pollNotifications();
  </script>
</body>
</html>
"""


@app.route('/mobile')
def mobile():
    return MOBILE_HTML, 200, {'Content-Type': 'text/html; charset=utf-8'}


if __name__ == '__main__':
    print("--------------------------------------------------")
    print(" JARVIS BRIDGE: http://0.0.0.0:5000")
    print(" Mobile control: http://<THIS_PC_IP>:5000/mobile")
    print("--------------------------------------------------")
    app.run(host='0.0.0.0', port=5000)
