import { Suspense, useState, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF, Environment, useProgress, Center } from "@react-three/drei";
import * as THREE from "three";

// Your verified Vercel Blob URL
const MODEL_URL = "https://rgd8w4vqllunko1j.public.blob.vercel-storage.com/room.glb";

function RoomModel() {
  // Using the Google CDN for Draco decoders to handle your compressed mesh
  const { scene } = useGLTF(MODEL_URL, 'https://www.gstatic.com/draco/versioned/decoders/1.5.5/');

  useEffect(() => {
    if (scene) {
      scene.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const mesh = child as THREE.Mesh;
          mesh.castShadow = true;
          mesh.receiveShadow = true;

          // Casting to MeshStandardMaterial to access and fix material properties
          const material = mesh.material as THREE.MeshStandardMaterial;
          if (material) {
            // FIX: Makes walls and windows visible from both sides (fixes "missing" window)
            material.side = THREE.DoubleSide; 

            // FIX: Ensures both walls stay dark like your Blender design
            if (mesh.name.toLowerCase().includes("wall")) {
              material.color.set("#111111");
              material.roughness = 1; // Reduces glare that makes walls look white
            }

            // FIX: Ensure glass/window is transparent if it looks like a solid block
            if (mesh.name.toLowerCase().includes("window") || mesh.name.toLowerCase().includes("glass")) {
              material.transparent = true;
              material.opacity = 0.5;
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
      {/* Percentage loader for the 26.9MB file */}
      {progress < 100 && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white z-[110] bg-[#0a0a0a]">
          <p className="mb-4 text-sm tracking-widest uppercase opacity-50">
            Building Immersive Room {Math.round(progress)}%
          </p>
          <div className="w-48 h-1 bg-white/10 rounded-full overflow-hidden">
            <div className="h-full bg-white transition-all duration-300" style={{ width: `${progress}%` }} />
          </div>
        </div>
      )}

      <Canvas shadows camera={{ position: [10, 10, 10], fov: 45 }}>
        <color attach="background" args={['#0a0a0a']} />
        
        {/* Balanced lighting: reduced ambient to stop walls from turning white */}
        <ambientLight intensity={0.4} /> 
        <spotLight position={[10, 15, 10]} angle={0.3} penumbra={1} intensity={2} castShadow />
        <pointLight position={[-10, 10, -10]} intensity={1} color="#444" />

        <Suspense fallback={null}>
          <RoomModel />
          <Environment preset="city" />
        </Suspense>

        <OrbitControls 
          makeDefault 
          enableDamping 
          dampingFactor={0.05}
          maxPolarAngle={Math.PI / 2.1} 
        />
      </Canvas>
    </div>
  );
}