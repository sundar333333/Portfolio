import { Suspense, useRef, useState, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useGLTF, Environment, OrbitControls } from "@react-three/drei";
import * as THREE from "three";

function RoomModel() {
  const { scene } = useGLTF("/room.glb", true);
  const groupRef = useRef<THREE.Group>(null);

  useEffect(() => {
    scene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        if (mesh.material) {
          const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
          materials.forEach((mat) => {
            if (mat instanceof THREE.MeshStandardMaterial || mat instanceof THREE.MeshPhysicalMaterial) {
              if (mat.map) mat.map.anisotropy = 1;
              mat.envMapIntensity = 0.5;
            }
          });
        }
      }
    });
  }, [scene]);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.1) * 0.03;
    }
  });

  const box = new THREE.Box3().setFromObject(scene);
  const size = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());
  const maxDim = Math.max(size.x, size.y, size.z);
  const scale = 4 / maxDim;

  return (
    <group ref={groupRef}>
      <primitive
        object={scene}
        scale={scale}
        position={[-center.x * scale, -center.y * scale + 0.5, -center.z * scale]}
      />
    </group>
  );
}

function LoadingIndicator() {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 2;
      meshRef.current.rotation.x = state.clock.elapsedTime;
    }
  });

  return (
    <group>
      <mesh ref={meshRef}>
        <boxGeometry args={[0.3, 0.3, 0.3]} />
        <meshStandardMaterial color="#444" wireframe />
      </mesh>
      <ambientLight intensity={0.5} />
    </group>
  );
}

interface Room3DProps {
  visible: boolean;
}

export function Room3D({ visible }: Room3DProps) {
  const [hasError, setHasError] = useState(false);

  if (!visible || hasError) return null;

  return (
    <div
      className="fixed inset-0 z-[31]"
      data-testid="room-3d-container"
    >
      <Canvas
        shadows
        camera={{ position: [3, 3, 5], fov: 45 }}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: "high-performance",
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.2,
        }}
        style={{ background: "transparent" }}
        onCreated={({ gl }) => {
          gl.domElement.addEventListener("webglcontextlost", (e) => {
            e.preventDefault();
            setHasError(true);
          });
        }}
      >
        <Suspense fallback={<LoadingIndicator />}>
          <RoomModel />
          <ambientLight intensity={0.3} />
          <pointLight position={[3, 4, 2]} intensity={0.8} color="#ffffff" castShadow />
          <pointLight position={[-2, 3, -1]} intensity={0.4} color="#4a8fe7" />
          <spotLight
            position={[0, 5, 3]}
            angle={0.5}
            penumbra={0.8}
            intensity={0.6}
            color="#ffffff"
            castShadow
          />
          <Environment preset="apartment" />
          <OrbitControls
            enableZoom={true}
            enablePan={false}
            minDistance={2}
            maxDistance={10}
            minPolarAngle={Math.PI / 6}
            maxPolarAngle={Math.PI / 2.2}
            autoRotate
            autoRotateSpeed={0.3}
            target={[0, 0.5, 0]}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}

