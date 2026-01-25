import { useEffect, useRef, useState } from "react";

interface PixelEffectProps {
  visible: boolean;
  backgroundColor?: string;
}

export function PixelEffect({ visible, backgroundColor = "#0066FF" }: PixelEffectProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const targetRef = useRef({ x: 0, y: 0 });
  const animationRef = useRef<number>(0);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    if (!visible) {
      setIsActive(false);
      return;
    }

    const handleMouseMove = (e: MouseEvent) => {
      targetRef.current.x = e.clientX;
      targetRef.current.y = e.clientY;
      setIsActive(true);
    };

    const handleMouseLeave = () => {
      setIsActive(false);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [visible]);

  useEffect(() => {
    if (!visible || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const pixelSize = 20;
    const effectRadius = 150;
    const innerRadius = 40;

    const animate = () => {
      if (!ctx || !visible) return;

      mouseRef.current.x += (targetRef.current.x - mouseRef.current.x) * 0.15;
      mouseRef.current.y += (targetRef.current.y - mouseRef.current.y) * 0.15;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (!isActive) {
        animationRef.current = requestAnimationFrame(animate);
        return;
      }

      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;

      const startX = Math.max(0, Math.floor((mx - effectRadius) / pixelSize) * pixelSize);
      const startY = Math.max(0, Math.floor((my - effectRadius) / pixelSize) * pixelSize);
      const endX = Math.min(canvas.width, Math.ceil((mx + effectRadius) / pixelSize) * pixelSize);
      const endY = Math.min(canvas.height, Math.ceil((my + effectRadius) / pixelSize) * pixelSize);

      for (let x = startX; x < endX; x += pixelSize) {
        for (let y = startY; y < endY; y += pixelSize) {
          const centerX = x + pixelSize / 2;
          const centerY = y + pixelSize / 2;
          const dist = Math.sqrt((centerX - mx) ** 2 + (centerY - my) ** 2);

          if (dist < effectRadius && dist > innerRadius) {
            const falloff = 1 - (dist - innerRadius) / (effectRadius - innerRadius);
            const alpha = falloff * 0.85;

            const baseColor = { r: 0, g: 102, b: 255 };
            const variation = Math.sin(x * 0.02 + y * 0.02) * 15;
            
            const r = Math.min(255, Math.max(0, baseColor.r + variation));
            const g = Math.min(255, Math.max(0, baseColor.g + variation));
            const b = Math.min(255, Math.max(0, baseColor.b + variation * 0.5));

            ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;
            
            const sizeVariation = 0.9 + Math.random() * 0.2;
            const adjustedSize = pixelSize * sizeVariation;
            const offset = (pixelSize - adjustedSize) / 2;
            
            ctx.fillRect(x + offset, y + offset, adjustedSize - 1, adjustedSize - 1);
          }
        }
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animationRef.current);
    };
  }, [visible, isActive, backgroundColor]);

  if (!visible) return null;

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-10 pointer-events-none"
      style={{ mixBlendMode: "multiply" }}
      data-testid="pixel-effect-canvas"
    />
  );
}
