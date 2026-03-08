import { Suspense, useState, useCallback } from "react";
import { Canvas } from "@react-three/fiber";
// Removed Draco from this import line
import { OrbitControls, useGLTF, Environment, useProgress, Center } from "@react-three/drei";
import * as THREE from "three";

const MODEL_URL = "https://rgd8w4vqllunko1j.public.blob.vercel-storage.com/room.glb";

function RoomModel({ onModelLoaded }: { onModelLoaded: (center: THREE.Vector3, size: THREE.Vector3) => void }) {
  // This is the correct way to trigger the Draco decoder in @react-three/drei
  const { scene } = useGLTF(MODEL_URL, 'https://www.gstatic.com/draco/versioned/decoders/1.5.5/');

  return (
    <Center top onCentered={({ width, height, depth }) => {
      onModelLoaded(new THREE.Vector3(0,0,0), new THREE.Vector3(width, height, depth));
    }}>
      <primitive object={scene} scale={2} /> 
    </Center>
  );
}

export default function Room3D({ isVisible = true }: { isVisible?: boolean }) {
  const [loaded, setLoaded] = useState(false);
  const { progress } = useProgress();

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-[#111]" style={{ width: '100vw', height: '100vh' }}>
      {progress < 100 && (
        <div className="absolute inset-0 flex items-center justify-center text-white z-[110]">
          Loading: {Math.round(progress)}%
        </div>
      )}

      <Canvas camera={{ position: [10, 10, 10], fov: 50 }}>
        <color attach="background" args={['#1a1a1a']} />
        <ambientLight intensity={1.5} />
        <pointLight position={[10, 10, 10]} />

        {/* This Red Box will appear while the room is downloading */}
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial color="red" />
        </mesh>

        <Suspense fallback={null}>
          <RoomModel onModelLoaded={() => setLoaded(true)} />
          <Environment preset="city" />
        </Suspense>

        <OrbitControls makeDefault />
      </Canvas>
    </div>
  );
}