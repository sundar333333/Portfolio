import { Suspense, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF, Environment, useProgress, Center } from "@react-three/drei";
import * as THREE from "three";

const MODEL_URL = "https://rgd8w4vqllunko1j.public.blob.vercel-storage.com/room.glb";

function RoomModel() {
  const { scene } = useGLTF(MODEL_URL, 'https://www.gstatic.com/draco/versioned/decoders/1.5.5/');

  // This will run as soon as the model is added to the scene
  useState(() => {
    if (scene) {
      const box = new THREE.Box3().setFromObject(scene);
      const size = box.getSize(new THREE.Vector3());
      console.log("SUCCESS: Room loaded. Original Size:", size);
      
      scene.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const mesh = child as THREE.Mesh;
          mesh.castShadow = true;
          mesh.receiveShadow = true;
          // Force materials to be visible even if they exported as black/transparent
          if (mesh.material) {
            (mesh.material as THREE.MeshStandardMaterial).emissive = new THREE.Color(0xffffff);
            (mesh.material as THREE.MeshStandardMaterial).emissiveIntensity = 0.2;
          }
        }
      });
    }
  });

  return (
    <Center top>
      <primitive object={scene} scale={1} /> 
    </Center>
  );
}

export default function Room3D({ isVisible = true }: { isVisible?: boolean }) {
  const { progress } = useProgress();

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-[#111]" style={{ width: '100vw', height: '100vh' }}>
      {progress < 100 && (
        <div className="absolute inset-0 flex items-center justify-center text-white z-[110] bg-black">
          <p className="text-xl">Downloading Room: {Math.round(progress)}%</p>
        </div>
      )}

      <Canvas shadows camera={{ position: [15, 15, 15], fov: 50 }}>
        <color attach="background" args={['#1a1a1a']} />
        
        {/* Extreme lighting to ensure nothing is hidden in shadow */}
        <ambientLight intensity={3} />
        <pointLight position={[10, 10, 10]} intensity={2} />
        <directionalLight position={[-10, 10, -10]} intensity={2} />

        <Suspense fallback={null}>
          <RoomModel />
          <Environment preset="apartment" />
        </Suspense>

        <OrbitControls makeDefault />
      </Canvas>
    </div>
  );
}