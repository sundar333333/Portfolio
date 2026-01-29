import { motion } from "framer-motion";
import { useEffect, useRef, useMemo } from "react";
import tvImage from "@assets/image_1769700838431.png";

interface TVZoomOutProps {
  visible: boolean;
  scrollProgress: number;
}

export function TVZoomOut({ visible, scrollProgress }: TVZoomOutProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);

  const noisePattern = useMemo(() => {
    const size = 128;
    const data = new Uint8ClampedArray(size * size * 4);
    for (let i = 0; i < size * size * 4; i += 4) {
      const value = Math.random() * 255;
      data[i] = value;
      data[i + 1] = value;
      data[i + 2] = value;
      data[i + 3] = 255;
    }
    return data;
  }, []);

  useEffect(() => {
    if (!visible || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const animate = () => {
      const size = 128;
      const imageData = ctx.createImageData(size, size);
      
      for (let i = 0; i < size * size * 4; i += 4) {
        const value = Math.random() * 255;
        imageData.data[i] = value;
        imageData.data[i + 1] = value;
        imageData.data[i + 2] = value;
        imageData.data[i + 3] = 255;
      }
      
      ctx.putImageData(imageData, 0, 0);
      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [visible]);

  if (!visible) return null;

  const zoomOutStart = 0.92;
  const zoomOutEnd = 1.0;
  
  const zoomProgress = scrollProgress < zoomOutStart ? 0 :
                       scrollProgress > zoomOutEnd ? 1 :
                       (scrollProgress - zoomOutStart) / (zoomOutEnd - zoomOutStart);

  const scale = 15 - zoomProgress * 14;
  const opacity = zoomProgress < 0.1 ? zoomProgress * 10 : 1;

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden"
      style={{
        opacity,
        backgroundColor: "#000000",
      }}
      data-testid="tv-zoom-out"
    >
      <div
        className="relative"
        style={{
          transform: `scale(${scale})`,
          transformOrigin: "center center",
        }}
      >
        <img
          src={tvImage}
          alt="Vintage TV"
          className="w-[400px] h-auto"
          style={{
            filter: "drop-shadow(0 0 30px rgba(0,0,0,0.8))",
          }}
        />
        
        <div
          className="absolute overflow-hidden"
          style={{
            top: "8%",
            left: "6%",
            width: "58%",
            height: "62%",
            borderRadius: "8px",
          }}
        >
          <canvas
            ref={canvasRef}
            width={128}
            height={128}
            className="w-full h-full"
            style={{
              imageRendering: "pixelated",
              filter: "contrast(1.2) brightness(0.9)",
            }}
          />
        </div>
      </div>

      {zoomProgress > 0.8 && (
        <motion.div
          className="absolute bottom-20 left-1/2 -translate-x-1/2"
          initial={{ opacity: 0 }}
          animate={{ opacity: (zoomProgress - 0.8) * 5 }}
        >
          <span
            style={{
              fontFamily: "'Anton', 'Archivo Black', sans-serif",
              fontSize: "clamp(1rem, 2vw, 1.5rem)",
              color: "#FFFFFF",
              opacity: 0.6,
              letterSpacing: "0.3em",
            }}
          >
            SIGNAL LOST
          </span>
        </motion.div>
      )}
    </motion.div>
  );
}
