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
  onEnter?: () => void;
  onBack?: () => void;
  isEntered?: boolean;
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

export function WhiteSection({ progress, circleProgress, onCaseStudyChange, onZoomProgress, onEnter, onBack, isEntered }: WhiteSectionProps) {
  const translateY = Math.max(0, 100 - progress * 100);
  
  const minSize = 150;
  const maxSize = 460;
  
  const [smoothOffset, setSmoothOffset] = useState({ x: 0, y: 0 });
  const [logoOffset, setLogoOffset] = useState({ x: 0, y: 0 });
  const [trail, setTrail] = useState<TrailPoint[]>([]);
  const [hoveredProject, setHoveredProject] = useState<string | null>(null);
  const [openCaseStudy, setOpenCaseStudy] = useState<string | null>(null);
  const [zoomProgress, setZoomProgress] = useState(0);
  const [postZoomProgress, setPostZoomProgress] = useState(0);
  const targetZoom = useRef(0);
  const targetPostZoom = useRef(0);
  const smoothAnimFrame = useRef<number>(0);
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
      setPostZoomProgress(0);
      onZoomProgress?.(0);
    }
  }, [isWorksScreenVisible, openCaseStudy, onZoomProgress]);

  // Separate scroll handler for zooming into the circle
  useEffect(() => {
    if (!isWorksScreenVisible || openCaseStudy !== null) return;
    
    const freeScrollThreshold = 800; // Free scroll before zoom starts
    const zoomThreshold = 2000; // Zoom scroll distance
    const postZoomThreshold = 4000; // Scroll distance after zoom for contact section
    const totalThreshold = freeScrollThreshold + zoomThreshold + postZoomThreshold;
    
    const handleWheel = (e: WheelEvent) => {
      if (!isWorksScreenVisible || openCaseStudy !== null) return;
      
      const isScrollingUp = e.deltaY < 0;
      if (isScrollingUp && zoomScrollAccumulator.current <= 0) {
        return;
      }
      
      e.preventDefault();
      
      zoomScrollAccumulator.current += e.deltaY;
      zoomScrollAccumulator.current = Math.max(0, Math.min(totalThreshold, zoomScrollAccumulator.current));
      
      const zoomStart = Math.max(0, zoomScrollAccumulator.current - freeScrollThreshold);
      targetZoom.current = Math.min(1, zoomStart / zoomThreshold);
      
      const postStart = Math.max(0, zoomScrollAccumulator.current - freeScrollThreshold - zoomThreshold);
      targetPostZoom.current = Math.min(1, postStart / postZoomThreshold);
    };
    
    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
    
    const smoothUpdate = () => {
      setZoomProgress(prev => {
        const next = lerp(prev, targetZoom.current, 0.12);
        if (Math.abs(next - targetZoom.current) < 0.001) return targetZoom.current;
        return next;
      });
      setPostZoomProgress(prev => {
        const next = lerp(prev, targetPostZoom.current, 0.12);
        if (Math.abs(next - targetPostZoom.current) < 0.001) return targetPostZoom.current;
        return next;
      });
      onZoomProgress?.(targetZoom.current);
      smoothAnimFrame.current = requestAnimationFrame(smoothUpdate);
    };
    smoothAnimFrame.current = requestAnimationFrame(smoothUpdate);
    
    window.addEventListener('wheel', handleWheel, { passive: false });
    
    return () => {
      window.removeEventListener('wheel', handleWheel);
      cancelAnimationFrame(smoothAnimFrame.current);
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

      {zoomProgress > 0.3 && !openCaseStudy && (
        <div 
          className="fixed inset-0 z-30 pointer-events-auto flex items-center justify-center"
          style={{
            backgroundColor: isEntered ? '#fff' : '#000',
            opacity: Math.min(1, (zoomProgress - 0.3) / 0.4),
            transition: 'background-color 0.8s ease-out, opacity 0.3s ease-out',
          }}
          data-testid="black-screen-section"
        >
          {isEntered && (
            <button
              className="fixed top-6 left-6 z-40 flex items-center gap-2 px-4 py-2 rounded-full border border-black/10 bg-white/80 backdrop-blur-sm hover:bg-black/5 transition-colors text-black/60 hover:text-black/90 text-sm"
              onClick={() => onBack?.()}
              data-testid="button-back-home"
            >
              <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="14" y1="10" x2="6" y2="10" />
                <polyline points="10,4 4,10 10,16" />
              </svg>
              Back
            </button>
          )}
          {zoomProgress >= 0.85 && !isEntered && postZoomProgress < 0.5 && (
            <button
              className="group relative flex items-center justify-center cursor-pointer"
              style={{
                opacity: postZoomProgress > 0.3 
                  ? Math.max(0, 1 - (postZoomProgress - 0.3) / 0.2)
                  : Math.min(1, (zoomProgress - 0.85) / 0.15),
              }}
              onClick={() => onEnter?.()}
              data-testid="button-enter"
            >
              <div className="absolute w-44 h-44 md:w-56 md:h-56 rounded-full border border-white/10 group-hover:border-white/30 group-hover:scale-110 transition-all duration-700 ease-out" />
              <div className="absolute w-52 h-52 md:w-64 md:h-64 rounded-full border border-white/5 group-hover:border-white/15 group-hover:scale-105 transition-all duration-1000 ease-out"
                style={{ animation: 'pulseRing 3s ease-in-out infinite' }}
              />
              <div className="absolute w-60 h-60 md:w-72 md:h-72 rounded-full border border-white/[0.03] group-hover:border-white/10 group-hover:scale-105 transition-all duration-1000 ease-out"
                style={{ animation: 'pulseRing 4s ease-in-out infinite 1s' }}
              />
              <div className="relative flex flex-col items-center gap-2">
                <span className="font-anton text-white/90 text-3xl md:text-5xl tracking-[0.35em] uppercase group-hover:tracking-[0.5em] group-hover:text-white transition-all duration-500 ease-out"
                  style={{ textShadow: '0 0 30px rgba(255,255,255,0.15)' }}
                >
                  ENTER
                </span>
                <span className="text-white/20 text-[10px] md:text-xs tracking-[0.3em] uppercase group-hover:text-white/40 transition-all duration-500">
                  explore
                </span>
              </div>
            </button>
          )}
          {postZoomProgress > 0.3 && !isEntered && (
            <div 
              className="fixed inset-0 z-40 bg-black overflow-hidden"
              style={{ opacity: Math.min(1, (postZoomProgress - 0.3) / 0.3) }}
              data-testid="post-zoom-section"
            >
              {(() => {
                const headingVisible = Math.min(1, Math.max(0, (postZoomProgress - 0.5) / 0.2));
                const contactPhase = Math.max(0, (postZoomProgress - 0.75) / 0.25);
                const headingShift = contactPhase * 120;
                const mailOpacity = Math.min(1, Math.max(0, contactPhase * 2));
                const formOpacity = Math.min(1, Math.max(0, (contactPhase - 0.2) * 1.5));
                
                return (
                  <>
                    <div 
                      className="absolute left-8 md:left-16 lg:left-24 max-w-3xl"
                      style={{
                        opacity: headingVisible,
                        top: `calc(50% - ${headingShift}px)`,
                        transform: `translateY(-50%)`,
                        transition: 'top 0.3s ease-out',
                      }}
                    >
                      <h2
                        className="text-white font-black text-3xl md:text-5xl lg:text-5xl leading-tight"
                        style={{ fontFamily: "'Anton', sans-serif" }}
                        data-testid="text-contact-heading"
                      >
                        Let's connect and create<br />meaningful digital experiences.
                      </h2>
                    </div>
                    
                    {contactPhase > 0 && (
                      <div
                        className="absolute left-8 md:left-16 lg:left-24"
                        style={{ 
                          opacity: mailOpacity,
                          top: `calc(50% + ${40 - headingShift * 0.3}px)`,
                        }}
                      >
                        <img 
                          src="https://media2.giphy.com/media/v1.Y2lkPTc5MGI3NjExMW1scHhhYmRzczJiYjRmbjlpbjNlNndrNm5oM3cweDhmam5wbndibyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/iXDe1s3spQUZG/giphy.gif"
                          alt="Creative animation"
                          className="w-80 md:w-[28rem] lg:w-[32rem] h-48 md:h-56 lg:h-60 object-cover rounded-lg"
                          data-testid="img-contact-gif"
                        />
                      </div>
                    )}

                    {contactPhase > 0 && (
                      <div
                        className="absolute left-8 md:left-16 lg:left-24 bottom-12 md:bottom-16"
                        style={{ opacity: mailOpacity }}
                      >
                        <span className="text-white/50 text-sm md:text-base">Mail : </span>
                        <a
                          href="mailto:leosr1033@gmail.com"
                          className="group relative text-white text-sm md:text-base pointer-events-auto"
                          data-testid="link-email"
                        >
                          leosr1033@gmail.com
                          <span className="absolute left-0 bottom-0 w-full h-[1px] bg-white origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ease-out" />
                        </a>
                      </div>
                    )}
                    
                    {contactPhase > 0.2 && (
                      <div
                        className="absolute right-8 md:right-16 lg:right-24 bottom-12 md:bottom-16 top-[35%] md:top-[30%] w-[90%] max-w-md pointer-events-auto"
                        style={{ 
                          opacity: formOpacity,
                          transform: `translateY(${Math.max(0, 30 - formOpacity * 30)}px)`,
                        }}
                        data-testid="contact-form"
                      >
                        <h3 className="text-white font-bold text-2xl md:text-3xl mb-8" style={{ fontFamily: "'Anton', sans-serif" }}>
                          Contact
                        </h3>
                        <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
                          <div className="flex gap-4">
                            <div className="flex-1">
                              <label className="text-white/60 text-sm block mb-2">First Name</label>
                              <input
                                type="text"
                                className="w-full bg-transparent border-b border-white/30 text-white py-2 outline-none focus:border-white/70 transition-colors"
                                data-testid="input-first-name"
                              />
                            </div>
                            <div className="flex-1">
                              <label className="text-white/60 text-sm block mb-2">Last Name</label>
                              <input
                                type="text"
                                className="w-full bg-transparent border-b border-white/30 text-white py-2 outline-none focus:border-white/70 transition-colors"
                                data-testid="input-last-name"
                              />
                            </div>
                          </div>
                          <div>
                            <label className="text-white/60 text-sm block mb-2">Email *</label>
                            <input
                              type="email"
                              className="w-full bg-transparent border-b border-white/30 text-white py-2 outline-none focus:border-white/70 transition-colors"
                              data-testid="input-email"
                            />
                          </div>
                          <div>
                            <label className="text-white/60 text-sm block mb-2">Write a message</label>
                            <textarea
                              rows={3}
                              className="w-full bg-transparent border-b border-white/30 text-white py-2 outline-none focus:border-white/70 transition-colors resize-none"
                              data-testid="input-message"
                            />
                          </div>
                          <button
                            type="submit"
                            className="px-8 py-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors text-sm tracking-wider"
                            data-testid="button-submit-contact"
                          >
                            Submit
                          </button>
                        </form>
                      </div>
                    )}
                  </>
                );
              })()}
            </div>
          )}
        </div>
      )}

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
