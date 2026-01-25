import { useState, useEffect } from "react";
import { motion } from "framer-motion";

interface AboutHeroSectionProps {
  visible: boolean;
  scrollProgress: number;
}

const greetings = ["HELLO!", "¡HOLA!", "OLÁ!", "ПРИВЕТ!", "வணக்கம்!"];
const roles = ["UI UX", "PRODUCT", "BRAND", "WEB"];

export function AboutHeroSection({ visible, scrollProgress }: AboutHeroSectionProps) {
  const [greetingIndex, setGreetingIndex] = useState(0);
  const [roleIndex, setRoleIndex] = useState(0);

  useEffect(() => {
    if (!visible) return;
    
    const greetingInterval = setInterval(() => {
      setGreetingIndex((prev) => (prev + 1) % greetings.length);
    }, 2000);
    
    return () => clearInterval(greetingInterval);
  }, [visible]);

  useEffect(() => {
    if (!visible) return;
    
    const roleInterval = setInterval(() => {
      setRoleIndex((prev) => (prev + 1) % roles.length);
    }, 2500);
    
    return () => clearInterval(roleInterval);
  }, [visible]);

  if (!visible) return null;

  const aboutMeY = 80 + scrollProgress * (window.innerHeight + 100);
  const aboutMeOpacity = scrollProgress < 0.1 ? scrollProgress * 10 : 
                         scrollProgress > 0.8 ? (1 - scrollProgress) * 5 : 1;
  
  const heroOpacity = scrollProgress > 0.3 ? Math.min((scrollProgress - 0.3) * 3, 1) : 0;
  const heroY = scrollProgress > 0.3 ? 
                Math.max(100 - (scrollProgress - 0.3) * 300, 0) : 100;

  return (
    <div className="fixed inset-0 z-40 pointer-events-none overflow-hidden">
      <motion.div
        className="absolute left-8 pointer-events-none"
        style={{
          top: aboutMeY,
          opacity: aboutMeOpacity,
          transform: "rotate(-90deg)",
          transformOrigin: "left top",
        }}
      >
        <span
          className="text-white font-black tracking-widest whitespace-nowrap"
          style={{
            fontFamily: "'Anton', sans-serif",
            fontSize: "clamp(3rem, 8vw, 6rem)",
            textShadow: "0 0 20px rgba(255,255,255,0.3)",
          }}
        >
          ABOUT ME
        </span>
      </motion.div>

      <motion.div
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
        style={{
          opacity: heroOpacity,
          transform: `translateY(${heroY}px)`,
        }}
      >
        <div className="text-center">
          <div 
            className="mb-4"
            style={{
              fontFamily: "'Anton', sans-serif",
              fontSize: "clamp(2.5rem, 6vw, 5rem)",
              lineHeight: 1.1,
            }}
          >
            <motion.span
              key={greetingIndex}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="inline-block mr-4"
              style={{ color: "#000000" }}
            >
              {greetings[greetingIndex]}
            </motion.span>
            <span className="text-white">I'm</span>
          </div>
          
          <div
            className="text-white"
            style={{
              fontFamily: "'Anton', sans-serif",
              fontSize: "clamp(3rem, 8vw, 7rem)",
              lineHeight: 1,
              textShadow: "0 0 30px rgba(255,255,255,0.2)",
            }}
          >
            SUNDAR RAM
          </div>

          <div 
            className="mt-6"
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: "clamp(1rem, 2.5vw, 1.8rem)",
              fontWeight: 300,
              letterSpacing: "0.1em",
            }}
          >
            <span className="text-white">I am a </span>
            <motion.span
              key={roleIndex}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="inline-block"
              style={{ color: "#000000", fontWeight: 600 }}
            >
              {roles[roleIndex]}
            </motion.span>
            <span className="text-white"> designer</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
