import { useEffect, useRef } from "react";

interface PixelEffectProps {
  visible: boolean;
}

interface Pixel {
  x: number;
  y: number;
  size: number;
  opacity: number;
  createdAt: number;
  lifetime: number;
  hue: number;
  lightness: number;
}

export function PixelEffect({ visible }: PixelEffectProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pixelsRef = useRef<Pixel[]>([]);
  const mouseRef = useRef({ x: 0, y: 0, prevX: 0, prevY: 0 });
  const animationRef = useRef<number>(0);
  const lastSpawnRef = useRef(0);

  useEffect(() => {
    if (!visible) {
      pixelsRef.current = [];
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.prevX = mouseRef.current.x;
      mouseRef.current.prevY = mouseRef.current.y;
      mouseRef.current.x = e.clientX;
      mouseRef.current.y = e.clientY;
    };

    window.addEventListener("mousemove", handleMouseMove);

    const spawnPixels = (timestamp: number) => {
      const { x, y, prevX, prevY } = mouseRef.current;
      const dx = x - prevX;
      const dy = y - prevY;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < 1) return;

      const timeSinceLastSpawn = timestamp - lastSpawnRef.current;
      if (timeSinceLastSpawn < 8) return;

      lastSpawnRef.current = timestamp;

      const numPixels = Math.min(Math.floor(distance / 3) + 8, 25);

      for (let i = 0; i < numPixels; i++) {
        const t = Math.random();
        const px = prevX + dx * t;
        const py = prevY + dy * t;

        const size = 12 + Math.random() * 20;
        
        const angle = Math.random() * Math.PI * 2;
        const spreadRadius = 80 + Math.random() * 180;
        const offsetX = Math.cos(angle) * spreadRadius;
        const offsetY = Math.sin(angle) * spreadRadius;
        
        const lifetime = 1200 + Math.random() * 1200;
        const hue = 215 + Math.random() * 20;
        const lightness = 45 + Math.random() * 25;

        pixelsRef.current.push({
          x: px + offsetX,
          y: py + offsetY,
          size,
          opacity: 0.7 + Math.random() * 0.3,
          createdAt: timestamp,
          lifetime,
          hue,
          lightness,
        });
      }

      if (pixelsRef.current.length > 500) {
        pixelsRef.current = pixelsRef.current.slice(-350);
      }
    };

    const easeOutCubic = (t: number): number => {
      return 1 - Math.pow(1 - t, 3);
    };

    const animate = (timestamp: number) => {
      if (!ctx || !visible) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      spawnPixels(timestamp);

      pixelsRef.current = pixelsRef.current.filter((pixel) => {
        const age = timestamp - pixel.createdAt;
        if (age >= pixel.lifetime) return false;

        const progress = age / pixel.lifetime;
        const fadeProgress = easeOutCubic(progress);
        const currentOpacity = pixel.opacity * (1 - fadeProgress);

        if (currentOpacity < 0.01) return false;
        
        ctx.save();
        ctx.globalAlpha = currentOpacity;
        ctx.fillStyle = `hsl(${pixel.hue}, 85%, ${pixel.lightness}%)`;
        
        ctx.fillRect(
          Math.floor(pixel.x / pixel.size) * pixel.size,
          Math.floor(pixel.y / pixel.size) * pixel.size,
          pixel.size - 1,
          pixel.size - 1
        );
        ctx.restore();

        return true;
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(animationRef.current);
    };
  }, [visible]);

  if (!visible) return null;

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-10 pointer-events-none"
      data-testid="pixel-effect-canvas"
    />
  );
}
