import { useRef, forwardRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Environment, ContactShadows, Float, Text } from "@react-three/drei";
import * as THREE from "three";

function ComputerDesk() {
  return (
    <group position={[0, 0, -2]}>
      {/* Desk top */}
      <mesh position={[0, 0.75, 0]} castShadow receiveShadow>
        <boxGeometry args={[2.4, 0.05, 0.8]} />
        <meshStandardMaterial color="#2a2015" roughness={0.3} />
      </mesh>
      {/* Left leg */}
      <mesh position={[-1.1, 0.375, 0]} castShadow>
        <boxGeometry args={[0.05, 0.75, 0.6]} />
        <meshStandardMaterial color="#1a1510" roughness={0.4} />
      </mesh>
      {/* Right leg */}
      <mesh position={[1.1, 0.375, 0]} castShadow>
        <boxGeometry args={[0.05, 0.75, 0.6]} />
        <meshStandardMaterial color="#1a1510" roughness={0.4} />
      </mesh>
      {/* Back panel */}
      <mesh position={[0, 0.375, -0.35]} castShadow>
        <boxGeometry args={[2.3, 0.7, 0.02]} />
        <meshStandardMaterial color="#1a1510" roughness={0.4} />
      </mesh>
    </group>
  );
}

function Monitor() {
  const screenRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (screenRef.current) {
      const material = screenRef.current.material as THREE.MeshStandardMaterial;
      material.emissiveIntensity = 0.5 + Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
    }
  });

  return (
    <group position={[0, 1.1, -2.2]}>
      {/* Monitor frame */}
      <mesh castShadow>
        <boxGeometry args={[0.9, 0.55, 0.03]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.2} metalness={0.8} />
      </mesh>
      {/* Screen */}
      <mesh ref={screenRef} position={[0, 0, 0.02]}>
        <boxGeometry args={[0.85, 0.5, 0.01]} />
        <meshStandardMaterial 
          color="#0a0a15" 
          emissive="#1a3a5a"
          emissiveIntensity={0.5}
          roughness={0.1}
        />
      </mesh>
      {/* Stand neck */}
      <mesh position={[0, -0.35, 0]} castShadow>
        <boxGeometry args={[0.08, 0.15, 0.08]} />
        <meshStandardMaterial color="#2a2a2a" metalness={0.9} roughness={0.2} />
      </mesh>
      {/* Stand base */}
      <mesh position={[0, -0.43, 0.1]} castShadow>
        <boxGeometry args={[0.3, 0.02, 0.2]} />
        <meshStandardMaterial color="#2a2a2a" metalness={0.9} roughness={0.2} />
      </mesh>
    </group>
  );
}

function CPU() {
  const rgbRef = useRef<THREE.PointLight>(null);
  const stripRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const hue = (state.clock.elapsedTime * 0.3) % 1;
    if (rgbRef.current) {
      rgbRef.current.color.setHSL(hue, 1, 0.5);
    }
    if (stripRef.current) {
      const material = stripRef.current.material as THREE.MeshStandardMaterial;
      material.color.setHSL(hue, 1, 0.5);
      material.emissive.setHSL(hue, 1, 0.5);
    }
  });

  return (
    <group position={[0.9, 0.95, -2]}>
      {/* CPU case */}
      <mesh castShadow>
        <boxGeometry args={[0.2, 0.4, 0.4]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.3} metalness={0.7} />
      </mesh>
      {/* Glass panel */}
      <mesh position={[-0.1, 0, 0]}>
        <boxGeometry args={[0.01, 0.35, 0.35]} />
        <meshStandardMaterial 
          color="#111" 
          transparent 
          opacity={0.3}
          roughness={0.1}
        />
      </mesh>
      {/* RGB strip */}
      <mesh ref={stripRef} position={[-0.09, 0, 0]}>
        <boxGeometry args={[0.01, 0.3, 0.02]} />
        <meshStandardMaterial 
          color="#ff0000"
          emissive="#ff0000"
          emissiveIntensity={2}
        />
      </mesh>
      {/* RGB light */}
      <pointLight
        ref={rgbRef}
        position={[-0.15, 0, 0]}
        intensity={0.5}
        distance={1}
        color="#ff0000"
      />
    </group>
  );
}

function GamingKeyboard() {
  const keysRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (keysRef.current) {
      keysRef.current.children.forEach((key, i) => {
        const material = (key as THREE.Mesh).material as THREE.MeshStandardMaterial;
        const hue = (state.clock.elapsedTime * 0.2 + i * 0.05) % 1;
        material.emissive.setHSL(hue, 1, 0.3);
      });
    }
  });

  return (
    <group position={[-0.2, 0.8, -1.8]}>
      {/* Keyboard base */}
      <mesh castShadow>
        <boxGeometry args={[0.45, 0.02, 0.15]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.4} metalness={0.6} />
      </mesh>
      {/* Keys group */}
      <group ref={keysRef} position={[0, 0.02, 0]}>
        {Array.from({ length: 12 }).map((_, row) => (
          Array.from({ length: 4 }).map((_, col) => (
            <mesh 
              key={`key-${row}-${col}`} 
              position={[-0.18 + row * 0.035, 0.01, -0.05 + col * 0.035]}
              castShadow
            >
              <boxGeometry args={[0.03, 0.015, 0.03]} />
              <meshStandardMaterial 
                color="#2a2a2a" 
                emissive="#ff0000"
                emissiveIntensity={0.5}
              />
            </mesh>
          ))
        )).flat()}
      </group>
    </group>
  );
}

function GamingMouse() {
  const mouseRef = useRef<THREE.Mesh>(null);
  const lightRef = useRef<THREE.PointLight>(null);

  useFrame((state) => {
    const hue = (state.clock.elapsedTime * 0.4) % 1;
    if (mouseRef.current) {
      const material = mouseRef.current.material as THREE.MeshStandardMaterial;
      material.emissive.setHSL(hue, 1, 0.3);
    }
    if (lightRef.current) {
      lightRef.current.color.setHSL(hue, 1, 0.5);
    }
  });

  return (
    <group position={[0.25, 0.8, -1.8]}>
      {/* Mouse body */}
      <mesh ref={mouseRef} castShadow>
        <capsuleGeometry args={[0.025, 0.06, 8, 16]} />
        <meshStandardMaterial 
          color="#1a1a1a" 
          roughness={0.3} 
          metalness={0.6}
          emissive="#00ff00"
          emissiveIntensity={0.3}
        />
      </mesh>
      {/* RGB glow */}
      <pointLight
        ref={lightRef}
        position={[0, 0.02, 0]}
        intensity={0.2}
        distance={0.3}
      />
    </group>
  );
}

const OfficeChairAnimated = forwardRef<THREE.Group>((_, ref) => {
  return (
    <group ref={ref} position={[0, 0, -0.8]}>
      {/* Seat */}
      <mesh position={[0, 0.45, 0]} castShadow>
        <boxGeometry args={[0.45, 0.08, 0.45]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.6} />
      </mesh>
      {/* Back rest */}
      <mesh position={[0, 0.75, -0.2]} castShadow>
        <boxGeometry args={[0.43, 0.55, 0.08]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.6} />
      </mesh>
      {/* Arm rests */}
      <mesh position={[-0.25, 0.55, 0]} castShadow>
        <boxGeometry args={[0.05, 0.15, 0.3]} />
        <meshStandardMaterial color="#2a2a2a" roughness={0.5} />
      </mesh>
      <mesh position={[0.25, 0.55, 0]} castShadow>
        <boxGeometry args={[0.05, 0.15, 0.3]} />
        <meshStandardMaterial color="#2a2a2a" roughness={0.5} />
      </mesh>
      {/* Base pole */}
      <mesh position={[0, 0.25, 0]} castShadow>
        <cylinderGeometry args={[0.03, 0.03, 0.35, 16]} />
        <meshStandardMaterial color="#3a3a3a" metalness={0.9} roughness={0.2} />
      </mesh>
      {/* Wheel base */}
      {[0, 72, 144, 216, 288].map((angle, i) => (
        <group key={i} rotation={[0, THREE.MathUtils.degToRad(angle), 0]}>
          <mesh position={[0.15, 0.05, 0]} castShadow>
            <boxGeometry args={[0.2, 0.02, 0.03]} />
            <meshStandardMaterial color="#3a3a3a" metalness={0.8} roughness={0.3} />
          </mesh>
          <mesh position={[0.22, 0.03, 0]} castShadow>
            <sphereGeometry args={[0.025, 16, 16]} />
            <meshStandardMaterial color="#1a1a1a" roughness={0.4} />
          </mesh>
        </group>
      ))}
    </group>
  );
});

function Bed() {
  return (
    <group position={[0, 0, 1.5]}>
      {/* Mattress */}
      <mesh position={[0, 0.35, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.4, 0.25, 2]} />
        <meshStandardMaterial color="#3a4a5a" roughness={0.8} />
      </mesh>
      {/* Pillow */}
      <mesh position={[0, 0.52, -0.7]} castShadow>
        <boxGeometry args={[0.9, 0.12, 0.4]} />
        <meshStandardMaterial color="#e8e0d8" roughness={0.9} />
      </mesh>
      {/* Blanket */}
      <mesh position={[0, 0.5, 0.3]} castShadow>
        <boxGeometry args={[1.35, 0.08, 1.2]} />
        <meshStandardMaterial color="#4a3a50" roughness={0.85} />
      </mesh>
      {/* Frame */}
      <mesh position={[0, 0.15, 0]} castShadow>
        <boxGeometry args={[1.5, 0.3, 2.1]} />
        <meshStandardMaterial color="#2a2015" roughness={0.5} />
      </mesh>
      {/* Headboard */}
      <mesh position={[0, 0.6, -1]} castShadow>
        <boxGeometry args={[1.5, 0.6, 0.08]} />
        <meshStandardMaterial color="#2a2015" roughness={0.5} />
      </mesh>
    </group>
  );
}

function VintageLamp() {
  return (
    <group position={[-1.3, 0.78, -2]}>
      {/* Lamp base */}
      <mesh position={[0, 0, 0]} castShadow>
        <cylinderGeometry args={[0.08, 0.1, 0.05, 16]} />
        <meshStandardMaterial color="#8b7355" metalness={0.8} roughness={0.3} />
      </mesh>
      {/* Lamp pole */}
      <mesh position={[0, 0.2, 0]} castShadow>
        <cylinderGeometry args={[0.015, 0.015, 0.35, 8]} />
        <meshStandardMaterial color="#8b7355" metalness={0.9} roughness={0.2} />
      </mesh>
      {/* Lamp shade */}
      <mesh position={[0, 0.4, 0]} castShadow>
        <coneGeometry args={[0.12, 0.15, 16, 1, true]} />
        <meshStandardMaterial 
          color="#f5e6d3" 
          side={THREE.DoubleSide}
          roughness={0.9}
          transparent
          opacity={0.9}
        />
      </mesh>
      {/* Warm light */}
      <pointLight
        position={[0, 0.35, 0]}
        intensity={0.8}
        distance={2}
        color="#ffaa55"
        castShadow
      />
    </group>
  );
}

function PlantHolder() {
  return (
    <Float speed={1.5} rotationIntensity={0.1} floatIntensity={0.3}>
      <group position={[0, 1.8, -2.4]}>
        {/* Pot */}
        <mesh castShadow>
          <cylinderGeometry args={[0.08, 0.06, 0.1, 16]} />
          <meshStandardMaterial color="#d4a574" roughness={0.8} />
        </mesh>
        {/* Soil */}
        <mesh position={[0, 0.04, 0]}>
          <cylinderGeometry args={[0.07, 0.07, 0.02, 16]} />
          <meshStandardMaterial color="#3a2a1a" roughness={1} />
        </mesh>
        {/* Plant leaves */}
        {[0, 60, 120, 180, 240, 300].map((angle, i) => (
          <mesh 
            key={i} 
            position={[
              Math.cos(THREE.MathUtils.degToRad(angle)) * 0.03,
              0.12 + i * 0.01,
              Math.sin(THREE.MathUtils.degToRad(angle)) * 0.03
            ]}
            rotation={[
              THREE.MathUtils.degToRad(30 + i * 5),
              THREE.MathUtils.degToRad(angle),
              0
            ]}
            castShadow
          >
            <planeGeometry args={[0.04, 0.1]} />
            <meshStandardMaterial color="#3a8a4a" side={THREE.DoubleSide} roughness={0.8} />
          </mesh>
        ))}
        {/* Wall mount bracket */}
        <mesh position={[0, 0, -0.06]} castShadow>
          <boxGeometry args={[0.1, 0.08, 0.02]} />
          <meshStandardMaterial color="#2a2a2a" metalness={0.8} roughness={0.3} />
        </mesh>
      </group>
    </Float>
  );
}

const WallTVAnimated = forwardRef<THREE.Group>((_, ref) => {
  const screenRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (screenRef.current) {
      const material = screenRef.current.material as THREE.MeshStandardMaterial;
      material.emissiveIntensity = 0.3 + Math.sin(state.clock.elapsedTime * 2) * 0.05;
    }
  });

  return (
    <group ref={ref} position={[-2.4, 1.2, -0.5]}>
      {/* TV arm mount */}
      <group position={[0.3, 0, 0.4]}>
        <mesh castShadow>
          <boxGeometry args={[0.08, 0.08, 0.02]} />
          <meshStandardMaterial color="#2a2a2a" metalness={0.9} roughness={0.2} />
        </mesh>
        {/* Arm segment 1 */}
        <mesh position={[0, 0, 0.15]} rotation={[0, 0, 0]} castShadow>
          <boxGeometry args={[0.04, 0.04, 0.25]} />
          <meshStandardMaterial color="#3a3a3a" metalness={0.8} roughness={0.3} />
        </mesh>
        {/* Arm segment 2 */}
        <mesh position={[-0.15, 0, 0.28]} rotation={[0, Math.PI / 4, 0]} castShadow>
          <boxGeometry args={[0.04, 0.04, 0.2]} />
          <meshStandardMaterial color="#3a3a3a" metalness={0.8} roughness={0.3} />
        </mesh>
      </group>
      {/* TV Frame */}
      <mesh castShadow>
        <boxGeometry args={[0.7, 0.45, 0.03]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.2} metalness={0.7} />
      </mesh>
      {/* TV Screen */}
      <mesh ref={screenRef} position={[0, 0, 0.02]}>
        <boxGeometry args={[0.65, 0.4, 0.01]} />
        <meshStandardMaterial 
          color="#0a0a15"
          emissive="#2a4a6a"
          emissiveIntensity={0.3}
          roughness={0.1}
        />
      </mesh>
    </group>
  );
});

function Cupboard() {
  const bookColors = ["#8B4513", "#2F4F4F", "#8B0000", "#191970", "#556B2F", "#4A4A4A"];
  
  return (
    <group position={[-2.4, 0.8, 0.8]}>
      {/* Main frame */}
      <mesh castShadow>
        <boxGeometry args={[0.1, 1.6, 0.8]} />
        <meshStandardMaterial color="#3a2a1a" roughness={0.6} />
      </mesh>
      
      {/* Bottom closed doors (2 rows) */}
      {[0, 1].map((row) => (
        <group key={`door-${row}`} position={[0.06, -0.6 + row * 0.4, 0]}>
          {/* Door panel */}
          <mesh castShadow>
            <boxGeometry args={[0.02, 0.38, 0.75]} />
            <meshStandardMaterial color="#4a3a2a" roughness={0.5} />
          </mesh>
          {/* Door handle */}
          <mesh position={[0.02, 0, 0.15]} castShadow>
            <boxGeometry args={[0.02, 0.08, 0.02]} />
            <meshStandardMaterial color="#8b7355" metalness={0.9} roughness={0.2} />
          </mesh>
        </group>
      ))}
      
      {/* Top open shelves (2 rows) with books */}
      {[0, 1].map((row) => (
        <group key={`shelf-${row}`} position={[0.04, 0.2 + row * 0.4, 0]}>
          {/* Shelf */}
          <mesh position={[0, -0.18, 0]} castShadow>
            <boxGeometry args={[0.08, 0.02, 0.75]} />
            <meshStandardMaterial color="#3a2a1a" roughness={0.6} />
          </mesh>
          {/* Books */}
          {Array.from({ length: 5 }).map((_, i) => (
            <mesh 
              key={i} 
              position={[0.02, 0, -0.28 + i * 0.14]}
              rotation={[0, Math.random() * 0.1, 0]}
              castShadow
            >
              <boxGeometry args={[0.03, 0.28 + Math.random() * 0.08, 0.1 + Math.random() * 0.03]} />
              <meshStandardMaterial 
                color={bookColors[i % bookColors.length]} 
                roughness={0.8} 
              />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  );
}

function Room() {
  return (
    <group>
      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[8, 8]} />
        <meshStandardMaterial color="#1a1815" roughness={0.9} />
      </mesh>
      
      {/* Back wall (North) */}
      <mesh position={[0, 2, -2.5]} receiveShadow>
        <planeGeometry args={[8, 4]} />
        <meshStandardMaterial color="#1e1e22" roughness={0.95} />
      </mesh>
      
      {/* Left wall */}
      <mesh position={[-2.5, 2, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[8, 4]} />
        <meshStandardMaterial color="#1a1a1e" roughness={0.95} />
      </mesh>
      
      {/* Right wall */}
      <mesh position={[2.5, 2, 0]} rotation={[0, -Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[8, 4]} />
        <meshStandardMaterial color="#1a1a1e" roughness={0.95} />
      </mesh>
    </group>
  );
}

function RoomScene() {
  const chairRef = useRef<THREE.Group>(null);
  const tvRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (chairRef.current) {
      chairRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.15;
    }
    if (tvRef.current) {
      tvRef.current.rotation.y = Math.PI / 2 + Math.sin(state.clock.elapsedTime * 0.2) * 0.1;
    }
  });

  return (
    <>
      <Room />
      <ComputerDesk />
      <Monitor />
      <CPU />
      <GamingKeyboard />
      <GamingMouse />
      <OfficeChairAnimated ref={chairRef} />
      <Bed />
      <VintageLamp />
      <PlantHolder />
      <WallTVAnimated ref={tvRef} />
      <Cupboard />
      
      {/* Section label */}
      <Text
        position={[0, 2.8, -2.4]}
        fontSize={0.15}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
        font="/fonts/inter-medium.woff"
      >
        MY SPACE
      </Text>
    </>
  );
}

interface Room3DSceneProps {
  visible: boolean;
}

export function Room3DScene({ visible }: Room3DSceneProps) {
  if (!visible) return null;

  return (
    <div 
      className="fixed inset-0 z-50 pointer-events-auto"
      style={{ opacity: visible ? 1 : 0, transition: 'opacity 0.5s ease-out' }}
      data-testid="room-3d-scene"
    >
      <Canvas
        shadows
        camera={{ position: [3, 2.5, 4], fov: 50 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: 'transparent' }}
      >
        <color attach="background" args={['#000000']} />
        
        {/* Ambient light for general illumination */}
        <ambientLight intensity={0.15} />
        
        {/* Main directional light */}
        <directionalLight
          position={[5, 8, 5]}
          intensity={0.4}
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
          shadow-camera-far={15}
          shadow-camera-left={-4}
          shadow-camera-right={4}
          shadow-camera-top={4}
          shadow-camera-bottom={-4}
        />
        
        {/* Fill light */}
        <directionalLight
          position={[-3, 4, -2]}
          intensity={0.2}
          color="#6688aa"
        />
        
        {/* Rim light */}
        <spotLight
          position={[0, 5, -3]}
          intensity={0.3}
          angle={0.5}
          penumbra={1}
          color="#aaccff"
        />

        <RoomScene />
        
        <ContactShadows
          position={[0, 0, 0]}
          opacity={0.6}
          scale={10}
          blur={2}
          far={4}
        />
        
        <OrbitControls
          enablePan={false}
          enableZoom={true}
          minDistance={3}
          maxDistance={8}
          minPolarAngle={Math.PI / 6}
          maxPolarAngle={Math.PI / 2.2}
          autoRotate
          autoRotateSpeed={0.3}
          dampingFactor={0.05}
          enableDamping
        />
        
        <Environment preset="night" />
      </Canvas>
    </div>
  );
}
