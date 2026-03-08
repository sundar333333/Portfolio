import { Suspense, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF, useProgress, Stage, Center } from "@react-three/drei";
import * as THREE from "three";

const MODEL_URL = "https://rgd8w4vqllunko1j.public.blob.vercel-storage.com/room.glb";

function RoomModel() {
  const { scene } = useGLTF(MODEL_URL, 'https://www.gstatic.com/draco/versioned/decoders/1.5.5/');

  useEffect(() => {
    if (scene) {
      scene.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const mesh = child as THREE.Mesh;
          const material = mesh.material as THREE.MeshStandardMaterial;
          if (material) {
            // FIX: Render both sides of every face to prevent "invisible" walls/windows
            material.side = THREE.DoubleSide;
            // FIX: Standardize wall colors
            if (mesh.name.toLowerCase().includes("wall")) {
              material.color.set("#111111");
            }
          }
        }
      });
    }
  }, [scene]);

  return <primitive object={scene} />;
}

export default function Room3D({ isVisible = true }: { isVisible?: boolean }) {
  const { progress } = useProgress();

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-[#0a0a0a]" style={{ width: '100vw', height: '100vh' }}>
      {progress < 100 && (
        <div className="absolute inset-0 flex items-center justify-center text-white z-[110] bg-black">
          Building Room: {Math.round(progress)}%
        </div>
      )}

      <Canvas shadows camera={{ position: [0, 0, 15], fov: 45 }}>
        <Suspense fallback={null}>
          {/* Corrected Stage props to resolve TypeScript errors */}
          <Stage 
            environment="city" 
            intensity={0.5} 
            shadows={{ type: 'contact', opacity: 0.7, blur: 2 }}
            adjustCamera={false} // Prevents Stage from overriding your camera position
          >
            <Center>
              <RoomModel />
            </Center>
          </Stage>
        </Suspense>
        <OrbitControls makeDefault enableDamping />
      </Canvas>
    </div>
  );
}