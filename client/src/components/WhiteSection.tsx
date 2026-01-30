import { useState, useEffect } from "react";

interface WhiteSectionProps {
  progress: number;
  circleProgress: number;
}

export function WhiteSection({ progress, circleProgress }: WhiteSectionProps) {
  const translateY = Math.max(0, 100 - progress * 100);
  
  const minSize = 150;
  const maxSize = 460;
  const circleSize = minSize + (maxSize - minSize) * circleProgress;
  
  const [gyroOffset, setGyroOffset] = useState({ x: 0, y: 0 });
  const isFullyExpanded = circleProgress >= 1;

  useEffect(() => {
    if (!isFullyExpanded) {
      setGyroOffset({ x: 0, y: 0 });
      return;
    }

    const handleDeviceOrientation = (e: DeviceOrientationEvent) => {
      const gamma = e.gamma || 0;
      const beta = e.beta || 0;
      
      const maxOffset = 80;
      const x = Math.max(-maxOffset, Math.min(maxOffset, gamma * 2.5));
      const y = Math.max(-maxOffset, Math.min(maxOffset, (beta - 45) * 1.8));
      
      setGyroOffset({ x, y });
    };

    const handleMouseMove = (e: MouseEvent) => {
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;
      
      const maxOffset = 60;
      const x = ((e.clientX - centerX) / centerX) * maxOffset;
      const y = ((e.clientY - centerY) / centerY) * maxOffset;
      
      setGyroOffset({ x, y });
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
        <div
          className="absolute top-1/2 left-1/2 rounded-full bg-black transition-transform duration-100 ease-out"
          style={{
            width: circleSize,
            height: circleSize,
            transform: `translate(-50%, -50%) translate(${gyroOffset.x}px, ${gyroOffset.y}px)`,
          }}
          data-testid="expanding-circle"
        />
      )}
    </div>
  );
}
