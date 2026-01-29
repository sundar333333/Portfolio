import { motion } from "framer-motion";
import forestTvImage from "@assets/image_1769692723761.png";

interface ForestZoomSectionProps {
  visible: boolean;
  scrollProgress: number;
}

export function ForestZoomSection({ visible, scrollProgress }: ForestZoomSectionProps) {
  if (!visible) return null;

  const zoomStartProgress = 0.85;
  const zoomEndProgress = 1.0;
  
  if (scrollProgress < zoomStartProgress) return null;

  const zoomProgress = (scrollProgress - zoomStartProgress) / (zoomEndProgress - zoomStartProgress);
  
  const scale = 8 - zoomProgress * 7;
  
  const opacity = Math.min(1, zoomProgress * 2);

  return (
    <div className="fixed inset-0 z-[35] pointer-events-none overflow-hidden">
      <motion.div
        className="absolute inset-0 flex items-center justify-center"
        style={{
          opacity,
        }}
      >
        <motion.img
          src={forestTvImage}
          alt="Forest TV"
          className="w-full h-full object-cover"
          style={{
            transform: `scale(${scale})`,
            transformOrigin: "center center",
          }}
        />
      </motion.div>
      
      <motion.div
        className="absolute inset-0 bg-black"
        style={{
          opacity: Math.max(0, 1 - zoomProgress * 3),
        }}
      />
    </div>
  );
}
