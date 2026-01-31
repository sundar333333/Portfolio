import { useState, useEffect } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

interface TrailPoint {
  x: number;
  y: number;
  id: string;
}

interface CustomCursorProps {
  isDark?: boolean;
}

const lightTrailColors = [
  "rgba(255, 100, 100, 0.8)",
  "rgba(255, 200, 100, 0.7)",
  "rgba(100, 255, 100, 0.6)",
  "rgba(100, 200, 255, 0.5)",
  "rgba(200, 100, 255, 0.4)",
];

const darkTrailColors = [
  "rgba(100, 50, 50, 0.8)",
  "rgba(150, 100, 50, 0.7)",
  "rgba(50, 100, 50, 0.6)",
  "rgba(50, 100, 150, 0.5)",
  "rgba(100, 50, 150, 0.4)",
];

let globalTrailId = 0;

export function CustomCursor({ isDark = false }: CustomCursorProps) {
  const trailColors = isDark ? darkTrailColors : lightTrailColors;
  const [trail, setTrail] = useState<TrailPoint[]>([]);
  const [isVisible, setIsVisible] = useState(false);
  
  const cursorX = useMotionValue(0);
  const cursorY = useMotionValue(0);
  
  const springConfig = { damping: 25, stiffness: 300 };
  const cursorXSpring = useSpring(cursorX, springConfig);
  const cursorYSpring = useSpring(cursorY, springConfig);

  useEffect(() => {
    const isTouchDevice = "ontouchstart" in window;
    if (isTouchDevice) return;

    const handleMouseMove = (e: MouseEvent) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
      setIsVisible(true);

      globalTrailId += 1;
      const uniqueId = `trail-${globalTrailId}-${Date.now()}`;
      setTrail((prev) => {
        const newTrail = [...prev, { x: e.clientX, y: e.clientY, id: uniqueId }];
        return newTrail.slice(-20);
      });
    };

    const handleMouseLeave = () => {
      setIsVisible(false);
    };

    const handleMouseEnter = () => {
      setIsVisible(true);
    };

    window.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseleave", handleMouseLeave);
    document.addEventListener("mouseenter", handleMouseEnter);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
      document.removeEventListener("mouseenter", handleMouseEnter);
    };
  }, [cursorX, cursorY]);

  useEffect(() => {
    if (trail.length === 0) return;

    const timer = setInterval(() => {
      setTrail((prev) => prev.slice(1));
    }, 30);

    return () => clearInterval(timer);
  }, [trail.length]);

  const isTouchDevice = typeof window !== "undefined" && "ontouchstart" in window;
  if (isTouchDevice) return null;

  return (
    <div
      className="fixed inset-0 pointer-events-none z-[10001]"
      style={{ cursor: "none" }}
      data-testid="custom-cursor-container"
    >
      <style>{`
        * { cursor: none !important; }
      `}</style>

      {trail.map((point, index) => (
        <motion.div
          key={point.id}
          className="absolute rounded-full pointer-events-none"
          initial={{ opacity: 0.8, scale: 1 }}
          animate={{ opacity: 0, scale: 0.3 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          style={{
            left: point.x - 4,
            top: point.y - 4,
            width: 8,
            height: 8,
            background: trailColors[index % trailColors.length],
            boxShadow: `0 0 10px ${trailColors[index % trailColors.length]}`,
          }}
        />
      ))}

      <motion.div
        className="absolute pointer-events-none"
        style={{
          left: cursorXSpring,
          top: cursorYSpring,
          x: "-50%",
          y: "-50%",
          opacity: isVisible ? 1 : 0,
        }}
        data-testid="cursor-main"
      >
        <div
          className={`w-10 h-10 rounded-full border transition-colors duration-300 ${isDark ? 'border-black/30' : 'border-white/30'}`}
          style={{
            background: isDark 
              ? "radial-gradient(circle, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.08) 50%, transparent 70%)"
              : "radial-gradient(circle, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 50%, transparent 70%)",
            backdropFilter: "blur(2px)",
            boxShadow: isDark
              ? "0 0 20px rgba(0,0,0,0.1), inset 0 0 20px rgba(0,0,0,0.05)"
              : "0 0 20px rgba(255,255,255,0.1), inset 0 0 20px rgba(255,255,255,0.05)",
          }}
        />
        <div
          className={`absolute top-1/2 left-1/2 w-2 h-2 -translate-x-1/2 -translate-y-1/2 rounded-full transition-colors duration-300 ${isDark ? 'bg-black/60' : 'bg-white/60'}`}
        />
      </motion.div>
    </div>
  );
}
