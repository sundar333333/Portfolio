import { useState, useEffect, useRef } from "react";
import { X } from "lucide-react";
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
}

const projectLogos: Record<string, string> = {
  current: currentLogo,
  spacejump: spaceJumpLogo,
  eventify: eventifyLogo,
  ticking: tickingLogo,
};

const projectCaseStudies: Record<string, string> = {
  current: "https://www.figma.com/embed?embed_host=share&url=https%3A%2F%2Fwww.figma.com%2Fproto%2F6D1cHJn9cNle6SrkOGKiwb%2FUntitled%3Fpage-id%3D0%253A1%26node-id%3D7-21388%26viewport%3D-16667%252C-1615%252C0.29%26t%3DA9IM3Eqf4hN8nX3w-1%26scaling%3Dscale-down-width%26content-scaling%3Dresponsive%26hide-ui%3D1",
  spacejump: "https://www.figma.com/embed?embed_host=share&url=https%3A%2F%2Fwww.figma.com%2Fproto%2FlzrqO3p3AxxkgrYxlnSuVO%2FSpace-Jump-Game-UX-Case-study%3Fpage-id%3D0%253A1%26node-id%3D1-2%26t%3Dyfoxkj3qDi0cwGa7-1%26scaling%3Dscale-down-width%26content-scaling%3Dresponsive%26hide-ui%3D1",
  eventify: "https://www.figma.com/embed?embed_host=share&url=https%3A%2F%2Fwww.figma.com%2Fproto%2FvLXe2NKquLXGL0rg0BcE2E%2FUntitled%3Fpage-id%3D0%253A1%26node-id%3D1-2%26t%3DzUPLaoZt8Ni95D7f-1%26scaling%3Dscale-down-width%26content-scaling%3Dresponsive%26hide-ui%3D1",
  ticking: "https://www.figma.com/embed?embed_host=share&url=https%3A%2F%2Fwww.figma.com%2Fproto%2FXZ8kBuNApBlz6LXvmpZvaP%2FTicking-Application-Case-study%3Fpage-id%3D0%253A1%26node-id%3D1-2%26starting-point-node-id%3D1%253A2%26t%3Doya6bJf77Y9QDoi5-1%26scaling%3Dscale-down-width%26content-scaling%3Dresponsive%26hide-ui%3D1",
};

let trailId = 0;

export function WhiteSection({ progress, circleProgress }: WhiteSectionProps) {
  const translateY = Math.max(0, 100 - progress * 100);
  
  const minSize = 150;
  const maxSize = 460;
  const circleSize = minSize + (maxSize - minSize) * circleProgress;
  
  const [smoothOffset, setSmoothOffset] = useState({ x: 0, y: 0 });
  const [logoOffset, setLogoOffset] = useState({ x: 0, y: 0 });
  const [trail, setTrail] = useState<TrailPoint[]>([]);
  const [hoveredProject, setHoveredProject] = useState<string | null>(null);
  const [openCaseStudy, setOpenCaseStudy] = useState<string | null>(null);
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
      {progress >= 1 && !openCaseStudy && (
        <>
          <div 
            className="project-name-hover absolute top-[28%] left-4 md:left-12 text-black font-bold text-4xl md:text-6xl cursor-pointer pointer-events-auto"
            style={{ fontFamily: "'Orbitron', sans-serif" }}
            onMouseEnter={() => setHoveredProject('current')}
            onMouseLeave={() => setHoveredProject(null)}
            onClick={() => setOpenCaseStudy('current')}
            data-testid="project-top-left"
          >
            Current
          </div>
          <div 
            className="project-name-hover absolute top-[28%] right-4 md:right-12 text-black font-bold text-4xl md:text-6xl text-right cursor-pointer pointer-events-auto"
            style={{ fontFamily: "'Orbitron', sans-serif" }}
            onMouseEnter={() => setHoveredProject('spacejump')}
            onMouseLeave={() => setHoveredProject(null)}
            onClick={() => setOpenCaseStudy('spacejump')}
            data-testid="project-top-right"
          >
            Space Jump
          </div>
          <div 
            className="project-name-hover absolute bottom-[28%] left-4 md:left-12 text-black font-bold text-4xl md:text-6xl cursor-pointer pointer-events-auto"
            style={{ fontFamily: "'Orbitron', sans-serif" }}
            onMouseEnter={() => setHoveredProject('eventify')}
            onMouseLeave={() => setHoveredProject(null)}
            onClick={() => setOpenCaseStudy('eventify')}
            data-testid="project-bottom-left"
          >
            Eventify
          </div>
          <div 
            className="project-name-hover absolute bottom-[28%] right-4 md:right-12 text-black font-bold text-4xl md:text-6xl text-right cursor-pointer pointer-events-auto"
            style={{ fontFamily: "'Orbitron', sans-serif" }}
            onMouseEnter={() => setHoveredProject('ticking')}
            onMouseLeave={() => setHoveredProject(null)}
            onClick={() => setOpenCaseStudy('ticking')}
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

      {/* Logo display inside circle - no mercury effect */}
      {hoveredProject && circleProgress >= 1 && !openCaseStudy && (
        <div
          className="absolute pointer-events-none flex items-center justify-center transition-opacity duration-300"
          style={{
            left: `calc(50% + ${smoothOffset.x}px)`,
            top: `calc(50% + ${smoothOffset.y}px)`,
            width: circleSize * 0.8,
            height: circleSize * 0.8,
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

      {/* Case Study Viewer */}
      {openCaseStudy && (
        <div 
          className="fixed inset-0 z-[9999] pointer-events-auto overflow-hidden"
          style={{ 
            width: '100vw', 
            height: '100vh',
            background: openCaseStudy === 'current' ? 'linear-gradient(135deg, #ff6b9d 0%, #c44569 50%, #8b5cf6 100%)' :
                        openCaseStudy === 'ticking' ? 'linear-gradient(180deg, #f97316 0%, #ea580c 100%)' :
                        openCaseStudy === 'spacejump' ? '#1a1a2e' :
                        openCaseStudy === 'eventify' ? '#1a1a2e' : '#000'
          }}
          data-testid="case-study-viewer"
        >
          <button
            onClick={() => setOpenCaseStudy(null)}
            className="fixed top-6 right-6 z-[10000] w-14 h-14 flex items-center justify-center bg-black text-white rounded-full hover:bg-gray-700 transition-colors border-2 border-white shadow-lg"
            style={{ pointerEvents: 'auto' }}
            data-testid="close-case-study"
          >
            <X size={28} />
          </button>
          <iframe
            src={projectCaseStudies[openCaseStudy]}
            className="border-0"
            style={{
              position: 'absolute',
              top: '-30px',
              left: '50%',
              transform: 'translateX(-50%) scale(1.15)',
              transformOrigin: 'top center',
              width: '100vw',
              height: 'calc(100vh + 100px)',
            }}
            allowFullScreen
            title={`${openCaseStudy} Case Study`}
          />
        </div>
      )}
    </div>
  );
}
