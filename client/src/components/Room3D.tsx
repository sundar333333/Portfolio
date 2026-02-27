import { Suspense, useRef, useState, useEffect, useCallback } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF, Environment, ContactShadows, useProgress } from "@react-three/drei";
import { MeshoptDecoder } from "meshoptimizer";
import * as THREE from "three";

useGLTF.preload("/static/room.glb");

function RoomModel({ onModelLoaded }: { onModelLoaded: () => void }) {
  const { scene } = useGLTF("/static/room.glb", true, true, (loader) => {
    loader.setMeshoptDecoder(MeshoptDecoder);
  });
  const groupRef = useRef<THREE.Group>(null);

  useEffect(() => {
    if (scene) {
      scene.traverse((child: THREE.Object3D) => {
        if ((child as THREE.Mesh).isMesh) {
          const mesh = child as THREE.Mesh;
          mesh.castShadow = true;
          mesh.receiveShadow = true;
        }
      });

      const box = new THREE.Box3().setFromObject(scene);
      const size = box.getSize(new THREE.Vector3());
      const center = box.getCenter(new THREE.Vector3());

      const maxDim = Math.max(size.x, size.y, size.z);
      const targetSize = 8;
      const scale = targetSize / maxDim;

      scene.scale.setScalar(scale);

      const scaledBox = new THREE.Box3().setFromObject(scene);
      const scaledCenter = scaledBox.getCenter(new THREE.Vector3());
      scene.position.sub(scaledCenter);

      onModelLoaded();
    }
  }, [scene, onModelLoaded]);

  return (
    <group ref={groupRef}>
      <primitive object={scene} />
    </group>
  );
}

function LoadingOverlay() {
  const { progress } = useProgress();

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center z-10 bg-white">
      <div className="w-16 h-16 border-4 border-black/10 border-t-black/60 rounded-full"
        style={{ animation: 'spin 1s linear infinite' }}
      />
      <p className="mt-4 text-black/40 text-sm tracking-wider">Loading 3D Room...</p>
      <div className="mt-3 w-48 h-1 bg-black/10 rounded-full overflow-hidden">
        <div className="h-full bg-black/40 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
      </div>
      <p className="mt-2 text-black/25 text-xs">{Math.round(progress)}%</p>
    </div>
  );
}

interface Room3DProps {
  isVisible: boolean;
}

export default function Room3D({ isVisible }: Room3DProps) {
  const [loaded, setLoaded] = useState(false);
  const handleModelLoaded = useCallback(() => {
    setTimeout(() => setLoaded(true), 300);
  }, []);

  if (!isVisible) return null;

  return (
    <div
      className="fixed inset-0 z-30 bg-white"
      style={{ width: '100vw', height: '100vh' }}
      data-testid="room-3d-container"
      onWheelCapture={(e) => e.stopPropagation()}
      onWheel={(e) => e.stopPropagation()}
    >
      {!loaded && <LoadingOverlay />}
      <Canvas
        shadows
        camera={{ position: [10, 6, 10], fov: 50, near: 0.1, far: 200 }}
        style={{
          width: '100%',
          height: '100%',
          opacity: loaded ? 1 : 0,
          transition: 'opacity 0.8s ease-out',
        }}
        gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.2 }}
      >
        <color attach="background" args={['#f5f5f5']} />

        <ambientLight intensity={0.5} />
        <directionalLight
          position={[8, 12, 5]}
          intensity={1.5}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
        />
        <pointLight position={[-5, 8, -5]} intensity={0.4} color="#ffeedd" />
        <hemisphereLight args={["#b1e1ff", "#b97a20", 0.3]} />

        <Suspense fallback={null}>
          <RoomModel onModelLoaded={handleModelLoaded} />
          <Environment preset="apartment" />
        </Suspense>

        <ContactShadows
          position={[0, -4, 0]}
          opacity={0.35}
          scale={30}
          blur={2.5}
          far={10}
        />

        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={3}
          maxDistance={30}
          minPolarAngle={0.2}
          maxPolarAngle={Math.PI / 2.1}
          target={[0, 0, 0]}
          enableDamping={true}
          dampingFactor={0.05}
          autoRotate={true}
          autoRotateSpeed={0.5}
        />
      </Canvas>
    </div>
  );
}
