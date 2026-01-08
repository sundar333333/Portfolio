import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface HeroTextProps {
  onTextHover: (text: string | null) => void;
}

const roles = [
  "I'm a UI UX designer",
  "I'm a Product designer",
  "I'm a Website designer",
];

export function HeroText({ onTextHover }: HeroTextProps) {
  const [currentRoleIndex, setCurrentRoleIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const currentRole = roles[currentRoleIndex];
    
    const typeSpeed = isDeleting ? 30 : 50;
    const pauseTime = 2000;

    if (!isDeleting && displayedText === currentRole) {
      const timer = setTimeout(() => setIsDeleting(true), pauseTime);
      return () => clearTimeout(timer);
    }

    if (isDeleting && displayedText === "") {
      setIsDeleting(false);
      setCurrentRoleIndex((prev) => (prev + 1) % roles.length);
      return;
    }

    const timer = setTimeout(() => {
      if (isDeleting) {
        setDisplayedText(currentRole.substring(0, displayedText.length - 1));
      } else {
        setDisplayedText(currentRole.substring(0, displayedText.length + 1));
      }
    }, typeSpeed);

    return () => clearTimeout(timer);
  }, [displayedText, isDeleting, currentRoleIndex]);

  return (
    <motion.div
      className="text-center pointer-events-auto px-4 w-full max-w-4xl"
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.8, duration: 1 }}
      data-testid="hero-text-container"
    >
      <motion.h1
        className="font-anton text-3xl sm:text-5xl md:text-7xl lg:text-8xl text-white mb-4 md:mb-6 cursor-pointer leading-tight"
        style={{
          textShadow: "0 0 40px rgba(255,255,255,0.2), 0 0 80px rgba(255,255,255,0.1)",
        }}
        onMouseEnter={() => onTextHover("Hello!! I am Sundar Ram")}
        onMouseLeave={() => onTextHover(null)}
        whileHover={{ scale: 1.02 }}
        data-testid="text-hero-greeting"
      >
        Hello!! I am Sundar Ram
      </motion.h1>

      <div
        className="h-10 md:h-16 flex items-center justify-center cursor-pointer"
        onMouseEnter={() => onTextHover(displayedText || roles[currentRoleIndex])}
        onMouseLeave={() => onTextHover(null)}
        data-testid="text-hero-role"
      >
        <motion.p
          className="font-mono text-base sm:text-xl md:text-2xl lg:text-3xl text-white/80"
          style={{
            textShadow: "0 0 20px rgba(255,255,255,0.1)",
          }}
        >
          {displayedText}
          <motion.span
            className="inline-block w-0.5 h-5 md:h-8 bg-white/80 ml-1"
            animate={{ opacity: [1, 0] }}
            transition={{ duration: 0.5, repeat: Infinity, repeatType: "reverse" }}
          />
        </motion.p>
      </div>
    </motion.div>
  );
}
