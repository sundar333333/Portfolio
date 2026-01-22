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
      <mesh ref={meshRef}>
        <planeGeometry args={[size, size]} />
        <meshBasicMaterial map={noiseTexture} />
      </mesh>
      
      <lineSegments position={[0, 0, 0.01]}>
        <edgesGeometry args={[new THREE.PlaneGeometry(size, size)]} />
        <lineBasicMaterial color="#111111" linewidth={1} />
      </lineSegments>
    </group>
  );
}

function FlatDisplayWall() {
  const displays = useMemo(() => {
    const items: { position: [number, number, number]; rotation: [number, number, number]; size: number }[] = [];
    
    const displaySize = 1.2;
    const rows = 10;
    const cols = 16;
    
    const totalWidth = cols * displaySize;
    const totalHeight = rows * displaySize;
    
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const x = col * displaySize - totalWidth / 2 + displaySize / 2;
        const y = row * displaySize - totalHeight / 2 + displaySize / 2 + 1;
        const z = -10;
        
        items.push({
          position: [x, y, z],
          rotation: [0, 0, 0],
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
      <FlatDisplayWall />
      
      <ambientLight intensity={0.15} color="#ffffff" />
      <pointLight position={[0, 3, -10]} intensity={1} color="#ffffff" distance={30} decay={2} />
      <pointLight position={[-8, 2, -18]} intensity={0.5} color="#aaaaaa" distance={20} decay={2} />
      <pointLight position={[8, 2, -18]} intensity={0.5} color="#aaaaaa" distance={20} decay={2} />
    </group>
  );
}
