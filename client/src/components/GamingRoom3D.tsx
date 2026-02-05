import { useRef, useMemo, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { 
  OrbitControls, 
  Environment, 
  ContactShadows,
  MeshReflectorMaterial,
  Float,
  Sparkles,
  useGLTF
} from "@react-three/drei";
import { EffectComposer, Bloom, Vignette, SSAO } from "@react-three/postprocessing";
import { BlendFunction } from "postprocessing";
import * as THREE from "three";

const POLY_PIZZA_CDN = "https://d1a370nemizbjq.cloudfront.net";

const MODEL_URLS = {
  gamingComputer: `${POLY_PIZZA_CDN}/5cN7W4ufoII/model.gltf`,
  monitor: `${POLY_PIZZA_CDN}/M9Lpzbr0bA/model.gltf`,
  officeChair: `${POLY_PIZZA_CDN}/UfKvrZBK6C/model.gltf`,
  deskChair: `${POLY_PIZZA_CDN}/CKSz6PB1vO/model.gltf`,
  bedSingle: `${POLY_PIZZA_CDN}/sn8az3odMR/model.gltf`,
  bedDouble: `${POLY_PIZZA_CDN}/wcmbCZ63mg/model.gltf`,
  desk: `${POLY_PIZZA_CDN}/dptlMEX4tF_/model.gltf`,
  pc: `${POLY_PIZZA_CDN}/7uQP127OF7z/model.gltf`,
};

function RGBLight({ position, color, intensity = 1, speed = 2 }: { position: [number, number, number]; color: string; intensity?: number; speed?: number }) {
  const lightRef = useRef<THREE.PointLight>(null);
  
  useFrame(({ clock }) => {
    if (lightRef.current) {
      lightRef.current.intensity = intensity * (0.7 + Math.sin(clock.elapsedTime * speed) * 0.3);
    }
  });
  
  return <pointLight ref={lightRef} position={position} color={color} intensity={intensity} distance={4} decay={2} />;
}

function RGBStrip({ position, rotation, color, width = 0.3, height = 0.02 }: { position: [number, number, number]; rotation?: [number, number, number]; color: string; width?: number; height?: number }) {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame(({ clock }) => {
    if (meshRef.current) {
      const material = meshRef.current.material as THREE.MeshStandardMaterial;
      material.emissiveIntensity = 2 + Math.sin(clock.elapsedTime * 3) * 0.5;
    }
  });

  return (
    <mesh ref={meshRef} position={position} rotation={rotation || [0, 0, 0]}>
      <boxGeometry args={[width, height, 0.01]} />
      <meshStandardMaterial 
        color={color} 
        emissive={color} 
        emissiveIntensity={2}
        toneMapped={false}
      />
    </mesh>
  );
}

function LoadedModel({ url, position, rotation, scale }: { 
  url: string; 
  position: [number, number, number]; 
  rotation?: [number, number, number]; 
  scale?: number | [number, number, number];
}) {
  const { scene } = useGLTF(url);
  const clonedScene = useMemo(() => scene.clone(), [scene]);
  
  return (
    <primitive 
      object={clonedScene} 
      position={position} 
      rotation={rotation || [0, 0, 0]} 
      scale={scale || 1}
      castShadow
      receiveShadow
    />
  );
}

function GamingComputer() {
  return (
    <group position={[0.9, 0.44, -2.1]}>
      <Suspense fallback={<FallbackPC />}>
        <LoadedModel 
          url={MODEL_URLS.gamingComputer} 
          position={[0, 0, 0]} 
          scale={0.4}
        />
      </Suspense>
      <RGBLight position={[-0.15, 0.2, 0.15]} color="#ff0055" intensity={0.8} speed={2.5} />
      <RGBLight position={[-0.15, 0, 0.15]} color="#00ff88" intensity={0.8} speed={3} />
      <RGBLight position={[-0.15, -0.2, 0]} color="#0088ff" intensity={0.6} speed={2} />
    </group>
  );
}

function FallbackPC() {
  const fanRef1 = useRef<THREE.Mesh>(null);
  const fanRef2 = useRef<THREE.Mesh>(null);
  
  useFrame(({ clock }) => {
    const speed = clock.elapsedTime * 8;
    if (fanRef1.current) fanRef1.current.rotation.z = speed;
    if (fanRef2.current) fanRef2.current.rotation.z = -speed;
  });

  return (
    <group>
      <mesh castShadow>
        <boxGeometry args={[0.22, 0.48, 0.42]} />
        <meshStandardMaterial color="#0a0a0a" roughness={0.2} metalness={0.85} />
      </mesh>
      <mesh position={[-0.112, 0, 0.08]}>
        <boxGeometry args={[0.005, 0.44, 0.38]} />
        <meshStandardMaterial color="#111" transparent opacity={0.25} />
      </mesh>
      <mesh ref={fanRef1} position={[-0.112, 0.12, 0.08]}>
        <cylinderGeometry args={[0.055, 0.055, 0.015, 8]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>
      <mesh ref={fanRef2} position={[-0.112, -0.12, 0.08]}>
        <cylinderGeometry args={[0.055, 0.055, 0.015, 8]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>
      <mesh position={[-0.112, 0.12, 0.09]}>
        <ringGeometry args={[0.045, 0.055, 32]} />
        <meshStandardMaterial emissive="#ff0055" emissiveIntensity={3} toneMapped={false} />
      </mesh>
      <mesh position={[-0.112, -0.12, 0.09]}>
        <ringGeometry args={[0.045, 0.055, 32]} />
        <meshStandardMaterial emissive="#00ff88" emissiveIntensity={3} toneMapped={false} />
      </mesh>
    </group>
  );
}

function Monitor3D() {
  const screenRef = useRef<THREE.Mesh>(null);
  
  useFrame(({ clock }) => {
    if (screenRef.current) {
      const material = screenRef.current.material as THREE.MeshStandardMaterial;
      material.emissiveIntensity = 0.4 + Math.sin(clock.elapsedTime * 0.5) * 0.1;
    }
  });

  return (
    <group position={[0, 0.44, -2.25]}>
      <Suspense fallback={
        <group position={[0, 0.34, 0]}>
          <mesh castShadow>
            <boxGeometry args={[1.1, 0.65, 0.03]} />
            <meshStandardMaterial color="#050505" roughness={0.1} metalness={0.9} />
          </mesh>
          <mesh ref={screenRef} position={[0, 0, 0.02]}>
            <planeGeometry args={[1.0, 0.58]} />
            <meshStandardMaterial color="#0a0a1a" emissive="#1a3a6a" emissiveIntensity={0.4} />
          </mesh>
        </group>
      }>
        <LoadedModel 
          url={MODEL_URLS.monitor} 
          position={[0, 0, 0]} 
          scale={0.5}
        />
      </Suspense>
      <RGBStrip position={[0, 0.02, 0.03]} color="#ff00ff" width={0.6} />
    </group>
  );
}

function GamingChair3D() {
  return (
    <group position={[0, 0, 0.3]}>
      <Suspense fallback={<FallbackChair />}>
        <LoadedModel 
          url={MODEL_URLS.officeChair} 
          position={[0, 0, 0]} 
          rotation={[0, Math.PI, 0]}
          scale={0.6}
        />
      </Suspense>
      <RGBStrip position={[0.27, 0.55, -0.1]} rotation={[0, 0, Math.PI / 2]} color="#ff0044" width={0.35} />
      <RGBStrip position={[-0.27, 0.55, -0.1]} rotation={[0, 0, Math.PI / 2]} color="#ff0044" width={0.35} />
      <RGBLight position={[0.3, 0.5, 0]} color="#ff0044" intensity={0.4} />
      <RGBLight position={[-0.3, 0.5, 0]} color="#ff0044" intensity={0.4} />
    </group>
  );
}

function FallbackChair() {
  return (
    <group>
      <mesh position={[0, 0.32, 0]} castShadow>
        <boxGeometry args={[0.52, 0.1, 0.52]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.8} />
      </mesh>
      <mesh position={[0, 0.72, -0.22]} castShadow rotation={[-0.1, 0, 0]}>
        <boxGeometry args={[0.52, 0.72, 0.08]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.8} />
      </mesh>
      <mesh position={[0, 1.12, -0.24]} castShadow>
        <boxGeometry args={[0.32, 0.18, 0.1]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.85} />
      </mesh>
      {[[-0.2, 0.06, 0.2], [0.2, 0.06, 0.2], [-0.2, 0.06, -0.2], [0.2, 0.06, -0.2]].map((pos, i) => (
        <mesh key={i} position={pos as [number, number, number]} castShadow>
          <sphereGeometry args={[0.04, 20, 20]} />
          <meshStandardMaterial color="#222" metalness={0.85} roughness={0.15} />
        </mesh>
      ))}
    </group>
  );
}

function Bed3D() {
  return (
    <group position={[-2.25, 0, 0.6]} rotation={[0, Math.PI / 2, 0]}>
      <Suspense fallback={<FallbackBed />}>
        <LoadedModel 
          url={MODEL_URLS.bedDouble} 
          position={[0, 0, 0]} 
          scale={0.8}
        />
      </Suspense>
    </group>
  );
}

function FallbackBed() {
  return (
    <group>
      <mesh position={[0, 0.22, 0]} castShadow receiveShadow>
        <boxGeometry args={[2.1, 0.32, 1.1]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.85} />
      </mesh>
      <mesh position={[0, 0.42, 0]} receiveShadow>
        <boxGeometry args={[2.0, 0.12, 1.0]} />
        <meshStandardMaterial color="#2a2a3a" roughness={0.95} />
      </mesh>
      <mesh position={[-0.75, 0.52, -0.2]} castShadow>
        <boxGeometry args={[0.45, 0.16, 0.38]} />
        <meshStandardMaterial color="#4a4a5a" roughness={0.95} />
      </mesh>
    </group>
  );
}

function Desk3D() {
  return (
    <group position={[0, 0, -2]}>
      <Suspense fallback={<FallbackDesk />}>
        <LoadedModel 
          url={MODEL_URLS.desk} 
          position={[0, 0.4, 0]} 
          scale={0.8}
        />
      </Suspense>
      <RGBStrip position={[0, 0.38, 0.44]} color="#00ffff" width={2.4} />
    </group>
  );
}

function FallbackDesk() {
  return (
    <group position={[0, 0.4, 0]}>
      <mesh position={[0, 0, 0]} castShadow receiveShadow>
        <boxGeometry args={[2.6, 0.04, 0.9]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.15} metalness={0.4} />
      </mesh>
      {[[-1.15, -0.38, 0.3], [1.15, -0.38, 0.3], [-1.15, -0.38, -0.3], [1.15, -0.38, -0.3]].map((pos, i) => (
        <mesh key={i} position={pos as [number, number, number]} castShadow>
          <boxGeometry args={[0.06, 0.72, 0.06]} />
          <meshStandardMaterial color="#1a1a1a" roughness={0.3} metalness={0.7} />
        </mesh>
      ))}
    </group>
  );
}

function PlayStation5() {
  return (
    <group position={[-0.9, 0.47, -2.15]} rotation={[0, 0, Math.PI / 2]}>
      <mesh castShadow>
        <boxGeometry args={[0.06, 0.38, 0.24]} />
        <meshStandardMaterial color="#ffffff" roughness={0.15} metalness={0.1} />
      </mesh>
      <mesh position={[0.032, 0, 0]}>
        <boxGeometry args={[0.008, 0.36, 0.22]} />
        <meshStandardMaterial color="#0a0a0a" roughness={0.05} metalness={0.9} />
      </mesh>
      <mesh position={[0.035, -0.12, 0]}>
        <boxGeometry args={[0.003, 0.04, 0.03]} />
        <meshStandardMaterial emissive="#0088ff" emissiveIntensity={2} toneMapped={false} />
      </mesh>
      <RGBLight position={[0.05, -0.12, 0]} color="#0088ff" intensity={0.3} speed={1} />
    </group>
  );
}

function GamingHeadphones() {
  return (
    <group position={[-0.55, 0.52, -1.85]} rotation={[0, 0.2, 0]}>
      <mesh castShadow>
        <torusGeometry args={[0.09, 0.018, 16, 32, Math.PI]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.25} metalness={0.7} />
      </mesh>
      {[[-0.09, -0.02], [0.09, -0.02]].map(([x, y], i) => (
        <group key={i} position={[x, y, 0]}>
          <mesh castShadow>
            <sphereGeometry args={[0.05, 24, 24]} />
            <meshStandardMaterial color="#2a2a2a" roughness={0.3} metalness={0.5} />
          </mesh>
        </group>
      ))}
      <mesh position={[0.052, -0.02, 0]}>
        <boxGeometry args={[0.004, 0.025, 0.012]} />
        <meshStandardMaterial emissive="#00ff44" emissiveIntensity={2} toneMapped={false} />
      </mesh>
    </group>
  );
}

function PS5Controller() {
  return (
    <group position={[0.35, 0.455, -1.75]} rotation={[0.1, 0.4, 0]}>
      <mesh castShadow>
        <boxGeometry args={[0.15, 0.025, 0.095]} />
        <meshStandardMaterial color="#ffffff" roughness={0.15} metalness={0.1} />
      </mesh>
      {[[-0.045, -0.02], [0.045, 0.015]].map(([x, z], i) => (
        <mesh key={i} position={[x, 0.018, z]}>
          <cylinderGeometry args={[0.012, 0.012, 0.012, 16]} />
          <meshStandardMaterial color="#1a1a1a" roughness={0.5} />
        </mesh>
      ))}
      <mesh position={[0, 0.02, -0.01]}>
        <boxGeometry args={[0.035, 0.004, 0.035]} />
        <meshStandardMaterial color="#1a1a2a" emissive="#0066ff" emissiveIntensity={0.8} />
      </mesh>
    </group>
  );
}

function PlantShelf() {
  const PlantPot = ({ position }: { position: [number, number, number] }) => (
    <group position={position}>
      <mesh castShadow>
        <cylinderGeometry args={[0.045, 0.035, 0.08, 16]} />
        <meshStandardMaterial color="#5a3a2a" roughness={0.85} />
      </mesh>
      <Float speed={2} rotationIntensity={0.1} floatIntensity={0.1}>
        <mesh position={[0, 0.08, 0]}>
          <sphereGeometry args={[0.055, 12, 12]} />
          <meshStandardMaterial color="#1a5a1a" roughness={0.9} />
        </mesh>
      </Float>
    </group>
  );

  return (
    <group position={[0, 1.65, -2.48]}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[0.85, 0.025, 0.14]} />
        <meshStandardMaterial color="#5a3a1a" roughness={0.6} metalness={0.1} />
      </mesh>
      <PlantPot position={[-0.28, 0.055, 0]} />
      <PlantPot position={[0, 0.055, 0]} />
      <PlantPot position={[0.28, 0.055, 0]} />
    </group>
  );
}

function WallTV() {
  const screenRef = useRef<THREE.Mesh>(null);
  
  useFrame(({ clock }) => {
    if (screenRef.current) {
      const material = screenRef.current.material as THREE.MeshStandardMaterial;
      material.emissiveIntensity = 0.15 + Math.sin(clock.elapsedTime * 0.3) * 0.05;
    }
  });

  return (
    <group position={[1.6, 1.35, -2.48]}>
      <mesh castShadow>
        <boxGeometry args={[1.0, 0.6, 0.025]} />
        <meshStandardMaterial color="#050505" roughness={0.1} metalness={0.95} />
      </mesh>
      <mesh ref={screenRef} position={[0, 0, 0.015]}>
        <planeGeometry args={[0.96, 0.56]} />
        <meshStandardMaterial color="#0a0a12" emissive="#1a2a3a" emissiveIntensity={0.15} />
      </mesh>
    </group>
  );
}

function FloorLamp() {
  const lightRef = useRef<THREE.PointLight>(null);
  const shadeRef = useRef<THREE.Mesh>(null);
  
  useFrame(({ clock }) => {
    if (lightRef.current) {
      lightRef.current.intensity = 1.2 + Math.sin(clock.elapsedTime * 0.8) * 0.15;
    }
    if (shadeRef.current) {
      const material = shadeRef.current.material as THREE.MeshStandardMaterial;
      material.emissiveIntensity = 0.5 + Math.sin(clock.elapsedTime * 0.8) * 0.1;
    }
  });

  return (
    <group position={[1.5, 0, -1.4]}>
      <mesh position={[0, 0.025, 0]} castShadow>
        <cylinderGeometry args={[0.18, 0.22, 0.04, 24]} />
        <meshStandardMaterial color="#1a1a1a" metalness={0.9} roughness={0.15} />
      </mesh>
      <mesh position={[0, 0.75, 0]} castShadow>
        <cylinderGeometry args={[0.018, 0.018, 1.4, 12]} />
        <meshStandardMaterial color="#252525" metalness={0.95} roughness={0.1} />
      </mesh>
      <mesh ref={shadeRef} position={[0, 1.48, 0]} castShadow>
        <cylinderGeometry args={[0.14, 0.1, 0.28, 24]} />
        <meshStandardMaterial 
          color="#f5f0e5" 
          roughness={0.9}
          emissive="#fff8e8"
          emissiveIntensity={0.5}
          side={THREE.DoubleSide}
        />
      </mesh>
      <pointLight ref={lightRef} position={[0, 1.42, 0]} color="#fff5e0" intensity={1.2} distance={5} decay={2} castShadow />
    </group>
  );
}

function Cupboard() {
  return (
    <group position={[2.35, 0, -0.9]}>
      <mesh position={[0, 0.95, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.65, 1.9, 0.48]} />
        <meshStandardMaterial color="#2a1a0a" roughness={0.65} metalness={0.1} />
      </mesh>
      <mesh position={[0.01, 0.95, 0.245]}>
        <boxGeometry args={[0.6, 0.92, 0.015]} />
        <meshStandardMaterial color="#1a0a00" roughness={0.55} />
      </mesh>
      {[0, 0.07, 0.14].map((y, i) => (
        <mesh key={i} position={[0, 1.95 + y, 0]} castShadow>
          <boxGeometry args={[0.22, 0.055, 0.16]} />
          <meshStandardMaterial color={["#3a2a1a", "#2a3a2a", "#2a2a3a"][i]} roughness={0.45} />
        </mesh>
      ))}
    </group>
  );
}

function MessiPoster() {
  return (
    <group position={[-2.48, 1.35, -0.9]} rotation={[0, Math.PI / 2, 0]}>
      <mesh castShadow>
        <boxGeometry args={[0.65, 0.85, 0.018]} />
        <meshStandardMaterial color="#1a1a2a" roughness={0.3} metalness={0.1} />
      </mesh>
      <mesh position={[0, 0, 0.012]}>
        <boxGeometry args={[0.6, 0.8, 0.008]} />
        <meshStandardMaterial color="#2a3a5a" roughness={0.5} />
      </mesh>
      <mesh position={[0, -0.12, 0.015]}>
        <boxGeometry args={[0.28, 0.42, 0.004]} />
        <meshStandardMaterial color="#75aadb" roughness={0.6} />
      </mesh>
      <mesh position={[0, 0.28, 0.015]}>
        <boxGeometry args={[0.45, 0.1, 0.003]} />
        <meshStandardMaterial color="#ffd700" roughness={0.25} metalness={0.6} />
      </mesh>
    </group>
  );
}

function Room() {
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[6.5, 6.5]} />
        <MeshReflectorMaterial
          blur={[300, 100]}
          resolution={1024}
          mixBlur={0.8}
          mixStrength={0.5}
          roughness={0.7}
          depthScale={1.2}
          minDepthThreshold={0.4}
          maxDepthThreshold={1.4}
          color="#1a120a"
          metalness={0.3}
          mirror={0.3}
        />
      </mesh>
      <mesh position={[0, 1.55, -2.52]} receiveShadow>
        <planeGeometry args={[6.5, 3.1]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.92} />
      </mesh>
      <mesh position={[-2.52, 1.55, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[6.5, 3.1]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.92} />
      </mesh>
      <mesh position={[2.52, 1.55, 0]} rotation={[0, -Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[6.5, 3.1]} />
        <meshStandardMaterial color="#181818" roughness={0.92} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 3.1, 0]}>
        <planeGeometry args={[6.5, 6.5]} />
        <meshStandardMaterial color="#0f0f0f" roughness={0.98} />
      </mesh>
    </group>
  );
}

function AmbientParticles() {
  return (
    <Sparkles
      count={50}
      scale={5}
      size={0.8}
      speed={0.3}
      opacity={0.3}
      color="#ffffff"
    />
  );
}

function Scene() {
  return (
    <>
      <ambientLight intensity={0.08} />
      <directionalLight
        position={[4, 5, 3]}
        intensity={0.35}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-far={25}
        shadow-camera-left={-6}
        shadow-camera-right={6}
        shadow-camera-top={6}
        shadow-camera-bottom={-6}
        shadow-bias={-0.0001}
      />
      <pointLight position={[0, 2.8, 0]} intensity={0.15} color="#ffffff" decay={2} />
      <spotLight
        position={[-1, 2.5, 1]}
        angle={0.5}
        penumbra={0.8}
        intensity={0.3}
        color="#fff8f0"
        castShadow
      />
      
      <Room />
      <Desk3D />
      <Monitor3D />
      <GamingComputer />
      <PlayStation5 />
      <GamingHeadphones />
      <PS5Controller />
      <PlantShelf />
      <WallTV />
      <GamingChair3D />
      <Bed3D />
      <FloorLamp />
      <Cupboard />
      <MessiPoster />
      <AmbientParticles />
      
      <ContactShadows
        position={[0, 0.001, 0]}
        opacity={0.6}
        scale={12}
        blur={2.5}
        far={5}
      />
    </>
  );
}

function PostProcessing() {
  return (
    <EffectComposer>
      <SSAO
        blendFunction={BlendFunction.MULTIPLY}
        samples={16}
        radius={0.1}
        intensity={20}
        luminanceInfluence={0.5}
        color="black"
      />
      <Bloom 
        intensity={0.8}
        luminanceThreshold={0.6}
        luminanceSmoothing={0.9}
        mipmapBlur
      />
      <Vignette
        offset={0.3}
        darkness={0.6}
        blendFunction={BlendFunction.NORMAL}
      />
    </EffectComposer>
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
      <Suspense fallback={
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-white text-lg">Loading 3D Room...</div>
        </div>
      }>
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
            logarithmicDepthBuffer: true,
          }}
          camera={{ 
            position: [0.5, 1.6, 3.8], 
            fov: 45,
            near: 0.1,
            far: 100
          }}
          style={{ background: 'transparent' }}
        >
          <Suspense fallback={null}>
            <Scene />
            <PostProcessing />
          </Suspense>
          <OrbitControls
            enablePan={false}
            enableZoom={true}
            minDistance={2}
            maxDistance={6}
            minPolarAngle={Math.PI / 6}
            maxPolarAngle={Math.PI / 2.1}
            target={[0, 0.9, -0.8]}
            autoRotate
            autoRotateSpeed={0.25}
            enableDamping
            dampingFactor={0.05}
          />
          <Environment preset="night" />
        </Canvas>
      </Suspense>
    </div>
  );
}

Object.values(MODEL_URLS).forEach(url => {
  useGLTF.preload(url);
});
