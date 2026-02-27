import { Suspense, useRef, useState, useEffect } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls, useProgress, Html } from "@react-three/drei";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { MeshoptDecoder } from "meshoptimizer";
import * as THREE from "three";

function disposeThreeCache() {
  THREE.Cache.clear();
}

function RoomModel() {
  const [scene, setScene] = useState<THREE.Group | null>(null);
  const { gl } = useThree();

  useEffect(() => {
    const loader = new GLTFLoader();
    loader.setMeshoptDecoder(MeshoptDecoder);

    loader.load(
      "/myroom.glb",
      (gltf) => {
        gltf.scene.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            const mesh = child as THREE.Mesh;
            if (mesh.material) {
              const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
              materials.forEach((mat) => {
                if (mat instanceof THREE.MeshStandardMaterial || mat instanceof THREE.MeshPhysicalMaterial) {
                  mat.envMapIntensity = 0.3;
                  mat.normalMap = null;
                  mat.aoMap = null;
                  mat.metalnessMap = null;
                  mat.roughnessMap = null;
                  mat.needsUpdate = true;
                  if (mat.map) {
                    mat.map.generateMipmaps = false;
                    mat.map.minFilter = THREE.LinearFilter;
                    mat.map.magFilter = THREE.LinearFilter;
                    mat.map.needsUpdate = true;
                  }
                }
              });
            }
          }
        });
        setScene(gltf.scene);
      },
      undefined,
      (error) => console.error("Failed to load room model:", error)
    );

    return () => {
      if (scene) {
        scene.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            const mesh = child as THREE.Mesh;
            mesh.geometry?.dispose();
            const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
            materials.forEach((mat) => {
              if (mat.map) mat.map.dispose();
              mat.dispose();
            });
          }
        });
      }
    };
  }, [gl]);

  if (!scene) return null;

  return <primitive object={scene} />;
}

function Loader() {
  const { progress } = useProgress();
  return (
    <Html center>
      <div className="flex flex-col items-center gap-3">
        <div className="w-48 h-1 bg-black/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-black/60 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        <span className="text-black/40 text-xs tracking-widest uppercase">Loading room</span>
      </div>
    </Html>
  );
}

function CameraSetup() {
  const { camera } = useThree();
  const initialized = useRef(false);

  useEffect(() => {
    if (!initialized.current) {
      camera.position.set(5, 4, 8);
      camera.lookAt(0, 1, 0);
      initialized.current = true;
    }
  }, [camera]);

  return null;
}

interface Room3DProps {
  visible: boolean;
}

export function Room3D({ visible }: Room3DProps) {
  useEffect(() => {
    disposeThreeCache();
  }, []);

  if (!visible) return null;

  return (
    <div className="w-full h-full relative" data-testid="room-3d-container">
      <Canvas
        camera={{ fov: 45, near: 0.1, far: 200 }}
        style={{ background: "#ffffff" }}
        gl={{
          antialias: false,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.0,
          powerPreference: "high-performance",
          preserveDrawingBuffer: false,
          precision: "mediump",
        }}
        dpr={[0.75, 1]}
      >
        <CameraSetup />
        <ambientLight intensity={0.8} />
        <directionalLight position={[5, 8, 5]} intensity={1.0} />
        <directionalLight position={[-3, 5, -3]} intensity={0.4} />
        <hemisphereLight args={["#ffffff", "#e0e0e0", 0.5]} />

        <Suspense fallback={<Loader />}>
          <RoomModel />
        </Suspense>

        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          zoomSpeed={0.8}
          rotateSpeed={0.5}
          panSpeed={0.5}
          minDistance={2}
          maxDistance={20}
          target={[0, 1, 0]}
          dampingFactor={0.12}
          enableDamping={true}
        />
      </Canvas>

      <button
        className="absolute top-6 right-6 z-10 w-10 h-10 flex items-center justify-center rounded-full border border-black/15 bg-white/80 backdrop-blur-sm hover:bg-black/5 transition-colors"
        onClick={() => window.location.reload()}
        data-testid="button-exit-room"
      >
        <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <line x1="4" y1="4" x2="16" y2="16" />
          <line x1="16" y1="4" x2="4" y2="16" />
        </svg>
      </button>
    </div>
  );
}
