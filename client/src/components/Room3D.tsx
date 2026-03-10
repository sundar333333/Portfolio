import { Suspense, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF, Environment, useProgress, ContactShadows } from "@react-three/drei";
import * as THREE from "three";

const MODEL_URL = "https://rgd8w4vqllunko1j.public.blob.vercel-storage.com/room-compressed.glb";

// These are the exact node names that are the wrong-colored walls
const WHITE_WALL_NODES = ['Object_6', 'Object_1.002'];
// These are the exact material names that need to be black
const BEIGE_MATERIALS = ['phong1', 'Beige Painted Plaster Wall'];

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

        // Fix 1: Correct color space on all textures
        if (m.map) m.map.colorSpace = THREE.SRGBColorSpace;
        if (m.emissiveMap) m.emissiveMap.colorSpace = THREE.SRGBColorSpace;

        // Fix 2: Reduce env map so black walls stay black
        m.envMapIntensity = 0.15;

        // Fix 3: Force white/beige walls to black by material name
        if (BEIGE_MATERIALS.includes(m.name)) {
          m.color = new THREE.Color(0x0d0d0d);
          m.map = null;
          m.roughness = 0.9;
          m.metalness = 0;
          m.needsUpdate = true;
        }

        // Fix 4: Fix window glass — kill emissive glow, make transparent
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

      // Fix 5: Force white wall nodes to black by node name
      if (WHITE_WALL_NODES.includes(mesh.name)) {
        const m = Array.isArray(mesh.material)
          ? mesh.material[0] as THREE.MeshPhysicalMaterial
          : mesh.material as THREE.MeshPhysicalMaterial;
        m.color = new THREE.Color(0x0d0d0d);
        m.map = null;
        m.needsUpdate = true;
      }

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

        <ambientLight intensity={0.6} />
        <spotLight
          position={[0, 8, 0]}
          angle={0.5}
          penumbra={1}
          intensity={1.5}
          castShadow
          shadow-mapSize={[2048, 2048]}
        />
        <directionalLight position={[3, 6, 3]} intensity={0.5} />
        <directionalLight position={[-3, 6, -3]} intensity={0.3} />
        <pointLight position={[0, 3, 0]} intensity={0.8} color="#ffffff" />

        <Suspense fallback={null}>
          <RoomModel />
          <Environment preset="apartment" />
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