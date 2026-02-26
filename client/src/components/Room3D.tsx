import { Suspense, useRef, useState, useEffect } from "react";
import { Canvas, useThree, useFrame } from "@react-three/fiber";
import { OrbitControls, Environment } from "@react-three/drei";
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
    "/render3d.glb",
    (gltf) => {
      gltf.scene.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const mesh = child as THREE.Mesh;
          mesh.castShadow = true;
          mesh.receiveShadow = true;
        }
      });
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
      "/render3d.glb",
      (gltf) => {
        gltf.scene.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            const mesh = child as THREE.Mesh;
            mesh.castShadow = true;
            mesh.receiveShadow = true;

            if (mesh.material) {
              const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
              materials.forEach((mat) => {
                if (mat instanceof THREE.MeshStandardMaterial || mat instanceof THREE.MeshPhysicalMaterial) {
                  if (mat.map) {
                    mat.map.anisotropy = maxAnisotropy;
                    mat.map.minFilter = THREE.LinearMipmapLinearFilter;
                    mat.map.magFilter = THREE.LinearFilter;
                    mat.map.generateMipmaps = true;
                    mat.map.needsUpdate = true;
                  }
                  mat.needsUpdate = true;
                }
              });
            }
          }
        });

        cachedScene = gltf.scene;
        setScene(gltf.scene);
      },
      undefined,
      (error) => {
        console.error("Failed to load room model:", error);
      }
    );
  }, []);

  if (!scene) return <LoadingSpinner />;

  const box = new THREE.Box3();
  const worldPos = new THREE.Vector3();
  scene.traverse((child) => {
    if ((child as THREE.Mesh).isMesh && child.visible) {
      child.getWorldPosition(worldPos);
      if (Math.abs(worldPos.x) < 50 && Math.abs(worldPos.y) < 50 && Math.abs(worldPos.z) < 50) {
        const meshBox = new THREE.Box3().setFromObject(child);
        box.union(meshBox);
      }
    }
  });
  if (box.isEmpty()) {
    box.setFromObject(scene);
  }

  const size = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());
  const maxDim = Math.max(size.x, size.y, size.z);
  const scale = 4 / maxDim;

  return (
    <primitive
      object={scene}
      scale={scale}
      position={[-center.x * scale, -center.y * scale + 0.5, -center.z * scale]}
    />
  );
}

function LoadingSpinner() {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 2;
      meshRef.current.rotation.x += delta * 0.5;
    }
  });

  return (
    <group>
      <mesh ref={meshRef}>
        <torusGeometry args={[0.4, 0.05, 16, 32]} />
        <meshStandardMaterial color="#999" />
      </mesh>
      <ambientLight intensity={0.5} />
    </group>
  );
}

function SceneCleanup() {
  const { gl } = useThree();

  useEffect(() => {
    return () => {
      gl.dispose();
    };
  }, [gl]);

  return null;
}

interface Room3DProps {
  visible: boolean;
}

export function Room3D({ visible }: Room3DProps) {
  const [hasError, setHasError] = useState(false);
  const [canvasKey, setCanvasKey] = useState(0);

  useEffect(() => {
    if (visible && hasError) {
      setHasError(false);
      setCanvasKey((k) => k + 1);
    }
  }, [visible]);

  if (!visible || hasError) return null;

  return (
    <div
      className="w-full h-full"
      data-testid="room-3d-container"
    >
      <Canvas
        key={canvasKey}
        shadows
        camera={{ position: [3, 2.5, 5], fov: 45 }}
        gl={{
          antialias: true,
          alpha: false,
          powerPreference: "high-performance",
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.1,
          failIfMajorPerformanceCaveat: false,
        }}
        dpr={[1, 2]}
        style={{ background: "#ffffff" }}
        onCreated={({ gl }) => {
          gl.setClearColor("#ffffff");
          gl.domElement.addEventListener("webglcontextlost", (e) => {
            e.preventDefault();
            setHasError(true);
          });
        }}
      >
        <SceneCleanup />
        <Suspense fallback={<LoadingSpinner />}>
          <RoomModel />
          <Environment preset="apartment" environmentIntensity={0.4} />
          <ambientLight intensity={0.55} />
          <directionalLight
            position={[3, 5, 4]}
            intensity={1.5}
            color="#ffffff"
            castShadow
            shadow-mapSize-width={2048}
            shadow-mapSize-height={2048}
            shadow-bias={-0.0001}
          />
          <hemisphereLight args={["#ffffff", "#333333", 0.4]} />
          <pointLight position={[0, 3, 0]} intensity={0.3} color="#ffeedd" />
          <OrbitControls
            enableZoom={true}
            enablePan={false}
            minDistance={1}
            maxDistance={12}
            minPolarAngle={Math.PI / 6}
            maxPolarAngle={Math.PI / 2.2}
            autoRotate={false}
            target={[0, 0.5, 0]}
            enableDamping={true}
            dampingFactor={0.05}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}
