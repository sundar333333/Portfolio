import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface WorkSectionProps {
  visible: boolean;
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

export function WorkSection({ visible }: WorkSectionProps) {
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
      
      <MonitorWall />
      
      <FloatingParticles />
      
      <ambientLight intensity={0.1} color="#0a0a20" />
      <pointLight position={[0, 5, -15]} intensity={2} color="#00ffff" distance={30} decay={2} />
      <pointLight position={[-10, 3, -20]} intensity={1} color="#ff00ff" distance={20} decay={2} />
      <pointLight position={[10, 3, -20]} intensity={1} color="#ff6600" distance={20} decay={2} />
    </group>
  );
}
