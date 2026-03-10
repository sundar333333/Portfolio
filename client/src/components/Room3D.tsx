import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF, Environment, useProgress, ContactShadows } from "@react-three/drei";
import * as THREE from "three";

const MODEL_URL = "https://rgd8w4vqllunko1j.public.blob.vercel-storage.com/room.glb";

function RoomModel() {
  // Using a simpler decoder path
  const { scene } = useGLTF(MODEL_URL, 'https://www.gstatic.com/draco/versioned/decoders/1.5.5/');

  return (
    <primitive 
      object={scene} 
      scale={1} 
      position={[0, -1, 0]} // Moves it slightly down so it's not in the camera's face
      rotation={[0, Math.PI / 4, 0]} // Gives it a nice starting angle
    />
  );
}

export default function Room3D({ isVisible = true }: { isVisible?: boolean }) {
  const { progress } = useProgress();

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-[#111]" style={{ width: '100vw', height: '100vh' }}>
      {/* Percentage Loader */}
      {progress < 100 && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white z-[110] bg-black">
          <div className="w-48 h-1 bg-white/20 rounded-full mb-4 overflow-hidden">
            <div className="h-full bg-blue-500" style={{ width: `${progress}%` }} />
          </div>
          <p className="text-sm tracking-widest uppercase">Building Room... {Math.round(progress)}%</p>
        </div>
      )}

      <Canvas camera={{ position: [5, 5, 5], fov: 45 }} shadows>
        <color attach="background" args={['#1a1a1a']} />
        
        {/* Stronger, more reliable lighting */}
        <ambientLight intensity={1.5} />
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={2} castShadow />
        <pointLight position={[-10, -10, -10]} intensity={1} color="blue" />

        <Suspense fallback={null}>
          <RoomModel />
          {/* Using 'city' instead of 'apartment' as it's more reliable for lighting models */}
          <Environment preset="city" />
          <ContactShadows opacity={0.4} scale={20} blur={2.4} far={4.5} />
        </Suspense>

        <OrbitControls 
          makeDefault 
          enableDamping 
          minDistance={2} 
          maxDistance={20} 
        />
      </Canvas>
    </div>
  );
}