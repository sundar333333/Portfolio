import { useRef, useMemo, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface WorkSectionProps {
  visible: boolean;
  onOpenCaseStudy?: () => void;
}

const FIGMA_CASE_STUDY_URL = "https://www.figma.com/proto/6D1cHJn9cNle6SrkOGKiwb/Untitled?page-id=0%3A1&node-id=7-21388&viewport=-2836%2C166%2C0.05&t=0nqb9yoqrLCZxWQt-1&scaling=min-zoom&content-scaling=fixed";

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

function Monitor({ position, rotation, projectIndex }: { position: [number, number, number]; rotation: [number, number, number]; projectIndex: number }) {
  const monitorRef = useRef<THREE.Group>(null);
  const screenRef = useRef<THREE.Mesh>(null);

  const colors = ["#ff00ff", "#00ffff", "#ff6600", "#00ff66", "#6600ff", "#ffff00"];
  const color = colors[projectIndex % colors.length];

  const screenTexture = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 256;
    canvas.height = 192;
    const ctx = canvas.getContext("2d")!;
    
    const gradient = ctx.createLinearGradient(0, 0, 256, 192);
    gradient.addColorStop(0, "#0a0a0a");
    gradient.addColorStop(1, "#1a1a1a");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 256, 192);
    
    for (let y = 0; y < 192; y += 2) {
      ctx.fillStyle = "rgba(0, 0, 0, 0.15)";
      ctx.fillRect(0, y, 256, 1);
    }
    
    ctx.fillStyle = color;
    ctx.font = "bold 24px monospace";
    ctx.textAlign = "center";
    ctx.fillText(`PROJECT ${projectIndex + 1}`, 128, 100);
    
    const tex = new THREE.CanvasTexture(canvas);
    return tex;
  }, [color, projectIndex]);

  useFrame((state) => {
    if (monitorRef.current) {
      monitorRef.current.position.y += Math.sin(state.clock.elapsedTime * 0.5 + projectIndex) * 0.001;
    }
    if (screenRef.current) {
      const material = screenRef.current.material as THREE.MeshBasicMaterial;
      material.opacity = 0.8 + Math.sin(state.clock.elapsedTime * 3 + projectIndex * 0.5) * 0.2;
    }
  });

  return (
    <group ref={monitorRef} position={position} rotation={rotation}>
      <mesh>
        <boxGeometry args={[2.2, 1.7, 0.15]} />
        <meshStandardMaterial color="#1a1a1a" metalness={0.8} roughness={0.3} />
      </mesh>
      
      <mesh ref={screenRef} position={[0, 0, 0.08]}>
        <planeGeometry args={[2, 1.5]} />
        <meshBasicMaterial map={screenTexture} transparent opacity={0.9} />
      </mesh>
      
      <mesh position={[0, 0, 0.09]}>
        <planeGeometry args={[2.02, 1.52]} />
        <meshBasicMaterial color={color} transparent opacity={0.05} />
      </mesh>
      
      <pointLight position={[0, 0, 0.5]} intensity={0.5} color={color} distance={3} decay={2} />
    </group>
  );
}

function MonitorWall() {
  const monitors = useMemo(() => {
    const items: { position: [number, number, number]; rotation: [number, number, number]; index: number }[] = [];
    
    const curveRadius = 12;
    const numMonitors = 7;
    const angleSpan = Math.PI * 0.6;
    const startAngle = -angleSpan / 2;
    
    for (let i = 0; i < numMonitors; i++) {
      const angle = startAngle + (i / (numMonitors - 1)) * angleSpan;
      const x = Math.sin(angle) * curveRadius;
      const z = -20 - Math.cos(angle) * curveRadius;
      const y = (i % 2 === 0) ? 1 : 2.5;
      const rotY = -angle;
      
      items.push({
        position: [x, y, z],
        rotation: [0, rotY, 0],
        index: i,
      });
    }
    
    for (let i = 0; i < 5; i++) {
      const angle = startAngle + ((i + 0.5) / (numMonitors - 1)) * angleSpan;
      const x = Math.sin(angle) * (curveRadius + 3);
      const z = -24 - Math.cos(angle) * curveRadius;
      const y = 4;
      const rotY = -angle;
      
      items.push({
        position: [x, y, z],
        rotation: [0, rotY, 0],
        index: i + numMonitors,
      });
    }
    
    return items;
  }, []);

  return (
    <group>
      {monitors.map((monitor, i) => (
        <Monitor
          key={i}
          position={monitor.position}
          rotation={monitor.rotation}
          projectIndex={monitor.index}
        />
      ))}
    </group>
  );
}

function FloatingParticles() {
  const particlesRef = useRef<THREE.Points>(null);
  
  const { positions, colors } = useMemo(() => {
    const count = 200;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 40;
      positions[i * 3 + 1] = Math.random() * 10;
      positions[i * 3 + 2] = -10 - Math.random() * 30;
      
      const color = new THREE.Color();
      color.setHSL(Math.random() * 0.3 + 0.5, 1, 0.5);
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
    }
    
    return { positions, colors };
  }, []);

  useFrame((state) => {
    if (particlesRef.current) {
      particlesRef.current.rotation.y = state.clock.elapsedTime * 0.02;
      const posArray = particlesRef.current.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < posArray.length / 3; i++) {
        posArray[i * 3 + 1] += Math.sin(state.clock.elapsedTime + i) * 0.002;
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
      <pointsMaterial size={0.1} vertexColors transparent opacity={0.8} />
    </points>
  );
}

function GlassyPoster({ onPosterClick }: { onPosterClick: () => void }) {
  const posterRef = useRef<THREE.Group>(null);
  const glassRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  
  const posterTexture = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 1024;
    canvas.height = 640;
    const ctx = canvas.getContext("2d")!;
    
    const gradient = ctx.createLinearGradient(0, 0, 1024, 640);
    gradient.addColorStop(0, "#667eea");
    gradient.addColorStop(0.5, "#764ba2");
    gradient.addColorStop(1, "#f093fb");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 1024, 640);
    
    ctx.fillStyle = "rgba(255, 255, 255, 0.03)";
    for (let i = 0; i < 20; i++) {
      const x = Math.random() * 1024;
      const y = Math.random() * 640;
      const r = Math.random() * 150 + 50;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }
    
    ctx.fillStyle = "rgba(0, 0, 0, 0.2)";
    ctx.beginPath();
    ctx.moveTo(0, 640);
    ctx.lineTo(400, 640);
    ctx.lineTo(600, 400);
    ctx.lineTo(200, 400);
    ctx.closePath();
    ctx.fill();
    
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 72px 'Inter', sans-serif";
    ctx.textAlign = "left";
    ctx.fillText("Current", 60, 120);
    
    ctx.font = "300 36px 'Inter', sans-serif";
    ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
    ctx.fillText("Mobile Payment App", 60, 170);
    
    ctx.font = "bold 160px 'Inter', sans-serif";
    ctx.fillStyle = "rgba(255, 255, 255, 0.15)";
    ctx.fillText("$", 750, 550);
    
    ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
    ctx.beginPath();
    ctx.roundRect(60, 220, 180, 50, 25);
    ctx.fill();
    
    ctx.fillStyle = "#667eea";
    ctx.font = "600 18px 'Inter', sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("VIEW CASE STUDY", 150, 252);
    
    ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
    ctx.font = "14px 'Inter', sans-serif";
    ctx.textAlign = "left";
    ctx.fillText("40+ Screens  •  UI/UX Design  •  Fintech", 60, 560);
    
    ctx.fillStyle = "rgba(255, 255, 255, 0.2)";
    ctx.beginPath();
    ctx.roundRect(700, 80, 260, 460, 30);
    ctx.fill();
    
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.roundRect(720, 100, 220, 420, 20);
    ctx.fill();
    
    ctx.fillStyle = "#667eea";
    ctx.beginPath();
    ctx.roundRect(740, 120, 180, 60, 10);
    ctx.fill();
    
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 24px 'Inter', sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("Current", 830, 160);
    
    ctx.fillStyle = "#f0f0f0";
    ctx.beginPath();
    ctx.roundRect(740, 200, 180, 100, 10);
    ctx.fill();
    
    ctx.fillStyle = "#333";
    ctx.font = "14px 'Inter', sans-serif";
    ctx.fillText("Your Balance", 830, 230);
    ctx.font = "bold 28px 'Inter', sans-serif";
    ctx.fillText("$10,800", 830, 270);
    
    ctx.fillStyle = "#e0e0e0";
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.roundRect(740, 320 + i * 60, 180, 50, 8);
      ctx.fill();
    }
    
    const tex = new THREE.CanvasTexture(canvas);
    tex.needsUpdate = true;
    return tex;
  }, []);

  useFrame((state) => {
    if (posterRef.current) {
      posterRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.05;
      posterRef.current.position.y = 2 + Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
    }
    if (glassRef.current) {
      const material = glassRef.current.material as THREE.MeshPhysicalMaterial;
      material.opacity = hovered ? 0.25 : 0.15;
    }
  });

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
      <mesh position={[0, 0, -0.05]}>
        <boxGeometry args={[6.5, 4.2, 0.1]} />
        <meshStandardMaterial color="#0a0a0a" metalness={0.9} roughness={0.2} />
      </mesh>
      
      <mesh position={[0, 0, 0.01]}>
        <planeGeometry args={[6, 3.8]} />
        <meshBasicMaterial map={posterTexture} />
      </mesh>
      
      <mesh ref={glassRef} position={[0, 0, 0.06]}>
        <planeGeometry args={[6.2, 4]} />
        <meshPhysicalMaterial 
          color="#ffffff"
          transparent
          opacity={0.15}
          roughness={0.1}
          metalness={0.1}
          clearcoat={1}
          clearcoatRoughness={0.1}
          reflectivity={1}
          envMapIntensity={1}
        />
      </mesh>
      
      <mesh position={[0, 0, 0.07]}>
        <planeGeometry args={[6.3, 4.1]} />
        <meshBasicMaterial 
          color={hovered ? "#00ffff" : "#ffffff"} 
          transparent 
          opacity={hovered ? 0.15 : 0.05} 
        />
      </mesh>
      
      <pointLight 
        position={[0, 0, 2]} 
        intensity={hovered ? 3 : 1} 
        color="#00ffff" 
        distance={8} 
        decay={2} 
      />
      
      {[-3.3, 3.3].map((x) => (
        [-2.1, 2.1].map((y) => (
          <mesh key={`${x}-${y}`} position={[x, y, 0]}>
            <sphereGeometry args={[0.08, 16, 16]} />
            <meshStandardMaterial color="#333333" metalness={0.9} roughness={0.3} />
          </mesh>
        ))
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
        color="#00ffff" 
      />
      
      <NeonGrid 
        position={[0, 8, -15]} 
        rotation={[Math.PI / 2, 0, 0]} 
        color="#ff00ff" 
      />
      
      <GlassyPoster onPosterClick={handlePosterClick} />
      
      <FloatingParticles />
      
      <ambientLight intensity={0.1} color="#0a0a20" />
      <pointLight position={[0, 5, -15]} intensity={2} color="#00ffff" distance={30} decay={2} />
      <pointLight position={[-10, 3, -20]} intensity={1} color="#ff00ff" distance={20} decay={2} />
      <pointLight position={[10, 3, -20]} intensity={1} color="#ff6600" distance={20} decay={2} />
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
  if (!isOpen) return null;
  
  const caseStudyUrl = "https://www.figma.com/proto/6D1cHJn9cNle6SrkOGKiwb/Untitled?page-id=0%3A1&node-id=7-21388&viewport=-2836%2C166%2C0.05&t=0nqb9yoqrLCZxWQt-1&scaling=min-zoom&content-scaling=fixed&embed-host=share";
  
  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm"
      onClick={onClose}
      data-testid="case-study-modal-backdrop"
    >
      <div 
        className="relative w-[95vw] h-[90vh] bg-black rounded-lg overflow-hidden border border-white/20"
        onClick={(e) => e.stopPropagation()}
        data-testid="case-study-modal-content"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-10 h-10 flex items-center justify-center bg-white/10 hover:bg-white/20 rounded-full transition-colors border border-white/20"
          data-testid="button-close-modal"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
        
        <iframe
          src={caseStudyUrl}
          className="w-full h-full"
          title="Case Study"
          allowFullScreen
          data-testid="case-study-iframe"
        />
      </div>
    </div>
  );
}
