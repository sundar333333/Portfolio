import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Environment, ContactShadows } from "@react-three/drei";
import * as THREE from "three";

function RGBLight({ position, color, intensity = 1 }: { position: [number, number, number]; color: string; intensity?: number }) {
  const lightRef = useRef<THREE.PointLight>(null);
  
  useFrame(({ clock }) => {
    if (lightRef.current) {
      lightRef.current.intensity = intensity * (0.8 + Math.sin(clock.elapsedTime * 2) * 0.2);
    }
  });
  
  return <pointLight ref={lightRef} position={position} color={color} intensity={intensity} distance={3} />;
}

function Desk() {
  return (
    <group position={[0, 0.4, -2]}>
      <mesh position={[0, 0, 0]} castShadow receiveShadow>
        <boxGeometry args={[2.4, 0.05, 0.8]} />
        <meshStandardMaterial color="#2a2a2a" roughness={0.3} metalness={0.1} />
      </mesh>
      <mesh position={[-1.0, -0.4, 0.3]} castShadow>
        <boxGeometry args={[0.05, 0.75, 0.5]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>
      <mesh position={[1.0, -0.4, 0.3]} castShadow>
        <boxGeometry args={[0.05, 0.75, 0.5]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>
      <mesh position={[-1.0, -0.4, -0.3]} castShadow>
        <boxGeometry args={[0.05, 0.75, 0.5]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>
      <mesh position={[1.0, -0.4, -0.3]} castShadow>
        <boxGeometry args={[0.05, 0.75, 0.5]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>
    </group>
  );
}

function Monitor() {
  return (
    <group position={[0, 0.75, -2.2]}>
      <mesh castShadow>
        <boxGeometry args={[1.0, 0.6, 0.03]} />
        <meshStandardMaterial color="#0a0a0a" roughness={0.2} metalness={0.8} />
      </mesh>
      <mesh position={[0, 0, 0.02]}>
        <boxGeometry args={[0.92, 0.52, 0.01]} />
        <meshStandardMaterial 
          color="#1a1a2e" 
          emissive="#4a6fa5" 
          emissiveIntensity={0.3}
        />
      </mesh>
      <mesh position={[0, -0.35, 0.1]} castShadow>
        <boxGeometry args={[0.15, 0.1, 0.15]} />
        <meshStandardMaterial color="#1a1a1a" metalness={0.5} />
      </mesh>
      <mesh position={[0, -0.42, 0.1]} castShadow>
        <boxGeometry args={[0.3, 0.02, 0.2]} />
        <meshStandardMaterial color="#1a1a1a" metalness={0.5} />
      </mesh>
    </group>
  );
}

function GamingPC() {
  const fanRef1 = useRef<THREE.Mesh>(null);
  const fanRef2 = useRef<THREE.Mesh>(null);
  
  useFrame(({ clock }) => {
    if (fanRef1.current) fanRef1.current.rotation.z = clock.elapsedTime * 5;
    if (fanRef2.current) fanRef2.current.rotation.z = clock.elapsedTime * 5;
  });

  return (
    <group position={[0.9, 0.65, -2.1]}>
      <mesh castShadow>
        <boxGeometry args={[0.25, 0.5, 0.45]} />
        <meshStandardMaterial color="#0a0a0a" roughness={0.3} metalness={0.7} />
      </mesh>
      <mesh position={[-0.13, 0, 0.1]}>
        <boxGeometry args={[0.01, 0.45, 0.35]} />
        <meshStandardMaterial 
          color="#111" 
          transparent 
          opacity={0.3}
        />
      </mesh>
      <mesh ref={fanRef1} position={[-0.13, 0.1, 0.05]}>
        <cylinderGeometry args={[0.08, 0.08, 0.02, 6]} />
        <meshStandardMaterial color="#222" />
      </mesh>
      <mesh ref={fanRef2} position={[-0.13, -0.12, 0.05]}>
        <cylinderGeometry args={[0.08, 0.08, 0.02, 6]} />
        <meshStandardMaterial color="#222" />
      </mesh>
      <RGBLight position={[-0.1, 0.1, 0.1]} color="#ff0066" intensity={0.5} />
      <RGBLight position={[-0.1, -0.1, 0.1]} color="#00ff88" intensity={0.5} />
      <RGBLight position={[-0.1, 0, 0.15]} color="#0088ff" intensity={0.3} />
      <mesh position={[-0.14, 0.15, 0.1]}>
        <boxGeometry args={[0.005, 0.12, 0.02]} />
        <meshStandardMaterial emissive="#ff0066" emissiveIntensity={2} />
      </mesh>
      <mesh position={[-0.14, -0.05, 0.1]}>
        <boxGeometry args={[0.005, 0.12, 0.02]} />
        <meshStandardMaterial emissive="#00ff88" emissiveIntensity={2} />
      </mesh>
    </group>
  );
}

function PlayStation5() {
  return (
    <group position={[-0.85, 0.48, -2.1]} rotation={[0, 0, Math.PI / 2]}>
      <mesh castShadow>
        <boxGeometry args={[0.08, 0.4, 0.26]} />
        <meshStandardMaterial color="#ffffff" roughness={0.2} />
      </mesh>
      <mesh position={[0.045, 0, 0]}>
        <boxGeometry args={[0.01, 0.38, 0.24]} />
        <meshStandardMaterial color="#0a0a0a" roughness={0.1} />
      </mesh>
      <mesh position={[0.05, -0.15, 0]}>
        <boxGeometry args={[0.005, 0.03, 0.03]} />
        <meshStandardMaterial emissive="#0088ff" emissiveIntensity={1} />
      </mesh>
    </group>
  );
}

function GamingHeadphones() {
  return (
    <group position={[-0.5, 0.52, -1.8]}>
      <mesh castShadow>
        <torusGeometry args={[0.08, 0.015, 8, 16, Math.PI]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.3} />
      </mesh>
      <mesh position={[-0.08, -0.02, 0]} castShadow>
        <sphereGeometry args={[0.04, 16, 16]} />
        <meshStandardMaterial color="#2a2a2a" />
      </mesh>
      <mesh position={[0.08, -0.02, 0]} castShadow>
        <sphereGeometry args={[0.04, 16, 16]} />
        <meshStandardMaterial color="#2a2a2a" />
      </mesh>
      <mesh position={[0.085, -0.02, 0]}>
        <boxGeometry args={[0.005, 0.02, 0.01]} />
        <meshStandardMaterial emissive="#00ff00" emissiveIntensity={1} />
      </mesh>
    </group>
  );
}

function PS5Controller() {
  return (
    <group position={[0.4, 0.46, -1.7]} rotation={[0, 0.3, 0]}>
      <mesh castShadow>
        <boxGeometry args={[0.16, 0.03, 0.1]} />
        <meshStandardMaterial color="#ffffff" roughness={0.2} />
      </mesh>
      <mesh position={[-0.06, 0.01, -0.03]}>
        <cylinderGeometry args={[0.012, 0.012, 0.015, 16]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>
      <mesh position={[0.06, 0.01, 0.02]}>
        <cylinderGeometry args={[0.012, 0.012, 0.015, 16]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>
      <mesh position={[0, 0.02, -0.01]}>
        <boxGeometry args={[0.04, 0.005, 0.04]} />
        <meshStandardMaterial emissive="#0066ff" emissiveIntensity={0.5} />
      </mesh>
    </group>
  );
}

function PlantShelf() {
  return (
    <group position={[0, 1.6, -2.45]}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[0.8, 0.03, 0.15]} />
        <meshStandardMaterial color="#8B4513" roughness={0.7} />
      </mesh>
      {[-0.25, 0, 0.25].map((x, i) => (
        <group key={i} position={[x, 0.08, 0]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.04, 0.035, 0.08, 16]} />
            <meshStandardMaterial color="#654321" roughness={0.8} />
          </mesh>
          <mesh position={[0, 0.06, 0]}>
            <sphereGeometry args={[0.05, 8, 8]} />
            <meshStandardMaterial color="#228B22" roughness={0.9} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function WallTV() {
  return (
    <group position={[1.5, 1.3, -2.45]}>
      <mesh castShadow>
        <boxGeometry args={[0.9, 0.55, 0.03]} />
        <meshStandardMaterial color="#0a0a0a" roughness={0.2} metalness={0.8} />
      </mesh>
      <mesh position={[0, 0, 0.02]}>
        <boxGeometry args={[0.85, 0.5, 0.01]} />
        <meshStandardMaterial 
          color="#0a0a15" 
          emissive="#1a2a4a" 
          emissiveIntensity={0.2}
        />
      </mesh>
    </group>
  );
}

function GamingChair() {
  return (
    <group position={[0, 0, 0]}>
      <mesh position={[0, 0.3, 0]} castShadow>
        <boxGeometry args={[0.5, 0.08, 0.5]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>
      <mesh position={[0, 0.7, -0.2]} castShadow>
        <boxGeometry args={[0.5, 0.7, 0.08]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>
      <mesh position={[0, 1.15, -0.2]} castShadow>
        <boxGeometry args={[0.3, 0.2, 0.1]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>
      <mesh position={[0.28, 0.45, 0]} castShadow>
        <boxGeometry args={[0.08, 0.08, 0.35]} />
        <meshStandardMaterial color="#2a2a2a" />
      </mesh>
      <mesh position={[-0.28, 0.45, 0]} castShadow>
        <boxGeometry args={[0.08, 0.08, 0.35]} />
        <meshStandardMaterial color="#2a2a2a" />
      </mesh>
      {[
        [-0.18, 0.05, 0.18],
        [0.18, 0.05, 0.18],
        [-0.18, 0.05, -0.18],
        [0.18, 0.05, -0.18],
        [0, 0.05, 0.2],
      ].map((pos, i) => (
        <mesh key={i} position={pos as [number, number, number]} castShadow>
          <sphereGeometry args={[0.04, 16, 16]} />
          <meshStandardMaterial color="#333" metalness={0.8} roughness={0.2} />
        </mesh>
      ))}
      <mesh position={[0.22, 0.35, -0.05]}>
        <boxGeometry args={[0.02, 0.03, 0.15]} />
        <meshStandardMaterial emissive="#ff0044" emissiveIntensity={1} />
      </mesh>
      <mesh position={[-0.22, 0.35, -0.05]}>
        <boxGeometry args={[0.02, 0.03, 0.15]} />
        <meshStandardMaterial emissive="#ff0044" emissiveIntensity={1} />
      </mesh>
    </group>
  );
}

function Bed() {
  return (
    <group position={[-2.2, 0, 0.5]} rotation={[0, Math.PI / 2, 0]}>
      <mesh position={[0, 0.2, 0]} castShadow receiveShadow>
        <boxGeometry args={[2, 0.3, 1]} />
        <meshStandardMaterial color="#2a2a2a" />
      </mesh>
      <mesh position={[0, 0.4, 0]} receiveShadow>
        <boxGeometry args={[1.9, 0.15, 0.95]} />
        <meshStandardMaterial color="#3a3a4a" roughness={0.9} />
      </mesh>
      <mesh position={[-0.7, 0.5, 0]} castShadow>
        <boxGeometry args={[0.4, 0.15, 0.35]} />
        <meshStandardMaterial color="#4a4a5a" roughness={0.95} />
      </mesh>
      <mesh position={[-0.7, 0.5, 0.35]} castShadow>
        <boxGeometry args={[0.35, 0.12, 0.3]} />
        <meshStandardMaterial color="#5a5a6a" roughness={0.95} />
      </mesh>
      <mesh position={[0.95, 0.45, 0]} castShadow>
        <boxGeometry args={[0.05, 0.5, 1]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>
    </group>
  );
}

function FloorLamp() {
  const lightRef = useRef<THREE.PointLight>(null);
  
  useFrame(({ clock }) => {
    if (lightRef.current) {
      lightRef.current.intensity = 0.8 + Math.sin(clock.elapsedTime * 0.5) * 0.1;
    }
  });

  return (
    <group position={[1.4, 0, -1.5]}>
      <mesh position={[0, 0.05, 0]} castShadow>
        <cylinderGeometry args={[0.15, 0.18, 0.03, 16]} />
        <meshStandardMaterial color="#1a1a1a" metalness={0.8} />
      </mesh>
      <mesh position={[0, 0.7, 0]} castShadow>
        <cylinderGeometry args={[0.015, 0.015, 1.3, 8]} />
        <meshStandardMaterial color="#2a2a2a" metalness={0.9} />
      </mesh>
      <mesh position={[0, 1.4, 0]} castShadow>
        <cylinderGeometry args={[0.12, 0.08, 0.25, 16]} />
        <meshStandardMaterial 
          color="#f5f5dc" 
          roughness={0.9}
          emissive="#fff5e0"
          emissiveIntensity={0.3}
        />
      </mesh>
      <pointLight ref={lightRef} position={[0, 1.35, 0]} color="#fff5e0" intensity={0.8} distance={4} castShadow />
    </group>
  );
}

function Cupboard() {
  return (
    <group position={[2.3, 0, -1]}>
      <mesh position={[0, 0.9, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.6, 1.8, 0.45]} />
        <meshStandardMaterial color="#3a2a1a" roughness={0.7} />
      </mesh>
      <mesh position={[0, 0.9, 0.23]}>
        <boxGeometry args={[0.55, 0.85, 0.02]} />
        <meshStandardMaterial color="#2a1a0a" roughness={0.6} />
      </mesh>
      <mesh position={[0, 0.9, 0.23]}>
        <boxGeometry args={[0.02, 1.75, 0.02]} />
        <meshStandardMaterial color="#2a1a0a" roughness={0.6} />
      </mesh>
      <mesh position={[0.12, 0.6, 0.25]}>
        <sphereGeometry args={[0.02, 8, 8]} />
        <meshStandardMaterial color="#c0a080" metalness={0.8} />
      </mesh>
      <mesh position={[-0.12, 1.2, 0.25]}>
        <sphereGeometry args={[0.02, 8, 8]} />
        <meshStandardMaterial color="#c0a080" metalness={0.8} />
      </mesh>
      {[0, 0.08, 0.16].map((y, i) => (
        <mesh key={i} position={[0, 1.85 + y, 0]} castShadow>
          <boxGeometry args={[0.25, 0.06, 0.18]} />
          <meshStandardMaterial color={["#4a3a2a", "#3a4a3a", "#3a3a4a"][i]} roughness={0.5} />
        </mesh>
      ))}
    </group>
  );
}

function MessiPoster() {
  return (
    <group position={[-2.45, 1.3, -1]} rotation={[0, Math.PI / 2, 0]}>
      <mesh castShadow>
        <boxGeometry args={[0.6, 0.8, 0.02]} />
        <meshStandardMaterial color="#1a1a2a" />
      </mesh>
      <mesh position={[0, 0, 0.015]}>
        <boxGeometry args={[0.55, 0.75, 0.01]} />
        <meshStandardMaterial color="#2a3a5a" />
      </mesh>
      <mesh position={[0, -0.15, 0.02]}>
        <boxGeometry args={[0.25, 0.4, 0.005]} />
        <meshStandardMaterial color="#75aadb" />
      </mesh>
      <mesh position={[0, 0.25, 0.02]}>
        <boxGeometry args={[0.4, 0.08, 0.005]} />
        <meshStandardMaterial color="#ffd700" />
      </mesh>
    </group>
  );
}

function Room() {
  const floorTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = '#2a1a0a';
    ctx.fillRect(0, 0, 512, 512);
    for (let i = 0; i < 8; i++) {
      for (let j = 0; j < 8; j++) {
        ctx.fillStyle = (i + j) % 2 === 0 ? '#3a2a1a' : '#2a1a0a';
        ctx.fillRect(i * 64, j * 64, 64, 64);
      }
    }
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(2, 2);
    return texture;
  }, []);

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[6, 6]} />
        <meshStandardMaterial map={floorTexture} roughness={0.8} />
      </mesh>
      <mesh position={[0, 1.5, -2.5]} receiveShadow>
        <planeGeometry args={[6, 3]} />
        <meshStandardMaterial color="#2a2a2a" roughness={0.9} />
      </mesh>
      <mesh position={[-2.5, 1.5, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[6, 3]} />
        <meshStandardMaterial color="#2a2a2a" roughness={0.9} />
      </mesh>
      <mesh position={[2.5, 1.5, 0]} rotation={[0, -Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[6, 3]} />
        <meshStandardMaterial color="#282828" roughness={0.9} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 3, 0]}>
        <planeGeometry args={[6, 6]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.95} />
      </mesh>
    </group>
  );
}

function Scene() {
  return (
    <>
      <ambientLight intensity={0.15} />
      <directionalLight
        position={[3, 4, 2]}
        intensity={0.4}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-far={20}
        shadow-camera-left={-5}
        shadow-camera-right={5}
        shadow-camera-top={5}
        shadow-camera-bottom={-5}
      />
      <pointLight position={[0, 2.5, 0]} intensity={0.2} color="#ffffff" />
      
      <Room />
      <Desk />
      <Monitor />
      <GamingPC />
      <PlayStation5 />
      <GamingHeadphones />
      <PS5Controller />
      <PlantShelf />
      <WallTV />
      <GamingChair />
      <Bed />
      <FloorLamp />
      <Cupboard />
      <MessiPoster />
      
      <ContactShadows
        position={[0, 0, 0]}
        opacity={0.4}
        scale={10}
        blur={2}
        far={4}
      />
    </>
  );
}

interface GamingRoom3DProps {
  opacity?: number;
}

export function GamingRoom3D({ opacity = 1 }: GamingRoom3DProps) {
  const targetDpr = Math.min(window.devicePixelRatio, 3);
  
  return (
    <div 
      className="absolute inset-0"
      style={{ 
        opacity,
        transition: 'opacity 0.5s ease-out'
      }}
      data-testid="gaming-room-3d"
    >
      <Canvas
        shadows
        dpr={targetDpr}
        gl={{ 
          antialias: true, 
          alpha: true,
          powerPreference: "high-performance",
          precision: "highp",
          stencil: false,
          depth: true,
        }}
        camera={{ 
          position: [0, 1.5, 3.5], 
          fov: 50,
          near: 0.1,
          far: 100
        }}
        style={{ background: 'transparent' }}
      >
        <Scene />
        <OrbitControls
          enablePan={false}
          enableZoom={true}
          minDistance={2}
          maxDistance={6}
          minPolarAngle={Math.PI / 6}
          maxPolarAngle={Math.PI / 2.2}
          target={[0, 0.8, -1]}
          autoRotate
          autoRotateSpeed={0.3}
        />
        <Environment preset="night" />
      </Canvas>
    </div>
  );
}
