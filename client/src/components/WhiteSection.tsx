import { useState, useEffect, useRef } from "react";
import { motion, useSpring, useTransform } from "framer-motion";

interface WhiteSectionProps {
  progress: number;
  circleProgress: number;
}

export function WhiteSection({ progress, circleProgress }: WhiteSectionProps) {
  const translateY = Math.max(0, 100 - progress * 100);
  
  const minSize = 150;
  const maxSize = 460;
  const circleSize = minSize + (maxSize - minSize) * circleProgress;
  
  const [targetOffset, setTargetOffset] = useState({ x: 0, y: 0 });
  const isFullyExpanded = circleProgress >= 1;

  // Liquid spring config - low stiffness, moderate damping for fluid motion
  const springConfig = { stiffness: 50, damping: 15, mass: 1.5 };
  
  const springX = useSpring(0, springConfig);
  const springY = useSpring(0, springConfig);

  // Update spring targets when offset changes
  useEffect(() => {
    springX.set(targetOffset.x);
    springY.set(targetOffset.y);
  }, [targetOffset.x, targetOffset.y, springX, springY]);

  useEffect(() => {
    if (!isFullyExpanded) {
      setTargetOffset({ x: 0, y: 0 });
      return;
    }

    const handleDeviceOrientation = (e: DeviceOrientationEvent) => {
      const gamma = e.gamma || 0;
      const beta = e.beta || 0;
      
      const maxOffset = 100;
      const x = Math.max(-maxOffset, Math.min(maxOffset, gamma * 3.5));
      const y = Math.max(-maxOffset, Math.min(maxOffset, (beta - 45) * 2.5));
      
      setTargetOffset({ x, y });
    };

    const handleMouseMove = (e: MouseEvent) => {
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;
      
      const maxOffset = 80;
      const x = ((e.clientX - centerX) / centerX) * maxOffset;
      const y = ((e.clientY - centerY) / centerY) * maxOffset;
      
      setTargetOffset({ x, y });
    };

    if (typeof DeviceOrientationEvent !== 'undefined' && 
        typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
      (DeviceOrientationEvent as any).requestPermission()
        .then((permission: string) => {
          if (permission === 'granted') {
            window.addEventListener('deviceorientation', handleDeviceOrientation);
          }
        })
        .catch(() => {
          window.addEventListener('mousemove', handleMouseMove);
        });
    } else if (window.DeviceOrientationEvent) {
      window.addEventListener('deviceorientation', handleDeviceOrientation);
    }
    
    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('deviceorientation', handleDeviceOrientation);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [isFullyExpanded]);

  return (
    <div
      className="fixed inset-0 z-20 bg-white pointer-events-none"
      style={{
        transform: `translateY(${translateY}%)`,
      }}
      data-testid="white-section"
    >
      {circleProgress > 0 && (
        <motion.div
          className="absolute top-1/2 left-1/2 rounded-full bg-black"
          style={{
            width: circleSize,
            height: circleSize,
            x: springX,
            y: springY,
            translateX: "-50%",
            translateY: "-50%",
          }}
          data-testid="expanding-circle"
        />
      )}
    </div>
  );
}
