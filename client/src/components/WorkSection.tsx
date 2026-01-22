import { useRef, useMemo, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface WorkSectionProps {
  visible: boolean;
}

function NoiseDisplay({ position, rotation, size = 1 }: { position: [number, number, number]; rotation: [number, number, number]; size?: number }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const textureRef = useRef<THREE.DataTexture | null>(null);

  const noiseTexture = useMemo(() => {
    const width = 64;
    const height = 64;
    const data = new Uint8Array(width * height * 4);
    
    for (let i = 0; i < width * height * 4; i += 4) {
      const gray = Math.random() * 255;
      data[i] = gray;
      data[i + 1] = gray;
      data[i + 2] = gray;
      data[i + 3] = 255;
    }
    
    const tex = new THREE.DataTexture(data, width, height, THREE.RGBAFormat);
    tex.needsUpdate = true;
    textureRef.current = tex;
    return tex;
  }, []);

  useEffect(() => {
    return () => {
      if (textureRef.current) {
        textureRef.current.dispose();
      }
    };
  }, []);

  useFrame(() => {
    if (textureRef.current) {
      const data = textureRef.current.image.data as Uint8Array;
      for (let i = 0; i < data.length; i += 4) {
        const gray = Math.random() * 255;
        data[i] = gray;
        data[i + 1] = gray;
        data[i + 2] = gray;
      }
      textureRef.current.needsUpdate = true;
    }
  });

  return (
    <group position={position} rotation={rotation}>
      <mesh>
        <boxGeometry args={[size * 1.02, size * 1.02, 0.05]} />
        <meshStandardMaterial color="#1a1a1a" metalness={0.9} roughness={0.2} />
      </mesh>
      
      <mesh ref={meshRef} position={[0, 0, 0.03]}>
        <planeGeometry args={[size * 0.95, size * 0.95]} />
        <meshBasicMaterial map={noiseTexture} />
      </mesh>
      
      <mesh position={[0, 0, -0.03]}>
        <planeGeometry args={[size * 0.95, size * 0.95]} />
        <meshBasicMaterial color="#0a0a0a" />
      </mesh>
    </group>
  );
}

function CurvedDisplayWall() {
  const displays = useMemo(() => {
    const items: { position: [number, number, number]; rotation: [number, number, number]; size: number }[] = [];
    
    const curveRadius = 15;
    const displaySize = 1.8;
    const gap = 0.1;
    const totalSize = displaySize + gap;
    
    const rows = 6;
    const cols = 12;
    const angleSpan = Math.PI * 0.8;
    const startAngle = -angleSpan / 2;
    
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const angle = startAngle + (col / (cols - 1)) * angleSpan;
        const x = Math.sin(angle) * curveRadius;
        const z = -20 - Math.cos(angle) * curveRadius;
        const y = row * totalSize - (rows * totalSize) / 2 + totalSize / 2 + 2;
        const rotY = -angle;
        
        items.push({
          position: [x, y, z],
          rotation: [0, rotY, 0],
          size: displaySize,
        });
      }
    }
    
    return items;
  }, []);

  return (
    <group>
      {displays.map((display, i) => (
        <NoiseDisplay
          key={i}
          position={display.position}
          rotation={display.rotation}
          size={display.size}
        />
      ))}
    </group>
  );
}

export function WorkSection({ visible }: WorkSectionProps) {
  if (!visible) return null;

  return (
    <group position={[0, 0, -5]}>
      <CurvedDisplayWall />
      
      <ambientLight intensity={0.15} color="#ffffff" />
      <pointLight position={[0, 3, -10]} intensity={1} color="#ffffff" distance={30} decay={2} />
      <pointLight position={[-8, 2, -18]} intensity={0.5} color="#aaaaaa" distance={20} decay={2} />
      <pointLight position={[8, 2, -18]} intensity={0.5} color="#aaaaaa" distance={20} decay={2} />
    </group>
  );
}
