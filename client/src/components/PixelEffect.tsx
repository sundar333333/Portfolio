import { useEffect, useRef } from "react";

interface PixelEffectProps {
  visible: boolean;
}

interface Pixel {
  gridX: number;
  gridY: number;
  opacity: number;
  createdAt: number;
  lifetime: number;
  hue: number;
  lightness: number;
}

const PIXEL_SIZE = 24;

export function PixelEffect({ visible }: PixelEffectProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pixelMapRef = useRef<Map<string, Pixel>>(new Map());
  const mouseRef = useRef({ x: 0, y: 0, prevX: 0, prevY: 0 });
  const animationRef = useRef<number>(0);

  useEffect(() => {
    if (!visible) {
      pixelMapRef.current.clear();
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
      mouseRef.current.x = e.clientX;
      mouseRef.current.y = e.clientY;
    };

    window.addEventListener("mousemove", handleMouseMove);

    const getGridKey = (gx: number, gy: number) => `${gx},${gy}`;

    const spawnPixels = (timestamp: number) => {
      const { x, y, prevX, prevY } = mouseRef.current;
      const dx = x - prevX;
      const dy = y - prevY;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < 3) return;

      mouseRef.current.prevX = x;
      mouseRef.current.prevY = y;

      const centerGridX = Math.floor(x / PIXEL_SIZE);
      const centerGridY = Math.floor(y / PIXEL_SIZE);

      const radius = 4;

      const currentCount = pixelMapRef.current.size;
      
      for (let offsetX = -radius; offsetX <= radius; offsetX++) {
        for (let offsetY = -radius; offsetY <= radius; offsetY++) {
          const dist = Math.sqrt(offsetX * offsetX + offsetY * offsetY);
          if (dist > radius) continue;

          if (Math.random() > 0.4) continue;

          const gx = centerGridX + offsetX;
          const gy = centerGridY + offsetY;
          const key = getGridKey(gx, gy);

          if (!pixelMapRef.current.has(key)) {
            const hue = 210 + Math.random() * 25;
            const lightness = 40 + Math.random() * 30;
            
            const globalOrder = pixelMapRef.current.size;
            const baseLifetime = 200;
            const lifetime = baseLifetime + globalOrder * 15;

            pixelMapRef.current.set(key, {
              gridX: gx,
              gridY: gy,
              opacity: 0.85,
              createdAt: timestamp,
              lifetime,
              hue,
              lightness,
            });
          }
        }
      }
    };

    const easeOutCubic = (t: number): number => {
      return 1 - Math.pow(1 - t, 3);
    };

    const animate = (timestamp: number) => {
      if (!ctx || !visible) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      spawnPixels(timestamp);

      const sortedPixels = Array.from(pixelMapRef.current.entries())
        .sort((a, b) => a[1].createdAt - b[1].createdAt);

      for (const [key, pixel] of sortedPixels) {
        const age = timestamp - pixel.createdAt;
        
        if (age >= pixel.lifetime) {
          pixelMapRef.current.delete(key);
          continue;
        }

        const progress = age / pixel.lifetime;
        const fadeProgress = easeOutCubic(progress);
        const currentOpacity = pixel.opacity * (1 - fadeProgress);

        if (currentOpacity < 0.01) {
          pixelMapRef.current.delete(key);
          continue;
        }

        ctx.save();
        ctx.globalAlpha = currentOpacity;
        ctx.fillStyle = `hsl(${pixel.hue}, 80%, ${pixel.lightness}%)`;

        ctx.fillRect(
          pixel.gridX * PIXEL_SIZE,
          pixel.gridY * PIXEL_SIZE,
          PIXEL_SIZE - 1,
          PIXEL_SIZE - 1
        );
        ctx.restore();
      }

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
