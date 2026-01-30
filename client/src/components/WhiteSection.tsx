import { useState, useEffect, useRef } from "react";

interface TrailPoint {
  x: number;
  y: number;
  id: number;
}

interface WhiteSectionProps {
  progress: number;
  circleProgress: number;
}

let trailId = 0;

export function WhiteSection({ progress, circleProgress }: WhiteSectionProps) {
  const translateY = Math.max(0, 100 - progress * 100);
  
  const minSize = 150;
  const maxSize = 460;
  const circleSize = minSize + (maxSize - minSize) * circleProgress;
  
  const [smoothOffset, setSmoothOffset] = useState({ x: 0, y: 0 });
  const [trail, setTrail] = useState<TrailPoint[]>([]);
  const targetOffset = useRef({ x: 0, y: 0 });
  const lastTrailPos = useRef({ x: 0, y: 0 });
  const isFullyExpanded = circleProgress >= 1;

  useEffect(() => {
    let animationId: number;
    let frameCount = 0;
    
    const smoothFollow = () => {
      setSmoothOffset(prev => {
        const dx = targetOffset.current.x - prev.x;
        const dy = targetOffset.current.y - prev.y;
        const easing = 0.08;
        
        const newX = prev.x + dx * easing;
        const newY = prev.y + dy * easing;
        
        frameCount++;
        if (frameCount % 2 === 0 && isFullyExpanded) {
          const distMoved = Math.sqrt(
            Math.pow(newX - lastTrailPos.current.x, 2) + 
            Math.pow(newY - lastTrailPos.current.y, 2)
          );
          
          if (distMoved > 0.5) {
            trailId++;
            setTrail(t => [...t, { x: newX, y: newY, id: trailId }].slice(-20));
            lastTrailPos.current = { x: newX, y: newY };
          }
        }
        
        return { x: newX, y: newY };
      });
      animationId = requestAnimationFrame(smoothFollow);
    };
    
    animationId = requestAnimationFrame(smoothFollow);
    
    return () => cancelAnimationFrame(animationId);
  }, [isFullyExpanded]);

  useEffect(() => {
    if (trail.length === 0) return;
    
    const timer = setInterval(() => {
      setTrail(t => t.slice(1));
    }, 50);
    
    return () => clearInterval(timer);
  }, [trail.length]);

  useEffect(() => {
    if (!isFullyExpanded) {
      targetOffset.current = { x: 0, y: 0 };
      return;
    }

    const handleDeviceOrientation = (e: DeviceOrientationEvent) => {
      const gamma = e.gamma || 0;
      const beta = e.beta || 0;
      
      const maxOffset = 100;
      const x = Math.max(-maxOffset, Math.min(maxOffset, gamma * 3.5));
      const y = Math.max(-maxOffset, Math.min(maxOffset, (beta - 45) * 2.5));
      
      targetOffset.current = { x, y };
    };

    const handleMouseMove = (e: MouseEvent) => {
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;
      
      const maxOffset = 80;
      const x = ((e.clientX - centerX) / centerX) * maxOffset;
      const y = ((e.clientY - centerY) / centerY) * maxOffset;
      
      targetOffset.current = { x, y };
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
      {progress >= 1 && (
        <>
          <div 
            className="absolute top-[28%] left-[15%] text-black font-bold text-2xl md:text-3xl"
            style={{ fontFamily: "'Archivo Black', sans-serif" }}
            data-testid="project-top-left"
          >
            Current
          </div>
          <div 
            className="absolute top-[28%] right-[15%] text-black font-bold text-2xl md:text-3xl text-right"
            style={{ fontFamily: "'Archivo Black', sans-serif" }}
            data-testid="project-top-right"
          >
            Space Jump
          </div>
          <div 
            className="absolute bottom-[28%] left-[15%] text-black font-bold text-2xl md:text-3xl"
            style={{ fontFamily: "'Archivo Black', sans-serif" }}
            data-testid="project-bottom-left"
          >
            Eventify
          </div>
          <div 
            className="absolute bottom-[28%] right-[15%] text-black font-bold text-2xl md:text-3xl text-right"
            style={{ fontFamily: "'Archivo Black', sans-serif" }}
            data-testid="project-bottom-right"
          >
            Ticking
          </div>
        </>
      )}

      <svg 
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{ filter: 'url(#goo)' }}
      >
        <defs>
          <filter id="goo">
            <feGaussianBlur in="SourceGraphic" stdDeviation="12" result="blur" />
            <feColorMatrix 
              in="blur" 
              mode="matrix" 
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 35 -15" 
              result="goo" 
            />
            <feComposite in="SourceGraphic" in2="goo" operator="atop" />
          </filter>
        </defs>
        
        {trail.map((point, index) => {
          const opacity = (index + 1) / trail.length * 0.7;
          const scale = 0.85 + (index / trail.length) * 0.15;
          const centerX = window.innerWidth / 2 + point.x;
          const centerY = window.innerHeight / 2 + point.y;
          
          return (
            <circle
              key={point.id}
              cx={centerX}
              cy={centerY}
              r={(circleSize * scale) / 2}
              fill="black"
              opacity={opacity}
            />
          );
        })}
        
        {circleProgress > 0 && (
          <circle
            cx={window.innerWidth / 2 + smoothOffset.x}
            cy={window.innerHeight / 2 + smoothOffset.y}
            r={circleSize / 2}
            fill="black"
          />
        )}
      </svg>
    </div>
  );
}
