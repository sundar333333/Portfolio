import { Suspense, useEffect, useState, useRef, useCallback } from "react";
import { Canvas, useThree, useFrame } from "@react-three/fiber";
import { OrbitControls, useGLTF, Environment, useProgress } from "@react-three/drei";
import { EffectComposer, Outline } from "@react-three/postprocessing";
import * as THREE from "three";
import MonitorDesktop from "./MonitorDesktop";

const MODEL_URL = "https://rgd8w4vqllunko1j.public.blob.vercel-storage.com/3DRoomorginal1.compressed.glb";

// ─── Which mesh names are clickable ───────────────────────────────
const CLICKABLE_NAMES = [
  "gigabyte", "cube.049", "cube049", "monitor", "screen", "display",
];

function isClickable(obj: THREE.Object3D): boolean {
  let current: THREE.Object3D | null = obj;
  while (current) {
    const name = current.name.toLowerCase();
    if (CLICKABLE_NAMES.some(n => name.includes(n))) return true;
    current = current.parent;
  }
  return false;
}

// ─── Hover + outline + camera zoom ───────────────────────────────
function InteractiveScene({
  onMonitorClick,
}: {
  onMonitorClick: () => void;
}) {
  const { scene, camera, gl } = useThree();
  const [hovered, setHovered] = useState<THREE.Object3D[]>([]);
  const controlsRef = useRef<any>(null);
  const targetPos = useRef<THREE.Vector3 | null>(null);
  const isZooming = useRef(false);

  // Collect all meshes under a clickable ancestor
  const getMeshGroup = useCallback((obj: THREE.Object3D): THREE.Object3D[] => {
    let root: THREE.Object3D = obj;
    let current: THREE.Object3D | null = obj;
    while (current) {
      const name = current.name.toLowerCase();
      if (CLICKABLE_NAMES.some(n => name.includes(n))) { root = current; break; }
      current = current.parent;
    }
    const meshes: THREE.Object3D[] = [];
    root.traverse(c => { if ((c as THREE.Mesh).isMesh) meshes.push(c); });
    return meshes;
  }, []);

  useFrame(() => {
    if (targetPos.current && isZooming.current) {
      camera.position.lerp(targetPos.current, 0.05);
      if (camera.position.distanceTo(targetPos.current) < 0.1) {
        isZooming.current = false;
      }
    }
  });

  useEffect(() => {
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    let lastHit: THREE.Object3D | null = null;

    const onMove = (e: MouseEvent) => {
      const rect = gl.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);
      const hits = raycaster.intersectObjects(scene.children, true);

      if (hits.length > 0 && isClickable(hits[0].object)) {
        const obj = hits[0].object;
        if (obj !== lastHit) {
          lastHit = obj;
          setHovered(getMeshGroup(obj));
          gl.domElement.style.cursor = "pointer";
        }
      } else {
        if (lastHit) {
          lastHit = null;
          setHovered([]);
          gl.domElement.style.cursor = "default";
        }
      }
    };

    const onClick = (e: MouseEvent) => {
      const rect = gl.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);
      const hits = raycaster.intersectObjects(scene.children, true);

      if (hits.length > 0 && isClickable(hits[0].object)) {
        // Zoom toward the object
        const point = hits[0].point;
        const dir = camera.position.clone().sub(point).normalize();
        targetPos.current = point.clone().add(dir.multiplyScalar(2.5));
        isZooming.current = true;
        onMonitorClick();
      }
    };

    gl.domElement.addEventListener("mousemove", onMove);
    gl.domElement.addEventListener("click", onClick);
    return () => {
      gl.domElement.removeEventListener("mousemove", onMove);
      gl.domElement.removeEventListener("click", onClick);
      gl.domElement.style.cursor = "default";
    };
  }, [scene, camera, gl, onMonitorClick, getMeshGroup]);

  return (
    <>
      <EffectComposer autoClear={false}>
        <Outline
          selection={hovered as THREE.Mesh[]}
          selectionLayer={10}
          visibleEdgeColor={0x00aaff}
          hiddenEdgeColor={0x004488}
          edgeStrength={3}
          width={600}
        />
      </EffectComposer>
    </>
  );
}

// ─── Room model ───────────────────────────────────────────────────
function RoomModel() {
  const { scene } = useGLTF(MODEL_URL, "https://www.gstatic.com/draco/versioned/decoders/1.5.5/");

  useEffect(() => {
    scene.traverse((child) => {
      const mesh = child as THREE.Mesh;
      if (!mesh.isMesh) return;
      const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
      materials.forEach((mat) => {
        const m = mat as THREE.MeshStandardMaterial;
        if (m.map) m.map.colorSpace = THREE.SRGBColorSpace;
        m.envMapIntensity = 0.05;
        if (m.name === "black_wall") {
          m.color = new THREE.Color(0x080808); m.roughness = 0.9; m.metalness = 0;
          m.map = null; m.normalMap = null; m.roughnessMap = null; m.aoMap = null; m.needsUpdate = true;
        }
        if (mesh.name === "Plane.003") {
          m.color = new THREE.Color(0x080808); m.roughness = 0.9; m.metalness = 0;
          m.map = null; m.normalMap = null; m.roughnessMap = null; m.aoMap = null; m.needsUpdate = true;
        }
        if (m.name === "Glass_material") {
          m.transparent = true; m.opacity = 0.3; m.roughness = 0.05; m.metalness = 0.1;
          m.color = new THREE.Color(0x88aacc); m.map = null;
          m.emissive = new THREE.Color(0x000000); m.emissiveIntensity = 0; m.emissiveMap = null;
          m.side = THREE.DoubleSide;
          (m as THREE.MeshPhysicalMaterial).transmission = 0; m.needsUpdate = true;
        }
      });
      if (mesh.name === "Handle.005") {
        mesh.material = new THREE.MeshBasicMaterial({ color: 0x080808 });
      }
      mesh.castShadow = true;
      mesh.receiveShadow = true;
    });
  }, [scene]);

  return <primitive object={scene} scale={1} position={[0, -1, 0]} rotation={[0, Math.PI / 4, 0]} />;
}

// ─── Main export ──────────────────────────────────────────────────
export default function Room3D({ isVisible = true, onBack }: { isVisible?: boolean; onBack?: () => void }) {
  const { progress } = useProgress();
  const [desktopOpen, setDesktopOpen] = useState(false);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[100]" style={{ width: "100vw", height: "100vh", background: "#111" }}>

      <button
        onClick={onBack}
        style={{
          position: "absolute", top: "20px", left: "20px", zIndex: 200,
          display: "flex", alignItems: "center", gap: "8px",
          background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.2)",
          color: "#ffffff", padding: "10px 18px", borderRadius: "999px",
          cursor: "pointer", fontSize: "14px", fontFamily: "inherit",
          backdropFilter: "blur(8px)", transition: "background 0.2s",
        }}
        onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.18)")}
        onMouseLeave={e => (e.currentTarget.style.background = "rgba(255,255,255,0.08)")}
      >
        ← Back
      </button>

      {!desktopOpen && progress >= 100 && (
        <div style={{
          position: "absolute", bottom: "28px", left: "50%", transform: "translateX(-50%)",
          zIndex: 150, pointerEvents: "none",
          background: "rgba(0,0,0,0.55)", backdropFilter: "blur(8px)",
          border: "1px solid rgba(255,255,255,0.12)", borderRadius: "8px",
          padding: "8px 18px", color: "#aaa", fontSize: "13px",
          fontFamily: "inherit", whiteSpace: "nowrap",
        }}>
          🖥️ Click the monitor to interact
        </div>
      )}

      {progress < 100 && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white z-[110] bg-black">
          <div className="w-48 h-1 bg-white/20 rounded-full mb-4 overflow-hidden">
            <div className="h-full bg-blue-500 transition-all duration-300" style={{ width: `${progress}%` }} />
          </div>
          <p className="text-sm tracking-widest uppercase">Building Room... {Math.round(progress)}%</p>
        </div>
      )}

      <Canvas
        camera={{ position: [5, 5, 5], fov: 45 }}
        shadows
        gl={{
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 0.7,
          outputColorSpace: THREE.SRGBColorSpace,
          powerPreference: "high-performance",
        }}
      >
        <color attach="background" args={["#111111"]} />
        <ambientLight intensity={0.4} />
        <spotLight position={[0, 8, 0]} angle={0.5} penumbra={1} intensity={1.2} castShadow shadow-mapSize={[1024, 1024]} />
        <directionalLight position={[3, 6, 3]} intensity={0.3} />
        <directionalLight position={[-3, 6, -3]} intensity={0.2} />
        <Suspense fallback={null}>
          <RoomModel />
          <Environment preset="apartment" />
        </Suspense>
        <OrbitControls
          makeDefault
          enableDamping
          minDistance={2}
          maxDistance={20}
          minPolarAngle={Math.PI / 6}
          maxPolarAngle={Math.PI / 2.2}
          minAzimuthAngle={Math.PI / 6}
          maxAzimuthAngle={Math.PI * 0.75}
        />
        <InteractiveScene onMonitorClick={() => setDesktopOpen(true)} />
      </Canvas>

      {desktopOpen && <MonitorDesktop onClose={() => setDesktopOpen(false)} />}
    </div>
  );
}
