import React, { useEffect, useState, useRef, useCallback } from 'react';

const HAND_CONNECTIONS: [number, number][] = [
  [0, 1], [1, 2], [2, 3], [3, 4], [0, 5], [5, 6], [6, 7], [7, 8], [0, 9], [9, 10], [10, 11], [11, 12],
  [0, 13], [13, 14], [14, 15], [15, 16], [0, 17], [17, 18], [18, 19], [19, 20], [5, 9], [9, 13], [13, 17],
];

interface GestureHUDProps {
  isLocked: boolean;
  cameraEnabled: boolean;
  onGestureDrag?: (dx: number, dy: number) => void;
  onCloseChat?: () => void;
}

const GestureHUD: React.FC<GestureHUDProps> = ({
  isLocked,
  cameraEnabled,
  onGestureDrag,
  onCloseChat,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const handLandmarkerRef = useRef<any>(null);
  const rafRef = useRef<number>(0);
  const lastHandCenterRef = useRef<{ x: number; y: number } | null>(null);
  const lastSwipeTimeRef = useRef(0);
  const [activeHand, setActiveHand] = useState(false);
  const [handLandmarks, setHandLandmarks] = useState<{ x: number; y: number }[][]>([]);
  const isPinchingRef = useRef(false);
  const prevPinchCenterRef = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    if (!cameraEnabled) {
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
      return;
    }
    let mounted = true;
    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: 'user', width: 320, height: 240 } })
      .then((stream) => {
        if (!mounted || !videoRef.current) return;
        streamRef.current = stream;
        videoRef.current.srcObject = stream;
      })
      .catch(() => {});
    return () => {
      mounted = false;
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    };
  }, [cameraEnabled]);

  useEffect(() => {
    if (!cameraEnabled || isLocked) return;
    let cancelled = false;
    const initHands = async () => {
      try {
        const vision = await import('@mediapipe/tasks-vision');
        const HandLandmarker = vision.HandLandmarker;
        const FilesetResolver = vision.FilesetResolver;
        const resolver = await FilesetResolver.forVisionTasks(
          'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
        );
        const landmarker = await HandLandmarker.createFromOptions(resolver, {
          baseOptions: {
            modelAssetPath:
              'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task',
            delegate: 'CPU',
          },
          runningMode: 'VIDEO',
          numHands: 2,
        });
        if (!cancelled) handLandmarkerRef.current = landmarker;
      } catch (_) {
        handLandmarkerRef.current = null;
      }
    };
    initHands();
    return () => {
      cancelled = true;
      handLandmarkerRef.current = null;
    };
  }, [cameraEnabled, isLocked]);

  const drawAndDetect = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const landmarker = handLandmarkerRef.current;
    if (!video || !canvas || !landmarker || video.readyState < 2) {
      rafRef.current = requestAnimationFrame(drawAndDetect);
      return;
    }
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      rafRef.current = requestAnimationFrame(drawAndDetect);
      return;
    }
    const w = video.videoWidth;
    const h = video.videoHeight;
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
    }
    ctx.clearRect(0, 0, w, h);
    let allLandmarks: { x: number; y: number }[][] = [];
    try {
      const result = landmarker.detectForVideo(video, performance.now() * 0.001);
      if (result?.landmarks) {
        for (const hand of result.landmarks) {
          const points = hand.map((l: { x: number; y: number }) => ({ x: l.x * w, y: l.y * h }));
          allLandmarks.push(points);
          ctx.strokeStyle = '#22d3ee';
          ctx.lineWidth = 2;
          ctx.lineCap = 'round';
          for (const [i, j] of HAND_CONNECTIONS) {
            if (hand[i] && hand[j]) {
              ctx.beginPath();
              ctx.moveTo(points[i].x, points[i].y);
              ctx.lineTo(points[j].x, points[j].y);
              ctx.stroke();
            }
          }
          ctx.fillStyle = 'rgba(34, 211, 238, 0.6)';
          for (let i = 0; i < points.length; i++) {
            ctx.beginPath();
            ctx.arc(points[i].x, points[i].y, 3, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }
    } catch (_) {}
    setHandLandmarks(allLandmarks);
    setActiveHand(allLandmarks.length > 0);

    if (allLandmarks.length > 0 && allLandmarks[0].length >= 9) {
      const tips = allLandmarks[0];
      const thumbTip = tips[4];
      const indexTip = tips[8];
      const dist = Math.hypot(thumbTip.x - indexTip.x, thumbTip.y - indexTip.y);
      const pinchThreshold = Math.min(w, h) * 0.08;
      const isPinch = dist < pinchThreshold;
      const center = {
        x: tips.reduce((s, p) => s + p.x, 0) / tips.length,
        y: tips.reduce((s, p) => s + p.y, 0) / tips.length,
      };
      if (isPinch) {
        isPinchingRef.current = true;
        const prev = prevPinchCenterRef.current;
        if (prev && onGestureDrag) {
          const dx = center.x - prev.x;
          const dy = center.y - prev.y;
          if (Math.abs(dx) > 2 || Math.abs(dy) > 2) onGestureDrag(dx, dy);
        }
        prevPinchCenterRef.current = center;
      } else {
        isPinchingRef.current = false;
        prevPinchCenterRef.current = null;
        const now = Date.now();
        const last = lastHandCenterRef.current;
        if (last && onCloseChat) {
          const vx = center.x - last.x;
          if (vx > Math.min(w, h) * 0.15 && now - lastSwipeTimeRef.current > 800) {
            lastSwipeTimeRef.current = now;
            onCloseChat();
          }
        }
        lastHandCenterRef.current = center;
      }
    } else {
      isPinchingRef.current = false;
      prevPinchCenterRef.current = null;
      lastHandCenterRef.current = null;
    }

    rafRef.current = requestAnimationFrame(drawAndDetect);
  }, [onGestureDrag, onCloseChat]);

  useEffect(() => {
    if (!cameraEnabled || isLocked) return;
    rafRef.current = requestAnimationFrame(drawAndDetect);
    return () => cancelAnimationFrame(rafRef.current);
  }, [cameraEnabled, isLocked, drawAndDetect]);

  if (isLocked || !cameraEnabled) return null;

  return (
    <div className="absolute bottom-24 right-10 flex flex-col items-end gap-3 pointer-events-none">
      <div className="flex items-center gap-3">
        <div className="text-right">
          <div className="text-[10px] font-orbitron text-slate-500">KINETIC ENGINE</div>
          <div className={`text-xs font-orbitron ${activeHand ? 'text-emerald-400' : 'text-cyan-500'}`}>
            {activeHand ? 'HAND_DETECTED' : 'SCANNING_GESTURES'}
          </div>
        </div>
        <div
          className={`w-12 h-12 rounded-lg border flex items-center justify-center transition-all duration-300 ${
            activeHand ? 'bg-emerald-500/20 border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.3)]' : 'bg-slate-900 border-slate-700'
          }`}
        >
          <i className={`fa-solid fa-hand-point-up text-xl ${activeHand ? 'text-emerald-400' : 'text-slate-600'}`}></i>
        </div>
      </div>

      <div className="w-48 h-32 bg-slate-950/60 border border-cyan-900/30 rounded-lg overflow-hidden relative">
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover scale-x-[-1]"
        />
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full object-cover scale-x-[-1] pointer-events-none"
          style={{ width: '100%', height: '100%' }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
        <div className="absolute bottom-1 left-2 text-[8px] font-mono text-cyan-500/80">GESTURE HUB • BLUE LINES = HANDS</div>
      </div>
    </div>
  );
};

export default GestureHUD;
