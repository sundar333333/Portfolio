import { Suspense, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF, Environment, useProgress, ContactShadows } from "@react-three/drei";
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
        const m = mat as THREE.MeshPhysicalMaterial;

        // Fix color space
        if (m.map) m.map.colorSpace = THREE.SRGBColorSpace;
        if (m.emissiveMap) m.emissiveMap.colorSpace = THREE.SRGBColorSpace;

        // Very low env map so black walls stay black
        m.envMapIntensity = 0.05;

        // Fix window glass
        if (m.name === 'PaletteMaterial010' || mesh.name === 'WindowFrame') {
          m.emissive = new THREE.Color(0x000000);
          m.emissiveIntensity = 0;
          m.emissiveMap = null;
          m.transparent = true;
          m.transmission = 1.0;
          m.roughness = 0.0;
          m.thickness = 0.3;
          m.color = new THREE.Color(0xffffff);
          m.map = null;
          m.side = THREE.DoubleSide;
          m.needsUpdate = true;
        }
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
    <div
      className="fixed inset-0 z-[100] bg-[#111]"
      style={{ width: '100vw', height: '100vh' }}
    >
      {progress < 100 && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white z-[110] bg-black">
          <div className="w-48 h-1 bg-white/20 rounded-full mb-4 overflow-hidden">
            <div
              className="h-full bg-blue-500 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-sm tracking-widest uppercase">
            Building Room... {Math.round(progress)}%
          </p>
        </div>
      )}

      <Canvas
        camera={{ position: [5, 5, 5], fov: 45 }}
        shadows
        gl={{
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 0.6,
          outputColorSpace: THREE.SRGBColorSpace,
        }}
      >
        <color attach="background" args={['#111111']} />

        {/* Reduced lighting to keep black walls dark */}
        <ambientLight intensity={0.3} />
        <spotLight
          position={[0, 8, 0]}
          angle={0.5}
          penumbra={1}
          intensity={1.0}
          castShadow
          shadow-mapSize={[2048, 2048]}
        />
        <directionalLight position={[3, 6, 3]} intensity={0.3} />
        <directionalLight position={[-3, 6, -3]} intensity={0.2} />
        <pointLight position={[0, 3, 0]} intensity={0.5} color="#ffffff" />

        <Suspense fallback={null}>
          <RoomModel />
          <Environment preset="night" />
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