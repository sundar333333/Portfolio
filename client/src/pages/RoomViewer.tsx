import { useState, useEffect, useRef } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { MeshoptDecoder } from "meshoptimizer";
import * as THREE from "three";

function RoomModel({ onLoaded }: { onLoaded: () => void }) {
  const [scene, setScene] = useState<THREE.Group | null>(null);
  const { gl } = useThree();

  useEffect(() => {
    const loader = new GLTFLoader();
    loader.setMeshoptDecoder(MeshoptDecoder);
    const maxAnisotropy = gl.capabilities.getMaxAnisotropy();

    loader.load(
      "/myroom.glb",
      (gltf) => {
        gltf.scene.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            const mesh = child as THREE.Mesh;
            mesh.castShadow = true;
            mesh.receiveShadow = true;
            if (mesh.material) {
              const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
              materials.forEach((mat) => {
                if (!(mat instanceof THREE.MeshStandardMaterial || mat instanceof THREE.MeshPhysicalMaterial)) return;
                if (mat.map) {
                  mat.map.anisotropy = maxAnisotropy;
                  mat.map.minFilter = THREE.LinearMipmapLinearFilter;
                  mat.map.magFilter = THREE.LinearFilter;
                  mat.map.generateMipmaps = true;
                  mat.map.needsUpdate = true;
                }
              });
            }
          }
        });
        setScene(gltf.scene);
        onLoaded();
      },
      undefined,
      (error) => console.error("Failed to load room model:", error)
    );
  }, [gl, onLoaded]);

  if (!scene) return null;
  return <primitive object={scene} />;
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

function hasWebGL(): boolean {
  try {
    const canvas = document.createElement("canvas");
    return !!(canvas.getContext("webgl2") || canvas.getContext("webgl"));
  } catch {
    return false;
  }
}

export default function RoomViewer() {
  const [loaded, setLoaded] = useState(false);
  const [progress, setProgress] = useState(0);
  const webglSupported = hasWebGL();

  useEffect(() => {
    if (!loaded) {
      const interval = setInterval(() => {
        setProgress((prev) => Math.min(prev + 1, 90));
      }, 100);
      return () => clearInterval(interval);
    } else {
      setProgress(100);
    }
  }, [loaded]);

  if (!webglSupported) {
    return (
      <div className="w-screen h-screen flex items-center justify-center bg-white" data-testid="room-no-webgl">
        <p className="text-black/40 text-sm">Open in a browser tab to view the 3D room</p>
      </div>
    );
  }

  return (
    <div className="w-screen h-screen bg-white relative" data-testid="room-viewer-page">
      {!loaded && (
        <div className="absolute inset-0 flex flex-col items-center justify-center z-10 bg-white" data-testid="room-loading">
          <div className="w-48 h-1 bg-black/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-black/60 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="mt-3 text-black/40 text-xs tracking-widest uppercase">Loading room</span>
        </div>
      )}

      <Canvas
        shadows
        camera={{ fov: 45, near: 0.1, far: 200 }}
        style={{ background: "#ffffff" }}
        gl={{
          antialias: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.2,
          powerPreference: "high-performance",
        }}
      >
        <CameraSetup />
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 8, 5]} intensity={1.2} castShadow shadow-mapSize={[1024, 1024]} />
        <directionalLight position={[-3, 5, -3]} intensity={0.4} />
        <hemisphereLight args={["#ffffff", "#e0e0e0", 0.6]} />

        <RoomModel onLoaded={() => setLoaded(true)} />

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
        className="absolute top-6 left-6 z-10 flex items-center gap-2 px-4 py-2 rounded-full border border-black/10 bg-white/80 backdrop-blur-sm hover:bg-black/5 transition-colors text-black/60 hover:text-black/90 text-sm"
        onClick={() => window.location.href = "/"}
        data-testid="button-back-home"
      >
        <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <line x1="14" y1="10" x2="6" y2="10" />
          <polyline points="10,4 4,10 10,16" />
        </svg>
        Back
      </button>

      <button
        className="absolute top-6 right-6 z-10 w-10 h-10 flex items-center justify-center rounded-full border border-black/15 bg-white/80 backdrop-blur-sm hover:bg-black/5 transition-colors"
        onClick={() => window.location.href = "/"}
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
