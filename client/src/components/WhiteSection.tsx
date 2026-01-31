import { useState, useEffect, useRef } from "react";
import currentLogo from "@assets/ChatGPT_Image_Jan_31,_2026,_03_56_26_AM_1769812385134.png";
import spaceJumpLogo from "@assets/Group_4_1769812419285.png";
import eventifyLogo from "@assets/lk_1769812445813.png";
import tickingLogo from "@assets/Group_27_1769812471632.png";

interface TrailPoint {
  x: number;
  y: number;
  id: number;
}

interface WhiteSectionProps {
  progress: number;
  circleProgress: number;
  currentTransitionProgress: number;
}

const projectLogos: Record<string, string> = {
  current: currentLogo,
  spacejump: spaceJumpLogo,
  eventify: eventifyLogo,
  ticking: tickingLogo,
};

let trailId = 0;

export function WhiteSection({ progress, circleProgress, currentTransitionProgress }: WhiteSectionProps) {
  const translateY = Math.max(0, 100 - progress * 100);
  
  const minSize = 150;
  const maxSize = 460;
  const circleSize = minSize + (maxSize - minSize) * circleProgress;
  
  const [smoothOffset, setSmoothOffset] = useState({ x: 0, y: 0 });
  const [logoOffset, setLogoOffset] = useState({ x: 0, y: 0 });
  const [trail, setTrail] = useState<TrailPoint[]>([]);
  const [hoveredProject, setHoveredProject] = useState<string | null>(null);
  const [viewport, setViewport] = useState({ width: typeof window !== 'undefined' ? window.innerWidth : 1920, height: typeof window !== 'undefined' ? window.innerHeight : 1080 });
  const targetOffset = useRef({ x: 0, y: 0 });
  const lastTrailPos = useRef({ x: 0, y: 0 });
  const isFullyExpanded = circleProgress >= 1;
  const isCurrentTransitionActive = currentTransitionProgress > 0;
  const isNewCircleAtCenter = currentTransitionProgress >= 0.95;

  // Handle viewport resize
  useEffect(() => {
    const handleResize = () => {
      setViewport({ width: window.innerWidth, height: window.innerHeight });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // Original circle moves up and fades during current transition
  const originalCircleY = isCurrentTransitionActive 
    ? (viewport.height / 2) - (currentTransitionProgress * viewport.height * 0.6)
    : viewport.height / 2;
  const originalCircleOpacity = isCurrentTransitionActive 
    ? Math.max(0, 1 - currentTransitionProgress * 1.5)
    : 1;
  
  // New circle with Current logo comes from bottom
  const newCircleY = isCurrentTransitionActive
    ? viewport.height + 230 - (currentTransitionProgress * (viewport.height / 2 + 230))
    : viewport.height + 230;
  const newCircleOpacity = isCurrentTransitionActive
    ? Math.min(1, currentTransitionProgress * 2)
    : 0;

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
      
      // Logo follows with less sensitivity (40% of circle movement)
      setLogoOffset(prev => {
        const logoSensitivity = 0.4;
        const targetX = targetOffset.current.x * logoSensitivity;
        const targetY = targetOffset.current.y * logoSensitivity;
        const dx = targetX - prev.x;
        const dy = targetY - prev.y;
        const easing = 0.06;
        return { x: prev.x + dx * easing, y: prev.y + dy * easing };
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
      const centerX = viewport.width / 2;
      const centerY = viewport.height / 2;
      
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
  }, [isFullyExpanded, viewport]);

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
            className={`project-name-hover absolute top-[28%] left-4 md:left-12 text-black font-bold text-4xl md:text-6xl cursor-pointer pointer-events-auto ${isNewCircleAtCenter ? 'current-active' : ''}`}
            style={{ 
              fontFamily: "'Orbitron', sans-serif",
              backgroundColor: isNewCircleAtCenter ? 'black' : undefined,
              color: isNewCircleAtCenter ? 'white' : undefined,
              padding: isNewCircleAtCenter ? '0.25rem 0.75rem' : undefined,
            }}
            onMouseEnter={() => setHoveredProject('current')}
            onMouseLeave={() => setHoveredProject(null)}
            data-testid="project-top-left"
          >
            Current
          </div>
          <div 
            className="project-name-hover absolute top-[28%] right-4 md:right-12 text-black font-bold text-4xl md:text-6xl text-right cursor-pointer pointer-events-auto"
            style={{ fontFamily: "'Orbitron', sans-serif" }}
            onMouseEnter={() => setHoveredProject('spacejump')}
            onMouseLeave={() => setHoveredProject(null)}
            data-testid="project-top-right"
          >
            Space Jump
          </div>
          <div 
            className="project-name-hover absolute bottom-[28%] left-4 md:left-12 text-black font-bold text-4xl md:text-6xl cursor-pointer pointer-events-auto"
            style={{ fontFamily: "'Orbitron', sans-serif" }}
            onMouseEnter={() => setHoveredProject('eventify')}
            onMouseLeave={() => setHoveredProject(null)}
            data-testid="project-bottom-left"
          >
            Eventify
          </div>
          <div 
            className="project-name-hover absolute bottom-[28%] right-4 md:right-12 text-black font-bold text-4xl md:text-6xl text-right cursor-pointer pointer-events-auto"
            style={{ fontFamily: "'Orbitron', sans-serif" }}
            onMouseEnter={() => setHoveredProject('ticking')}
            onMouseLeave={() => setHoveredProject(null)}
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
          const centerX = viewport.width / 2 + point.x;
          const centerY = viewport.height / 2 + point.y;
          const trailSize = isCurrentTransitionActive ? maxSize : circleSize;
          
          return (
            <circle
              key={point.id}
              cx={centerX}
              cy={centerY}
              r={(trailSize * scale) / 2}
              fill="black"
              opacity={opacity * originalCircleOpacity}
            />
          );
        })}
        
        {circleProgress > 0 && originalCircleOpacity > 0 && (
          <circle
            cx={viewport.width / 2 + smoothOffset.x}
            cy={originalCircleY + smoothOffset.y}
            r={(isCurrentTransitionActive ? maxSize : circleSize) / 2}
            fill="black"
            opacity={originalCircleOpacity}
          />
        )}
        
        {/* New circle with Current logo - comes from bottom */}
        {isCurrentTransitionActive && newCircleOpacity > 0 && (
          <circle
            cx={viewport.width / 2 + smoothOffset.x}
            cy={newCircleY + smoothOffset.y}
            r={maxSize / 2}
            fill="black"
            opacity={newCircleOpacity}
          />
        )}
      </svg>

      {/* Logo display inside original circle - before transition */}
      {hoveredProject && circleProgress >= 1 && !isCurrentTransitionActive && (
        <div
          className="absolute pointer-events-none flex items-center justify-center transition-opacity duration-300"
          style={{
            left: `calc(50% + ${smoothOffset.x}px)`,
            top: `calc(50% + ${smoothOffset.y}px)`,
            width: maxSize * 0.8,
            height: maxSize * 0.8,
            transform: `translate(-50%, -50%) translate(${logoOffset.x}px, ${logoOffset.y}px)`,
          }}
          data-testid="project-logo"
        >
          <img
            src={projectLogos[hoveredProject]}
            alt={hoveredProject}
            className="object-contain"
            style={{
              filter: 'drop-shadow(0 0 20px rgba(255,255,255,0.3))',
              maxWidth: (hoveredProject === 'current' || hoveredProject === 'ticking') ? '90%' : '70%',
              maxHeight: (hoveredProject === 'current' || hoveredProject === 'ticking') ? '90%' : '70%',
            }}
          />
        </div>
      )}

      {/* Logo display inside the new circle during transition - shows Current by default, or hovered project */}
      {isCurrentTransitionActive && newCircleOpacity > 0.3 && (
        <div
          className="absolute pointer-events-none flex items-center justify-center"
          style={{
            left: `calc(50% + ${smoothOffset.x}px)`,
            top: `${newCircleY + smoothOffset.y}px`,
            width: maxSize * 0.8,
            height: maxSize * 0.8,
            transform: `translate(-50%, -50%) translate(${logoOffset.x}px, ${logoOffset.y}px)`,
            opacity: newCircleOpacity,
          }}
          data-testid="current-project-logo"
        >
          <img
            src={hoveredProject ? projectLogos[hoveredProject] : currentLogo}
            alt={hoveredProject || "Current"}
            className="object-contain"
            style={{
              filter: 'drop-shadow(0 0 20px rgba(255,255,255,0.3))',
              maxWidth: ((hoveredProject === 'current' || hoveredProject === 'ticking') || !hoveredProject) ? '90%' : '70%',
              maxHeight: ((hoveredProject === 'current' || hoveredProject === 'ticking') || !hoveredProject) ? '90%' : '70%',
            }}
          />
        </div>
      )}
    </div>
  );
}
