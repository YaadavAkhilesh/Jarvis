from flask import Flask, request, jsonify
from flask_cors import CORS
import win32api
import os

app = Flask(__name__)
CORS(app) # Allow frontend to communicate

@app.route('/status', methods=['GET'])
def status():
    return jsonify({
        "status": "Online",
        "version": "4.3.0",
        "bridge_ready": True
    })

@app.route('/print', methods=['POST'])
def print_document():
    data = request.json
    file_path = data.get('path', 'test.txt')
    try:
        # Standard Windows Print Command
        win32api.ShellExecute(0, "print", file_path, None, ".", 0)
        return jsonify({"success": True, "message": f"Sent {file_path} to default printer."})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/command', methods=['POST'])
def handle_command():
    # Placeholder for IoT / Smart Home integration
    data = request.json
    command = data.get('cmd')
    print(f"Executing System Command: {command}")
    return jsonify({"success": True, "executed": command})

if __name__ == '__main__':
    print("--------------------------------------------------")
    print(" JARVIS HARDWARE BRIDGE: READY ON PORT 5000")
    print("--------------------------------------------------")
    app.run(host='0.0.0.0', port=5000)
