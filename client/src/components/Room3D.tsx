import { Suspense, useEffect, useRef, useMemo } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, useGLTF, Environment, useProgress } from "@react-three/drei";
import * as THREE from "three";

const MODEL_URL = "https://rgd8w4vqllunko1j.public.blob.vercel-storage.com/3DRoomorginal1.compressed.glb";

function SkyDome() {
  const texture = useMemo(() => {
    const W = 2048, H = 1024;
    const canvas = document.createElement("canvas");
    canvas.width = W; canvas.height = H;
    const ctx = canvas.getContext("2d")!;

    // Deep blue base
    const base = ctx.createLinearGradient(0, 0, 0, H);
    base.addColorStop(0,   "#020d2e");
    base.addColorStop(0.3, "#031240");
    base.addColorStop(0.6, "#020e35");
    base.addColorStop(1,   "#010a22");
    ctx.fillStyle = base;
    ctx.fillRect(0, 0, W, H);

    // Horizontal depth
    const horiz = ctx.createLinearGradient(0, 0, W, 0);
    horiz.addColorStop(0,   "rgba(2,8,40,0.5)");
    horiz.addColorStop(0.4, "rgba(5,20,70,0.3)");
    horiz.addColorStop(0.6, "rgba(5,20,70,0.3)");
    horiz.addColorStop(1,   "rgba(2,8,40,0.5)");
    ctx.fillStyle = horiz;
    ctx.fillRect(0, 0, W, H);

    // Blue nebula glow zones
    const glow = (x: number, y: number, r: number, ri: number, gi: number, bi: number, a: number) => {
      const g = ctx.createRadialGradient(x, y, 0, x, y, r);
      g.addColorStop(0,   `rgba(${ri},${gi},${bi},${a})`);
      g.addColorStop(0.5, `rgba(${ri},${gi},${bi},${a * 0.4})`);
      g.addColorStop(1,   "rgba(0,0,0,0)");
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    };
    glow(500,  150, 500, 10, 40, 140, 0.55);
    glow(1200, 200, 600,  8, 35, 130, 0.5);
    glow(800,  600, 450, 12, 45, 150, 0.45);
    glow(200,  500, 380,  6, 25, 110, 0.4);
    glow(1700, 700, 420, 10, 38, 135, 0.42);
    glow(1000, 400, 350, 15, 55, 160, 0.35);

    // Milky way band
    const mw = ctx.createLinearGradient(0, 350, 0, 680);
    mw.addColorStop(0,   "rgba(0,0,0,0)");
    mw.addColorStop(0.4, "rgba(10,30,90,0.2)");
    mw.addColorStop(0.6, "rgba(10,30,90,0.2)");
    mw.addColorStop(1,   "rgba(0,0,0,0)");
    ctx.fillStyle = mw; ctx.fillRect(0, 0, W, H);

    const seed = (n: number) => {
      let x = Math.sin(n * 127.1) * 43758.5453;
      return x - Math.floor(x);
    };

    // Helper — draw a perfect round star using arc (NOT fillRect)
    const drawStar = (
      sx: number, sy: number, radius: number,
      r: number, g: number, b: number, alpha: number,
      glowRadius = 0
    ) => {
      // Optional soft glow halo
      if (glowRadius > 0) {
        const halo = ctx.createRadialGradient(sx, sy, 0, sx, sy, glowRadius);
        halo.addColorStop(0,   `rgba(${r},${g},${b},${alpha * 0.5})`);
        halo.addColorStop(0.5, `rgba(${r},${g},${b},${alpha * 0.15})`);
        halo.addColorStop(1,   "rgba(0,0,0,0)");
        ctx.fillStyle = halo;
        ctx.beginPath();
        ctx.arc(sx, sy, glowRadius, 0, Math.PI * 2);
        ctx.fill();
      }
      // Solid round core
      ctx.fillStyle = `rgba(${r},${g},${b},${alpha})`;
      ctx.beginPath();
      ctx.arc(sx, sy, radius, 0, Math.PI * 2);
      ctx.fill();
    };

    // Tier 1 — 2500 tiny round dots (radius 0.6–0.9)
    for (let i = 0; i < 2500; i++) {
      const sx  = seed(i * 3.1) * W;
      const sy  = seed(i * 7.3) * H;
      const br  = 170 + seed(i * 4.1) * 85;
      const al  = 0.45 + seed(i * 6.2) * 0.45;
      const rad = 0.5 + seed(i * 2.1) * 0.4;
      drawStar(sx, sy, rad, br, br, Math.min(255, br + 25), al);
    }

    // Tier 2 — 500 medium round stars (radius 1–1.5)
    for (let i = 0; i < 500; i++) {
      const sx  = seed(i * 5.7 + 100) * W;
      const sy  = seed(i * 2.9 + 100) * H;
      const br  = 200 + seed(i * 8.3) * 55;
      const al  = 0.65 + seed(i * 3.4) * 0.35;
      const rad = 0.9 + seed(i * 4.1) * 0.6;
      drawStar(sx, sy, rad, Math.max(180, br - 15), Math.max(185, br - 10), br, al);
    }

    // Tier 3 — 80 bright stars with round glow halo (radius 1.5–2)
    for (let i = 0; i < 80; i++) {
      const sx  = seed(i * 9.1 + 200) * W;
      const sy  = seed(i * 4.7 + 200) * H;
      const br  = 230 + seed(i * 6.1) * 25;
      const rad = 1.4 + seed(i * 3.3) * 0.6;
      drawStar(sx, sy, rad, br, br, 255, 0.95, rad * 5);
    }

    // Saturn — large, top right near window area
    const px = 1580, py = 160, pr = 80;
    const satAtm = ctx.createRadialGradient(px, py, pr * 0.8, px, py, pr * 3);
    satAtm.addColorStop(0,   "rgba(100,130,220,0.3)");
    satAtm.addColorStop(0.5, "rgba(60,90,180,0.12)");
    satAtm.addColorStop(1,   "rgba(0,0,0,0)");
    ctx.fillStyle = satAtm;
    ctx.beginPath(); ctx.arc(px, py, pr * 3, 0, Math.PI * 2); ctx.fill();

    const satBody = ctx.createRadialGradient(px - 22, py - 22, 5, px, py, pr);
    satBody.addColorStop(0,    "#dde8ff");
    satBody.addColorStop(0.2,  "#aabbee");
    satBody.addColorStop(0.5,  "#7788cc");
    satBody.addColorStop(0.75, "#4455aa");
    satBody.addColorStop(1,    "#1a2060");
    ctx.fillStyle = satBody;
    ctx.beginPath(); ctx.arc(px, py, pr, 0, Math.PI * 2); ctx.fill();

    // Surface bands
    ctx.save();
    ctx.beginPath(); ctx.arc(px, py, pr, 0, Math.PI * 2); ctx.clip();
    [
      { y: -0.3, h: 0.12, a: 0.12 },
      { y: -0.1, h: 0.08, a: 0.08 },
      { y:  0.1, h: 0.1,  a: 0.1  },
      { y:  0.3, h: 0.07, a: 0.06 },
    ].forEach(({ y, h, a }) => {
      ctx.fillStyle = `rgba(80,100,180,${a})`;
      ctx.fillRect(px - pr, py + y * pr, pr * 2, h * pr);
    });
    ctx.restore();

    // Rings
    ctx.save();
    ctx.translate(px, py); ctx.rotate(-0.18); ctx.scale(1, 0.28);
    [
      { ri: 1.15, ro: 1.55, a: 0.5,  r: 180, g: 190, b: 240 },
      { ri: 1.60, ro: 2.00, a: 0.35, r: 150, g: 165, b: 220 },
      { ri: 2.05, ro: 2.35, a: 0.2,  r: 120, g: 138, b: 205 },
    ].forEach(({ ri, ro, a, r, g, b }) => {
      const rg = ctx.createRadialGradient(0, 0, pr * ri, 0, 0, pr * ro);
      rg.addColorStop(0,   `rgba(${r},${g},${b},0)`);
      rg.addColorStop(0.2, `rgba(${r},${g},${b},${a})`);
      rg.addColorStop(0.8, `rgba(${r},${g},${b},${a * 0.7})`);
      rg.addColorStop(1,   `rgba(${r},${g},${b},0)`);
      ctx.fillStyle = rg;
      ctx.beginPath(); ctx.arc(0, 0, pr * ro, 0, Math.PI * 2); ctx.fill();
    });
    ctx.restore();

    // Mars — left side
    const mx = 90, my = 500, mr = 32;
    const matm = ctx.createRadialGradient(mx, my, mr, mx, my, mr * 2.2);
    matm.addColorStop(0, "rgba(180,60,25,0.22)");
    matm.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = matm;
    ctx.beginPath(); ctx.arc(mx, my, mr * 2.2, 0, Math.PI * 2); ctx.fill();
    const mbody = ctx.createRadialGradient(mx - 9, my - 9, 2, mx, my, mr);
    mbody.addColorStop(0,   "#f5a080");
    mbody.addColorStop(0.4, "#d05535");
    mbody.addColorStop(1,   "#4a1010");
    ctx.fillStyle = mbody;
    ctx.beginPath(); ctx.arc(mx, my, mr, 0, Math.PI * 2); ctx.fill();

    // Vignette
    const vig = ctx.createRadialGradient(W / 2, H / 2, H * 0.15, W / 2, H / 2, H * 0.85);
    vig.addColorStop(0, "rgba(0,0,0,0)");
    vig.addColorStop(1, "rgba(0,0,20,0.7)");
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

// ─── Star field ───────────────────────────────────────────────────
function StarField() {
  const ref = useRef<THREE.Points>(null);
  const { positions, colors } = useMemo(() => {
    const count = 700;
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    const seed = (n: number) => { let x = Math.sin(n * 91.3) * 43758.5; return x - Math.floor(x); };
    for (let i = 0; i < count; i++) {
      const theta = seed(i * 2.3) * Math.PI * 2;
      const phi   = Math.acos(2 * seed(i * 3.7) - 1);
      const r     = 46 + seed(i * 5.1) * 8;
      pos[i * 3]     = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = r * Math.cos(phi);
      const b = 0.75 + seed(i * 4.3) * 0.25;
      col[i * 3] = b * 0.85; col[i * 3 + 1] = b * 0.9; col[i * 3 + 2] = b;
    }
    return { positions: pos, colors: col };
  }, []);
  useFrame((_, dt) => { if (ref.current) ref.current.rotation.y += dt * 0.0015; });
  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" array={positions} count={positions.length / 3} itemSize={3} />
        <bufferAttribute attach="attributes-color"    array={colors}    count={colors.length / 3}    itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.08} vertexColors transparent opacity={0.85} sizeAttenuation />
    </points>
  );
}

// ─── RGB lights ───────────────────────────────────────────────────
function RGBLights() {
  const { scene } = useThree();
  const r1 = useRef<THREE.PointLight>(null);
  const r2 = useRef<THREE.PointLight>(null);
  const r3 = useRef<THREE.PointLight>(null);
  const t  = useRef(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      scene.traverse((obj) => {
        const name = obj.name.toLowerCase();
        if (name.includes("cube.049") || name.includes("cube049")) {
          const mp = new THREE.Vector3();
          obj.getWorldPosition(mp);
          if (r1.current && r2.current && r3.current) {
            r1.current.position.set(mp.x - 1.4, mp.y + 0.1, mp.z - 0.3);
            r2.current.position.set(mp.x - 1.6, mp.y + 0.4, mp.z - 0.4);
            r3.current.position.set(mp.x - 1.2, mp.y - 0.2, mp.z - 0.2);
          }
        }
      });
    }, 3000);
    return () => clearTimeout(timer);
  }, [scene]);

  useFrame((_, dt) => {
    t.current += dt * 0.45;
    const s = t.current;
    r1.current?.color.setHSL((s * 0.06) % 1, 1, 0.5);
    r2.current?.color.setHSL(((s * 0.06) + 0.33) % 1, 1, 0.5);
    r3.current?.color.setHSL(((s * 0.06) + 0.66) % 1, 1, 0.5);
  });

  return (
    <>
      <pointLight ref={r1} position={[0,0,0]} intensity={5}   distance={1.5} decay={3} color="#ff00aa" />
      <pointLight ref={r2} position={[0,0,0]} intensity={4}   distance={1.3} decay={3} color="#00aaff" />
      <pointLight ref={r3} position={[0,0,0]} intensity={3.5} distance={1.2} decay={3} color="#aa00ff" />
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
          m.transparent = true; m.opacity = 0.15; m.roughness = 0.0; m.metalness = 0.0;
          m.color = new THREE.Color(0xaaccff); m.map = null;
          m.emissive = new THREE.Color(0x000000); m.emissiveIntensity = 0; m.emissiveMap = null;
          m.side = THREE.DoubleSide;
          (m as THREE.MeshPhysicalMaterial).transmission = 0;
          m.needsUpdate = true;
        }
      });
      if (mesh.name === "Handle.005") {
        mesh.material = new THREE.MeshBasicMaterial({ color: 0x080808 });
      }
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
    <div className="fixed inset-0 z-[100]" style={{ width: "100vw", height: "100vh", background: "#020d2e" }}>
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
        <color attach="background" args={["#020d2e"]} />
        <SkyDome />
        <StarField />
        <ambientLight intensity={0.4} />
        <spotLight position={[0, 8, 0]} angle={0.5} penumbra={1} intensity={1.2}
          castShadow shadow-mapSize={[1024, 1024]} />
        <directionalLight position={[3, 6, 3]} intensity={0.3} />
        <directionalLight position={[-3, 6, -3]} intensity={0.2} />
        <RGBLights />
        <Suspense fallback={null}>
          <RoomModel />
          <Environment preset="apartment" />
        </Suspense>
        <OrbitControls
          makeDefault enableDamping
          minDistance={2} maxDistance={20}
          minPolarAngle={Math.PI / 6} maxPolarAngle={Math.PI / 2.2}
          minAzimuthAngle={Math.PI / 6} maxAzimuthAngle={Math.PI * 0.75}
        />
      </Canvas>
    </div>
  );
}