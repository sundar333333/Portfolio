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

function CurvedDisplayWall() {
  const displays = useMemo(() => {
    const items: { position: [number, number, number]; rotation: [number, number, number]; size: number }[] = [];
    
    const curveRadius = 8;
    const displaySize = 1.5;
    
    const rows = 12;
    const cols = 20;
    const angleSpan = Math.PI * 1.2;
    const startAngle = -angleSpan / 2;
    
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const angle = startAngle + (col / (cols - 1)) * angleSpan;
        const x = Math.sin(angle) * curveRadius;
        const z = -12 - Math.cos(angle) * curveRadius;
        const y = row * displaySize - (rows * displaySize) / 2 + displaySize / 2 + 1;
        const rotY = -angle;
        
        items.push({
          position: [x, y, z],
          rotation: [0, rotY, 0],
          size: displaySize,
        });
      }
    }
    
    const sideRows = 12;
    const sideDisplaySize = 1.5;
    for (let row = 0; row < sideRows; row++) {
      const y = row * sideDisplaySize - (sideRows * sideDisplaySize) / 2 + sideDisplaySize / 2 + 1;
      
      items.push({
        position: [-8, y, -6],
        rotation: [0, Math.PI / 2, 0],
        size: sideDisplaySize,
      });
      items.push({
        position: [-8, y, -7.5],
        rotation: [0, Math.PI / 2, 0],
        size: sideDisplaySize,
      });
      items.push({
        position: [-8, y, -9],
        rotation: [0, Math.PI / 2, 0],
        size: sideDisplaySize,
      });
      
      items.push({
        position: [8, y, -6],
        rotation: [0, -Math.PI / 2, 0],
        size: sideDisplaySize,
      });
      items.push({
        position: [8, y, -7.5],
        rotation: [0, -Math.PI / 2, 0],
        size: sideDisplaySize,
      });
      items.push({
        position: [8, y, -9],
        rotation: [0, -Math.PI / 2, 0],
        size: sideDisplaySize,
      });
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
