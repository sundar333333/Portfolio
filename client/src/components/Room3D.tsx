import { Suspense, useEffect, useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, useGLTF, Environment, useProgress } from "@react-three/drei";
import * as THREE from "three";

const MODEL_URL = "https://rgd8w4vqllunko1j.public.blob.vercel-storage.com/3DRoomorginal1.compressed.glb";

// ─── Deep real-space sky dome ─────────────────────────────────────
function SkyDome() {
  const texture = useMemo(() => {
    const W = 2048, H = 1024;
    const canvas = document.createElement("canvas");
    canvas.width = W; canvas.height = H;
    const ctx = canvas.getContext("2d")!;

    // Near-black deep space base
    ctx.fillStyle = "#000816";
    ctx.fillRect(0, 0, W, H);

    // Dark blue depth zones — subtle, not bright
    const zone = (x: number, y: number, r: number, ri: number, gi: number, bi: number, a: number) => {
      const g = ctx.createRadialGradient(x, y, 0, x, y, r);
      g.addColorStop(0, `rgba(${ri},${gi},${bi},${a})`);
      g.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);
    };

    // Deep blue zones matching reference image
    zone(512,  200, 500,  5, 18, 70,  0.65);
    zone(1024, 100, 650,  3, 12, 55,  0.55);
    zone(300,  600, 400,  4, 10, 45,  0.45);
    zone(1600, 400, 500,  6, 15, 65,  0.5);
    zone(900,  700, 380,  5, 14, 50,  0.42);
    zone(1800, 800, 300,  4, 10, 40,  0.38);
    zone(100,  300, 350,  3, 8,  35,  0.4);

    // Faint horizontal milky way smear
    const mw = ctx.createLinearGradient(0, 380, 0, 620);
    mw.addColorStop(0,   "rgba(0,0,0,0)");
    mw.addColorStop(0.5, "rgba(8,14,42,0.2)");
    mw.addColorStop(1,   "rgba(0,0,0,0)");
    ctx.fillStyle = mw;
    ctx.fillRect(0, 0, W, H);

    // Very faint nebula colour hints (barely visible like real space)
    zone(700,  250, 280, 30, 5,  60,  0.12);
    zone(1400, 350, 240, 5,  20, 55,  0.1);
    zone(400,  500, 200, 50, 8,  40,  0.1);

    // Stars — realistic varied sizes and brightness
    const seed = (n: number) => {
      let x = Math.sin(n * 127.1) * 43758.5453;
      return x - Math.floor(x);
    };

    // Layer 1: many dim tiny stars
    for (let i = 0; i < 2500; i++) {
      const sx = seed(i * 3.1) * W;
      const sy = seed(i * 7.3) * H;
      const bright = 80 + seed(i * 4.1) * 80;
      const alpha  = 0.3 + seed(i * 6.2) * 0.4;
      ctx.fillStyle = `rgba(${bright},${bright},${Math.min(255, bright + 20)},${alpha})`;
      ctx.fillRect(sx, sy, 1, 1);
    }

    // Layer 2: medium stars
    for (let i = 0; i < 400; i++) {
      const sx = seed(i * 5.7 + 1) * W;
      const sy = seed(i * 2.9 + 1) * H;
      const bright = 150 + seed(i * 8.3) * 105;
      const alpha  = 0.5 + seed(i * 3.4) * 0.5;
      const rb = Math.max(0, bright - seed(i * 11.1) * 40);
      ctx.fillStyle = `rgba(${rb},${rb},${bright},${alpha})`;
      ctx.fillRect(sx - 0.5, sy - 0.5, 1.5, 1.5);
    }

    // Layer 3: bright stars with soft glow
    for (let i = 0; i < 60; i++) {
      const sx = seed(i * 9.1 + 2) * W;
      const sy = seed(i * 4.7 + 2) * H;
      const bright = 210 + seed(i * 6.1) * 45;
      // Glow halo
      const glow = ctx.createRadialGradient(sx, sy, 0, sx, sy, 4);
      glow.addColorStop(0,   `rgba(${bright},${bright},255,0.8)`);
      glow.addColorStop(0.4, `rgba(${bright},${bright},255,0.3)`);
      glow.addColorStop(1,   "rgba(0,0,0,0)");
      ctx.fillStyle = glow;
      ctx.fillRect(sx - 4, sy - 4, 8, 8);
      // Core
      ctx.fillStyle = `rgba(255,255,255,0.95)`;
      ctx.fillRect(sx, sy, 1, 1);
    }

    // Saturn planet — top right corner
    const px = 1760, py = 95, pr = 52;
    // Atmosphere
    const atm = ctx.createRadialGradient(px, py, pr, px, py, pr * 2.4);
    atm.addColorStop(0, "rgba(50,70,160,0.22)");
    atm.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = atm;
    ctx.beginPath(); ctx.arc(px, py, pr * 2.4, 0, Math.PI * 2); ctx.fill();
    // Body
    const pbg = ctx.createRadialGradient(px - 14, py - 14, 3, px, py, pr);
    pbg.addColorStop(0,    "#d0dcf8");
    pbg.addColorStop(0.3,  "#8899dd");
    pbg.addColorStop(0.65, "#4455aa");
    pbg.addColorStop(1,    "#1a2060");
    ctx.fillStyle = pbg;
    ctx.beginPath(); ctx.arc(px, py, pr, 0, Math.PI * 2); ctx.fill();
    // Rings
    ctx.save(); ctx.translate(px, py); ctx.rotate(-0.2); ctx.scale(1, 0.25);
    [
      { ri: 1.1,  ro: 1.42, a: 0.32, r: 150, g: 162, b: 228 },
      { ri: 1.48, ro: 1.78, a: 0.2,  r: 120, g: 135, b: 210 },
      { ri: 1.82, ro: 2.02, a: 0.12, r: 100, g: 115, b: 195 },
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

    // Mars-like rocky planet — left side
    const p2x = 90, p2y = 480, p2r = 30;
    const p2a = ctx.createRadialGradient(p2x, p2y, p2r, p2x, p2y, p2r * 1.9);
    p2a.addColorStop(0, "rgba(180,55,25,0.18)"); p2a.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = p2a; ctx.beginPath(); ctx.arc(p2x, p2y, p2r * 1.9, 0, Math.PI * 2); ctx.fill();
    const p2g = ctx.createRadialGradient(p2x - 8, p2y - 8, 2, p2x, p2y, p2r);
    p2g.addColorStop(0, "#f09870"); p2g.addColorStop(0.5, "#c04530"); p2g.addColorStop(1, "#4a1010");
    ctx.fillStyle = p2g; ctx.beginPath(); ctx.arc(p2x, p2y, p2r, 0, Math.PI * 2); ctx.fill();

    // Vignette edges — dark corners like reference
    const vig = ctx.createRadialGradient(W / 2, H / 2, H * 0.18, W / 2, H / 2, H * 0.85);
    vig.addColorStop(0, "rgba(0,0,0,0)");
    vig.addColorStop(1, "rgba(0,0,10,0.75)");
    ctx.fillStyle = vig; ctx.fillRect(0, 0, W, H);

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

// ─── Subtle 3D star points ────────────────────────────────────────
function StarField() {
  const ref = useRef<THREE.Points>(null);
  const { positions, colors } = useMemo(() => {
    const count = 600;
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    const seed = (n: number) => { let x = Math.sin(n * 91.3) * 43758.5; return x - Math.floor(x); };
    for (let i = 0; i < count; i++) {
      const theta = seed(i * 2.3) * Math.PI * 2;
      const phi   = Math.acos(2 * seed(i * 3.7) - 1);
      const r     = 45 + seed(i * 5.1) * 8;
      pos[i * 3]     = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = r * Math.cos(phi);
      const b = 0.6 + seed(i * 4.3) * 0.4;
      col[i * 3] = b * 0.82; col[i * 3 + 1] = b * 0.88; col[i * 3 + 2] = b;
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
      <pointsMaterial size={0.07} vertexColors transparent opacity={0.65} sizeAttenuation />
    </points>
  );
}

// ─── RGB lights — LEFT WALL behind monitor only ───────────────────
// From GLB analysis + room rotY(PI/4) + pos[0,-1,0]:
//   Monitor world:    ( 0.04,  0.69, -5.15)
//   PC tower world:   (-0.64,  0.47, -4.39)
//   Messi/right wall: ( 3.55,  1.75, -2.08)  ← must NOT light this
function RGBLights() {
  const r1 = useRef<THREE.PointLight>(null); // behind monitor screen
  const r2 = useRef<THREE.PointLight>(null); // PC tower
  const r3 = useRef<THREE.PointLight>(null); // left wall strip
  const r4 = useRef<THREE.PointLight>(null); // under desk
  const t  = useRef(0);

  useFrame((_, dt) => {
    t.current += dt * 0.45;
    const s = t.current;
    r1.current?.color.setHSL((s * 0.06)         % 1, 1, 0.5);
    r2.current?.color.setHSL(((s * 0.06) + 0.25) % 1, 1, 0.5);
    r3.current?.color.setHSL(((s * 0.06) + 0.5)  % 1, 1, 0.5);
    r4.current?.color.setHSL(((s * 0.06) + 0.75) % 1, 1, 0.5);
  });

  return (
    <>
      {/* Behind monitor — left wall cluster, z ~ -5 */}
      <pointLight ref={r1} position={[ 0.41, 1.5, -5.53]} intensity={5}   distance={2.5} decay={2.5} color="#ff00aa" />
      {/* PC tower glow */}
      <pointLight ref={r2} position={[-0.53, 0.8, -4.49]} intensity={4}   distance={2.0} decay={2.5} color="#00aaff" />
      {/* Left wall LED strip */}
      <pointLight ref={r3} position={[-0.71, 1.2, -4.95]} intensity={3.5} distance={2.5} decay={2.5} color="#aa00ff" />
      {/* Under desk floor glow */}
      <pointLight ref={r4} position={[-0.28, 0.0, -4.53]} intensity={3}   distance={2.0} decay={2.5} color="#00ffcc" />
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
      if (mesh.name === "Handle.005") mesh.material = new THREE.MeshBasicMaterial({ color: 0x080808 });
      mesh.castShadow = true; mesh.receiveShadow = true;
    });
  }, [scene]);
  return <primitive object={scene} scale={1} position={[0, -1, 0]} rotation={[0, Math.PI / 4, 0]} />;
}

// ─── Main export ──────────────────────────────────────────────────
export default function Room3D({ isVisible = true, onBack }: { isVisible?: boolean; onBack?: () => void }) {
  const { progress } = useProgress();
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[100]" style={{ width: "100vw", height: "100vh", background: "#000816" }}>
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
      >← Back</button>

      {progress < 100 && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white z-[110] bg-black">
          <div className="w-48 h-1 bg-white/20 rounded-full mb-4 overflow-hidden">
            <div className="h-full bg-blue-500 transition-all duration-300" style={{ width: `${progress}%` }} />
          </div>
          <p className="text-sm tracking-widest uppercase">Building Room... {Math.round(progress)}%</p>
        </div>
      )}

      <Canvas camera={{ position: [5, 5, 5], fov: 45 }} shadows
        gl={{ toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 0.7, outputColorSpace: THREE.SRGBColorSpace, powerPreference: "high-performance" }}>
        <color attach="background" args={["#000816"]} />
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
        <OrbitControls makeDefault enableDamping minDistance={2} maxDistance={20}
          minPolarAngle={Math.PI / 6} maxPolarAngle={Math.PI / 2.2}
          minAzimuthAngle={Math.PI / 6} maxAzimuthAngle={Math.PI * 0.75} />
      </Canvas>
    </div>
  );
}