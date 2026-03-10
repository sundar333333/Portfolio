import { Suspense, useEffect, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF, Environment, useProgress, Center } from "@react-three/drei";
import * as THREE from "three";

// Using your verified compressed model URL
const MODEL_URL = "https://rgd8w4vqllunko1j.public.blob.vercel-storage.com/room-compressed.glb";

function RoomModel({ onLog }: { onLog: (s: string) => void }) {
  const { scene } = useGLTF(MODEL_URL, 'https://www.gstatic.com/draco/versioned/decoders/1.5.5/');

  useEffect(() => {
    const logs: string[] = [];

    scene.traverse((child) => {
      if (!(child as THREE.Mesh).isMesh) return;
      const mesh = child as THREE.Mesh;

      const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];

      materials.forEach((mat) => {
        const m = mat as THREE.MeshStandardMaterial;

        // Apply global fixes for colorspace and environmental reflection
        if (m.map) m.map.colorSpace = THREE.SRGBColorSpace;
        m.envMapIntensity = 0.1;

        // 1. FIXING THE WALLS: Targeting specific meshes to stop material swapping
        // Plane, Plane003, and Cylinder002_1 were interchanging in your logs
        if (
          mesh.name === 'Plane' || 
          mesh.name === 'Plane003' || 
          mesh.name === 'Cylinder002_1'
        ) {
          m.color.set(0x080808); // Deep charcoal black
          m.roughness = 0.95;    // Matte finish to prevent white glare
          m.metalness = 0;
          m.map = null;          // Remove any swapped floor/towel textures
          m.needsUpdate = true;
          logs.push(`✅ WALL FIXED: ${mesh.name}`);
        }

        // 2. FIXING THE WINDOW GLASS: Transparent and Double-Sided
        if (mesh.name === 'WindowFrame' || mesh.name === 'Object_4005') {
          m.transparent = true;
          m.opacity = 0.2;
          m.roughness = 0.05;
          m.metalness = 0.8;
          m.color.set(0xffffff);
          m.side = THREE.DoubleSide; // Prevents backface culling
          m.needsUpdate = true;
          logs.push(`✅ GLASS FIXED: ${mesh.name}`);
        }

        // 3. FIXING THE TECH GEAR (PS5, Monitors)
        if (mesh.name.includes('Sony_PS5') || mesh.name === 'Object_10002') {
          m.color.set(0xffffff); // Clean white for the shell
          m.roughness = 0.3;
          logs.push(`✅ TECH MATERIAL: ${mesh.name}`);
        }

        // 4. FIXING THE FLOOR
        if (mesh.name === 'Plane006') {
          m.roughness = 0.7;
          m.metalness = 0.1;
          logs.push(`✅ FLOOR LOGGED: ${mesh.name}`);
        }

        logs.push(`MESH: ${mesh.name} | MAT: ${m.name}`);
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
    <div className="fixed inset-0 z-[100]" style={{ width: '100vw', height: '100vh', background: '#111' }}>
      {/* Debug Overlay: Toggle off once materials are verified */}
      {log && (
        <pre style={{
          position: 'absolute', top: 0, left: 0, zIndex: 9999,
          background: 'rgba(0,0,0,0.85)', color: '#0f0', fontSize: '9px',
          padding: '10px', maxHeight: '100vh', overflowY: 'auto',
          whiteSpace: 'pre-wrap', width: '350px', pointerEvents: 'none',
          fontFamily: 'monospace'
        }}>
          {log}
        </pre>
      )}

      {progress < 100 && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white z-[110] bg-[#0a0a0a]">
          <div className="w-48 h-1 bg-white/10 rounded-full mb-4 overflow-hidden">
            <div 
              className="h-full bg-white transition-all duration-300" 
              style={{ width: `${progress}%` }} 
            />
          </div>
          <p className="text-xs tracking-[0.3em] uppercase opacity-50">
            Downloading Immersive Space {Math.round(progress)}%
          </p>
        </div>
      )}

      <Canvas
        shadows
        camera={{ position: [6, 6, 6], fov: 40 }}
        gl={{
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 0.8,
          outputColorSpace: THREE.SRGBColorSpace,
        }}
      >
        <color attach="background" args={['#0a0a0a']} />
        
        <ambientLight intensity={0.3} />
        <spotLight 
          position={[0, 10, 0]} 
          angle={0.5} 
          penumbra={1} 
          intensity={1.5} 
          castShadow 
          shadow-mapSize={[1024, 1024]} 
        />
        <directionalLight position={[5, 5, 5]} intensity={0.5} castShadow />
        
        <Suspense fallback={null}>
          <Center top>
            <RoomModel onLog={setLog} />
          </Center>
          <Environment preset="apartment" />
        </Suspense>

        <OrbitControls 
          makeDefault 
          enableDamping 
          dampingFactor={0.05}
          minDistance={3} 
          maxDistance={15} 
          maxPolarAngle={Math.PI / 2.1} 
        />
      </Canvas>
    </div>
  );
}