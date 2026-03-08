import { Suspense, useState, useEffect } from "react"; // Added useEffect here
import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF, Environment, useProgress, Center } from "@react-three/drei";
import * as THREE from "three";

// Using your confirmed Vercel Blob URL
const MODEL_URL = "https://rgd8w4vqllunko1j.public.blob.vercel-storage.com/room.glb";

function RoomModel() {
  const { scene } = useGLTF(MODEL_URL, 'https://www.gstatic.com/draco/versioned/decoders/1.5.5/');

  useEffect(() => {
    if (scene) {
      scene.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const mesh = child as THREE.Mesh;
          mesh.castShadow = true;
          mesh.receiveShadow = true;

          // Type casting to MeshStandardMaterial to fix the 'side' and 'color' errors
          const material = mesh.material as THREE.MeshStandardMaterial;
          if (material) {
            material.side = THREE.DoubleSide; // Fixes the "invisible from one side" wall issue
            
            // Manually forcing both walls to be dark if they look different
            if (mesh.name.toLowerCase().includes("wall")) {
              material.color.set("#111111");
            }
          }
        }
      });
    }
  }, [scene]);

  return (
    <Center top>
      <primitive object={scene} scale={1.5} />
    </Center>
  );
}

export default function Room3D({ isVisible = true }: { isVisible?: boolean }) {
  const { progress } = useProgress();

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-[#0a0a0a]" style={{ width: '100vw', height: '100vh' }}>
      {/* Visual Loading Bar */}
      {progress < 100 && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white z-[110] bg-[#0a0a0a]">
          <p className="mb-4">Loading Immersive Room: {Math.round(progress)}%</p>
          <div className="w-48 h-1 bg-white/20 rounded-full overflow-hidden">
            <div className="h-full bg-white" style={{ width: `${progress}%` }} />
          </div>
        </div>
      )}

      <Canvas shadows camera={{ position: [10, 10, 10], fov: 45 }}>
        <color attach="background" args={['#0a0a0a']} />
        <ambientLight intensity={1} />
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={2} castShadow />
        
        <Suspense fallback={null}>
          <RoomModel />
          <Environment preset="city" />
        </Suspense>

        <OrbitControls makeDefault enableDamping dampingFactor={0.05} />
      </Canvas>
    </div>
  );
}