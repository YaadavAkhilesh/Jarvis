# JARVIS AI: GITHUB & DEPLOYMENT GUIDE (V4.3)

Sir Akhil, this is your updated blueprint for running the project natively through NPM.

---

## 1. PROJECT STRUCTURE (ROOT)

```text
JarvisAI/ (Root Folder)
├── .env                  <-- [SECRET] Your real API key here
├── .env.example          <-- [PUBLIC] Template for others
├── .gitignore            <-- [SECURITY] Prevents .env from uploading
├── bridge.py             <-- Python Hardware Bridge
├── metadata.json         <-- [SYSTEM] Browser Permissions (Mic/Cam/GPS)
├── index.html            <-- Entry Point
├── index.tsx             <-- React Mounting
├── App.tsx               <-- Jarvis Logic
├── package.json          <-- Node Dependencies
├── start_jarvis.bat      <-- ONE-CLICK START
├── types.ts              <-- TypeScript Definitions
├── vite.config.ts        <-- Environment Config
└── components/           <-- UI Modules
    ├── FaceScanner.tsx
    ├── HUD.tsx
    └── ...
```

---

## 2. THE NEW "ONE-COMMAND" WORKFLOW
You no longer need the `.bat` file. Use the standard NPM workflow:

1. **Install Dependencies** (First time only):
   ```bash
   npm install
   ```

2. **Run Everything**:
   ```bash
   npm run dev
   ```
   *   **What this does**:
       - Runs `init.js` to check for Python and set up your `.env`.
       - Starts the **Hardware Bridge** (Python) on port 5000.
       - Starts the **Jarvis HUD** (Vite) and opens your browser automatically.

---

## 3. GITHUB UPLOAD
Your `.env` and `node_modules` are automatically ignored by Git. To upload:
```bash
git add .
git commit -m "Integrated cross-platform init and concurrent workflow"
git push origin main
```

---

## 4. TROUBLESHOOTING
- **Python Error**: If `npm run dev` says Python is missing, ensure Python is added to your Windows PATH.
- **Port Conflict**: If port 5000 or 5173 is in use, Jarvis will notify you in the terminal.
