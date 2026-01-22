import { useRef, useMemo, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface WorkSectionProps {
  visible: boolean;
}

function MiniVintageTV({ position, scale = 1 }: { position: [number, number, number]; scale?: number }) {
  const tvRef = useRef<THREE.Group>(null);
  const screenRef = useRef<THREE.Mesh>(null);
  const noiseTextureRef = useRef<THREE.DataTexture | null>(null);

  const woodTexture = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext("2d")!;
    
    const gradient = ctx.createLinearGradient(0, 0, 256, 256);
    gradient.addColorStop(0, "#3d2817");
    gradient.addColorStop(0.3, "#4a3020");
    gradient.addColorStop(0.6, "#3d2817");
    gradient.addColorStop(1, "#2d1810");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 256, 256);
    
    ctx.strokeStyle = "rgba(0,0,0,0.15)";
    ctx.lineWidth = 1;
    for (let i = 0; i < 60; i++) {
      ctx.beginPath();
      const y = Math.random() * 256;
      ctx.moveTo(0, y);
      ctx.bezierCurveTo(64, y + (Math.random() - 0.5) * 8, 192, y + (Math.random() - 0.5) * 8, 256, y + (Math.random() - 0.5) * 4);
      ctx.stroke();
    }
    
    const tex = new THREE.CanvasTexture(canvas);
    return tex;
  }, []);

  const noiseTexture = useMemo(() => {
    const size = 128;
    const data = new Uint8Array(size * size * 4);
    for (let i = 0; i < size * size * 4; i += 4) {
      const v = Math.random() * 255;
      data[i] = v;
      data[i + 1] = v;
      data[i + 2] = v;
      data[i + 3] = 255;
    }
    const tex = new THREE.DataTexture(data, size, size, THREE.RGBAFormat);
    tex.needsUpdate = true;
    noiseTextureRef.current = tex;
    return tex;
  }, []);

  useEffect(() => {
    return () => {
      if (noiseTextureRef.current) {
        noiseTextureRef.current.dispose();
      }
    };
  }, []);

  useFrame(() => {
    if (noiseTextureRef.current) {
      const size = 128;
      const data = noiseTextureRef.current.image.data as Uint8Array;
      for (let i = 0; i < size * size * 4; i += 4) {
        const v = Math.random() * 255;
        data[i] = v;
        data[i + 1] = v;
        data[i + 2] = v;
      }
      noiseTextureRef.current.needsUpdate = true;
    }
  });

  return (
    <group ref={tvRef} position={position} scale={scale}>
      <mesh>
        <boxGeometry args={[1.4, 1.1, 0.9]} />
        <meshStandardMaterial map={woodTexture} roughness={0.7} metalness={0.1} />
      </mesh>
      
      <mesh position={[0, 0.05, 0.35]}>
        <boxGeometry args={[0.95, 0.7, 0.22]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.8} />
      </mesh>
      
      <mesh ref={screenRef} position={[0, 0.05, 0.47]}>
        <planeGeometry args={[0.85, 0.6]} />
        <meshBasicMaterial map={noiseTexture} />
      </mesh>
      
      <mesh position={[0, 0.05, 0.48]}>
        <planeGeometry args={[0.87, 0.62]} />
        <meshPhysicalMaterial 
          color="#88ccff"
          transparent
          opacity={0.15}
          roughness={0.1}
          metalness={0.2}
        />
      </mesh>
      
      <mesh position={[0.55, 0, 0.35]}>
        <boxGeometry args={[0.15, 0.5, 0.1]} />
        <meshStandardMaterial color="#2a2a2a" roughness={0.6} />
      </mesh>
      
      <mesh position={[0.55, 0.15, 0.41]}>
        <cylinderGeometry args={[0.04, 0.04, 0.02, 16]} />
        <meshStandardMaterial color="#888888" metalness={0.8} roughness={0.3} />
      </mesh>
      <mesh position={[0.55, -0.05, 0.41]}>
        <cylinderGeometry args={[0.04, 0.04, 0.02, 16]} />
        <meshStandardMaterial color="#888888" metalness={0.8} roughness={0.3} />
      </mesh>
      
      <mesh position={[0, -0.55, -0.2]} rotation={[0, 0, 0]}>
        <boxGeometry args={[0.08, 0.1, 0.08]} />
        <meshStandardMaterial color="#2a2017" roughness={0.8} />
      </mesh>
      <mesh position={[0.4, -0.55, -0.2]} rotation={[0, 0, 0]}>
        <boxGeometry args={[0.08, 0.1, 0.08]} />
        <meshStandardMaterial color="#2a2017" roughness={0.8} />
      </mesh>
      <mesh position={[-0.4, -0.55, -0.2]} rotation={[0, 0, 0]}>
        <boxGeometry args={[0.08, 0.1, 0.08]} />
        <meshStandardMaterial color="#2a2017" roughness={0.8} />
      </mesh>
      <mesh position={[0, -0.55, 0.2]} rotation={[0, 0, 0]}>
        <boxGeometry args={[0.08, 0.1, 0.08]} />
        <meshStandardMaterial color="#2a2017" roughness={0.8} />
      </mesh>
      
      <pointLight position={[0, 0.05, 0.6]} intensity={0.3} color="#aaaaaa" distance={2} decay={2} />
    </group>
  );
}

function TVWall() {
  const tvPositions = useMemo(() => {
    const positions: [number, number, number][] = [];
    
    const cols = 5;
    const rows = 3;
    const spacingX = 2.0;
    const spacingY = 1.6;
    const startX = -((cols - 1) * spacingX) / 2;
    const startY = 0.5;
    const baseZ = -12;
    
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const x = startX + col * spacingX;
        const y = startY + row * spacingY;
        const z = baseZ;
        positions.push([x, y, z]);
      }
    }
    
    return positions;
  }, []);

  return (
    <group>
      {tvPositions.map((pos, i) => (
        <MiniVintageTV key={i} position={pos} scale={1.2} />
      ))}
    </group>
  );
}

export function WorkSection({ visible }: WorkSectionProps) {
  if (!visible) return null;

  return (
    <group position={[0, 0, -5]}>
      <TVWall />
      
      <ambientLight intensity={0.3} color="#111111" />
      <pointLight position={[0, 3, -8]} intensity={1.5} color="#ffffff" distance={20} decay={2} />
      <pointLight position={[-5, 2, -10]} intensity={0.8} color="#aaaaaa" distance={15} decay={2} />
      <pointLight position={[5, 2, -10]} intensity={0.8} color="#aaaaaa" distance={15} decay={2} />
    </group>
  );
}
