import { useRef, useMemo, useState, useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import * as THREE from "three";
import posterImage from "@assets/Payment_Mobile_Application_1769106866544.png";

interface WorkSectionProps {
  visible: boolean;
  onOpenCaseStudy?: () => void;
}

function NeonGrid({ position, rotation, color }: { position: [number, number, number]; rotation: [number, number, number]; color: string }) {
  const gridRef = useRef<THREE.Mesh>(null);

  const gridTexture = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext("2d")!;
    
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, 512, 512);
    
    const gridSize = 32;
    ctx.strokeStyle = color;
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.6;
    
    for (let x = 0; x <= 512; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, 512);
      ctx.stroke();
    }
    
    for (let y = 0; y <= 512; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(512, y);
      ctx.stroke();
    }
    
    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(20, 20);
    return tex;
  }, [color]);

  useFrame((state) => {
    if (gridRef.current) {
      const material = gridRef.current.material as THREE.MeshBasicMaterial;
      material.opacity = 0.3 + Math.sin(state.clock.elapsedTime * 2) * 0.1;
    }
  });

  return (
    <mesh ref={gridRef} position={position} rotation={rotation}>
      <planeGeometry args={[100, 100]} />
      <meshBasicMaterial 
        map={gridTexture} 
        transparent 
        opacity={0.4}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

function FloatingParticles() {
  const particlesRef = useRef<THREE.Points>(null);
  
  const { positions, colors } = useMemo(() => {
    const count = 300;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 50;
      positions[i * 3 + 1] = Math.random() * 15 - 2;
      positions[i * 3 + 2] = -5 - Math.random() * 35;
      
      const color = new THREE.Color();
      const hue = Math.random() > 0.5 ? 0.8 + Math.random() * 0.1 : 0.75 + Math.random() * 0.05;
      color.setHSL(hue, 0.8, 0.6);
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
    }
    
    return { positions, colors };
  }, []);

  useFrame((state) => {
    if (particlesRef.current) {
      particlesRef.current.rotation.y = state.clock.elapsedTime * 0.015;
      const posArray = particlesRef.current.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < posArray.length / 3; i++) {
        posArray[i * 3 + 1] += Math.sin(state.clock.elapsedTime * 0.5 + i * 0.1) * 0.003;
        posArray[i * 3] += Math.cos(state.clock.elapsedTime * 0.3 + i * 0.05) * 0.001;
      }
      particlesRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={positions.length / 3}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={colors.length / 3}
          array={colors}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial size={0.08} vertexColors transparent opacity={0.9} />
    </points>
  );
}

function ColorOrbs() {
  const orbsRef = useRef<THREE.Group>(null);
  
  const orbs = useMemo(() => [
    { position: [-8, 3, -18], color: "#a855f7", size: 3, speed: 0.3 },
    { position: [10, 5, -22], color: "#ec4899", size: 4, speed: 0.2 },
    { position: [-5, -1, -15], color: "#8b5cf6", size: 2.5, speed: 0.4 },
    { position: [7, 1, -14], color: "#d946ef", size: 2, speed: 0.35 },
    { position: [0, 6, -25], color: "#c084fc", size: 5, speed: 0.15 },
    { position: [-12, 4, -20], color: "#f472b6", size: 3.5, speed: 0.25 },
  ], []);

  useFrame((state) => {
    if (orbsRef.current) {
      orbsRef.current.children.forEach((orb, i) => {
        const orbData = orbs[i];
        orb.position.y = orbData.position[1] + Math.sin(state.clock.elapsedTime * orbData.speed + i) * 1.5;
        orb.position.x = orbData.position[0] + Math.cos(state.clock.elapsedTime * orbData.speed * 0.5 + i) * 1;
      });
    }
  });

  return (
    <group ref={orbsRef}>
      {orbs.map((orb, i) => (
        <mesh key={i} position={orb.position as [number, number, number]}>
          <sphereGeometry args={[orb.size, 32, 32]} />
          <meshBasicMaterial 
            color={orb.color} 
            transparent 
            opacity={0.15} 
          />
        </mesh>
      ))}
    </group>
  );
}

function GlowRings() {
  const ringsRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (ringsRef.current) {
      ringsRef.current.rotation.z = state.clock.elapsedTime * 0.1;
      ringsRef.current.children.forEach((ring, i) => {
        ring.rotation.x = state.clock.elapsedTime * 0.05 * (i + 1);
        ring.rotation.y = state.clock.elapsedTime * 0.03 * (i + 1);
      });
    }
  });

  return (
    <group ref={ringsRef} position={[0, 2, -16]}>
      {[6, 8, 10].map((radius, i) => (
        <mesh key={i} rotation={[Math.PI / 2 + i * 0.3, 0, 0]}>
          <torusGeometry args={[radius, 0.02, 16, 100]} />
          <meshBasicMaterial 
            color={i === 0 ? "#a855f7" : i === 1 ? "#ec4899" : "#8b5cf6"} 
            transparent 
            opacity={0.3 - i * 0.08} 
          />
        </mesh>
      ))}
    </group>
  );
}

function GlassyPoster({ onPosterClick }: { onPosterClick: () => void }) {
  const posterRef = useRef<THREE.Group>(null);
  const glassRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [gyro, setGyro] = useState({ x: 0, y: 0 });
  const { viewport } = useThree();
  
  const texture = useTexture(posterImage);
  
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 2;
      const y = (e.clientY / window.innerHeight - 0.5) * 2;
      setMousePos({ x, y });
    };
    
    const handleDeviceOrientation = (e: DeviceOrientationEvent) => {
      if (e.gamma !== null && e.beta !== null) {
        setGyro({
          x: (e.gamma / 45) * 0.3,
          y: ((e.beta - 45) / 45) * 0.3,
        });
      }
    };
    
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("deviceorientation", handleDeviceOrientation);
    
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("deviceorientation", handleDeviceOrientation);
    };
  }, []);

  useFrame((state) => {
    if (posterRef.current) {
      const targetRotY = (mousePos.x * 0.15 + gyro.x) * (hovered ? 1.5 : 1);
      const targetRotX = (-mousePos.y * 0.1 + gyro.y) * (hovered ? 1.5 : 1);
      
      posterRef.current.rotation.y = THREE.MathUtils.lerp(
        posterRef.current.rotation.y,
        targetRotY,
        0.05
      );
      posterRef.current.rotation.x = THREE.MathUtils.lerp(
        posterRef.current.rotation.x,
        targetRotX,
        0.05
      );
      
      posterRef.current.position.y = 2 + Math.sin(state.clock.elapsedTime * 0.5) * 0.15;
      
      const targetScale = hovered ? 1.08 : 1;
      posterRef.current.scale.x = THREE.MathUtils.lerp(posterRef.current.scale.x, targetScale, 0.1);
      posterRef.current.scale.y = THREE.MathUtils.lerp(posterRef.current.scale.y, targetScale, 0.1);
    }
    if (glassRef.current) {
      const material = glassRef.current.material as THREE.MeshPhysicalMaterial;
      material.opacity = hovered ? 0.25 : 0.12;
    }
  });

  const aspectRatio = 9 / 16;
  const posterHeight = 5;
  const posterWidth = posterHeight * aspectRatio;

  return (
    <group 
      ref={posterRef} 
      position={[0, 2, -12]}
      onClick={onPosterClick}
      onPointerOver={() => {
        setHovered(true);
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={() => {
        setHovered(false);
        document.body.style.cursor = "default";
      }}
    >
      <mesh position={[0, 0, -0.08]}>
        <boxGeometry args={[posterWidth + 0.3, posterHeight + 0.3, 0.12]} />
        <meshStandardMaterial 
          color="#1a1a2e" 
          metalness={0.95} 
          roughness={0.15}
          emissive="#2a1a4a"
          emissiveIntensity={0.1}
        />
      </mesh>
      
      <mesh position={[0, 0, 0.01]}>
        <planeGeometry args={[posterWidth, posterHeight]} />
        <meshBasicMaterial map={texture} />
      </mesh>
      
      <mesh ref={glassRef} position={[0, 0, 0.08]}>
        <planeGeometry args={[posterWidth + 0.15, posterHeight + 0.15]} />
        <meshPhysicalMaterial 
          color="#ffffff"
          transparent
          opacity={0.12}
          roughness={0.05}
          metalness={0.1}
          clearcoat={1}
          clearcoatRoughness={0.05}
          reflectivity={1}
          envMapIntensity={2}
        />
      </mesh>
      
      <mesh position={[0, 0, 0.1]}>
        <planeGeometry args={[posterWidth + 0.2, posterHeight + 0.2]} />
        <meshBasicMaterial 
          color={hovered ? "#a855f7" : "#8b5cf6"} 
          transparent 
          opacity={hovered ? 0.2 : 0.08} 
        />
      </mesh>
      
      <pointLight 
        position={[0, 0, 3]} 
        intensity={hovered ? 4 : 1.5} 
        color="#a855f7" 
        distance={10} 
        decay={2} 
      />
      <pointLight 
        position={[-2, 2, 2]} 
        intensity={hovered ? 2 : 0.8} 
        color="#ec4899" 
        distance={8} 
        decay={2} 
      />
      <pointLight 
        position={[2, -2, 2]} 
        intensity={hovered ? 2 : 0.8} 
        color="#8b5cf6" 
        distance={8} 
        decay={2} 
      />
      
      {[
        [-posterWidth/2 - 0.15, -posterHeight/2 - 0.15],
        [-posterWidth/2 - 0.15, posterHeight/2 + 0.15],
        [posterWidth/2 + 0.15, -posterHeight/2 - 0.15],
        [posterWidth/2 + 0.15, posterHeight/2 + 0.15],
      ].map(([x, y], i) => (
        <mesh key={i} position={[x, y, 0.02]}>
          <sphereGeometry args={[0.06, 16, 16]} />
          <meshStandardMaterial 
            color="#c084fc" 
            metalness={0.95} 
            roughness={0.1}
            emissive="#a855f7"
            emissiveIntensity={hovered ? 0.5 : 0.2}
          />
        </mesh>
      ))}
    </group>
  );
}

export function WorkSection({ visible, onOpenCaseStudy }: WorkSectionProps) {
  const handlePosterClick = () => {
    onOpenCaseStudy?.();
  };

  if (!visible) return null;

  return (
    <group position={[0, 0, -5]}>
      <NeonGrid 
        position={[0, -1, -15]} 
        rotation={[-Math.PI / 2, 0, 0]} 
        color="#a855f7" 
      />
      
      <NeonGrid 
        position={[0, 8, -15]} 
        rotation={[Math.PI / 2, 0, 0]} 
        color="#ec4899" 
      />
      
      <ColorOrbs />
      <GlowRings />
      
      <GlassyPoster onPosterClick={handlePosterClick} />
      
      <FloatingParticles />
      
      <ambientLight intensity={0.08} color="#1a0a2e" />
      <pointLight position={[0, 5, -15]} intensity={2.5} color="#a855f7" distance={35} decay={2} />
      <pointLight position={[-12, 3, -20]} intensity={1.5} color="#ec4899" distance={25} decay={2} />
      <pointLight position={[12, 3, -20]} intensity={1.5} color="#8b5cf6" distance={25} decay={2} />
      <pointLight position={[0, -2, -10]} intensity={1} color="#c084fc" distance={20} decay={2} />
    </group>
  );
}

export function ProjectInfoOverlay({ visible }: { visible: boolean }) {
  if (!visible) return null;
  
  return (
    <div 
      className="fixed bottom-8 left-8 z-50 pointer-events-none"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      <div className="text-white/60 text-sm tracking-widest mb-1">
        CURRENT MOBILE PAYMENT APPLICATION
      </div>
      <div className="text-white text-2xl font-bold tracking-wide">
        PAYMENT APPLICATION
      </div>
      <div className="flex gap-2 mt-3">
        {["fintech", "mobile", "ui/ux", "figma"].map((tag) => (
          <span 
            key={tag}
            className="px-3 py-1 border border-white/30 text-white/70 text-xs uppercase tracking-wider"
          >
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
}

export function CaseStudyModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [currentSlide, setCurrentSlide] = useState(0);
  
  if (!isOpen) return null;
  
  const slides = [
    {
      title: "Current - Mobile Payment App",
      subtitle: "UI/UX Case Study",
      description: "A modern fintech application designed to simplify money transfers and financial management for the digital generation.",
      stats: ["40+ Screens", "3 Months", "Figma"],
    },
    {
      title: "Problem Statement",
      description: "Users struggle with complex payment interfaces that lack intuitive navigation and clear visual hierarchy, leading to transaction errors and frustration.",
      points: [
        "Confusing navigation patterns",
        "Lack of transaction transparency",
        "Poor onboarding experience",
      ],
    },
    {
      title: "Design Solution",
      description: "Created a streamlined interface with clear visual hierarchy, intuitive gestures, and delightful micro-interactions.",
      points: [
        "Simplified 3-step payment flow",
        "Real-time transaction tracking",
        "Personalized dashboard",
      ],
    },
    {
      title: "Key Features",
      points: [
        "Instant P2P Transfers",
        "Smart Bill Splitting",
        "Expense Analytics",
        "Biometric Authentication",
        "Multi-currency Support",
      ],
    },
  ];

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slides.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center"
      onClick={onClose}
      data-testid="case-study-modal-backdrop"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/95 via-black/95 to-pink-900/95 backdrop-blur-xl" />
      
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-pink-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 right-1/3 w-64 h-64 bg-violet-500/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>
      
      <div 
        className="relative w-[90vw] max-w-5xl h-[85vh] rounded-3xl overflow-hidden border border-white/10"
        onClick={(e) => e.stopPropagation()}
        data-testid="case-study-modal-content"
        style={{
          background: 'linear-gradient(135deg, rgba(30, 20, 50, 0.9) 0%, rgba(20, 10, 30, 0.95) 50%, rgba(40, 20, 60, 0.9) 100%)',
          boxShadow: '0 0 80px rgba(168, 85, 247, 0.3), 0 0 120px rgba(236, 72, 153, 0.2)',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />
        
        <button
          onClick={onClose}
          className="absolute top-6 right-6 z-20 w-12 h-12 flex items-center justify-center bg-white/10 hover:bg-white/20 rounded-full transition-all duration-300 border border-white/20 hover:border-white/40 hover:scale-110"
          data-testid="button-close-modal"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
        
        <div className="h-full flex flex-col p-8 md:p-12">
          <div className="flex-1 flex flex-col justify-center">
            <div 
              key={currentSlide}
              className="animate-fadeIn"
            >
              {slides[currentSlide].subtitle && (
                <p className="text-purple-300 text-sm tracking-[0.3em] uppercase mb-4">
                  {slides[currentSlide].subtitle}
                </p>
              )}
              
              <h2 className="text-4xl md:text-6xl font-bold text-white mb-6 tracking-tight">
                {slides[currentSlide].title}
              </h2>
              
              {slides[currentSlide].description && (
                <p className="text-white/70 text-lg md:text-xl max-w-2xl leading-relaxed mb-8">
                  {slides[currentSlide].description}
                </p>
              )}
              
              {slides[currentSlide].stats && (
                <div className="flex gap-8 mb-8">
                  {slides[currentSlide].stats.map((stat, i) => (
                    <div key={i} className="px-6 py-3 bg-white/5 rounded-full border border-white/10">
                      <span className="text-white font-medium">{stat}</span>
                    </div>
                  ))}
                </div>
              )}
              
              {slides[currentSlide].points && (
                <ul className="space-y-4">
                  {slides[currentSlide].points.map((point, i) => (
                    <li key={i} className="flex items-center gap-4 text-white/80 text-lg">
                      <span className="w-2 h-2 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full" />
                      {point}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
          
          <div className="flex items-center justify-between pt-8 border-t border-white/10">
            <div className="flex gap-2">
              {slides.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentSlide(i)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    i === currentSlide 
                      ? 'bg-gradient-to-r from-purple-400 to-pink-400 w-8' 
                      : 'bg-white/30 hover:bg-white/50'
                  }`}
                  data-testid={`slide-indicator-${i}`}
                />
              ))}
            </div>
            
            <div className="flex gap-4">
              <button
                onClick={prevSlide}
                className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-full transition-all duration-300 border border-white/20 hover:border-white/40 text-white flex items-center gap-2"
                data-testid="button-prev-slide"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M15 18l-6-6 6-6" />
                </svg>
                Previous
              </button>
              <button
                onClick={nextSlide}
                className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 rounded-full transition-all duration-300 text-white flex items-center gap-2"
                data-testid="button-next-slide"
              >
                Next
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
