import { Suspense, useRef, useState, useEffect, useMemo } from "react";
import { Canvas, useThree, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { MeshoptDecoder } from "meshoptimizer";
import * as THREE from "three";

let cachedScene: THREE.Group | null = null;
let preloadStarted = false;

export function preloadRoom3D() {
  if (preloadStarted) return;
  preloadStarted = true;

  const loader = new GLTFLoader();
  loader.setMeshoptDecoder(MeshoptDecoder);
  loader.load(
    "/myroom.glb",
    (gltf) => {
      cachedScene = gltf.scene;
    },
    undefined,
    (error) => {
      console.error("Failed to preload room model:", error);
      preloadStarted = false;
    }
  );
}

function RoomModel() {
  const [scene, setScene] = useState<THREE.Group | null>(cachedScene);
  const { gl } = useThree();

  useEffect(() => {
    if (cachedScene) {
      setScene(cachedScene);
      return;
    }

    const loader = new GLTFLoader();
    loader.setMeshoptDecoder(MeshoptDecoder);
    const maxAnisotropy = gl.capabilities.getMaxAnisotropy();

    loader.load(
      "/myroom.glb",
      (gltf) => {
        gltf.scene.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            const mesh = child as THREE.Mesh;
            if (mesh.material) {
              const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
              materials.forEach((mat) => {
                if (!(mat instanceof THREE.MeshStandardMaterial || mat instanceof THREE.MeshPhysicalMaterial)) return;
                mat.envMapIntensity = 0.3;
                if (mat.map) {
                  mat.map.anisotropy = Math.min(maxAnisotropy, 4);
                  mat.map.generateMipmaps = false;
                  mat.map.minFilter = THREE.LinearFilter;
                  mat.map.magFilter = THREE.LinearFilter;
                  mat.map.needsUpdate = true;
                }
              });
            }
          }
        });

        cachedScene = gltf.scene;
        setScene(gltf.scene);
      },
      undefined,
      (error) => console.error("Failed to load room model:", error)
    );
  }, [gl]);

  const { center, size } = useMemo(() => {
    if (!scene) return { center: new THREE.Vector3(), size: 10 };
    const box = new THREE.Box3();
    scene.traverse((child) => {
      if (!(child as THREE.Mesh).isMesh) return;
      const mesh = child as THREE.Mesh;
      const wp = new THREE.Vector3();
      mesh.getWorldPosition(wp);
      if (wp.length() > 50) return;
      const meshBox = new THREE.Box3().setFromObject(mesh);
      if (meshBox.min.x !== Infinity) box.union(meshBox);
    });
    const c = new THREE.Vector3();
    box.getCenter(c);
    const s = box.getSize(new THREE.Vector3()).length();
    return { center: c, size: s || 10 };
  }, [scene]);

  if (!scene) return null;

  return (
    <group>
      <primitive object={scene} />
    </group>
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
  const [loadProgress, setLoadProgress] = useState(0);
  const [isLoaded, setIsLoaded] = useState(!!cachedScene);

  useEffect(() => {
    if (cachedScene) {
      setIsLoaded(true);
      setLoadProgress(100);
      return;
    }

    preloadRoom3D();

    const checkInterval = setInterval(() => {
      if (cachedScene) {
        setIsLoaded(true);
        setLoadProgress(100);
        clearInterval(checkInterval);
      } else {
        setLoadProgress((prev) => Math.min(prev + 2, 90));
      }
    }, 200);

    return () => clearInterval(checkInterval);
  }, []);

  if (!visible) return null;

  return (
    <div className="w-full h-full relative" data-testid="room-3d-container">
      {!isLoaded && (
        <div className="absolute inset-0 flex flex-col items-center justify-center z-10" data-testid="room-loading">
          <div className="w-48 h-1 bg-black/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-black/60 rounded-full transition-all duration-300"
              style={{ width: `${loadProgress}%` }}
            />
          </div>
          <span className="mt-3 text-black/40 text-xs tracking-widest uppercase">Loading room</span>
        </div>
      )}

      <Canvas
        camera={{ fov: 45, near: 0.1, far: 200 }}
        style={{ background: "#ffffff" }}
        gl={{ antialias: false, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.0, powerPreference: "high-performance" }}
      >
        <CameraSetup />
        <ambientLight intensity={0.8} />
        <directionalLight position={[5, 8, 5]} intensity={1.0} />
        <directionalLight position={[-3, 5, -3]} intensity={0.4} />
        <hemisphereLight args={["#ffffff", "#e0e0e0", 0.5]} />

        <Suspense fallback={null}>
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
