import { useState, useEffect, useRef, useMemo } from "react";
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
  logoSequenceProgress: number;
}

const projectLogos: Record<string, string> = {
  current: currentLogo,
  spacejump: spaceJumpLogo,
  eventify: eventifyLogo,
  ticking: tickingLogo,
};

const logoSequence = ['empty', 'current', 'spacejump', 'eventify', 'ticking', 'empty'] as const;

let trailId = 0;

export function WhiteSection({ progress, circleProgress, logoSequenceProgress }: WhiteSectionProps) {
  const translateY = Math.max(0, 100 - progress * 100);
  
  const minSize = 150;
  const maxSize = 460;
  const circleSize = minSize + (maxSize - minSize) * Math.min(1, circleProgress);
  
  const [smoothOffset, setSmoothOffset] = useState({ x: 0, y: 0 });
  const [logoOffset, setLogoOffset] = useState({ x: 0, y: 0 });
  const [trail, setTrail] = useState<TrailPoint[]>([]);
  const [hoveredProject, setHoveredProject] = useState<string | null>(null);
  const targetOffset = useRef({ x: 0, y: 0 });
  const lastTrailPos = useRef({ x: 0, y: 0 });
  const isFullyExpanded = circleProgress >= 1;

  // Calculate current logo stage based on logoSequenceProgress
  // 6 stages: empty -> current -> spacejump -> eventify -> ticking -> empty (final)
  const currentStage = useMemo(() => {
    if (logoSequenceProgress <= 0) return 0;
    if (logoSequenceProgress >= 1) return 5;
    // Each stage takes 1/5 of the progress (5 transitions)
    return Math.min(5, Math.floor(logoSequenceProgress * 5));
  }, [logoSequenceProgress]);

  // Calculate position within current stage (0-1)
  const stageProgress = useMemo(() => {
    if (logoSequenceProgress <= 0) return 0;
    if (logoSequenceProgress >= 1) return 1;
    const stageSize = 0.2; // 1/5
    return (logoSequenceProgress % stageSize) / stageSize;
  }, [logoSequenceProgress]);

  // Current and next logo in sequence
  const currentLogo = logoSequence[currentStage];
  const nextLogo = logoSequence[Math.min(currentStage + 1, 5)];

  // Calculate Y positions for outgoing and incoming circles
  // Outgoing circle moves from center (0) to top (-100vh) and fades
  // Incoming circle moves from bottom (100vh) to center (0)
  const outgoingY = stageProgress * -window.innerHeight;
  const incomingY = (1 - stageProgress) * window.innerHeight;
  const outgoingOpacity = 1 - stageProgress;
  const incomingOpacity = stageProgress;

  // Determine which project name should have the active (hover) state based on current displayed logo
  const activeProjectFromSequence = useMemo(() => {
    if (logoSequenceProgress <= 0) return null;
    if (logoSequenceProgress >= 1) return null;
    
    // When a logo is transitioning in (stageProgress > 0.5), show hover for the incoming logo
    // When a logo is centered (stageProgress around 0), show hover for current logo
    const effectiveLogo = stageProgress > 0.5 ? nextLogo : currentLogo;
    
    if (effectiveLogo === 'empty') return null;
    return effectiveLogo;
  }, [logoSequenceProgress, stageProgress, currentLogo, nextLogo]);

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
        
        // Only add trail when fully expanded and not in logo sequence
        frameCount++;
        if (frameCount % 2 === 0 && isFullyExpanded && logoSequenceProgress <= 0) {
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
  }, [isFullyExpanded, logoSequenceProgress]);

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

  // Render a single circle with optional logo
  const renderCircle = (logoKey: string | null, yOffset: number, opacity: number, key: string) => {
    const centerX = window.innerWidth / 2 + smoothOffset.x;
    const centerY = window.innerHeight / 2 + smoothOffset.y + yOffset;
    
    return (
      <g key={key} style={{ opacity }}>
        <circle
          cx={centerX}
          cy={centerY}
          r={maxSize / 2}
          fill="black"
        />
      </g>
    );
  };

  // Render logo for a circle
  const renderLogo = (logoKey: string, yOffset: number, opacity: number) => {
    if (logoKey === 'empty' || !projectLogos[logoKey]) return null;
    
    const logoSizePercent = (logoKey === 'current' || logoKey === 'ticking') ? 0.9 : 0.7;
    
    return (
      <div
        className="absolute pointer-events-none flex items-center justify-center"
        style={{
          left: `calc(50% + ${smoothOffset.x}px)`,
          top: `calc(50% + ${smoothOffset.y + yOffset}px)`,
          width: maxSize * 0.8,
          height: maxSize * 0.8,
          transform: `translate(-50%, -50%) translate(${logoOffset.x}px, ${logoOffset.y}px)`,
          opacity,
        }}
      >
        <img
          src={projectLogos[logoKey]}
          alt={logoKey}
          className="object-contain"
          style={{
            filter: 'drop-shadow(0 0 20px rgba(255,255,255,0.3))',
            maxWidth: `${logoSizePercent * 100}%`,
            maxHeight: `${logoSizePercent * 100}%`,
          }}
        />
      </div>
    );
  };

  // Determine if project name should have active styling
  const isProjectActive = (project: string) => {
    return activeProjectFromSequence === project || hoveredProject === project;
  };

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
            className={`absolute top-[28%] left-4 md:left-12 font-bold text-4xl md:text-6xl cursor-pointer pointer-events-auto transition-all duration-200 ${
              isProjectActive('current') ? 'bg-black text-white px-3 py-2 rounded-lg' : 'text-black'
            }`}
            style={{ fontFamily: "'Orbitron', sans-serif" }}
            onMouseEnter={() => setHoveredProject('current')}
            onMouseLeave={() => setHoveredProject(null)}
            data-testid="project-top-left"
          >
            Current
          </div>
          <div 
            className={`absolute top-[28%] right-4 md:right-12 font-bold text-4xl md:text-6xl text-right cursor-pointer pointer-events-auto transition-all duration-200 ${
              isProjectActive('spacejump') ? 'bg-black text-white px-3 py-2 rounded-lg' : 'text-black'
            }`}
            style={{ fontFamily: "'Orbitron', sans-serif" }}
            onMouseEnter={() => setHoveredProject('spacejump')}
            onMouseLeave={() => setHoveredProject(null)}
            data-testid="project-top-right"
          >
            Space Jump
          </div>
          <div 
            className={`absolute bottom-[28%] left-4 md:left-12 font-bold text-4xl md:text-6xl cursor-pointer pointer-events-auto transition-all duration-200 ${
              isProjectActive('eventify') ? 'bg-black text-white px-3 py-2 rounded-lg' : 'text-black'
            }`}
            style={{ fontFamily: "'Orbitron', sans-serif" }}
            onMouseEnter={() => setHoveredProject('eventify')}
            onMouseLeave={() => setHoveredProject(null)}
            data-testid="project-bottom-left"
          >
            Eventify
          </div>
          <div 
            className={`absolute bottom-[28%] right-4 md:right-12 font-bold text-4xl md:text-6xl text-right cursor-pointer pointer-events-auto transition-all duration-200 ${
              isProjectActive('ticking') ? 'bg-black text-white px-3 py-2 rounded-lg' : 'text-black'
            }`}
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
        style={{ filter: logoSequenceProgress <= 0 ? 'url(#goo)' : 'none' }}
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
        
        {/* Mercury trail - only when not in logo sequence */}
        {logoSequenceProgress <= 0 && trail.map((point, index) => {
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
        
        {/* Initial circle expansion - before logo sequence */}
        {circleProgress > 0 && logoSequenceProgress <= 0 && (
          <circle
            cx={window.innerWidth / 2 + smoothOffset.x}
            cy={window.innerHeight / 2 + smoothOffset.y}
            r={circleSize / 2}
            fill="black"
          />
        )}

        {/* Logo sequence circles */}
        {logoSequenceProgress > 0 && logoSequenceProgress < 1 && (
          <>
            {/* Outgoing circle (current logo moving up) */}
            {renderCircle(currentLogo === 'empty' ? null : currentLogo, outgoingY, outgoingOpacity, 'outgoing')}
            
            {/* Incoming circle (next logo moving up from bottom) */}
            {renderCircle(nextLogo === 'empty' ? null : nextLogo, incomingY, incomingOpacity, 'incoming')}
          </>
        )}

        {/* Final empty circle - stays at center */}
        {logoSequenceProgress >= 1 && (
          <circle
            cx={window.innerWidth / 2 + smoothOffset.x}
            cy={window.innerHeight / 2 + smoothOffset.y}
            r={maxSize / 2}
            fill="black"
          />
        )}
      </svg>

      {/* Logos for sequence circles */}
      {logoSequenceProgress > 0 && logoSequenceProgress < 1 && (
        <>
          {currentLogo !== 'empty' && renderLogo(currentLogo, outgoingY, outgoingOpacity)}
          {nextLogo !== 'empty' && renderLogo(nextLogo, incomingY, incomingOpacity)}
        </>
      )}

      {/* Logo display on hover - only when not in logo sequence */}
      {hoveredProject && logoSequenceProgress <= 0 && circleProgress >= 1 && (
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
    </div>
  );
}
