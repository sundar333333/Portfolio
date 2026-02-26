import { Suspense, useRef, useState, useEffect } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls, Environment } from "@react-three/drei";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { MeshoptDecoder } from "meshoptimizer";
import * as THREE from "three";

function RoomModel() {
  const [scene, setScene] = useState<THREE.Group | null>(null);
  const { gl } = useThree();

  useEffect(() => {
    const loader = new GLTFLoader();
    loader.setMeshoptDecoder(MeshoptDecoder);

    const maxAnisotropy = gl.capabilities.getMaxAnisotropy();

    loader.load(
      "/room.glb",
      (gltf) => {
        const windowFrameNodes = new Set([
          "defaultMaterial", "defaultMaterial.010", "defaultMaterial.006",
          "defaultMaterial.011", "defaultMaterial.012", "defaultMaterial.008",
          "defaultMaterial.005", "defaultMaterial.009",
        ]);
        const windowGlassNodes = new Set([
          "defaultMaterial.004", "defaultMaterial.003",
          "defaultMaterial.002", "defaultMaterial.001",
        ]);

        gltf.scene.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            const mesh = child as THREE.Mesh;
            mesh.castShadow = true;
            mesh.receiveShadow = true;

            const nodeName = mesh.name;
            const isFrame = windowFrameNodes.has(nodeName);
            const isGlass = windowGlassNodes.has(nodeName);

            if (isFrame || isGlass) {
              mesh.renderOrder = 10;
            }

            if (mesh.material) {
              const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
              materials.forEach((mat) => {
                if (mat instanceof THREE.MeshStandardMaterial || mat instanceof THREE.MeshPhysicalMaterial) {

                  if (isFrame) {
                    mat.color.set("#ffffff");
                    mat.roughness = 0.2;
                    mat.metalness = 0.0;
                    mat.side = THREE.DoubleSide;
                    mat.emissive = new THREE.Color("#333333");
                    mat.depthTest = true;
                    mat.polygonOffset = true;
                    mat.polygonOffsetFactor = -1;
                    mat.polygonOffsetUnits = -1;
                  }

                  if (isGlass) {
                    mat.color.set("#ddeeff");
                    mat.roughness = 0.0;
                    mat.metalness = 0.3;
                    mat.transparent = true;
                    mat.opacity = 0.4;
                    mat.side = THREE.DoubleSide;
                    mat.emissive = new THREE.Color("#445566");
                    mat.emissiveIntensity = 0.4;
                    mat.depthTest = true;
                    mat.polygonOffset = true;
                    mat.polygonOffsetFactor = -2;
                    mat.polygonOffsetUnits = -2;
                  }

                  mat.side = mat.side || THREE.DoubleSide;

                  if (mat.map) {
                    mat.map.anisotropy = maxAnisotropy;
                    mat.map.minFilter = THREE.LinearMipmapLinearFilter;
                    mat.map.magFilter = THREE.LinearFilter;
                    mat.map.generateMipmaps = true;
                    mat.map.needsUpdate = true;
                  }
                  if (mat.normalMap) {
                    mat.normalMap.anisotropy = maxAnisotropy;
                  }
                  if (mat.roughnessMap) {
                    mat.roughnessMap.anisotropy = maxAnisotropy;
                  }
                  mat.needsUpdate = true;
                }
              });
            }
          }
        });
        setScene(gltf.scene);
      },
      undefined,
      (error) => {
        console.error("Failed to load room model:", error);
      }
    );

    return () => {
      if (scene) {
        scene.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            const mesh = child as THREE.Mesh;
            mesh.geometry?.dispose();
            const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
            materials.forEach((mat) => {
              if (mat instanceof THREE.Material) {
                Object.values(mat).forEach((val) => {
                  if (val instanceof THREE.Texture) val.dispose();
                });
                mat.dispose();
              }
            });
          }
        });
      }
    };
  }, []);

  if (!scene) return <LoadingIndicator />;

  const box = new THREE.Box3().setFromObject(scene);
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

function LoadingIndicator() {
  const meshRef = useRef<THREE.Mesh>(null);

  return (
    <group>
      <mesh ref={meshRef}>
        <boxGeometry args={[0.3, 0.3, 0.3]} />
        <meshStandardMaterial color="#444" wireframe />
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
      gl.forceContextLoss();
    };
  }, [gl]);

  return null;
}

interface Room3DProps {
  visible: boolean;
}

export function Room3D({ visible }: Room3DProps) {
  const [hasError, setHasError] = useState(false);

  if (!visible || hasError) return null;

  return (
    <div
      className="fixed inset-0 z-[31]"
      data-testid="room-3d-container"
    >
      <Canvas
        shadows
        camera={{ position: [3, 2.5, 5], fov: 45 }}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: "high-performance",
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.1,
          failIfMajorPerformanceCaveat: false,
        }}
        dpr={[1, 2]}
        style={{ background: "transparent" }}
        onCreated={({ gl }) => {
          gl.domElement.addEventListener("webglcontextlost", (e) => {
            e.preventDefault();
            setHasError(true);
          });
        }}
      >
        <SceneCleanup />
        <Suspense fallback={<LoadingIndicator />}>
          <RoomModel />
          <Environment preset="apartment" environmentIntensity={0.4} />
          <ambientLight intensity={0.6} />
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
          />
        </Suspense>
      </Canvas>
    </div>
  );
}
