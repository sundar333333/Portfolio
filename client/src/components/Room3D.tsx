import { Suspense, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF, useProgress, Center, Environment } from "@react-three/drei";
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
            // FIX: Forces both sides of walls/windows to render
            material.side = THREE.DoubleSide;
            // FIX: Increases brightness of the textures directly
            material.emissive = new THREE.Color(0xffffff);
            material.emissiveIntensity = 0.05;
          }
        }
      });
    }
  }, [scene]);

  return <primitive object={scene} scale={1} />;
}

export default function Room3D({ isVisible = true }: { isVisible?: boolean }) {
  const { progress } = useProgress();

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-[#111]" style={{ width: '100vw', height: '100vh' }}>
      {progress < 100 && (
        <div className="absolute inset-0 flex items-center justify-center text-white z-[110] bg-black">
          Building Immersive Room: {Math.round(progress)}%
        </div>
      )}

      <Canvas shadows camera={{ position: [15, 15, 15], fov: 50 }}>
        <color attach="background" args={['#1a1a1a']} />
        
        {/* High-intensity lighting to prevent black screens */}
        <ambientLight intensity={2.5} />
        <directionalLight position={[10, 10, 10]} intensity={2} />
        <pointLight position={[-10, 5, -10]} intensity={1.5} />

        <Suspense fallback={null}>
          <Center top>
            <RoomModel />
          </Center>
          <Environment preset="city" />
        </Suspense>

        <OrbitControls makeDefault enableDamping minDistance={2} maxDistance={50} />
      </Canvas>
    </div>
  );
}