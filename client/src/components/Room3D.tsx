import { Suspense, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF, Environment, useProgress, ContactShadows } from "@react-three/drei";
import * as THREE from "three";

const MODEL_URL = "https://rgd8w4vqllunko1j.public.blob.vercel-storage.com/room.glb";

function RoomModel() {
  const { scene } = useGLTF(MODEL_URL, 'https://www.gstatic.com/draco/versioned/decoders/1.5.5/');

  useEffect(() => {
    scene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        
        // Force double-sided rendering — fixes missing window glass & walls
        if (Array.isArray(mesh.material)) {
          mesh.material.forEach((mat) => {
            mat.side = THREE.DoubleSide;
            mat.needsUpdate = true;
          });
        } else if (mesh.material) {
          (mesh.material as THREE.Material).side = THREE.DoubleSide;
          (mesh.material as THREE.Material).needsUpdate = true;
        }

        // Preserve dark/black material colors — prevent them being washed out
        if (!Array.isArray(mesh.material)) {
          const mat = mesh.material as THREE.MeshStandardMaterial;
          if (mat.color) {
            // Don't override, just ensure envMapIntensity doesn't blow out darks
            if (mat.envMapIntensity !== undefined) {
              mat.envMapIntensity = 0.3;
            }
          }
        }

        mesh.castShadow = true;
        mesh.receiveShadow = true;
      }
    });
  }, [scene]);

  return (
    <primitive 
      object={scene} 
      scale={1} 
      position={[0, -1, 0]}
      rotation={[0, Math.PI / 4, 0]}
    />
  );
}

export default function Room3D({ isVisible = true }: { isVisible?: boolean }) {
  const { progress } = useProgress();

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-[#111]" style={{ width: '100vw', height: '100vh' }}>
      {progress < 100 && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white z-[110] bg-black">
          <div className="w-48 h-1 bg-white/20 rounded-full mb-4 overflow-hidden">
            <div className="h-full bg-blue-500" style={{ width: `${progress}%` }} />
          </div>
          <p className="text-sm tracking-widest uppercase">Building Room... {Math.round(progress)}%</p>
        </div>
      )}

      <Canvas
        camera={{ position: [5, 5, 5], fov: 45 }}
        shadows
        gl={{
          toneMapping: THREE.ACESFilmicToneMapping,  // Preserves dark colors accurately
          toneMappingExposure: 0.8,                  // Slightly underexposed = darker walls stay dark
          outputColorSpace: THREE.SRGBColorSpace,
        }}
      >
        <color attach="background" args={['#1a1a1a']} />
        
        {/*
          KEY FIX: Reduced ambientLight from 1.5 → 0.4
          High ambient was washing out black walls to look grey/white.
          Using targeted lights instead for realistic room lighting.
        */}
        <ambientLight intensity={0.4} />
        
        {/* Warm ceiling-style key light */}
        <spotLight 
          position={[0, 8, 0]} 
          angle={0.6} 
          penumbra={0.8} 
          intensity={1.5} 
          castShadow 
          shadow-mapSize={[2048, 2048]}
        />
        
        {/* Subtle fill light from front-left — keeps details visible without washing walls */}
        <directionalLight position={[5, 5, 5]} intensity={0.5} />
        
        {/* Dim blue accent from behind — matches your room vibe */}
        <pointLight position={[-8, 2, -8]} intensity={0.6} color="#4488ff" />

        <Suspense fallback={null}>
          <RoomModel />
          {/* 'night' env has lower intensity, better for preserving dark materials */}
          <Environment preset="night" />
          <ContactShadows opacity={0.5} scale={20} blur={2.4} far={4.5} />
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