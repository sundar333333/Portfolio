import { useRef, useMemo, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import * as THREE from 'three';

function Desk() {
  return (
    <group position={[0, 0.4, 0]}>
      {/* Desktop surface */}
      <mesh position={[0, 0, 0]} castShadow receiveShadow>
        <boxGeometry args={[2.4, 0.06, 1]} />
        <meshStandardMaterial color="#2a2a2a" roughness={0.3} metalness={0.1} />
      </mesh>
      
      {/* Desk legs */}
      {[[-1.1, -0.35, 0.4], [-1.1, -0.35, -0.4], [1.1, -0.35, 0.4], [1.1, -0.35, -0.4]].map((pos, i) => (
        <mesh key={i} position={pos as [number, number, number]} castShadow>
          <boxGeometry args={[0.06, 0.7, 0.06]} />
          <meshStandardMaterial color="#1a1a1a" roughness={0.5} metalness={0.3} />
        </mesh>
      ))}
      
      {/* Drawer unit */}
      <mesh position={[0.8, -0.2, 0]} castShadow>
        <boxGeometry args={[0.5, 0.4, 0.8]} />
        <meshStandardMaterial color="#222222" roughness={0.4} metalness={0.2} />
      </mesh>
    </group>
  );
}

function Monitor({ position, rotation = 0 }: { position: [number, number, number]; rotation?: number }) {
  const screenRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (screenRef.current) {
      const material = screenRef.current.material as THREE.MeshStandardMaterial;
      material.emissiveIntensity = 0.8 + Math.sin(state.clock.elapsedTime * 2) * 0.1;
    }
  });

  return (
    <group position={position} rotation={[0, rotation, 0]}>
      {/* Monitor frame */}
      <mesh castShadow>
        <boxGeometry args={[0.7, 0.45, 0.03]} />
        <meshStandardMaterial color="#111111" roughness={0.3} metalness={0.5} />
      </mesh>
      
      {/* Screen */}
      <mesh ref={screenRef} position={[0, 0, 0.017]}>
        <boxGeometry args={[0.65, 0.4, 0.01]} />
        <meshStandardMaterial 
          color="#0066ff" 
          emissive="#0066ff" 
          emissiveIntensity={0.8}
          roughness={0.1}
        />
      </mesh>
      
      {/* Monitor stand */}
      <mesh position={[0, -0.28, 0]} castShadow>
        <boxGeometry args={[0.08, 0.12, 0.08]} />
        <meshStandardMaterial color="#111111" roughness={0.3} metalness={0.5} />
      </mesh>
      
      {/* Monitor base */}
      <mesh position={[0, -0.35, 0]} castShadow>
        <boxGeometry args={[0.25, 0.02, 0.18]} />
        <meshStandardMaterial color="#111111" roughness={0.3} metalness={0.5} />
      </mesh>
    </group>
  );
}

function Chair() {
  return (
    <group position={[0, 0.3, 0.9]}>
      {/* Seat */}
      <mesh castShadow>
        <boxGeometry args={[0.5, 0.08, 0.5]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.7} />
      </mesh>
      
      {/* Backrest */}
      <mesh position={[0, 0.35, -0.22]} castShadow>
        <boxGeometry args={[0.48, 0.6, 0.08]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.7} />
      </mesh>
      
      {/* Chair base pole */}
      <mesh position={[0, -0.2, 0]} castShadow>
        <cylinderGeometry args={[0.03, 0.03, 0.35, 16]} />
        <meshStandardMaterial color="#333333" metalness={0.8} roughness={0.2} />
      </mesh>
      
      {/* Chair base */}
      <mesh position={[0, -0.38, 0]} castShadow>
        <cylinderGeometry args={[0.25, 0.25, 0.04, 16]} />
        <meshStandardMaterial color="#333333" metalness={0.8} roughness={0.2} />
      </mesh>
      
      {/* Wheels */}
      {[0, 1, 2, 3, 4].map((i) => {
        const angle = (i / 5) * Math.PI * 2;
        return (
          <mesh 
            key={i} 
            position={[Math.cos(angle) * 0.2, -0.42, Math.sin(angle) * 0.2]}
            castShadow
          >
            <sphereGeometry args={[0.04, 8, 8]} />
            <meshStandardMaterial color="#222222" roughness={0.5} />
          </mesh>
        );
      })}
    </group>
  );
}

function Keyboard() {
  return (
    <group position={[0, 0.46, 0.25]}>
      <mesh castShadow>
        <boxGeometry args={[0.45, 0.02, 0.15]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.5} />
      </mesh>
      {/* RGB strip */}
      <mesh position={[0, 0.015, 0]}>
        <boxGeometry args={[0.43, 0.005, 0.13]} />
        <meshStandardMaterial 
          color="#ff00ff" 
          emissive="#ff00ff" 
          emissiveIntensity={0.3}
        />
      </mesh>
    </group>
  );
}

function Mouse() {
  return (
    <group position={[0.35, 0.45, 0.25]}>
      <mesh castShadow>
        <boxGeometry args={[0.06, 0.025, 0.1]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.5} />
      </mesh>
    </group>
  );
}

function DeskLamp() {
  const lightRef = useRef<THREE.PointLight>(null);
  
  useFrame((state) => {
    if (lightRef.current) {
      lightRef.current.intensity = 0.5 + Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
    }
  });

  return (
    <group position={[-0.9, 0.45, -0.3]}>
      {/* Lamp base */}
      <mesh castShadow>
        <cylinderGeometry args={[0.08, 0.1, 0.03, 16]} />
        <meshStandardMaterial color="#222222" metalness={0.6} roughness={0.3} />
      </mesh>
      
      {/* Lamp arm */}
      <mesh position={[0, 0.2, 0]} castShadow>
        <cylinderGeometry args={[0.015, 0.015, 0.4, 8]} />
        <meshStandardMaterial color="#333333" metalness={0.8} roughness={0.2} />
      </mesh>
      
      {/* Lamp head */}
      <mesh position={[0.1, 0.38, 0]} rotation={[0, 0, -0.5]} castShadow>
        <coneGeometry args={[0.08, 0.12, 16]} />
        <meshStandardMaterial color="#333333" metalness={0.6} roughness={0.3} />
      </mesh>
      
      {/* Lamp light */}
      <mesh position={[0.1, 0.32, 0]}>
        <sphereGeometry args={[0.03, 8, 8]} />
        <meshStandardMaterial 
          color="#ffaa44" 
          emissive="#ffaa44" 
          emissiveIntensity={2}
        />
      </mesh>
      
      <pointLight 
        ref={lightRef}
        position={[0.1, 0.32, 0]} 
        color="#ffaa44" 
        intensity={0.5} 
        distance={2}
        castShadow
      />
    </group>
  );
}

function Shelf() {
  return (
    <group position={[-1.5, 1, -0.3]}>
      {/* Shelf boards */}
      {[0, 0.35, 0.7].map((y, i) => (
        <mesh key={i} position={[0, y, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.6, 0.03, 0.25]} />
          <meshStandardMaterial color="#3a3a3a" roughness={0.6} />
        </mesh>
      ))}
      
      {/* Side panels */}
      {[-0.28, 0.28].map((x, i) => (
        <mesh key={i} position={[x, 0.35, 0]} castShadow>
          <boxGeometry args={[0.03, 0.75, 0.25]} />
          <meshStandardMaterial color="#3a3a3a" roughness={0.6} />
        </mesh>
      ))}
      
      {/* Books on shelf */}
      <group position={[0, 0.12, 0]}>
        {[-0.15, -0.05, 0.05, 0.12].map((x, i) => (
          <mesh key={i} position={[x, 0, 0]} castShadow>
            <boxGeometry args={[0.08, 0.18, 0.15]} />
            <meshStandardMaterial 
              color={['#ff4444', '#44ff44', '#4444ff', '#ffff44'][i]} 
              roughness={0.8}
            />
          </mesh>
        ))}
      </group>
      
      {/* Plant pot */}
      <group position={[0, 0.5, 0]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.06, 0.05, 0.1, 16]} />
          <meshStandardMaterial color="#8B4513" roughness={0.9} />
        </mesh>
        <mesh position={[0, 0.1, 0]}>
          <sphereGeometry args={[0.08, 8, 8]} />
          <meshStandardMaterial color="#228B22" roughness={0.8} />
        </mesh>
      </group>
    </group>
  );
}

function CoffeeMug() {
  return (
    <group position={[0.9, 0.48, -0.2]}>
      <mesh castShadow>
        <cylinderGeometry args={[0.04, 0.035, 0.1, 16]} />
        <meshStandardMaterial color="#ffffff" roughness={0.3} />
      </mesh>
      {/* Handle */}
      <mesh position={[0.05, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <torusGeometry args={[0.025, 0.008, 8, 16, Math.PI]} />
        <meshStandardMaterial color="#ffffff" roughness={0.3} />
      </mesh>
    </group>
  );
}

function Headphones() {
  return (
    <group position={[-0.5, 0.5, 0.3]} rotation={[0, 0.3, 0]}>
      {/* Headband */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.1, 0.015, 8, 24, Math.PI]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.5} />
      </mesh>
      {/* Ear cups */}
      {[-0.1, 0.1].map((x, i) => (
        <mesh key={i} position={[x, -0.02, 0]} castShadow>
          <cylinderGeometry args={[0.05, 0.05, 0.03, 16]} />
          <meshStandardMaterial color="#222222" roughness={0.4} />
        </mesh>
      ))}
    </group>
  );
}

function Room() {
  const floorMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#1a1a1a',
    roughness: 0.8,
    metalness: 0.1,
  }), []);

  const wallMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#252525',
    roughness: 0.9,
    metalness: 0,
  }), []);

  return (
    <group>
      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow material={floorMaterial}>
        <planeGeometry args={[5, 5]} />
      </mesh>
      
      {/* Back wall */}
      <mesh position={[0, 1.5, -1]} receiveShadow material={wallMaterial}>
        <planeGeometry args={[5, 3]} />
      </mesh>
      
      {/* Left wall */}
      <mesh position={[-2.5, 1.5, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow material={wallMaterial}>
        <planeGeometry args={[5, 3]} />
      </mesh>
      
      {/* Furniture */}
      <Desk />
      <Monitor position={[-0.4, 0.68, -0.25]} rotation={0.15} />
      <Monitor position={[0.4, 0.68, -0.25]} rotation={-0.15} />
      <Chair />
      <Keyboard />
      <Mouse />
      <DeskLamp />
      <Shelf />
      <CoffeeMug />
      <Headphones />
    </group>
  );
}


interface Room3DProps {
  isVisible: boolean;
}

export function Room3D({ isVisible }: Room3DProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [showRoom, setShowRoom] = useState(false);
  
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => setShowRoom(true), 100);
      return () => clearTimeout(timer);
    } else {
      setShowRoom(false);
    }
  }, [isVisible]);
  
  if (!isVisible) return null;
  
  return (
    <div 
      ref={containerRef}
      className="fixed inset-0 z-40"
      style={{
        opacity: showRoom ? 1 : 0,
        transition: 'opacity 1.2s ease-out',
      }}
      data-testid="room-3d-container"
    >
      <Canvas
        shadows
        camera={{ position: [3, 2.5, 3], fov: 45 }}
        gl={{ antialias: true, alpha: true }}
      >
        <color attach="background" args={['#000000']} />
        
        {/* Ambient light */}
        <ambientLight intensity={0.15} />
        
        {/* Main directional light */}
        <directionalLight
          position={[5, 8, 5]}
          intensity={0.3}
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
        />
        
        {/* Blue accent light from monitors */}
        <pointLight position={[0, 0.8, 0]} color="#0066ff" intensity={0.8} distance={3} />
        
        {/* Warm accent light */}
        <pointLight position={[-1, 1, 0]} color="#ffaa44" intensity={0.3} distance={2} />
        
        <Room />
        
        <OrbitControls 
          enableZoom={false}
          enablePan={false}
          minPolarAngle={Math.PI / 4}
          maxPolarAngle={Math.PI / 2.2}
          minAzimuthAngle={-Math.PI / 6}
          maxAzimuthAngle={Math.PI / 4}
          rotateSpeed={0.3}
        />
        
        <Environment preset="night" />
      </Canvas>
    </div>
  );
}
