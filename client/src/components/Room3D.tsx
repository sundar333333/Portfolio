import { Suspense, useRef, useState, useEffect, useCallback } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls, useGLTF, Environment, useProgress } from "@react-three/drei";
import * as THREE from "three";

function RoomModel({ onModelLoaded }: { onModelLoaded: (center: THREE.Vector3, size: THREE.Vector3) => void }) {
  const { scene } = useGLTF("/room.glb");

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

      onModelLoaded(center, size);
    }
  }, [scene, onModelLoaded]);

  return <primitive object={scene} />;
}

function CameraSetup({ center, size }: { center: THREE.Vector3; size: THREE.Vector3 }) {
  const { camera } = useThree();
  const controlsRef = useRef<any>(null);

  useEffect(() => {
    if (!center || !size) return;

    const maxDim = Math.max(size.x, size.y, size.z);
    const distance = maxDim * 0.8;

    camera.position.set(
      center.x + distance * 0.6,
      center.y + distance * 0.4,
      center.z + distance * 0.6
    );
    camera.near = maxDim * 0.001;
    camera.far = maxDim * 10;
    (camera as THREE.PerspectiveCamera).updateProjectionMatrix();
    camera.lookAt(center);
  }, [center, size, camera]);

  return (
    <OrbitControls
      ref={controlsRef}
      target={center ? [center.x, center.y, center.z] : [0, 0, 0]}
      enablePan={true}
      enableZoom={true}
      enableRotate={true}
      minDistance={size ? Math.max(size.x, size.y, size.z) * 0.1 : 1}
      maxDistance={size ? Math.max(size.x, size.y, size.z) * 3 : 100}
      minPolarAngle={0.1}
      maxPolarAngle={Math.PI / 2.05}
      enableDamping={true}
      dampingFactor={0.05}
      autoRotate={true}
      autoRotateSpeed={0.3}
    />
  );
}

function SceneLights({ center, size }: { center: THREE.Vector3 | null; size: THREE.Vector3 | null }) {
  const maxDim = size ? Math.max(size.x, size.y, size.z) : 100;
  const cx = center?.x || 0;
  const cy = center?.y || 0;
  const cz = center?.z || 0;

  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight
        position={[cx + maxDim, cy + maxDim * 1.5, cz + maxDim * 0.5]}
        intensity={1.5}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={maxDim * 5}
        shadow-camera-left={-maxDim}
        shadow-camera-right={maxDim}
        shadow-camera-top={maxDim}
        shadow-camera-bottom={-maxDim}
      />
      <pointLight position={[cx - maxDim * 0.5, cy + maxDim, cz - maxDim * 0.5]} intensity={0.4} color="#ffeedd" />
      <hemisphereLight args={["#b1e1ff", "#b97a20", 0.4]} />
    </>
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
  const [sceneInfo, setSceneInfo] = useState<{ center: THREE.Vector3; size: THREE.Vector3 } | null>(null);
  useEffect(() => {
    const timeout = setTimeout(() => {
      setLoaded(true);
    }, 8000);

    return () => clearTimeout(timeout);
  }, []);

  const handleModelLoaded = useCallback((center: THREE.Vector3, size: THREE.Vector3) => {
    setSceneInfo({ center, size });
    setTimeout(() => setLoaded(true), 500);
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
        camera={{ fov: 50, near: 0.1, far: 100000 }}
        style={{
          width: '100%',
          height: '100%',
          opacity: loaded ? 1 : 0,
          transition: 'opacity 0.8s ease-out',
        }}
        gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.2 }}
      >
        <color attach="background" args={['#f0f0f0']} />

        <SceneLights center={sceneInfo?.center || null} size={sceneInfo?.size || null} />

        <Suspense fallback={null}>
          <RoomModel onModelLoaded={handleModelLoaded} />
          <Environment preset="apartment" />
        </Suspense>

        {sceneInfo && (
          <CameraSetup center={sceneInfo.center} size={sceneInfo.size} />
        )}
      </Canvas>
    </div>
  );
}
useGLTF.preload("/room.glb");
