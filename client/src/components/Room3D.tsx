import { Suspense, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF, Environment, useProgress, ContactShadows } from "@react-three/drei";
import * as THREE from "three";

const MODEL_URL = "https://rgd8w4vqllunko1j.public.blob.vercel-storage.com/room-compressed.glb";

function RoomModel() {
  const { scene } = useGLTF(MODEL_URL, 'https://www.gstatic.com/draco/versioned/decoders/1.5.5/');

  useEffect(() => {
    scene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];

        materials.forEach((mat) => {
          const m = mat as THREE.MeshPhysicalMaterial;

          // Fix 1: Correct color space
          if (m.map) m.map.colorSpace = THREE.SRGBColorSpace;
          if (m.emissiveMap) m.emissiveMap.colorSpace = THREE.SRGBColorSpace;

          // Fix 2: Reduce env map
          m.envMapIntensity = 0.2;

          // Fix 3: Override beige wall to black
          if (m.name === 'Beige Painted Plaster Wall') {
            m.color = new THREE.Color(0x111111);
            m.map = null;
            m.needsUpdate = true;
          }

          // Fix 4: Fix window glass - kill the emissive glow, make it transparent
          if (m.name === 'PaletteMaterial010' || mesh.name === 'WindowFrane') {
            m.emissive = new THREE.Color(0x000000);
            m.emissiveIntensity = 0;
            if (m.emissiveMap) m.emissiveMap = null;
            m.transparent = true;
            m.transmission = 1.0;
            m.roughness = 0.05;
            m.thickness = 0.5;
            m.color = new THREE.Color(0xffffff);
            m.map = null;
            m.side = THREE.DoubleSide;
            m.needsUpdate = true;
          }

          // Fix 5: Reduce overexposure on bright wall (phong1)
          if (m.name === 'phong1') {
            m.envMapIntensity = 0;
            m.needsUpdate = true;
          }
        });

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
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 0.9,
          outputColorSpace: THREE.SRGBColorSpace,
        }}
      >
        <color attach="background" args={['#1a1a1a']} />

        <ambientLight intensity={0.8} />
        <spotLight
          position={[0, 8, 0]}
          angle={0.6}
          penumbra={0.8}
          intensity={1.5}
          castShadow
          shadow-mapSize={[2048, 2048]}
        />
        <directionalLight position={[5, 5, 5]} intensity={0.6} />
        <directionalLight position={[-5, 5, -5]} intensity={0.4} />
        <pointLight position={[0, 4, 0]} intensity={1} color="#ffffff" />

        <Suspense fallback={null}>
          <RoomModel />
          <Environment preset="apartment" />
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