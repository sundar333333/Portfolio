import { Suspense, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, Float } from "@react-three/drei";
import * as THREE from "three";

function Desk() {
  return (
    <group position={[0, -0.5, -1.5]}>
      <mesh position={[0, 0.75, 0]} castShadow receiveShadow>
        <boxGeometry args={[2.4, 0.06, 1]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.3} metalness={0.8} />
      </mesh>
      {[[-1.1, 0, -0.4], [1.1, 0, -0.4], [-1.1, 0, 0.4], [1.1, 0, 0.4]].map((pos, i) => (
        <mesh key={i} position={[pos[0], 0.375, pos[2]]} castShadow>
          <boxGeometry args={[0.06, 0.75, 0.06]} />
          <meshStandardMaterial color="#111" roughness={0.4} metalness={0.6} />
        </mesh>
      ))}
    </group>
  );
}

function Monitor() {
  return (
    <group position={[0, 0.62, -1.8]}>
      <mesh castShadow>
        <boxGeometry args={[1.2, 0.7, 0.04]} />
        <meshStandardMaterial color="#0a0a0a" roughness={0.2} metalness={0.9} />
      </mesh>
      <mesh position={[0, 0, 0.025]}>
        <planeGeometry args={[1.1, 0.6]} />
        <meshStandardMaterial
          color="#0d1117"
          emissive="#1a73e8"
          emissiveIntensity={0.15}
          roughness={0.1}
          metalness={0.3}
        />
      </mesh>
      <CodeLines />
      <mesh position={[0, -0.38, 0.1]} castShadow>
        <boxGeometry args={[0.08, 0.12, 0.08]} />
        <meshStandardMaterial color="#111" roughness={0.3} metalness={0.7} />
      </mesh>
      <mesh position={[0, -0.44, 0.1]} castShadow>
        <boxGeometry args={[0.4, 0.02, 0.2]} />
        <meshStandardMaterial color="#111" roughness={0.3} metalness={0.7} />
      </mesh>
    </group>
  );
}

function CodeLines() {
  const lines = [
    { w: 0.3, x: -0.35, y: 0.2, color: "#c678dd" },
    { w: 0.5, x: -0.25, y: 0.15, color: "#61afef" },
    { w: 0.2, x: -0.15, y: 0.1, color: "#98c379" },
    { w: 0.6, x: -0.2, y: 0.05, color: "#e5c07b" },
    { w: 0.15, x: -0.15, y: 0.0, color: "#56b6c2" },
    { w: 0.4, x: -0.25, y: -0.05, color: "#61afef" },
    { w: 0.35, x: -0.15, y: -0.1, color: "#c678dd" },
    { w: 0.25, x: -0.2, y: -0.15, color: "#98c379" },
    { w: 0.45, x: -0.22, y: -0.2, color: "#e06c75" },
  ];

  return (
    <group position={[0, 0, 0.03]}>
      {lines.map((line, i) => (
        <mesh key={i} position={[line.x, line.y, 0]}>
          <planeGeometry args={[line.w, 0.02]} />
          <meshStandardMaterial
            color={line.color}
            emissive={line.color}
            emissiveIntensity={0.5}
            transparent
            opacity={0.8}
          />
        </mesh>
      ))}
    </group>
  );
}

function Keyboard() {
  return (
    <group position={[0, 0.29, -1.3]}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[0.8, 0.02, 0.3]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.4} metalness={0.6} />
      </mesh>
      {Array.from({ length: 4 }).map((_, row) =>
        Array.from({ length: 12 }).map((_, col) => (
          <mesh
            key={`${row}-${col}`}
            position={[-0.33 + col * 0.055, 0.015, -0.1 + row * 0.065]}
          >
            <boxGeometry args={[0.04, 0.01, 0.04]} />
            <meshStandardMaterial color="#222" roughness={0.5} metalness={0.4} />
          </mesh>
        ))
      )}
    </group>
  );
}

function Mouse() {
  return (
    <group position={[0.6, 0.29, -1.25]}>
      <mesh castShadow>
        <capsuleGeometry args={[0.025, 0.04, 4, 8]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.3} metalness={0.6} />
      </mesh>
    </group>
  );
}

function Chair() {
  return (
    <group position={[0, -0.5, 0]}>
      <mesh position={[0, 0.45, 0]} castShadow>
        <boxGeometry args={[0.5, 0.06, 0.5]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.6} metalness={0.3} />
      </mesh>
      <mesh position={[0, 0.85, -0.23]} castShadow>
        <boxGeometry args={[0.5, 0.8, 0.06]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.6} metalness={0.3} />
      </mesh>
      <mesh position={[0, 0.2, 0]}>
        <cylinderGeometry args={[0.03, 0.03, 0.5, 8]} />
        <meshStandardMaterial color="#111" roughness={0.3} metalness={0.8} />
      </mesh>
      {[0, 1, 2, 3, 4].map((i) => {
        const angle = (i / 5) * Math.PI * 2;
        return (
          <group key={i}>
            <mesh position={[Math.cos(angle) * 0.25, -0.05, Math.sin(angle) * 0.25]} rotation={[0, 0, Math.PI / 2 - angle]}>
              <cylinderGeometry args={[0.015, 0.015, 0.3, 6]} />
              <meshStandardMaterial color="#111" roughness={0.3} metalness={0.8} />
            </mesh>
            <mesh position={[Math.cos(angle) * 0.3, -0.08, Math.sin(angle) * 0.3]}>
              <sphereGeometry args={[0.03, 8, 8]} />
              <meshStandardMaterial color="#222" roughness={0.4} metalness={0.5} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}

function Shelf() {
  return (
    <group position={[-1.8, 0.5, -1.5]}>
      {[0, 0.5, 1].map((y, i) => (
        <mesh key={i} position={[0, y, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.6, 0.03, 0.25]} />
          <meshStandardMaterial color="#1a1a1a" roughness={0.5} metalness={0.5} />
        </mesh>
      ))}
      <mesh position={[-0.29, 0.5, 0]} castShadow>
        <boxGeometry args={[0.03, 1.03, 0.25]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.5} metalness={0.5} />
      </mesh>
      <mesh position={[0.29, 0.5, 0]} castShadow>
        <boxGeometry args={[0.03, 1.03, 0.25]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.5} metalness={0.5} />
      </mesh>
      {[
        { x: -0.15, w: 0.08, h: 0.35, color: "#2d1b69" },
        { x: -0.05, w: 0.06, h: 0.3, color: "#1a3c5e" },
        { x: 0.05, w: 0.07, h: 0.33, color: "#3d1c02" },
        { x: 0.15, w: 0.05, h: 0.28, color: "#1e3a1e" },
      ].map((book, i) => (
        <mesh key={i} position={[book.x, book.h / 2 + 0.03, 0]} castShadow>
          <boxGeometry args={[book.w, book.h, 0.18]} />
          <meshStandardMaterial color={book.color} roughness={0.8} metalness={0.1} />
        </mesh>
      ))}
    </group>
  );
}

function Plant() {
  return (
    <group position={[1.5, 0.29, -1.7]}>
      <mesh castShadow>
        <cylinderGeometry args={[0.08, 0.06, 0.15, 8]} />
        <meshStandardMaterial color="#2a2a2a" roughness={0.7} metalness={0.2} />
      </mesh>
      <mesh position={[0, 0.08, 0]}>
        <cylinderGeometry args={[0.07, 0.07, 0.02, 8]} />
        <meshStandardMaterial color="#1a3c1a" roughness={0.9} />
      </mesh>
      {[0, 1, 2, 3, 4, 5].map((i) => {
        const angle = (i / 6) * Math.PI * 2 + Math.random() * 0.3;
        const height = 0.1 + Math.random() * 0.15;
        return (
          <mesh key={i} position={[Math.cos(angle) * 0.03, 0.1 + height / 2, Math.sin(angle) * 0.03]} rotation={[Math.cos(angle) * 0.3, 0, Math.sin(angle) * 0.3]}>
            <capsuleGeometry args={[0.008, height, 4, 8]} />
            <meshStandardMaterial color="#1a5c1a" roughness={0.8} />
          </mesh>
        );
      })}
    </group>
  );
}

function CoffeeMug() {
  return (
    <Float speed={0} floatIntensity={0}>
      <group position={[-0.7, 0.32, -1.2]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.035, 0.03, 0.08, 12]} />
          <meshStandardMaterial color="#f5f5f5" roughness={0.3} metalness={0.1} />
        </mesh>
        <mesh position={[0, 0.01, 0]}>
          <cylinderGeometry args={[0.03, 0.025, 0.06, 12]} />
          <meshStandardMaterial color="#3b2314" roughness={0.8} />
        </mesh>
        <mesh position={[0.045, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <torusGeometry args={[0.025, 0.005, 8, 16, Math.PI]} />
          <meshStandardMaterial color="#f5f5f5" roughness={0.3} metalness={0.1} />
        </mesh>
      </group>
    </Float>
  );
}

function NeonSign() {
  const ref = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (ref.current) {
      const intensity = 0.8 + Math.sin(state.clock.elapsedTime * 2) * 0.2;
      ref.current.children.forEach((child) => {
        if ((child as THREE.Mesh).material) {
          const mat = (child as THREE.Mesh).material as THREE.MeshStandardMaterial;
          if (mat.emissiveIntensity !== undefined) {
            mat.emissiveIntensity = intensity;
          }
        }
      });
    }
  });

  return (
    <group ref={ref} position={[1.95, 1.2, -1]}>
      <mesh>
        <torusGeometry args={[0.15, 0.01, 8, 32]} />
        <meshStandardMaterial
          color="#ff6b35"
          emissive="#ff6b35"
          emissiveIntensity={1}
          toneMapped={false}
        />
      </mesh>
      <pointLight color="#ff6b35" intensity={0.5} distance={3} position={[0, 0, 0.1]} />
    </group>
  );
}

function WallArt() {
  return (
    <group position={[-0.8, 1.2, -1.97]}>
      <mesh>
        <boxGeometry args={[0.6, 0.4, 0.02]} />
        <meshStandardMaterial color="#111" roughness={0.3} metalness={0.5} />
      </mesh>
      <mesh position={[0, 0, 0.015]}>
        <planeGeometry args={[0.5, 0.3]} />
        <meshStandardMaterial
          color="#0f0f1a"
          emissive="#4a2d82"
          emissiveIntensity={0.3}
        />
      </mesh>
    </group>
  );
}

function Room() {
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1, 0]} receiveShadow>
        <planeGeometry args={[6, 6]} />
        <meshStandardMaterial color="#0a0a0a" roughness={0.3} metalness={0.8} />
      </mesh>

      <mesh position={[0, 1.5, -2]} receiveShadow>
        <planeGeometry args={[6, 5]} />
        <meshStandardMaterial color="#0d0d0d" roughness={0.9} metalness={0.1} />
      </mesh>

      <mesh position={[-3, 1.5, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[6, 5]} />
        <meshStandardMaterial color="#0d0d0d" roughness={0.9} metalness={0.1} />
      </mesh>

      <mesh position={[3, 1.5, 0]} rotation={[0, -Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[6, 5]} />
        <meshStandardMaterial color="#0d0d0d" roughness={0.9} metalness={0.1} />
      </mesh>

      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 4, 0]}>
        <planeGeometry args={[6, 6]} />
        <meshStandardMaterial color="#080808" roughness={0.9} />
      </mesh>
    </group>
  );
}

function Headphones() {
  return (
    <group position={[-1.0, 0.32, -1.5]} rotation={[0, 0.5, 0]}>
      <mesh>
        <torusGeometry args={[0.07, 0.008, 8, 24, Math.PI]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.3} metalness={0.7} />
      </mesh>
      <mesh position={[-0.07, -0.01, 0]}>
        <sphereGeometry args={[0.03, 8, 8]} />
        <meshStandardMaterial color="#222" roughness={0.4} metalness={0.5} />
      </mesh>
      <mesh position={[0.07, -0.01, 0]}>
        <sphereGeometry args={[0.03, 8, 8]} />
        <meshStandardMaterial color="#222" roughness={0.4} metalness={0.5} />
      </mesh>
    </group>
  );
}

function LEDStrip() {
  const ref = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (ref.current) {
      const mat = ref.current.material as THREE.MeshStandardMaterial;
      const hue = (state.clock.elapsedTime * 0.05) % 1;
      mat.color.setHSL(hue, 0.8, 0.5);
      mat.emissive.setHSL(hue, 0.8, 0.5);
    }
  });

  return (
    <group>
      <mesh ref={ref} position={[0, -0.95, -1.99]}>
        <boxGeometry args={[5.9, 0.02, 0.02]} />
        <meshStandardMaterial
          color="#6366f1"
          emissive="#6366f1"
          emissiveIntensity={0.8}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}

function SceneContent() {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.15) * 0.05;
      groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.02;
    }
  });

  return (
    <group ref={groupRef}>
      <Room />
      <Desk />
      <Monitor />
      <Keyboard />
      <Mouse />
      <Chair />
      <Shelf />
      <Plant />
      <CoffeeMug />
      <NeonSign />
      <WallArt />
      <Headphones />
      <LEDStrip />

      <ambientLight intensity={0.08} />
      <pointLight position={[0, 3, 0]} intensity={0.3} color="#ffffff" castShadow shadow-mapSize={1024} />
      <pointLight position={[0, 0.8, -1.5]} intensity={0.4} color="#4a8fe7" distance={3} />
      <spotLight
        position={[0, 3.5, -1]}
        angle={0.4}
        penumbra={0.8}
        intensity={0.6}
        color="#ffffff"
        castShadow
        target-position={[0, 0, -1.5]}
      />
    </group>
  );
}

interface Room3DProps {
  visible: boolean;
}

export function Room3D({ visible }: Room3DProps) {
  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 z-[31]"
      style={{
        opacity: visible ? 1 : 0,
        transition: "opacity 0.8s ease-in-out",
      }}
      data-testid="room-3d-container"
    >
      <Canvas
        shadows
        camera={{ position: [0, 1.5, 3], fov: 50 }}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        style={{ background: "transparent" }}
      >
        <Suspense fallback={null}>
          <SceneContent />
          <Environment preset="night" />
        </Suspense>
      </Canvas>
    </div>
  );
}
