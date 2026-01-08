import { motion } from "framer-motion";
import { Volume2, VolumeX } from "lucide-react";

interface AudioToggleProps {
  isMuted: boolean;
  onToggle: () => void;
}

export function AudioToggle({ isMuted, onToggle }: AudioToggleProps) {
  return (
    <motion.button
      className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-12 h-12 rounded-full bg-white/10 border border-white/20 backdrop-blur-sm"
      onClick={onToggle}
      whileHover={{ scale: 1.1, backgroundColor: "rgba(255,255,255,0.2)" }}
      whileTap={{ scale: 0.95 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1, duration: 0.5 }}
      data-testid="button-audio-toggle"
      aria-label={isMuted ? "Unmute audio" : "Mute audio"}
    >
      <motion.div
        initial={false}
        animate={{ scale: isMuted ? [1, 1.2, 1] : 1 }}
        transition={{ duration: 0.3 }}
      >
        {isMuted ? (
          <VolumeX className="w-5 h-5 text-white/80" />
        ) : (
          <Volume2 className="w-5 h-5 text-white" />
        )}
      </motion.div>
    </motion.button>
  );
}
