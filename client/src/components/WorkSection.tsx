import { useRef, useMemo, useState, useEffect } from "react";
import { useFrame, useLoader } from "@react-three/fiber";
import * as THREE from "three";
import { TextureLoader } from "three";
import posterImage from "@assets/Tabloid_-_2_1769105145589.png";

interface WorkSectionProps {
  visible: boolean;
  scrollProgress: number;
}

const PROJECT_URLS = [
  "https://www.figma.com/design/6D1cHJn9cNle6SrkOGKiwb/Untitled?node-id=7-21388&t=sTXlqiMvFTKS7ZVR-1",
  "https://www.figma.com/design/6D1cHJn9cNle6SrkOGKiwb/Untitled?node-id=7-21388",
  "https://www.figma.com/design/6D1cHJn9cNle6SrkOGKiwb/Untitled?node-id=7-21388",
  "https://www.figma.com/design/6D1cHJn9cNle6SrkOGKiwb/Untitled?node-id=7-21388",
];

function WormholeGrid({ scrollProgress }: { scrollProgress: number }) {
  const gridLinesRef = useRef<THREE.Group>(null);
  
  const radialMaterial = useMemo(() => 
    new THREE.LineBasicMaterial({ color: "#00ffff", transparent: true, opacity: 0.4 }), 
  []);
  const circularMaterial = useMemo(() => 
    new THREE.LineBasicMaterial({ color: "#8040ff", transparent: true, opacity: 0.6 }), 
  []);
  
  const { radialLineObjects, circularLineObjects } = useMemo(() => {
    const radialObjs: THREE.Line[] = [];
    const circularObjs: THREE.Line[] = [];
    
    const numRadialLines = 48;
    const numCircles = 20;
    const maxRadius = 40;
    const funnelDepth = 12;
    const centerZ = -25;
    
    for (let i = 0; i < numRadialLines; i++) {
      const angle = (i / numRadialLines) * Math.PI * 2;
      const points: THREE.Vector3[] = [];
      
      for (let r = 0; r <= maxRadius; r += 0.5) {
        const normalizedR = r / maxRadius;
        const depth = Math.pow(1 - normalizedR, 3) * funnelDepth;
        const spiralOffset = (1 - normalizedR) * Math.PI * 0.5;
        
        const x = Math.cos(angle + spiralOffset) * r;
        const z = Math.sin(angle + spiralOffset) * r + centerZ;
        const y = -depth;
        
        points.push(new THREE.Vector3(x, y, z));
      }
      
      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      radialObjs.push(new THREE.Line(geometry, radialMaterial));
    }
    
    for (let c = 1; c <= numCircles; c++) {
      const radius = (c / numCircles) * maxRadius;
      const points: THREE.Vector3[] = [];
      const segments = 64;
      
      for (let i = 0; i <= segments; i++) {
        const angle = (i / segments) * Math.PI * 2;
        const normalizedR = radius / maxRadius;
        const depth = Math.pow(1 - normalizedR, 3) * funnelDepth;
        const spiralOffset = (1 - normalizedR) * Math.PI * 0.5;
        
        const x = Math.cos(angle + spiralOffset) * radius;
        const z = Math.sin(angle + spiralOffset) * radius + centerZ;
        const y = -depth;
        
        points.push(new THREE.Vector3(x, y, z));
      }
      
      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      circularObjs.push(new THREE.Line(geometry, circularMaterial));
    }
    
    return { radialLineObjects: radialObjs, circularLineObjects: circularObjs };
  }, [radialMaterial, circularMaterial]);

  const intensity = Math.min(scrollProgress * 2, 1);

  useFrame((state) => {
    if (gridLinesRef.current) {
      gridLinesRef.current.rotation.y = state.clock.elapsedTime * 0.05;
    }
    radialMaterial.opacity = intensity * 0.4;
    circularMaterial.opacity = intensity * 0.6;
  });

  return (
    <group ref={gridLinesRef}>
      {radialLineObjects.map((line, i) => (
        <primitive key={`radial-${i}`} object={line} />
      ))}
      {circularLineObjects.map((line, i) => (
        <primitive key={`circular-${i}`} object={line} />
      ))}
      
      <mesh position={[0, -12, -25]} rotation={[-Math.PI * 0.5, 0, 0]}>
        <circleGeometry args={[2, 32]} />
        <meshBasicMaterial color="#ff00ff" transparent opacity={intensity * 0.8} />
      </mesh>
      <pointLight position={[0, -10, -25]} intensity={intensity * 5} color="#ff00ff" distance={20} decay={2} />
    </group>
  );
}

function SpaceStars() {
  const starsRef = useRef<THREE.Points>(null);
  
  const positions = useMemo(() => {
    const count = 800;
    const pos = new Float32Array(count * 3);
    
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 150;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 80 + 20;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 150 - 30;
    }
    
    return pos;
  }, []);

  useFrame((state) => {
    if (starsRef.current) {
      starsRef.current.rotation.y = state.clock.elapsedTime * 0.005;
    }
  });

  return (
    <points ref={starsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={positions.length / 3}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial size={0.12} color="#ffffff" transparent opacity={0.7} />
    </points>
  );
}

function GeodesicSphere({ scrollProgress, phase }: { scrollProgress: number; phase: number }) {
  const sphereRef = useRef<THREE.Group>(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const targetRotation = useRef({ x: 0, y: 0 });
  
  const wireframeGeometry = useMemo(() => {
    const geo = new THREE.IcosahedronGeometry(3, 3);
    const edges = new THREE.EdgesGeometry(geo);
    return edges;
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.x = (e.clientX / window.innerWidth - 0.5) * 2;
      mouseRef.current.y = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  useFrame((state, delta) => {
    if (sphereRef.current) {
      targetRotation.current.x = mouseRef.current.y * Math.PI * 0.3;
      targetRotation.current.y = mouseRef.current.x * Math.PI * 0.3;
      
      sphereRef.current.rotation.x += (targetRotation.current.x - sphereRef.current.rotation.x) * 0.05;
      sphereRef.current.rotation.y += (targetRotation.current.y - sphereRef.current.rotation.y) * 0.05;
      
      if (phase >= 1 && phase < 3) {
        const scrollRotation = scrollProgress * Math.PI * 4;
        sphereRef.current.rotation.z = scrollRotation;
      }
      
      const breathe = Math.sin(state.clock.elapsedTime * 0.3) * 0.03;
      sphereRef.current.scale.setScalar(1 + breathe);
    }
  });

  const sphereOpacity = Math.min(scrollProgress * 5, 1);
  const sphereY = phase >= 1 ? 0 : 8 - scrollProgress * 40;

  return (
    <group ref={sphereRef} position={[0, Math.max(sphereY, 0), -25]}>
      <lineSegments geometry={wireframeGeometry}>
        <lineBasicMaterial color="#4080ff" transparent opacity={sphereOpacity * 0.9} linewidth={2} />
      </lineSegments>
      
      <mesh>
        <icosahedronGeometry args={[2.9, 3]} />
        <meshBasicMaterial color="#1030ff" transparent opacity={sphereOpacity * 0.08} side={THREE.BackSide} />
      </mesh>
      
      <mesh>
        <icosahedronGeometry args={[3.1, 3]} />
        <meshBasicMaterial color="#00ffff" transparent opacity={sphereOpacity * 0.03} wireframe />
      </mesh>
      
      <pointLight position={[0, 0, 0]} intensity={sphereOpacity * 3} color="#4080ff" distance={15} decay={2} />
      <pointLight position={[0, 3, 0]} intensity={sphereOpacity * 1} color="#00ffff" distance={10} decay={2} />
      <pointLight position={[0, -3, 0]} intensity={sphereOpacity * 2} color="#ff00ff" distance={10} decay={2} />
    </group>
  );
}

function WorksText({ scrollProgress, phase }: { scrollProgress: number; phase: number }) {
  const textRef = useRef<THREE.Group>(null);
  const textMeshRef = useRef<THREE.Mesh>(null);
  
  const canvasTexture = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 1024;
    canvas.height = 256;
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 180px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("WORKS", 512, 128);
    const texture = new THREE.CanvasTexture(canvas);
    return texture;
  }, []);
  
  const textPhaseStart = 0.40;
  const textPhaseEnd = 0.50;
  const showText = scrollProgress >= textPhaseStart && scrollProgress <= textPhaseEnd;
  const textProgress = Math.min(Math.max((scrollProgress - textPhaseStart) / (textPhaseEnd - textPhaseStart), 0), 1);
  
  const orbitAngle = textProgress * Math.PI;
  const opacity = showText ? Math.sin(textProgress * Math.PI) : 0;
  const dissolveScale = 1 - Math.pow(textProgress, 2) * 0.5;

  useFrame(() => {
    if (textRef.current && showText) {
      const orbitRadius = 8;
      textRef.current.position.x = Math.sin(orbitAngle) * orbitRadius;
      textRef.current.position.z = -25 + Math.cos(orbitAngle) * orbitRadius;
      textRef.current.position.y = 2 + Math.sin(textProgress * Math.PI) * 2;
      
      textRef.current.rotation.y = orbitAngle + Math.PI;
      
      textRef.current.scale.setScalar(dissolveScale);
    }
  });

  if (!showText || opacity <= 0) return null;

  return (
    <group ref={textRef}>
      <mesh ref={textMeshRef}>
        <planeGeometry args={[12, 3]} />
        <meshBasicMaterial 
          map={canvasTexture} 
          transparent 
          opacity={opacity * 0.95}
          side={THREE.DoubleSide}
        />
      </mesh>
      
      <pointLight position={[0, 0, 2]} intensity={opacity * 4} color="#ffffff" distance={15} />
    </group>
  );
}

function ProjectPoster({ 
  projectIndex, 
  scrollProgress, 
  phase,
  isActive,
  onPosterClick 
}: { 
  projectIndex: number; 
  scrollProgress: number; 
  phase: number;
  isActive: boolean;
  onPosterClick: () => void;
}) {
  const posterRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  
  const texture = useLoader(TextureLoader, posterImage);
  
  const projectStartPhase = 4 + projectIndex;
  const isVisible = phase >= projectStartPhase;
  
  const phaseRanges = [
    { start: 0.50, end: 0.625 },
    { start: 0.625, end: 0.75 },
    { start: 0.75, end: 0.875 },
    { start: 0.875, end: 1.0 },
  ];
  
  const range = phaseRanges[projectIndex];
  const posterProgress = Math.min(Math.max((scrollProgress - range.start) / (range.end - range.start), 0), 1);
  
  const orbitPhase = Math.min(posterProgress * 2, 1);
  const dissolvePhase = Math.max((posterProgress - 0.5) * 2, 0);
  
  useFrame((state) => {
    if (posterRef.current && isVisible) {
      const baseAngle = projectIndex * Math.PI * 0.5;
      const orbitAngle = baseAngle + orbitPhase * Math.PI * 0.5;
      const orbitRadius = 6;
      
      if (dissolvePhase > 0) {
        const spiralTightness = Math.pow(dissolvePhase, 1.5);
        const shrinkingRadius = orbitRadius * (1 - spiralTightness * 0.95);
        const spiralRotations = dissolvePhase * Math.PI * 8;
        const springOscillation = Math.sin(dissolvePhase * Math.PI * 12) * (1 - dissolvePhase) * 0.3;
        
        posterRef.current.position.x = Math.cos(orbitAngle + spiralRotations) * shrinkingRadius;
        posterRef.current.position.z = -25 + Math.sin(orbitAngle + spiralRotations) * shrinkingRadius;
        posterRef.current.position.y = -dissolvePhase * 10 + springOscillation;
        
        posterRef.current.rotation.y = orbitAngle + spiralRotations + Math.PI;
        posterRef.current.rotation.x = dissolvePhase * Math.PI * 2;
        posterRef.current.rotation.z = dissolvePhase * Math.PI * 6 + springOscillation * 2;
        
        const scale = Math.max(0, 1 - Math.pow(dissolvePhase, 0.8));
        posterRef.current.scale.setScalar(scale * (hovered && dissolvePhase < 0.3 ? 1.05 : 1));
      } else {
        const appearScale = Math.min(orbitPhase * 2, 1);
        posterRef.current.position.x = Math.cos(orbitAngle) * orbitRadius;
        posterRef.current.position.z = -25 + Math.sin(orbitAngle) * orbitRadius;
        posterRef.current.position.y = (1 - appearScale) * 5;
        
        posterRef.current.rotation.y = orbitAngle + Math.PI;
        posterRef.current.rotation.x = 0;
        posterRef.current.rotation.z = 0;
        
        posterRef.current.scale.setScalar(appearScale * (hovered ? 1.08 : 1));
      }
    }
  });

  if (!isVisible || dissolvePhase >= 1) return null;

  const glassOpacity = Math.max(0, 1 - dissolvePhase * 1.2);

  return (
    <group 
      ref={posterRef}
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
      <mesh position={[0, 0, -0.06]}>
        <boxGeometry args={[3.5, 2.2, 0.1]} />
        <meshPhysicalMaterial 
          color="#0a0a15"
          metalness={0.95}
          roughness={0.1}
          transparent
          opacity={glassOpacity * 0.9}
          clearcoat={1}
          clearcoatRoughness={0.1}
        />
      </mesh>
      
      <mesh position={[0, 0, 0.01]}>
        <planeGeometry args={[3.2, 2]} />
        <meshBasicMaterial map={texture} transparent opacity={glassOpacity} />
      </mesh>
      
      <mesh position={[0, 0, 0.06]}>
        <planeGeometry args={[3.5, 2.2]} />
        <meshPhysicalMaterial 
          color={hovered ? "#40ffff" : "#ffffff"}
          transparent
          opacity={glassOpacity * (hovered ? 0.15 : 0.08)}
          roughness={0.05}
          transmission={0.6}
          thickness={0.5}
          clearcoat={1}
          ior={1.5}
        />
      </mesh>
      
      {hovered && (
        <mesh position={[0, 0, 0.08]}>
          <planeGeometry args={[3.6, 2.3]} />
          <meshBasicMaterial color="#00ffff" transparent opacity={0.1} />
        </mesh>
      )}
      
      <pointLight 
        position={[0, 0, 1.5]} 
        intensity={isActive ? 3 : 1} 
        color="#00ffff" 
        distance={8} 
        decay={2} 
      />
    </group>
  );
}


export function WorkSection({ visible, scrollProgress }: WorkSectionProps) {
  const normalizedProgress = Math.min(Math.max(scrollProgress, 0), 1);
  
  const phase = useMemo(() => {
    if (normalizedProgress < 0.10) return 0;
    if (normalizedProgress < 0.25) return 1;
    if (normalizedProgress < 0.40) return 2;
    if (normalizedProgress < 0.50) return 3;
    if (normalizedProgress < 0.625) return 4;
    if (normalizedProgress < 0.75) return 5;
    if (normalizedProgress < 0.875) return 6;
    if (normalizedProgress < 1.0) return 7;
    return 8;
  }, [normalizedProgress]);

  const activeProjectIndex = phase >= 4 ? Math.min(phase - 4, 3) : -1;

  if (!visible) return null;

  return (
    <group position={[0, 0, 0]}>
      <SpaceStars />
      
      <WormholeGrid scrollProgress={normalizedProgress} />
      
      <GeodesicSphere scrollProgress={normalizedProgress} phase={phase} />
      
      <WorksText scrollProgress={normalizedProgress} phase={phase} />
      
      {[0, 1, 2, 3].map((i) => (
        <ProjectPoster
          key={i}
          projectIndex={i}
          scrollProgress={normalizedProgress}
          phase={phase}
          isActive={i === activeProjectIndex}
          onPosterClick={() => window.open(PROJECT_URLS[i], "_blank")}
        />
      ))}
      
      <ambientLight intensity={0.03} color="#0a0a40" />
      <pointLight position={[0, 15, -20]} intensity={1.5} color="#4080ff" distance={60} decay={2} />
      <pointLight position={[0, -15, -25]} intensity={3} color="#ff00ff" distance={40} decay={2} />
      <pointLight position={[15, 5, -30]} intensity={1} color="#00ffff" distance={30} decay={2} />
      <pointLight position={[-15, 5, -30]} intensity={1} color="#8040ff" distance={30} decay={2} />
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
