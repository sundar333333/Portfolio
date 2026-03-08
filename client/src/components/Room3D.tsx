import { Suspense, useRef, useState, useEffect, useCallback } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls, useGLTF, Environment, useProgress, Center } from "@react-three/drei";
import * as THREE from "three";

// Using your specific Vercel Blob URL to bypass GitHub's size limits
const MODEL_URL = "https://rgd8w4vqllunko1j.public.blob.vercel-storage.com/room.glb";

// Pre-loading the model for faster initialization
useGLTF.preload(MODEL_URL);

function RoomModel({ onModelLoaded }: { onModelLoaded: (center: THREE.Vector3, size: THREE.Vector3) => void }) {
  const { scene } = useGLTF(MODEL_URL);

  useEffect(() => {
    if (scene) {
      scene.traverse((child) => {
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

  return (
    <Center top>
      <primitive object={scene} scale={1} />
    </Center>
  );
}

function CameraSetup({ center, size }: { center: THREE.Vector3; size: THREE.Vector3 }) {
  const { camera } = useThree();

  useEffect(() => {
    if (!center || !size) return;

    const maxDim = Math.max(size.x, size.y, size.z);
    const distance = maxDim * 1.5; 

    camera.position.set(distance, distance * 0.8, distance);
    camera.near = 0.1;
    camera.far = 2000;
    camera.lookAt(0, 0, 0); 
    (camera as THREE.PerspectiveCamera).updateProjectionMatrix();
  }, [center, size, camera]);

  return (
    <OrbitControls
      makeDefault
      target={[0, 0, 0]} 
      enableDamping={true}
      dampingFactor={0.05}
      minDistance={1}
      maxDistance={100}
    />
  );
}

function SceneLights() {
  return (
    <>
      <ambientLight intensity={0.8} />
      <directionalLight
        position={[10, 20, 10]}
        intensity={1.2}
        castShadow
        shadow-mapSize={[2048, 2048]}
      />
      <hemisphereLight args={["#ffffff", "#444444", 0.6]} />
    </>
  );
}

function LoadingOverlay() {
  const { progress } = useProgress();
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center z-50 bg-white">
      <div className="w-16 h-16 border-4 border-black/10 border-t-black/60 rounded-full animate-spin" />
      <p className="mt-4 text-black/60 font-medium">Downloading 3D Room...</p>
      <p className="mt-2 text-black/40 text-sm">{Math.round(progress)}%</p>
    </div>
  );
}

interface Room3DProps {
  isVisible: boolean;
}

export default function Room3D({ isVisible }: Room3DProps) {
  const [loaded, setLoaded] = useState(false);
  const [sceneInfo, setSceneInfo] = useState<{ center: THREE.Vector3; size: THREE.Vector3 } | null>(null);

  const handleModelLoaded = useCallback((center: THREE.Vector3, size: THREE.Vector3) => {
    setSceneInfo({ center, size });
    setLoaded(true);
  }, []);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-30 bg-[#f8f8f8]" style={{ width: '100vw', height: '100vh' }}>
      {!loaded && <LoadingOverlay />}
      
      <Canvas
        shadows
        camera={{ position: [15, 15, 15], fov: 45 }}
        style={{
          width: '100%',
          height: '100%',
          opacity: loaded ? 1 : 0,
          transition: 'opacity 1.5s ease-in-out',
        }}
        gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping }}
      >
        <SceneLights />

        <Suspense fallback={null}>
          <RoomModel onModelLoaded={handleModelLoaded} />
          <Environment preset="apartment" />
        </Suspense>

        {sceneInfo && <CameraSetup center={sceneInfo.center} size={sceneInfo.size} />}
      </Canvas>
    </div>
  );
}