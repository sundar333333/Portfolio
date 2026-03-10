import { Suspense, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF, Environment, useProgress } from "@react-three/drei";
import * as THREE from "three";

const MODEL_URL = "https://rgd8w4vqllunko1j.public.blob.vercel-storage.com/room-compressed.glb";

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

        // Main wall - Black Painted Plaster Wall
        if (m.name === 'Black Painted Plaster Wall') {
          m.color = new THREE.Color(0x080808);
          m.roughness = 0.9;
          m.metalness = 0;
          m.map = null;
          m.normalMap = null;
          m.roughnessMap = null;
          m.aoMap = null;
          m.needsUpdate = true;
        }

        // Second wall (Plane003) uses PaletteMaterial001
        // BUT Toalhas_04_LowPoly_25k_1 also uses PaletteMaterial001 (towel)
        // So target by MESH NAME not material name
        if (mesh.name === 'Plane003') {
          m.color = new THREE.Color(0x080808);
          m.roughness = 0.9;
          m.metalness = 0;
          m.map = null;
          m.normalMap = null;
          m.roughnessMap = null;
          m.aoMap = null;
          m.needsUpdate = true;
        }

        // Window glass - PaletteMaterial010 on WindowFrame
        // PaletteMaterial011 on Object_4005
        if (
          (mesh.name === 'WindowFrame' && m.name === 'PaletteMaterial010') ||
          (mesh.name === 'Object_4005' && m.name === 'PaletteMaterial011')
        ) {
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

        // Beige Painted Plaster Wall is on Cylinder002_1 (wardrobe) - leave it alone
        // phong1 is on Object_6 (chair) - leave it alone
      });

      mesh.castShadow = true;
      mesh.receiveShadow = true;
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
        <OrbitControls makeDefault enableDamping minDistance={2} maxDistance={20} />
      </Canvas>
    </div>
  );
}