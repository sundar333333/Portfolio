import { Suspense, useEffect, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF, Environment, useProgress, Center } from "@react-three/drei";
import * as THREE from "three";

// Using the compressed model URL from your latest working version
const MODEL_URL = "https://rgd8w4vqllunko1j.public.blob.vercel-storage.com/room-compressed.glb";

function RoomModel({ onLog }: { onLog: (s: string) => void }) {
  const { scene } = useGLTF(MODEL_URL, 'https://www.gstatic.com/draco/versioned/decoders/1.5.5/');

  useEffect(() => {
    const logs: string[] = [];

    scene.traverse((child) => {
      if (!(child as THREE.Mesh).isMesh) return;
      const mesh = child as THREE.Mesh;
      
      // Ensure we handle both single and multi-materials
      const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];

      materials.forEach((mat) => {
        const m = mat as THREE.MeshStandardMaterial;
        
        // Restore standard sRGB color space for textures
        if (m.map) m.map.colorSpace = THREE.SRGBColorSpace;
        m.envMapIntensity = 1.2; // Restore the brightness from your previous working version

        // 1. FIX THE WALLS (Plane, Plane003, Cylinder002_1)
        // This stops the walls from accidentally taking floor or towel textures
        if (mesh.name === 'Plane' || mesh.name === 'Plane003' || mesh.name === 'Cylinder002_1') {
          m.color.set(0x0a0a0a); // Deep black plaster
          m.roughness = 0.9;
          m.metalness = 0;
          m.map = null; // Clear any interchanged textures
          m.needsUpdate = true;
          logs.push(`✅ RESTORED WALL: ${mesh.name}`);
        }

        // 2. FIX THE WINDOW GLASS (WindowFrame, Object_4005)
        if (mesh.name === 'WindowFrame' || mesh.name === 'Object_4005') {
          m.transparent = true;
          m.opacity = 0.3;
          m.color.set(0x88aacc); // Subtle glass tint
          m.side = THREE.DoubleSide; // Fixes backface culling
          m.roughness = 0.05;
          m.metalness = 1;
          m.needsUpdate = true;
          logs.push(`✅ RESTORED GLASS: ${mesh.name}`);
        }

        // 3. FIX THE FLOOR (Plane006)
        if (mesh.name === 'Plane006') {
          m.roughness = 0.8;
          m.metalness = 0.2;
          logs.push(`✅ FLOOR VERIFIED: ${mesh.name}`);
        }
      });

      mesh.castShadow = true;
      mesh.receiveShadow = true;
    });

    onLog([...new Set(logs)].join('\n'));
  }, [scene, onLog]);

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
  const [log, setLog] = useState('');

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-[#111]" style={{ width: '100vw', height: '100vh' }}>
      {/* Percentage Loader */}
      {progress < 100 && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white z-[110] bg-black">
          <p className="mb-4">Building Space: {Math.round(progress)}%</p>
          <div className="w-48 h-1 bg-white/20 rounded-full overflow-hidden">
            <div className="h-full bg-blue-500" style={{ width: `${progress}%` }} />
          </div>
        </div>
      )}

      <Canvas
        shadows
        gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.0 }}
        camera={{ position: [5, 5, 5], fov: 45 }}
      >
        <color attach="background" args={['#0a0a0a']} />
        
        {/* Lighting setup based on your working Claude history */}
        <ambientLight intensity={0.5} />
        <spotLight position={[0, 10, 0]} angle={0.5} penumbra={1} intensity={2} castShadow />
        <directionalLight position={[5, 5, 5]} intensity={0.5} />

        <Suspense fallback={null}>
          <Center top>
            <RoomModel onLog={setLog} />
          </Center>
          <Environment preset="apartment" />
        </Suspense>

        <OrbitControls makeDefault enableDamping dampingFactor={0.05} />
      </Canvas>
    </div>
  );
}