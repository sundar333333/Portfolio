import { useState, useEffect, useRef } from "react";
import { X } from "lucide-react";
import currentLogo from "@assets/ChatGPT_Image_Jan_31,_2026,_03_56_26_AM_1769812385134.png";
import spaceJumpLogo from "@assets/Group_4_1769812419285.png";
import eventifyLogo from "@assets/lk_1769812445813.png";
import tickingLogo from "@assets/Group_27_1769812471632.png";
import tickingCaseStudy from "@assets/image_1769954947300.png";
import currentCaseStudy from "@assets/image_1769954987397.png";
import eventifyCaseStudy from "@assets/image_1769955050232.png";
import spaceJumpCaseStudy from "@assets/image_1769955092024.png";
import { Room3DScene } from "./Room3DScene";

interface TrailPoint {
  x: number;
  y: number;
  id: number;
}

interface WhiteSectionProps {
  progress: number;
  circleProgress: number;
  onCaseStudyChange?: (isOpen: boolean) => void;
  onZoomProgress?: (progress: number) => void;
}

const projectLogos: Record<string, string> = {
  current: currentLogo,
  spacejump: spaceJumpLogo,
  eventify: eventifyLogo,
  ticking: tickingLogo,
};

const projectCaseStudies: Record<string, string> = {
  current: "https://www.figma.com/embed?embed_host=share&hide-ui=1&url=https%3A%2F%2Fwww.figma.com%2Fproto%2F6D1cHJn9cNle6SrkOGKiwb%2FUntitled%3Fpage-id%3D0%253A1%26node-id%3D7-21388%26scaling%3Dscale-down-width%26content-scaling%3Dfixed%26hide-ui%3D1",
  spacejump: "https://www.figma.com/embed?embed_host=share&hide-ui=1&url=https%3A%2F%2Fwww.figma.com%2Fproto%2FlzrqO3p3AxxkgrYxlnSuVO%2FSpace-Jump-Game-UX-Case-study%3Fpage-id%3D0%253A1%26node-id%3D1-2%26scaling%3Dscale-down-width%26hide-ui%3D1",
  eventify: "https://www.figma.com/embed?embed_host=share&hide-ui=1&url=https%3A%2F%2Fwww.figma.com%2Fproto%2FvLXe2NKquLXGL0rg0BcE2E%2FUntitled%3Fpage-id%3D0%253A1%26node-id%3D1-2%26scaling%3Dscale-down-width%26hide-ui%3D1",
  ticking: "https://www.figma.com/embed?embed_host=share&hide-ui=1&url=https%3A%2F%2Fwww.figma.com%2Fproto%2FXZ8kBuNApBlz6LXvmpZvaP%2FTicking-Application-Case-study%3Fpage-id%3D0%253A1%26node-id%3D1-2%26starting-point-node-id%3D1%253A2%26scaling%3Dscale-down-width%26hide-ui%3D1",
};

let trailId = 0;

export function WhiteSection({ progress, circleProgress, onCaseStudyChange, onZoomProgress }: WhiteSectionProps) {
  const translateY = Math.max(0, 100 - progress * 100);
  
  const minSize = 150;
  const maxSize = 460;
  
  const [smoothOffset, setSmoothOffset] = useState({ x: 0, y: 0 });
  const [logoOffset, setLogoOffset] = useState({ x: 0, y: 0 });
  const [trail, setTrail] = useState<TrailPoint[]>([]);
  const [hoveredProject, setHoveredProject] = useState<string | null>(null);
  const [openCaseStudy, setOpenCaseStudy] = useState<string | null>(null);
  const [zoomProgress, setZoomProgress] = useState(0);
  const targetOffset = useRef({ x: 0, y: 0 });
  const lastTrailPos = useRef({ x: 0, y: 0 });
  const zoomScrollAccumulator = useRef(0);
  const isFullyExpanded = circleProgress >= 1;
  const isWorksScreenVisible = circleProgress >= 1 && progress >= 1;
  
  const viewportDiagonal = Math.sqrt(window.innerWidth ** 2 + window.innerHeight ** 2);
  const zoomedCircleSize = zoomProgress > 0 
    ? maxSize + (viewportDiagonal * 1.5 - maxSize) * zoomProgress 
    : minSize + (maxSize - minSize) * circleProgress;
  const circleSize = zoomedCircleSize;

  useEffect(() => {
    onCaseStudyChange?.(openCaseStudy !== null);
    
    // Prevent background scrolling when case study is open
    if (openCaseStudy !== null) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    
    return () => {
      document.body.style.overflow = '';
    };
  }, [openCaseStudy, onCaseStudyChange]);

  // Reset zoom when leaving works screen or opening case study
  useEffect(() => {
    if (!isWorksScreenVisible || openCaseStudy !== null) {
      zoomScrollAccumulator.current = 0;
      setZoomProgress(0);
      onZoomProgress?.(0);
    }
  }, [isWorksScreenVisible, openCaseStudy, onZoomProgress]);

  // Debug keyboard shortcut to jump to 3D room (press 'R' key)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'r' || e.key === 'R') {
        console.log('Jumping to 3D room');
        setZoomProgress(1);
        onZoomProgress?.(1);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onZoomProgress]);

  // Separate scroll handler for zooming into the circle
  useEffect(() => {
    if (!isWorksScreenVisible || openCaseStudy !== null) return;
    
    const freeScrollThreshold = 300; // Free scroll before zoom starts (reduced)
    const zoomThreshold = 800; // Zoom scroll distance (reduced)
    const totalThreshold = freeScrollThreshold + zoomThreshold;
    
    const handleWheel = (e: WheelEvent) => {
      // Only handle scroll when Works screen is fully visible and no case study is open
      if (!isWorksScreenVisible || openCaseStudy !== null) return;
      
      // Allow scrolling back to previous sections when zoom hasn't started
      const isScrollingUp = e.deltaY < 0;
      if (isScrollingUp && zoomScrollAccumulator.current <= 0) {
        // Don't prevent default - let the base scroll handle going back
        return;
      }
      
      // Only prevent default when we're actively in the scroll phase
      e.preventDefault();
      
      zoomScrollAccumulator.current += e.deltaY;
      
      // Clamp the accumulator
      zoomScrollAccumulator.current = Math.max(0, Math.min(totalThreshold, zoomScrollAccumulator.current));
      
      // Calculate zoom progress (only starts after free scroll threshold)
      const zoomStart = Math.max(0, zoomScrollAccumulator.current - freeScrollThreshold);
      const newZoomProgress = zoomStart / zoomThreshold;
      setZoomProgress(Math.min(1, newZoomProgress));
      onZoomProgress?.(Math.min(1, newZoomProgress));
    };
    
    window.addEventListener('wheel', handleWheel, { passive: false });
    
    return () => {
      window.removeEventListener('wheel', handleWheel);
    };
  }, [isWorksScreenVisible, openCaseStudy, onZoomProgress]);

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

  // Fade out projects as zoom progresses
  const projectsOpacity = Math.max(0, 1 - zoomProgress * 3);
  
  // Background transitions from white to black as zoom progresses
  const bgColor = zoomProgress > 0.3 
    ? `rgb(${Math.round(255 * (1 - (zoomProgress - 0.3) / 0.7))}, ${Math.round(255 * (1 - (zoomProgress - 0.3) / 0.7))}, ${Math.round(255 * (1 - (zoomProgress - 0.3) / 0.7))})`
    : 'white';
  
  const isZoomComplete = zoomProgress >= 1;

  return (
    <div
      className="fixed inset-0 z-20 pointer-events-none"
      style={{
        transform: `translateY(${translateY}%)`,
        backgroundColor: bgColor,
        transition: 'background-color 0.1s ease-out',
      }}
      data-testid="white-section"
    >
      {progress >= 1 && !openCaseStudy && projectsOpacity > 0 && (
        <div style={{ opacity: projectsOpacity, transition: 'opacity 0.15s ease-out' }}>
          {/* Scroll hint */}
          <div 
            className="absolute bottom-8 left-1/2 -translate-x-1/2 text-black/50 text-sm flex flex-col items-center gap-2"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            <span>Scroll to explore the room</span>
            <div className="w-6 h-10 border-2 border-black/30 rounded-full flex justify-center pt-2">
              <div className="w-1.5 h-3 bg-black/40 rounded-full animate-bounce" />
            </div>
          </div>
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
        </div>
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
      {hoveredProject && circleProgress >= 1 && !openCaseStudy && projectsOpacity > 0.5 && (
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

      {/* Black Screen - Next Section after zoom complete */}
      {zoomProgress > 0.3 && !openCaseStudy && (
        <div 
          className="fixed inset-0 z-30 pointer-events-auto"
          style={{
            backgroundColor: '#000',
            opacity: Math.min(1, (zoomProgress - 0.3) / 0.4),
            transition: 'opacity 0.3s ease-out',
          }}
          data-testid="black-screen-section"
        />
      )}

      {/* 3D Room Scene */}
      <Room3DScene visible={isZoomComplete && !openCaseStudy} />

      {/* Case Study Viewer */}
      {openCaseStudy && (
        <div 
          className="fixed inset-0 z-[9999] pointer-events-auto"
          style={{ 
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw', 
            height: '100vh',
            background: '#000',
            margin: 0,
            padding: 0,
          }}
          data-testid="case-study-viewer"
        >
          <button
            onClick={() => setOpenCaseStudy(null)}
            className="fixed top-4 right-4 z-[10000] w-12 h-12 flex items-center justify-center bg-black/80 text-white rounded-full hover:bg-black transition-colors border border-white/30"
            aria-label="Close case study"
            data-testid="close-case-study"
          >
            <X size={24} />
          </button>
          <iframe
            src={projectCaseStudies[openCaseStudy]}
            style={{
              width: '100%',
              height: '100%',
              border: 'none',
              margin: 0,
              padding: 0,
              display: 'block',
            }}
            allowFullScreen
            title={`${openCaseStudy} Case Study`}
            data-testid="case-study-iframe"
          />
        </div>
      )}
    </div>
  );
}
