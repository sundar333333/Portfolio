import { motion } from "framer-motion";

interface WhiteSectionProps {
  visible: boolean;
  progress: number;
}

export function WhiteSection({ visible, progress }: WhiteSectionProps) {
  if (!visible) return null;

  const translateY = Math.max(0, 100 - progress * 100);

  return (
    <motion.div
      className="fixed inset-0 z-20 bg-white pointer-events-auto"
      style={{
        transform: `translateY(${translateY}%)`,
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      data-testid="white-section"
    >
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-center px-6">
          <h2 className="font-anton text-4xl md:text-6xl lg:text-8xl text-black mb-8">
            LET'S CONNECT
          </h2>
          <p className="text-black/60 text-lg md:text-xl max-w-2xl mx-auto">
            Ready to bring your vision to life? Let's create something amazing together.
          </p>
        </div>
      </div>
    </motion.div>
  );
}
