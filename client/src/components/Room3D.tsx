import { Suspense, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF, Environment, useProgress } from "@react-three/drei";
import * as THREE from "three";

const MODEL_URL = "https://rgd8w4vqllunko1j.public.blob.vercel-storage.com/3DRoomorginal1.compressed.glb";

function RoomModel() {
  const { scene } = useGLTF(MODEL_URL, 'https://www.gstatic.com/draco/versioned/decoders/1.5.5/');

  useEffect(() => {
    scene.traverse((child) => {
      const mesh = child as THREE.Mesh;
      if (!mesh.isMesh) return;

      const materials = Array.isArray(mesh.material)
        ? mesh.material
        : [mesh.material];

      materials.forEach((mat) => {
        const m = mat as THREE.MeshStandardMaterial;

        if (m.map) m.map.colorSpace = THREE.SRGBColorSpace;
        m.envMapIntensity = 0.05;

        if (m.name === 'black_wall') {
          m.color = new THREE.Color(0x080808);
          m.roughness = 0.9;
          m.metalness = 0;
          m.map = null;
          m.normalMap = null;
          m.roughnessMap = null;
          m.aoMap = null;
          m.needsUpdate = true;
        }

        if (mesh.name === 'Plane.003') {
          m.color = new THREE.Color(0x080808);
          m.roughness = 0.9;
          m.metalness = 0;
          m.map = null;
          m.normalMap = null;
          m.roughnessMap = null;
          m.aoMap = null;
          m.needsUpdate = true;
        }

        if (m.name === 'Glass_material') {
          m.transparent = true;
          m.opacity = 0.3;
          m.roughness = 0.05;
          m.metalness = 0.1;
          m.color = new THREE.Color(0x88aacc);
          m.map = null;
          m.emissive = new THREE.Color(0x000000);
          m.emissiveIntensity = 0;
          m.emissiveMap = null;
          m.side = THREE.DoubleSide;
          (m as THREE.MeshPhysicalMaterial).transmission = 0;
          m.needsUpdate = true;
        }
      });

      mesh.castShadow = true;
      mesh.receiveShadow = true;
    });
  }, [scene]);

  return (
    <primitive object={scene} scale={1} position={[0, -1, 0]} rotation={[0, Math.PI / 4, 0]} />
  );
}

export default function Room3D({ isVisible = true }: { isVisible?: boolean }) {
  const { progress } = useProgress();

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[100]" style={{ width: '100vw', height: '100vh', background: '#111' }}>
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
          <RoomModel />
          <Environment preset="apartment" />
        </Suspense>
        <OrbitControls
          makeDefault
          enableDamping
          minDistance={2}
          maxDistance={20}
          minPolarAngle={Math.PI / 6}
          maxPolarAngle={Math.PI / 2.2}
          minAzimuthAngle={-Math.PI / 2}
          maxAzimuthAngle={Math.PI / 2}
        />
      </Canvas>
    </div>
  );
}