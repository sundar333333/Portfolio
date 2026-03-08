import { Suspense, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF, Environment, useProgress, Center } from "@react-three/drei";
import * as THREE from "three";

const MODEL_URL = "https://rgd8w4vqllunko1j.public.blob.vercel-storage.com/room.glb";

function RoomModel() {
  // Using the Google CDN for Draco decoders to ensure the compressed model opens
  const { scene } = useGLTF(MODEL_URL, 'https://www.gstatic.com/draco/versioned/decoders/1.5.5/');

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
        
        {/* Better Lighting for the final look */}
        <ambientLight intensity={1} />
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