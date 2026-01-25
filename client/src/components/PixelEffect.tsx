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
  offsetX: number;
  offsetY: number;
  hue: number;
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

      if (distance < 2) return;

      const timeSinceLastSpawn = timestamp - lastSpawnRef.current;
      if (timeSinceLastSpawn < 16) return;

      lastSpawnRef.current = timestamp;

      const numPixels = Math.min(Math.floor(distance / 8) + 1, 5);

      for (let i = 0; i < numPixels; i++) {
        const t = i / numPixels;
        const px = prevX + dx * t;
        const py = prevY + dy * t;

        const size = 4 + Math.random() * 4;
        const offsetX = (Math.random() - 0.5) * 20;
        const offsetY = (Math.random() - 0.5) * 20;
        const lifetime = 1000 + Math.random() * 1000;
        const hue = 210 + Math.random() * 30;

        pixelsRef.current.push({
          x: px + offsetX,
          y: py + offsetY,
          size,
          opacity: 0.9,
          createdAt: timestamp,
          lifetime,
          offsetX,
          offsetY,
          hue,
        });
      }

      if (pixelsRef.current.length > 300) {
        pixelsRef.current = pixelsRef.current.slice(-200);
      }
    };

    const easeOutQuad = (t: number): number => {
      return 1 - (1 - t) * (1 - t);
    };

    const animate = (timestamp: number) => {
      if (!ctx || !visible) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      spawnPixels(timestamp);

      pixelsRef.current = pixelsRef.current.filter((pixel) => {
        const age = timestamp - pixel.createdAt;
        if (age >= pixel.lifetime) return false;

        const progress = age / pixel.lifetime;
        const fadeProgress = easeOutQuad(progress);
        pixel.opacity = 0.9 * (1 - fadeProgress);

        const jitter = Math.sin(timestamp * 0.01 + pixel.x) * 0.5;
        
        ctx.save();
        ctx.globalAlpha = pixel.opacity;
        ctx.fillStyle = `hsl(${pixel.hue}, 90%, 55%)`;
        
        ctx.fillRect(
          pixel.x + jitter,
          pixel.y + jitter,
          pixel.size,
          pixel.size
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
