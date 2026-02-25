import { Suspense, useRef, useState, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { useGLTF, OrbitControls } from "@react-three/drei";
import * as THREE from "three";

function RoomModel() {
  const { scene } = useGLTF("/room.glb", true);

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
              const name = mat.name.toLowerCase();
              if (name.includes("black") && name.includes("plaster") && name.includes("wall") && !mat.map) {
                mat.color.set("#0a0a0a");
                mat.needsUpdate = true;
              }
            }
          });
        }
      }
    });
  }, [scene]);

  const box = new THREE.Box3().setFromObject(scene);
  const size = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());
  const maxDim = Math.max(size.x, size.y, size.z);
  const scale = 4 / maxDim;

  return (
    <primitive
      object={scene}
      scale={scale}
      position={[-center.x * scale, -center.y * scale + 0.5, -center.z * scale]}
    />
  );
}

function LoadingIndicator() {
  const meshRef = useRef<THREE.Mesh>(null);

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
        camera={{ position: [3, 2.5, 5], fov: 45 }}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: "high-performance",
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.4,
          failIfMajorPerformanceCaveat: false,
        }}
        dpr={[1, 1.5]}
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
          <ambientLight intensity={1.0} />
          <directionalLight
            position={[2, 5, 3]}
            intensity={1.5}
            color="#ffffff"
            castShadow
          />
          <directionalLight
            position={[-3, 4, -2]}
            intensity={0.8}
            color="#ffffff"
          />
          <pointLight position={[-2, 3, 1]} intensity={0.8} color="#ffffff" distance={15} />
          <pointLight position={[2, 3, -1]} intensity={0.8} color="#ffffff" distance={15} />
          <pointLight position={[0, 4, 0]} intensity={0.6} color="#ffffff" distance={15} />
          <OrbitControls
            enableZoom={true}
            enablePan={false}
            minDistance={2}
            maxDistance={10}
            minPolarAngle={Math.PI / 6}
            maxPolarAngle={Math.PI / 2.2}
            autoRotate={false}
            target={[0, 0.5, 0]}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}
