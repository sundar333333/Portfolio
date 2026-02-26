import { Suspense, useRef, useState, useEffect, useMemo } from "react";
import { Canvas, useThree, useFrame } from "@react-three/fiber";
import { OrbitControls, Environment } from "@react-three/drei";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { MeshoptDecoder } from "meshoptimizer";
import * as THREE from "three";

let cachedScene: THREE.Group | null = null;
let preloadStarted = false;
let materialFixesApplied = false;

function applyRoomFixes(scene: THREE.Group) {
  const wallMeshNames = new Set(["Plane", "Plane.003"]);

  const frameMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color("#e8e8e8"),
    roughness: 0.4,
    metalness: 0.1,
    side: THREE.DoubleSide,
  });
  const glassMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color("#88bbdd"),
    emissive: new THREE.Color("#4488aa"),
    emissiveIntensity: 0.3,
    transparent: true,
    opacity: 0.4,
    side: THREE.DoubleSide,
    depthWrite: false,
  });
  const handleMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color("#888888"),
    metalness: 0.8,
    roughness: 0.3,
  });

  const windowGroup = scene.getObjectByName("Window_Group");
  if (windowGroup) {
    windowGroup.traverse((child) => {
      if (!(child as THREE.Mesh).isMesh) return;
      const mesh = child as THREE.Mesh;
      const name = mesh.name;

      if (name === "CTRL_Hole") {
        mesh.visible = false;
        return;
      }

      if (name === "Handle" || name === "Handle.001") {
        mesh.material = handleMat;
      } else if (name === "Windows_Sill") {
        mesh.material = frameMat;
      } else {
        const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
        const newMats = mats.map((mat: any) => {
          const matName = (mat.name || "").toLowerCase();
          if (matName.includes("glass_material")) {
            return glassMat;
          }
          if (matName === "hidden_material") {
            return frameMat;
          }
          if (matName.includes("procedural wood")) {
            return frameMat;
          }
          return frameMat;
        });
        mesh.material = newMats.length === 1 ? newMats[0] : newMats;
      }
      mesh.visible = true;
      mesh.renderOrder = 5;
    });
  }

  const defaultMatNodes = new Set([
    "defaultMaterial", "defaultMaterial.001", "defaultMaterial.002",
    "defaultMaterial.003", "defaultMaterial.004", "defaultMaterial.005",
    "defaultMaterial.006", "defaultMaterial.007", "defaultMaterial.008",
    "defaultMaterial.009", "defaultMaterial.010", "defaultMaterial.011",
    "defaultMaterial.012", "defaultMaterial.013", "defaultMaterial.014",
    "defaultMaterial.015",
  ]);

  scene.traverse((child) => {
    if (!(child as THREE.Mesh).isMesh) return;
    const mesh = child as THREE.Mesh;
    mesh.castShadow = true;
    mesh.receiveShadow = true;

    if (wallMeshNames.has(mesh.name)) {
      mesh.material = new THREE.MeshStandardMaterial({
        color: new THREE.Color("#111111"),
        side: THREE.DoubleSide,
        roughness: 0.9,
        metalness: 0.0,
      });
    }

    if (defaultMatNodes.has(mesh.name)) {
      const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
      const hasWindowMat = mats.some((m: any) => {
        const n = (m.name || "").toLowerCase();
        return n.includes("_1001") || n.includes("border") || n.includes("glass") || n.includes("glow") || n.includes("shelves") || n.includes("sides") || n.includes("top_") || n.includes("bottom") || n.includes("triangle") || n.includes("xleft") || n.includes("xright");
      });
      if (hasWindowMat) {
        mesh.visible = false;
      }
    }
  });
}

export function preloadRoom3D() {
  if (preloadStarted) return;
  preloadStarted = true;

  const loader = new GLTFLoader();
  loader.setMeshoptDecoder(MeshoptDecoder);
  loader.load(
    "/quit2.glb",
    (gltf) => {
      applyRoomFixes(gltf.scene);
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
      if (!materialFixesApplied) {
        applyRoomFixes(cachedScene);
        materialFixesApplied = true;
      }
      setScene(cachedScene);
      return;
    }

    const loader = new GLTFLoader();
    loader.setMeshoptDecoder(MeshoptDecoder);
    const maxAnisotropy = gl.capabilities.getMaxAnisotropy();

    loader.load(
      "/quit2.glb",
      (gltf) => {
        applyRoomFixes(gltf.scene);

        gltf.scene.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            const mesh = child as THREE.Mesh;
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

        cachedScene = gltf.scene;
        setScene(gltf.scene);
      },
      undefined,
      (error) => {
        console.error("Failed to load room model:", error);
      }
    );
  }, []);

  const { scale, position } = useMemo(() => {
    if (!scene) return { scale: 1, position: [0, 0, 0] as [number, number, number] };

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
    const s = 4 / maxDim;

    return {
      scale: s,
      position: [-center.x * s, -center.y * s + 0.5, -center.z * s] as [number, number, number],
    };
  }, [scene]);

  if (!scene) return <LoadingSpinner />;

  return (
    <primitive
      object={scene}
      scale={scale}
      position={position}
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
        style={{ background: "#87CEEB" }}
        onCreated={({ gl }) => {
          gl.setClearColor("#87CEEB");
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
            minDistance={2}
            maxDistance={10}
            minPolarAngle={Math.PI / 6}
            maxPolarAngle={Math.PI / 2.2}
            autoRotate={false}
            target={[0, 0.5, 0]}
            enableDamping={true}
            dampingFactor={0.12}
            zoomSpeed={0.8}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}
