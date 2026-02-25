import { Suspense, useRef, useState, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { useGLTF, OrbitControls } from "@react-three/drei";
import * as THREE from "three";

function RoomModel() {
  const { scene } = useGLTF("/room.glb", true);

  useEffect(() => {
    const windowFrameMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(0.7, 0.7, 0.72),
      metalness: 0.4,
      roughness: 0.35,
      name: "Window_material",
    });
    const glassMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(0.0, 0.003, 0.5),
      metalness: 0.1,
      roughness: 0.05,
      transparent: true,
      opacity: 0.7,
      name: "Glass_material",
    });
    const handleMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(0.15, 0.15, 0.15),
      metalness: 0.3,
      roughness: 0.5,
      name: "Plastic_Handle_material",
    });
    const sillMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(0.8, 0.8, 0.82),
      metalness: 0.2,
      roughness: 0.4,
      name: "Sill_material",
    });

    scene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        const meshName = mesh.name;
        if (mesh.material) {
          const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
          materials.forEach((mat) => {
            if (mat instanceof THREE.MeshStandardMaterial || mat instanceof THREE.MeshPhysicalMaterial) {
              const name = mat.name.toLowerCase();
              if (name.includes("black") && name.includes("plaster") && name.includes("wall") && !mat.map) {
                mat.color.set("#0a0a0a");
                mat.needsUpdate = true;
              }
            }
          });

          const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
          let replaced = false;
          const newMats = mats.map((m) => {
            if (m.name === "GlassA_1001" || m.name === "GlassB_1001") {
              replaced = true;
              return glassMat.clone();
            }
            return m;
          });
          if (replaced) {
            mesh.material = Array.isArray(mesh.material) ? newMats : newMats[0];
          }

          if (meshName === "CTRL_Hole") {
            mesh.visible = false;
          } else if (meshName === "WindowFrame") {
            mesh.material = windowFrameMat;
          } else if (meshName === "Windows_Sill") {
            mesh.material = sillMat;
          } else if (meshName === "Handle" || meshName === "Handle001") {
            mesh.material = handleMat;
          } else if (meshName === "WindowL" || meshName === "WindowR" ||
                     meshName === "Window.L" || meshName === "Window.R" ||
                     meshName === "WindowL_1" || meshName === "WindowR_1" ||
                     meshName === "WindowL_2" || meshName === "WindowR_2") {
            if (Array.isArray(mesh.material)) {
              mesh.material = [windowFrameMat, glassMat];
            } else {
              const suffix = meshName.slice(-2);
              if (suffix === "_2" || suffix === ".2") {
                mesh.material = glassMat;
              } else {
                mesh.material = windowFrameMat;
              }
            }
          }
        }
      }
    });
  }, [scene]);

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
          toneMappingExposure: 1.4,
          failIfMajorPerformanceCaveat: false,
        }}
        dpr={[1, 1.5]}
        style={{ background: "transparent" }}
        onCreated={({ gl }) => {
          gl.domElement.addEventListener("webglcontextlost", (e) => {
            e.preventDefault();
            setHasError(true);
          });
        }}
      >
        <Suspense fallback={<LoadingIndicator />}>
          <RoomModel />
          <ambientLight intensity={1.0} />
          <directionalLight
            position={[2, 5, 3]}
            intensity={1.5}
            color="#ffffff"
            castShadow
          />
          <directionalLight
            position={[-3, 4, -2]}
            intensity={0.8}
            color="#ffffff"
          />
          <pointLight position={[-2, 3, 1]} intensity={0.8} color="#ffffff" distance={15} />
          <pointLight position={[2, 3, -1]} intensity={0.8} color="#ffffff" distance={15} />
          <pointLight position={[0, 4, 0]} intensity={0.6} color="#ffffff" distance={15} />
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
