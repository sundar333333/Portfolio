import { Suspense, useEffect, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF, Environment, useProgress } from "@react-three/drei";
import * as THREE from "three";

const MODEL_URL = "https://rgd8w4vqllunko1j.public.blob.vercel-storage.com/room-compressed.glb";

function RoomModel({ onLog }: { onLog: (s: string) => void }) {
  const { scene } = useGLTF(MODEL_URL, 'https://www.gstatic.com/draco/versioned/decoders/1.5.5/');

  useEffect(() => {
    const names: string[] = [];
    scene.traverse((child) => {
      const mesh = child as THREE.Mesh;
      if (!mesh.isMesh) return;
      const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
      mats.forEach((m) => {
        names.push(`MESH: ${mesh.name} | MAT: ${(m as THREE.Material).name}`);
      });
    });
    onLog([...new Set(names)].join('\n'));
  }, [scene]);

  return <primitive object={scene} scale={1} position={[0, -1, 0]} rotation={[0, Math.PI / 4, 0]} />;
}

export default function Room3D({ isVisible = true }: { isVisible?: boolean }) {
  const { progress } = useProgress();
  const [log, setLog] = useState('');

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[100]" style={{ width: '100vw', height: '100vh', background: '#111' }}>
      {log && (
        <pre style={{
          position: 'absolute', top: 0, left: 0, zIndex: 9999,
          background: 'rgba(0,0,0,0.9)', color: '#0f0', fontSize: '10px',
          padding: '8px', maxHeight: '100vh', overflowY: 'auto', whiteSpace: 'pre-wrap'
        }}>
          {log}
        </pre>
      )}
      {progress < 100 && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white z-[110] bg-black">
          <div className="w-48 h-1 bg-white/20 rounded-full mb-4 overflow-hidden">
            <div className="h-full bg-blue-500 transition-all duration-300" style={{ width: `${progress}%` }} />
          </div>
          <p className="text-sm tracking-widest uppercase">Building Room... {Math.round(progress)}%</p>
        </div>
      )}
      <Canvas
        camera={{ position: [5, 5, 5], fov: 45 }}
        shadows
        gl={{
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 0.7,
          outputColorSpace: THREE.SRGBColorSpace,
          powerPreference: "high-performance",
        }}
      >
        <color attach="background" args={['#111111']} />
        <ambientLight intensity={0.4} />
        <spotLight position={[0, 8, 0]} angle={0.5} penumbra={1} intensity={1.2} castShadow shadow-mapSize={[1024, 1024]} />
        <directionalLight position={[3, 6, 3]} intensity={0.3} />
        <directionalLight position={[-3, 6, -3]} intensity={0.2} />
        <Suspense fallback={null}>
          <RoomModel onLog={setLog} />
          <Environment preset="apartment" />
        </Suspense>
        <OrbitControls makeDefault enableDamping minDistance={2} maxDistance={20} />
      </Canvas>
    </div>
  );
}