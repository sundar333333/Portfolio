import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface LoadingScreenProps {
  onComplete: () => void;
}

export function LoadingScreen({ onComplete }: LoadingScreenProps) {
  const [progress, setProgress] = useState(1);
  const [isGlitching, setIsGlitching] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    const drawStatic = () => {
      const imageData = ctx.createImageData(canvas.width, canvas.height);
      const data = imageData.data;

      for (let i = 0; i < data.length; i += 4) {
        const noise = Math.random() * 255;
        data[i] = noise;
        data[i + 1] = noise;
        data[i + 2] = noise;
        data[i + 3] = 255;
      }

      ctx.putImageData(imageData, 0, 0);
      animationRef.current = requestAnimationFrame(drawStatic);
    };

    drawStatic();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      cancelAnimationFrame(animationRef.current);
    };
  }, []);

  useEffect(() => {
    if (progress >= 100) {
      setIsGlitching(true);
      setTimeout(() => {
        onComplete();
      }, 800);
      return;
    }

    const timer = setTimeout(() => {
      setProgress((p) => Math.min(p + 1, 100));
    }, 30);

    return () => clearTimeout(timer);
  }, [progress, onComplete]);

  return (
    <AnimatePresence>
      {!isGlitching || progress < 100 ? (
        <motion.div
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black overflow-hidden"
          initial={{ opacity: 1 }}
          exit={{
            opacity: 0,
            scale: 1.1,
            filter: "blur(10px)",
          }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          data-testid="loading-screen"
        >
          <canvas
            ref={canvasRef}
            className="absolute inset-0 opacity-60"
          />
          
          <motion.div
            className="relative z-10 flex flex-col items-center gap-6"
            animate={isGlitching ? {
              x: [0, -5, 5, -3, 3, 0],
              opacity: [1, 0.8, 1, 0.6, 1, 0],
            } : {}}
            transition={{ duration: 0.5 }}
          >
            <motion.h1
              className="font-anton text-4xl md:text-6xl text-white tracking-wider select-none"
              style={{
                textShadow: isGlitching
                  ? "3px 0 #ff0000, -3px 0 #00ff00, 0 3px #0000ff"
                  : "0 0 30px rgba(255,255,255,0.4)",
              }}
              animate={isGlitching ? {
                x: [0, 15, -15, 8, -8, 0],
                y: [0, -3, 3, -2, 2, 0],
                skewX: [0, 8, -8, 4, -4, 0],
                filter: [
                  "hue-rotate(0deg)",
                  "hue-rotate(90deg)",
                  "hue-rotate(-90deg)",
                  "hue-rotate(45deg)",
                  "hue-rotate(0deg)",
                ],
              } : {}}
              transition={{ duration: 0.6 }}
              data-testid="text-searching-signal"
            >
              SEARCHING SIGNAL
            </motion.h1>
            
            <div className="flex items-center gap-4">
              <div className="w-48 h-1 bg-white/20 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-white rounded-full"
                  style={{ width: `${progress}%` }}
                  transition={{ duration: 0.1 }}
                />
              </div>
              <span
                className="font-mono text-white text-xl tabular-nums"
                data-testid="text-progress-counter"
              >
                {progress}%
              </span>
            </div>
          </motion.div>

          <div className="absolute inset-0 pointer-events-none">
            <div
              className="absolute inset-0 opacity-10"
              style={{
                background: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.3) 2px, rgba(0,0,0,0.3) 4px)",
              }}
            />
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
