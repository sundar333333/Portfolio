import { Suspense, useState, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF, Environment, useProgress, Center } from "@react-three/drei";
import * as THREE from "three";

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
          const material = mesh.material as THREE.MeshStandardMaterial;
          if (material) {
            material.side = THREE.DoubleSide; // Fixes missing window
            if (mesh.name.toLowerCase().includes("wall")) {
              material.color.set("#111111"); // Symmetrical wall color
              material.roughness = 1;
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
      {progress < 100 && (
        <div className="absolute inset-0 flex items-center justify-center text-white z-[110] bg-[#0a0a0a]">
          Loading: {Math.round(progress)}%
        </div>
      )}
      <Canvas shadows camera={{ position: [10, 10, 10], fov: 45 }}>
        <color attach="background" args={['#0a0a0a']} />
        <ambientLight intensity={0.5} /> 
        <spotLight position={[10, 15, 10]} angle={0.3} penumbra={1} intensity={2} castShadow />
        <Suspense fallback={null}>
          <RoomModel />
          <Environment preset="city" />
        </Suspense>
        <OrbitControls makeDefault enableDamping dampingFactor={0.05} />
      </Canvas>
    </div>
  );
}