import { Suspense, useEffect, useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, useGLTF, Environment, useProgress } from "@react-three/drei";
import * as THREE from "three";

const MODEL_URL = "https://rgd8w4vqllunko1j.public.blob.vercel-storage.com/3DRoomorginal1.compressed.glb";

// ─── Deep space sky dome ──────────────────────────────────────────
function SkyDome() {
  const texture = useMemo(() => {
    const W = 2048, H = 1024;
    const canvas = document.createElement("canvas");
    canvas.width = W; canvas.height = H;
    const ctx = canvas.getContext("2d")!;

    ctx.fillStyle = "#000510";
    ctx.fillRect(0, 0, W, H);

    const addZone = (x: number, y: number, r: number, col: string, a: number) => {
      const g = ctx.createRadialGradient(x, y, 0, x, y, r);
      g.addColorStop(0, col.replace(")", `,${a})`).replace("rgb", "rgba"));
      g.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);
    };

    addZone(400,  200, 500, "rgb(5,15,60)",  0.6);
    addZone(1200, 150, 600, "rgb(3,10,50)",  0.5);
    addZone(700,  600, 450, "rgb(8,5,40)",   0.4);
    addZone(1700, 500, 400, "rgb(5,8,55)",   0.5);
    addZone(200,  700, 380, "rgb(10,5,35)",  0.4);
    addZone(1500, 800, 350, "rgb(6,12,45)",  0.45);

    // Milky way band
    const mw = ctx.createLinearGradient(0, 350, 0, 650);
    mw.addColorStop(0,   "rgba(0,0,0,0)");
    mw.addColorStop(0.3, "rgba(10,15,40,0.18)");
    mw.addColorStop(0.5, "rgba(15,20,55,0.22)");
    mw.addColorStop(0.7, "rgba(10,15,40,0.18)");
    mw.addColorStop(1,   "rgba(0,0,0,0)");
    ctx.fillStyle = mw;
    ctx.fillRect(0, 0, W, H);

    // Subtle nebula hints
    addZone(650,  280, 300, "rgb(60,10,80)",  0.18);
    addZone(850,  200, 250, "rgb(0,40,80)",   0.2);
    addZone(300,  400, 280, "rgb(80,10,60)",  0.15);
    addZone(1600, 300, 260, "rgb(40,10,70)",  0.16);
    addZone(1400, 700, 220, "rgb(0,30,70)",   0.15);

    // Stars
    const seed = (n: number) => {
      let x = Math.sin(n * 127.1) * 43758.5453;
      return x - Math.floor(x);
    };
    for (let i = 0; i < 3000; i++) {
      const sx = seed(i * 3.1) * W;
      const sy = seed(i * 7.3) * H;
      const r  = seed(i * 2.7);
      const size   = r < 0.02 ? 3 : r < 0.08 ? 2 : 1;
      const bright = Math.floor(140 + seed(i * 4.1) * 115);
      const alpha  = 0.4 + seed(i * 6.2) * 0.6;
      const rb = Math.max(0, bright - Math.floor(seed(i * 8.1) * 30));
      ctx.fillStyle = `rgba(${rb},${rb},${bright},${alpha})`;
      ctx.fillRect(sx, sy, size, size);
    }

    // Saturn planet — top right
    const px = 1750, py = 100, pr = 55;
    const atm = ctx.createRadialGradient(px, py, pr, px, py, pr * 2.5);
    atm.addColorStop(0, "rgba(60,80,180,0.2)");
    atm.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = atm;
    ctx.beginPath(); ctx.arc(px, py, pr * 2.5, 0, Math.PI * 2); ctx.fill();
    const pg = ctx.createRadialGradient(px - 15, py - 15, 4, px, py, pr);
    pg.addColorStop(0,    "#c8d8f8");
    pg.addColorStop(0.35, "#8899dd");
    pg.addColorStop(0.7,  "#4455aa");
    pg.addColorStop(1,    "#1a2060");
    ctx.fillStyle = pg;
    ctx.beginPath(); ctx.arc(px, py, pr, 0, Math.PI * 2); ctx.fill();
    ctx.save(); ctx.translate(px, py); ctx.rotate(-0.2); ctx.scale(1, 0.25);
    [
      { ri: 1.1,  ro: 1.45, a: 0.35, r: 150, g: 160, b: 230 },
      { ri: 1.5,  ro: 1.8,  a: 0.22, r: 120, g: 135, b: 210 },
      { ri: 1.85, ro: 2.05, a: 0.13, r: 100, g: 115, b: 195 },
    ].forEach(({ ri, ro, a, r, g, b }) => {
      const rg = ctx.createRadialGradient(0, 0, pr * ri, 0, 0, pr * ro);
      rg.addColorStop(0,   `rgba(${r},${g},${b},0)`);
      rg.addColorStop(0.3, `rgba(${r},${g},${b},${a})`);
      rg.addColorStop(0.7, `rgba(${r},${g},${b},${a * 0.5})`);
      rg.addColorStop(1,   `rgba(${r},${g},${b},0)`);
      ctx.fillStyle = rg;
      ctx.beginPath(); ctx.arc(0, 0, pr * ro, 0, Math.PI * 2); ctx.fill();
    });
    ctx.restore();

    // Mars-like planet — mid left
    const p2x = 100, p2y = 500, p2r = 32;
    const p2atm = ctx.createRadialGradient(p2x, p2y, p2r, p2x, p2y, p2r * 2);
    p2atm.addColorStop(0, "rgba(180,60,30,0.2)");
    p2atm.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = p2atm;
    ctx.beginPath(); ctx.arc(p2x, p2y, p2r * 2, 0, Math.PI * 2); ctx.fill();
    const p2g = ctx.createRadialGradient(p2x - 8, p2y - 8, 3, p2x, p2y, p2r);
    p2g.addColorStop(0,   "#f09070");
    p2g.addColorStop(0.5, "#c04530");
    p2g.addColorStop(1,   "#501010");
    ctx.fillStyle = p2g;
    ctx.beginPath(); ctx.arc(p2x, p2y, p2r, 0, Math.PI * 2); ctx.fill();

    // Blue ice planet — bottom right
    const p3x = 1950, p3y = 850, p3r = 22;
    const p3g = ctx.createRadialGradient(p3x - 5, p3y - 5, 2, p3x, p3y, p3r);
    p3g.addColorStop(0,   "#aaddff");
    p3g.addColorStop(0.5, "#2266cc");
    p3g.addColorStop(1,   "#001144");
    ctx.fillStyle = p3g;
    ctx.beginPath(); ctx.arc(p3x, p3y, p3r, 0, Math.PI * 2); ctx.fill();

    // Vignette
    const vig = ctx.createRadialGradient(W / 2, H / 2, H * 0.2, W / 2, H / 2, H * 0.9);
    vig.addColorStop(0, "rgba(0,0,0,0)");
    vig.addColorStop(1, "rgba(0,0,5,0.7)");
    ctx.fillStyle = vig;
    ctx.fillRect(0, 0, W, H);

    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }, []);

  return (
    <mesh scale={[-1, 1, 1]}>
      <sphereGeometry args={[58, 64, 64]} />
      <meshBasicMaterial map={texture} side={THREE.BackSide} />
    </mesh>
  );
}

// ─── 3D star points ───────────────────────────────────────────────
function StarField() {
  const ref = useRef<THREE.Points>(null);
  const { positions, colors } = useMemo(() => {
    const count = 800;
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    const seed = (n: number) => {
      let x = Math.sin(n * 91.3) * 43758.5;
      return x - Math.floor(x);
    };
    for (let i = 0; i < count; i++) {
      const theta = seed(i * 2.3) * Math.PI * 2;
      const phi   = Math.acos(2 * seed(i * 3.7) - 1);
      const r     = 44 + seed(i * 5.1) * 10;
      pos[i * 3]     = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = r * Math.cos(phi);
      const b = 0.65 + seed(i * 4.3) * 0.35;
      col[i * 3] = b * 0.85; col[i * 3 + 1] = b * 0.90; col[i * 3 + 2] = b;
    }
    return { positions: pos, colors: col };
  }, []);
  useFrame((_, dt) => { if (ref.current) ref.current.rotation.y += dt * 0.002; });
  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" array={positions} count={positions.length / 3} itemSize={3} />
        <bufferAttribute attach="attributes-color"    array={colors}    count={colors.length / 3}    itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.08} vertexColors transparent opacity={0.7} sizeAttenuation />
    </points>
  );
}

// ─── RGB lights pinned to exact PC/monitor world positions ─────────
// Derived from GLB node data + room transform rotY(PI/4) pos[0,-1,0]
//   monitor:      world( 0.04, 0.69, -5.15)
//   gigabyte PC:  world(-0.64, 0.47, -4.39)
//   left wall:    world(-1.10, 0.47, -3.93)
//   under desk:   world(-0.39,-0.10, -4.64)
function RGBLights() {
  const r1 = useRef<THREE.PointLight>(null);
  const r2 = useRef<THREE.PointLight>(null);
  const r3 = useRef<THREE.PointLight>(null);
  const r4 = useRef<THREE.PointLight>(null);
  const t  = useRef(0);

  useFrame((_, dt) => {
    t.current += dt * 0.5;
    const s = t.current;
    r1.current?.color.setHSL((s * 0.07)         % 1, 1, 0.5);
    r2.current?.color.setHSL(((s * 0.07) + 0.25) % 1, 1, 0.5);
    r3.current?.color.setHSL(((s * 0.07) + 0.5)  % 1, 1, 0.5);
    r4.current?.color.setHSL(((s * 0.07) + 0.75) % 1, 1, 0.5);
  });

  return (
    <>
      {/* Behind monitor screen */}
      <pointLight ref={r1} position={[ 0.04, 1.4, -5.15]} intensity={5}   distance={3.0} decay={2} color="#ff00aa" />
      {/* PC tower RGB glow */}
      <pointLight ref={r2} position={[-0.64, 0.9, -4.39]} intensity={4}   distance={2.5} decay={2} color="#00aaff" />
      {/* Left wall wash near desk */}
      <pointLight ref={r3} position={[-1.10, 1.2, -3.93]} intensity={3.5} distance={3.0} decay={2} color="#aa00ff" />
      {/* Under-desk strip */}
      <pointLight ref={r4} position={[-0.39, 0.1, -4.64]} intensity={3}   distance={2.5} decay={2} color="#00ffcc" />
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
      const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
      mats.forEach((mat) => {
        const m = mat as THREE.MeshStandardMaterial;
        if (m.map) m.map.colorSpace = THREE.SRGBColorSpace;
        m.envMapIntensity = 0.05;
        if (m.name === "black_wall") {
          m.color = new THREE.Color(0x080808); m.roughness = 0.9; m.metalness = 0;
          m.map = null; m.normalMap = null; m.roughnessMap = null; m.aoMap = null;
          m.needsUpdate = true;
        }
        if (mesh.name === "Plane.003") {
          m.color = new THREE.Color(0x080808); m.roughness = 0.9; m.metalness = 0;
          m.map = null; m.normalMap = null; m.roughnessMap = null; m.aoMap = null;
          m.needsUpdate = true;
        }
        if (m.name === "Glass_material") {
          m.transparent = true; m.opacity = 0.3; m.roughness = 0.05; m.metalness = 0.1;
          m.color = new THREE.Color(0x88aacc); m.map = null;
          m.emissive = new THREE.Color(0x000000); m.emissiveIntensity = 0; m.emissiveMap = null;
          m.side = THREE.DoubleSide;
          (m as THREE.MeshPhysicalMaterial).transmission = 0;
          m.needsUpdate = true;
        }
      });
      if (mesh.name === "Handle.005") {
        mesh.material = new THREE.MeshBasicMaterial({ color: 0x080808 });
      }
      mesh.castShadow = true;
      mesh.receiveShadow = true;
    });
  }, [scene]);
  return (
    <primitive object={scene} scale={1} position={[0, -1, 0]} rotation={[0, Math.PI / 4, 0]} />
  );
}

// ─── Main export ──────────────────────────────────────────────────
export default function Room3D({ isVisible = true, onBack }: { isVisible?: boolean; onBack?: () => void }) {
  const { progress } = useProgress();
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[100]" style={{ width: "100vw", height: "100vh", background: "#000510" }}>
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
        <color attach="background" args={["#000510"]} />
        <SkyDome />
        <StarField />
        <ambientLight intensity={0.4} />
        <spotLight position={[0, 8, 0]} angle={0.5} penumbra={1} intensity={1.2} castShadow shadow-mapSize={[1024, 1024]} />
        <directionalLight position={[3, 6, 3]} intensity={0.3} />
        <directionalLight position={[-3, 6, -3]} intensity={0.2} />
        <RGBLights />
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
      </Canvas>
    </div>
  );
}