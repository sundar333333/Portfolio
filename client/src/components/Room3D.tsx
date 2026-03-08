import { Suspense, useState, useCallback, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF, Environment, useProgress, Center } from "@react-three/drei";
import * as THREE from "three";

// Using your Vercel Blob URL to ensure the 26.9MB file loads correctly
const MODEL_URL = "https://rgd8w4vqllunko1j.public.blob.vercel-storage.com/room.glb";

// Pre-loading helps avoid flickering when the component mounts
useGLTF.preload(MODEL_URL);

function RoomModel() {
  // Using the Google CDN for Draco decoders to handle compressed meshes
  const { scene } = useGLTF(MODEL_URL, 'https://www.gstatic.com/draco/versioned/decoders/1.5.5/');

  useEffect(() => {
    if (scene) {
      scene.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const mesh = child as THREE.Mesh;
          mesh.castShadow = true;
          mesh.receiveShadow = true;

          // Casting to MeshStandardMaterial to fix the 'color' and 'side' errors
          const material = mesh.material as THREE.MeshStandardMaterial;
          
          if (material) {
            // Fixes the "missing window" by rendering both sides of the face
            material.side = THREE.DoubleSide; 

            // Ensures the walls are the consistent dark color from your design
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
      <primitive 
        object={scene} 
        scale={1.5} 
        position={[0, -1, 0]} 
      />
    </Center>
  );
}

export default function Room3D({ isVisible = true }: { isVisible?: boolean }) {
  const { progress } = useProgress();

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-[#0a0a0a]" style={{ width: '100vw', height: '100vh' }}>
      {/* Sleek loading bar for the 26.9MB download */}
      {progress < 100 && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white z-[110] bg-[#0a0a0a]">
          <div className="w-48 h-1 bg-white/10 rounded-full mb-4 overflow-hidden">
            <div 
              className="h-full bg-white transition-all duration-300" 
              style={{ width: `${progress}%` }} 
            />
          </div>
          <p className="text-sm tracking-widest uppercase opacity-50">
            Loading Immersive Room {Math.round(progress)}%
          </p>
        </div>
      )}

      <Canvas shadows camera={{ position: [8, 8, 8], fov: 45 }}>
        <color attach="background" args={['#0a0a0a']} />
        
        {/* Balanced lighting to keep walls dark but furniture visible */}
        <ambientLight intensity={0.7} />
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={2} castShadow />
        <pointLight position={[-10, -10, -10]} intensity={1} />

        <Suspense fallback={null}>
          <RoomModel />
          <Environment preset="city" />
        </Suspense>

        <OrbitControls 
          makeDefault 
          enableDamping 
          dampingFactor={0.05}
          maxPolarAngle={Math.PI / 2} 
        />
      </Canvas>
    </div>
  );
}