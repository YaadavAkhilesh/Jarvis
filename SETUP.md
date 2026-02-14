# JARVIS Setup

## Why "Neural connection failure" or features don't work

1. **Voice & text chat (Gemini)**  
   Add your Google Gemini API key so the app can talk to the AI.
   - Create a `.env` file in the project root (copy from `.env.example`).
   - Set `VITE_API_KEY=your_key_here` (get a key at https://aistudio.google.com/).
   - Restart the dev server after changing `.env`.

2. **Print, mobile control, smart home (Bridge)**  
   The Flask bridge must be running for:
   - **Print:** "Jarvis print report.pdf"
   - **Mobile control:** Run commands, open apps, shutdown PC from phone
   - **Smart home:** Lights/fan (and future IoT APIs)

   Start the bridge:
   ```bash
   python bridge.py
   ```
   Then open the app; the bridge runs at `http://localhost:5000`.  
   Optional: set `VITE_BRIDGE_URL=http://your-pc-ip:5000` in `.env` if the frontend runs on another device.

## Gesture Hub

- Turn on the **camera** (video icon in the header).
- Your hand appears with **blue skeleton lines** in the Gesture Hub panel.
- **Pinch** (thumb + index close) and move your hand → **drags the System Logs Console**.
- **Swipe right** (open palm, quick move right) → **closes the Text Chat** panel.

## IoT Mesh / Mobile

- In the sidebar, click **IoT Mesh** to expand.
- Open the shown URL on your phone (same WiFi as the PC), e.g. `http://192.168.x.x:5000/mobile`.
- From the mobile page you can: run commands, open apps, shutdown/restart PC, and see notifications sent from the PC.

## Smart home

- Voice: "Jarvis turn on lights", "Jarvis turn off fan", etc.
- Text chat: same commands in English or Hinglish.
- The bridge has `/api/smart/home`; you can later connect Tuya, Philips Hue, or Arduino there.
