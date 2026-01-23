import { useRef, useMemo, useState } from "react";
import { useFrame, useLoader } from "@react-three/fiber";
import * as THREE from "three";
import { TextureLoader } from "three";
import { Text } from "@react-three/drei";
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
  const gridRef = useRef<THREE.Points>(null);
  
  const { positions, originalPositions } = useMemo(() => {
    const gridSize = 80;
    const divisions = 60;
    const points: number[] = [];
    const originalPoints: number[] = [];
    
    for (let i = 0; i <= divisions; i++) {
      for (let j = 0; j <= divisions; j++) {
        const x = (i / divisions - 0.5) * gridSize;
        const z = (j / divisions - 0.5) * gridSize - 20;
        points.push(x, 0, z);
        originalPoints.push(x, 0, z);
      }
    }
    
    return { 
      positions: new Float32Array(points), 
      originalPositions: new Float32Array(originalPoints) 
    };
  }, []);

  useFrame((state) => {
    if (gridRef.current) {
      const posArray = gridRef.current.geometry.attributes.position.array as Float32Array;
      const wormholeStrength = Math.min(scrollProgress * 2, 1) * 8;
      const wormholeRadius = 15;
      const wormholeCenterZ = -25;
      
      for (let i = 0; i < posArray.length; i += 3) {
        const x = originalPositions[i];
        const z = originalPositions[i + 2];
        
        const distFromCenter = Math.sqrt(x * x + (z - wormholeCenterZ) * (z - wormholeCenterZ));
        
        if (distFromCenter < wormholeRadius) {
          const normalizedDist = distFromCenter / wormholeRadius;
          const depression = Math.pow(1 - normalizedDist, 2) * wormholeStrength;
          const spiralAngle = (1 - normalizedDist) * Math.PI * 2 + state.clock.elapsedTime * 0.5;
          
          posArray[i] = x + Math.cos(spiralAngle) * (1 - normalizedDist) * 0.5;
          posArray[i + 1] = -depression;
          posArray[i + 2] = z + Math.sin(spiralAngle) * (1 - normalizedDist) * 0.5;
        } else {
          posArray[i] = x;
          posArray[i + 1] = 0;
          posArray[i + 2] = z;
        }
      }
      
      gridRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <points ref={gridRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={positions.length / 3}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial 
        size={0.08} 
        color="#00ffff" 
        transparent 
        opacity={0.6}
        sizeAttenuation
      />
    </points>
  );
}

function SpaceStars() {
  const starsRef = useRef<THREE.Points>(null);
  
  const positions = useMemo(() => {
    const count = 500;
    const pos = new Float32Array(count * 3);
    
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 100;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 50 + 10;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 100 - 30;
    }
    
    return pos;
  }, []);

  useFrame((state) => {
    if (starsRef.current) {
      starsRef.current.rotation.y = state.clock.elapsedTime * 0.01;
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
      <pointsMaterial size={0.15} color="#ffffff" transparent opacity={0.8} />
    </points>
  );
}

function GeodesicSphere({ scrollProgress, phase }: { scrollProgress: number; phase: number }) {
  const sphereRef = useRef<THREE.Group>(null);
  const wireframeRef = useRef<THREE.LineSegments>(null);
  
  const wireframeGeometry = useMemo(() => {
    const geo = new THREE.IcosahedronGeometry(2, 2);
    const edges = new THREE.EdgesGeometry(geo);
    return edges;
  }, []);

  useFrame((state) => {
    if (sphereRef.current) {
      const baseRotationSpeed = 0.3;
      const phaseMultiplier = phase >= 2 ? 1 + (phase - 2) * 0.5 : 1;
      
      sphereRef.current.rotation.x = state.clock.elapsedTime * baseRotationSpeed * phaseMultiplier * 0.7;
      sphereRef.current.rotation.y = state.clock.elapsedTime * baseRotationSpeed * phaseMultiplier;
      sphereRef.current.rotation.z = state.clock.elapsedTime * baseRotationSpeed * phaseMultiplier * 0.3;
      
      const breathe = Math.sin(state.clock.elapsedTime * 0.5) * 0.05;
      sphereRef.current.scale.setScalar(1 + breathe);
    }
  });

  const sphereY = phase >= 1 ? 0 : 5;
  const sphereScale = Math.min(scrollProgress * 3, 1);

  return (
    <group ref={sphereRef} position={[0, sphereY, -25]} scale={sphereScale}>
      <lineSegments geometry={wireframeGeometry}>
        <lineBasicMaterial color="#4080ff" transparent opacity={0.8} linewidth={2} />
      </lineSegments>
      
      <mesh>
        <icosahedronGeometry args={[1.95, 2]} />
        <meshBasicMaterial color="#1020ff" transparent opacity={0.1} side={THREE.BackSide} />
      </mesh>
      
      <mesh>
        <icosahedronGeometry args={[2.05, 2]} />
        <meshBasicMaterial color="#00ffff" transparent opacity={0.05} wireframe />
      </mesh>
      
      <pointLight position={[0, 0, 0]} intensity={2} color="#4080ff" distance={10} decay={2} />
    </group>
  );
}

function WorksText({ scrollProgress, phase }: { scrollProgress: number; phase: number }) {
  const textRef = useRef<THREE.Group>(null);
  
  const showText = phase >= 2;
  const fadeStart = 0.35;
  const fadeEnd = 0.45;
  const fadeProgress = phase >= 3 ? Math.min(Math.max((scrollProgress - fadeStart) / (fadeEnd - fadeStart), 0), 1) : 0;
  const opacity = showText ? 1 - fadeProgress : 0;
  const rotationY = showText ? fadeProgress * Math.PI * 0.5 : 0;
  
  useFrame(() => {
    if (textRef.current) {
      textRef.current.rotation.y = rotationY;
    }
  });

  if (!showText || opacity <= 0) return null;

  return (
    <group ref={textRef} position={[0, 2, -20]}>
      <mesh>
        <planeGeometry args={[15, 4]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={opacity * 0.9}>
          <canvasTexture 
            attach="map" 
            image={(() => {
              const canvas = document.createElement("canvas");
              canvas.width = 512;
              canvas.height = 128;
              const ctx = canvas.getContext("2d")!;
              ctx.fillStyle = "#ffffff";
              ctx.font = "bold 100px Arial";
              ctx.textAlign = "center";
              ctx.textBaseline = "middle";
              ctx.fillText("WORKS", 256, 64);
              return canvas;
            })()} 
          />
        </meshBasicMaterial>
      </mesh>
      
      <pointLight position={[0, 0, 2]} intensity={opacity * 3} color="#ffffff" distance={10} />
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
  
  const phaseStarts = [0.55, 0.7, 0.85, 0.95];
  const phaseEnds = [0.7, 0.85, 0.95, 1.0];
  const dissolveStart = phaseStarts[projectIndex] || 0.55;
  const dissolveEnd = phaseEnds[projectIndex] || 0.7;
  const dissolveProgress = phase > projectStartPhase ? Math.min(Math.max((scrollProgress - dissolveStart) / (dissolveEnd - dissolveStart), 0), 1) : 0;
  
  useFrame((state) => {
    if (posterRef.current && isVisible) {
      const orbitAngle = state.clock.elapsedTime * 0.5 + projectIndex * Math.PI * 0.5;
      const orbitRadius = 5;
      const spiralProgress = dissolveProgress;
      
      if (spiralProgress > 0) {
        const spiralRadius = orbitRadius * (1 - spiralProgress * 0.8);
        const spiralAngle = orbitAngle + spiralProgress * Math.PI * 4;
        const spiralY = -spiralProgress * 8;
        
        posterRef.current.position.x = Math.cos(spiralAngle) * spiralRadius;
        posterRef.current.position.y = spiralY;
        posterRef.current.position.z = -25 + Math.sin(spiralAngle) * spiralRadius;
        posterRef.current.rotation.y = spiralAngle + Math.PI;
        posterRef.current.rotation.z = spiralProgress * Math.PI * 2;
      } else {
        posterRef.current.position.x = Math.cos(orbitAngle) * orbitRadius;
        posterRef.current.position.y = 0;
        posterRef.current.position.z = -25 + Math.sin(orbitAngle) * orbitRadius;
        posterRef.current.rotation.y = orbitAngle + Math.PI;
      }
      
      const scale = isActive ? 1.1 : 1;
      posterRef.current.scale.setScalar(scale * (1 - dissolveProgress));
    }
  });

  if (!isVisible || dissolveProgress >= 1) return null;

  const opacity = 1 - dissolveProgress;

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
      <mesh position={[0, 0, -0.05]}>
        <boxGeometry args={[3, 2, 0.08]} />
        <meshStandardMaterial 
          color="#0a0a0a" 
          metalness={0.9} 
          roughness={0.2} 
          transparent 
          opacity={opacity}
        />
      </mesh>
      
      <mesh position={[0, 0, 0.01]}>
        <planeGeometry args={[2.8, 1.8]} />
        <meshBasicMaterial map={texture} transparent opacity={opacity} />
      </mesh>
      
      <mesh position={[0, 0, 0.05]}>
        <planeGeometry args={[3, 2]} />
        <meshPhysicalMaterial 
          color={hovered ? "#00ffff" : "#ffffff"}
          transparent
          opacity={opacity * (hovered ? 0.2 : 0.1)}
          roughness={0.1}
          clearcoat={1}
        />
      </mesh>
      
      <pointLight 
        position={[0, 0, 1]} 
        intensity={isActive ? 2 : 0.5} 
        color="#00ffff" 
        distance={5} 
        decay={2} 
      />
    </group>
  );
}

export function WorkSection({ visible, scrollProgress }: WorkSectionProps) {
  const normalizedProgress = Math.min(Math.max(scrollProgress, 0), 1);
  
  const phase = useMemo(() => {
    if (normalizedProgress < 0.1) return 0;
    if (normalizedProgress < 0.2) return 1;
    if (normalizedProgress < 0.3) return 2;
    if (normalizedProgress < 0.4) return 3;
    if (normalizedProgress < 0.55) return 4;
    if (normalizedProgress < 0.7) return 5;
    if (normalizedProgress < 0.85) return 6;
    if (normalizedProgress < 0.95) return 7;
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
      
      <ambientLight intensity={0.05} color="#0a0a40" />
      <pointLight position={[0, 10, -20]} intensity={1} color="#4080ff" distance={50} decay={2} />
      <pointLight position={[0, -10, -25]} intensity={2} color="#ff00ff" distance={30} decay={2} />
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
