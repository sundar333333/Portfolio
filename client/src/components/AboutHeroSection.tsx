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

  let aboutMeOpacity = 0;
  let aboutMeY = 120;
  
  if (scrollProgress <= 0.25) {
    const phase1Progress = scrollProgress / 0.25;
    aboutMeY = 120 + phase1Progress * (window.innerHeight * 0.4);
    aboutMeOpacity = phase1Progress < 0.2 ? phase1Progress * 5 : 
                     phase1Progress > 0.7 ? (1 - phase1Progress) * 3.33 : 1;
  }
  
  let heroOpacity = 0;
  let heroY = 100;
  let squareOpacity = 0;
  let squareY = window.innerHeight * 0.5;
  
  if (scrollProgress > 0.5 && scrollProgress <= 0.65) {
    const heroEnterProgress = (scrollProgress - 0.5) / 0.15;
    heroOpacity = Math.min(heroEnterProgress * 2, 1);
    heroY = Math.max(100 - heroEnterProgress * 100, 0);
  } else if (scrollProgress > 0.65 && scrollProgress <= 0.85) {
    const exitProgress = (scrollProgress - 0.65) / 0.2;
    heroOpacity = 1 - exitProgress;
    heroY = -exitProgress * window.innerHeight * 0.4;
    
    squareOpacity = Math.min(exitProgress * 2, 1);
    squareY = window.innerHeight * 0.5 - exitProgress * window.innerHeight * 0.5;
  } else if (scrollProgress > 0.85) {
    heroOpacity = 0;
    heroY = -window.innerHeight * 0.4;
    squareOpacity = 1;
    squareY = 0;
  }

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

      <motion.div
        className="absolute left-1/2 pointer-events-none"
        style={{
          opacity: squareOpacity,
          transform: `translateX(-50%) translateY(${squareY}px)`,
          top: "50%",
        }}
      >
        <div
          className="bg-black"
          style={{
            width: "60px",
            height: "60px",
          }}
        />
      </motion.div>
    </div>
  );
}
