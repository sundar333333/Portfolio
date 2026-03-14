import { Suspense, useEffect, useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, useGLTF, Environment, useProgress } from "@react-three/drei";
import * as THREE from "three";

const MODEL_URL = "https://rgd8w4vqllunko1j.public.blob.vercel-storage.com/3DRoomorginal1.compressed.glb";

// ─── Cosmic nebula sky dome ───────────────────────────────────────
function SkyDome() {
  const texture = useMemo(() => {
    const W = 2048, H = 1024;
    const canvas = document.createElement("canvas");
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext("2d")!;

    // Deep space base
    const base = ctx.createLinearGradient(0, 0, W, H);
    base.addColorStop(0,    "#010510");
    base.addColorStop(0.2,  "#02071a");
    base.addColorStop(0.5,  "#030c22");
    base.addColorStop(0.8,  "#020818");
    base.addColorStop(1,    "#010510");
    ctx.fillStyle = base;
    ctx.fillRect(0, 0, W, H);

    // Helper: soft radial nebula blob
    const blob = (
      x: number, y: number, rx: number, ry: number,
      r: number, g: number, b: number, alpha: number, angle = 0
    ) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(angle);
      ctx.scale(rx / 260, ry / 260);
      const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, 260);
      grad.addColorStop(0,    `rgba(${r},${g},${b},${alpha})`);
      grad.addColorStop(0.35, `rgba(${r},${g},${b},${alpha * 0.7})`);
      grad.addColorStop(0.7,  `rgba(${r},${g},${b},${alpha * 0.25})`);
      grad.addColorStop(1,    `rgba(${r},${g},${b},0)`);
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(0, 0, 260, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    };

    // Deep blue base clouds
    blob(400,  300, 600, 350, 10,  40, 120, 0.55,  0.2);
    blob(900,  200, 700, 400, 8,   30, 110, 0.5,  -0.1);
    blob(1500, 400, 580, 320, 12,  35, 130, 0.45,  0.3);
    blob(600,  700, 500, 300, 5,   25, 100, 0.4,  -0.2);
    blob(1800, 700, 480, 280, 10,  28, 115, 0.4,   0.1);

    // Cyan/teal clouds (top-centre)
    blob(750,  180, 480, 300, 0,   200, 240, 0.6,   0.15);
    blob(620,  120, 360, 220, 10,  180, 220, 0.55, -0.1);
    blob(900,  250, 400, 250, 5,   170, 210, 0.5,   0.2);
    blob(1050, 160, 340, 200, 20,  190, 230, 0.45,  0.0);
    blob(500,  200, 300, 180, 0,   160, 200, 0.4,  -0.2);

    // Pink/magenta clouds (left diagonal)
    blob(220,  350, 440, 280, 230, 40,  160, 0.65,  0.3);
    blob(350,  500, 380, 240, 210, 30,  140, 0.6,   0.1);
    blob(150,  480, 320, 200, 200, 20,  130, 0.55, -0.1);
    blob(480,  620, 360, 220, 220, 50,  150, 0.5,   0.2);
    blob(280,  700, 300, 180, 215, 35,  145, 0.45, -0.15);
    blob(100,  280, 260, 160, 240, 60,  170, 0.4,   0.0);

    // Hot pink right side
    blob(1750, 350, 420, 260, 220, 30,  130, 0.6,  -0.2);
    blob(1900, 500, 360, 220, 210, 25,  120, 0.55,  0.15);
    blob(1600, 550, 380, 240, 215, 40,  140, 0.5,  -0.1);
    blob(1850, 200, 300, 180, 200, 20,  110, 0.45,  0.0);

    // Gold/amber bottom-left
    blob(300,  820, 380, 240, 200, 145, 25,  0.55,  0.1);
    blob(180,  720, 320, 200, 185, 130, 20,  0.5,  -0.1);
    blob(480,  880, 300, 180, 210, 155, 30,  0.45,  0.2);
    blob(650,  900, 260, 160, 195, 140, 22,  0.4,   0.0);

    // Purple/indigo deep fills
    blob(1350, 300, 420, 280, 90,  20,  180, 0.5,   0.1);
    blob(1550, 500, 360, 240, 70,  15,  160, 0.45, -0.2);
    blob(1200, 600, 380, 240, 100, 25,  190, 0.4,   0.15);
    blob(1700, 800, 320, 200, 80,  18,  170, 0.38, -0.1);

    // Bright white-cyan core glow
    blob(720,  200, 200, 140, 150, 230, 255, 0.75,  0.0);
    blob(740,  185, 120, 90,  210, 250, 255, 0.65,  0.0);
    blob(760,  175, 70,  50,  240, 255, 255, 0.55,  0.0);

    // Diagonal cyan wisp streak
    for (let i = 0; i < 8; i++) {
      const t = i / 7;
      blob(100 + t * 650, 400 - t * 220, 180 - t * 40, 80, 20, 180, 230, 0.2 + t * 0.15, -0.4);
    }
    // Pink streak left diagonal
    for (let i = 0; i < 6; i++) {
      const t = i / 5;
      blob(80 + t * 400, 200 + t * 400, 160, 70, 220, 40, 150, 0.18 + t * 0.1, 0.6);
    }

    // Stars (deterministic)
    const seed = (n: number) => {
      let x = Math.sin(n * 127.1) * 43758.5453;
      return x - Math.floor(x);
    };
    for (let i = 0; i < 2200; i++) {
      const sx = seed(i * 3.1) * W;
      const sy = seed(i * 7.3) * H;
      const size = seed(i * 2.7) < 0.04 ? 2.5 : seed(i * 5.9) < 0.15 ? 1.5 : 1;
      const bright = Math.floor(160 + seed(i * 4.1) * 95);
      ctx.fillStyle = `rgba(${bright},${bright},${Math.min(255, bright + 15)},${0.5 + seed(i * 6.2) * 0.5})`;
      ctx.fillRect(sx, sy, size, size);
    }

    // Sparkle stars
    const sparkle = (x: number, y: number, len: number, alpha: number) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.globalAlpha = alpha;
      ctx.fillStyle = "#ffffff";
      for (let a = 0; a < 4; a++) {
        ctx.save();
        ctx.rotate((a * Math.PI) / 4);
        ctx.beginPath();
        ctx.moveTo(0, -len); ctx.lineTo(1.5, 0);
        ctx.lineTo(0, len);  ctx.lineTo(-1.5, 0);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      }
      ctx.restore();
    };
    sparkle(1920, 90,  18, 0.9);
    sparkle(420,  110, 13, 0.8);
    sparkle(1100, 480, 9,  0.75);
    sparkle(seed(1) * W, seed(2) * H * 0.5, 20, 0.95);
    sparkle(seed(3) * W, seed(4) * H * 0.5, 14, 0.85);

    // Saturn planet (top right)
    const px = 1780, py = 115, pr = 58;
    const atmGrad = ctx.createRadialGradient(px, py, pr * 0.8, px, py, pr * 2.2);
    atmGrad.addColorStop(0, "rgba(80,100,200,0.25)");
    atmGrad.addColorStop(1, "rgba(20,40,140,0)");
    ctx.fillStyle = atmGrad;
    ctx.beginPath(); ctx.arc(px, py, pr * 2.2, 0, Math.PI * 2); ctx.fill();
    const planetGrad = ctx.createRadialGradient(px - 14, py - 14, 5, px, py, pr);
    planetGrad.addColorStop(0,    "#c0ccee");
    planetGrad.addColorStop(0.3,  "#7788cc");
    planetGrad.addColorStop(0.65, "#4455aa");
    planetGrad.addColorStop(1,    "#1a2060");
    ctx.fillStyle = planetGrad;
    ctx.beginPath(); ctx.arc(px, py, pr, 0, Math.PI * 2); ctx.fill();
    ctx.save();
    ctx.translate(px, py); ctx.rotate(-0.22); ctx.scale(1, 0.26);
    [
      { ri: 1.12, ro: 1.42, a: 0.38, r: 140, g: 155, b: 220 },
      { ri: 1.45, ro: 1.72, a: 0.28, r: 110, g: 130, b: 200 },
      { ri: 1.75, ro: 1.98, a: 0.18, r: 90,  g: 110, b: 185 },
    ].forEach(({ ri, ro, a, r, g, b }) => {
      const rg = ctx.createRadialGradient(0, 0, pr * ri, 0, 0, pr * ro);
      rg.addColorStop(0,   `rgba(${r},${g},${b},0)`);
      rg.addColorStop(0.3, `rgba(${r},${g},${b},${a})`);
      rg.addColorStop(0.7, `rgba(${r},${g},${b},${a * 0.6})`);
      rg.addColorStop(1,   `rgba(${r},${g},${b},0)`);
      ctx.fillStyle = rg;
      ctx.beginPath(); ctx.arc(0, 0, pr * ro, 0, Math.PI * 2); ctx.fill();
    });
    ctx.restore();

    // Small red planet (mid-left)
    const p2x = 120, p2y = 600, p2r = 28;
    const p2Grad = ctx.createRadialGradient(p2x - 6, p2y - 6, 3, p2x, p2y, p2r);
    p2Grad.addColorStop(0, "#ee9988");
    p2Grad.addColorStop(0.5, "#cc5544");
    p2Grad.addColorStop(1, "#441122");
    ctx.fillStyle = p2Grad;
    ctx.beginPath(); ctx.arc(p2x, p2y, p2r, 0, Math.PI * 2); ctx.fill();

    // Vignette
    const vig = ctx.createRadialGradient(W / 2, H / 2, H * 0.25, W / 2, H / 2, H);
    vig.addColorStop(0, "rgba(0,0,0,0)");
    vig.addColorStop(1, "rgba(0,0,8,0.65)");
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

// ─── Starfield ────────────────────────────────────────────────────
function StarField() {
  const starsRef = useRef<THREE.Points>(null);

  const { positions, colors } = useMemo(() => {
    const count = 1000;
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
      const b = 0.7 + seed(i * 4.3) * 0.3;
      col[i * 3] = b * 0.87; col[i * 3 + 1] = b * 0.92; col[i * 3 + 2] = b;
    }
    return { positions: pos, colors: col };
  }, []);

  useFrame((_, delta) => {
    if (starsRef.current) starsRef.current.rotation.y += delta * 0.003;
  });

  return (
    <points ref={starsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" array={positions} count={positions.length / 3} itemSize={3} />
        <bufferAttribute attach="attributes-color"    array={colors}    count={colors.length / 3}    itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.09} vertexColors transparent opacity={0.75} sizeAttenuation />
    </points>
  );
}

// ─── RGB lights — ONLY behind monitor + left wall near PC ─────────
function RGBLights() {
  const monitorBack  = useRef<THREE.PointLight>(null);
  const monitorUnder = useRef<THREE.PointLight>(null);
  const wallLeft     = useRef<THREE.PointLight>(null);
  const pcTower      = useRef<THREE.PointLight>(null);
  const timeRef = useRef(0);

  useFrame((_, delta) => {
    timeRef.current += delta * 0.5;
    const t = timeRef.current;
    monitorBack.current?.color.setHSL((t * 0.07) % 1, 1, 0.5);
    monitorUnder.current?.color.setHSL(((t * 0.07) + 0.2) % 1, 1, 0.5);
    wallLeft.current?.color.setHSL(((t * 0.07) + 0.45) % 1, 1, 0.5);
    pcTower.current?.color.setHSL(((t * 0.07) + 0.65) % 1, 1, 0.5);
  });

  return (
    <>
      {/* Behind monitor screen */}
      <pointLight ref={monitorBack}  position={[0.0,  0.9, -1.9]} intensity={4}   distance={2.8} decay={2} color="#ff00aa" />
      {/* Under-desk RGB strip */}
      <pointLight ref={monitorUnder} position={[0.2, -0.2, -1.6]} intensity={2.5} distance={2.2} decay={2} color="#00aaff" />
      {/* Left wall near PC */}
      <pointLight ref={wallLeft}     position={[-1.2, 0.8, -1.5]} intensity={3}   distance={3.5} decay={2} color="#aa00ff" />
      {/* PC tower side glow */}
      <pointLight ref={pcTower}      position={[0.6,  0.4, -1.4]} intensity={2}   distance={2.0} decay={2} color="#00ffcc" />
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
          m.color = new THREE.Color(0x080808);
          m.roughness = 0.9; m.metalness = 0;
          m.map = null; m.normalMap = null; m.roughnessMap = null; m.aoMap = null;
          m.needsUpdate = true;
        }
        if (mesh.name === "Plane.003") {
          m.color = new THREE.Color(0x080808);
          m.roughness = 0.9; m.metalness = 0;
          m.map = null; m.normalMap = null; m.roughnessMap = null; m.aoMap = null;
          m.needsUpdate = true;
        }
        if (m.name === "Glass_material") {
          m.transparent = true; m.opacity = 0.3;
          m.roughness = 0.05; m.metalness = 0.1;
          m.color = new THREE.Color(0x88aacc); m.map = null;
          m.emissive = new THREE.Color(0x000000);
          m.emissiveIntensity = 0; m.emissiveMap = null;
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
    <div className="fixed inset-0 z-[100]" style={{ width: "100vw", height: "100vh", background: "#010510" }}>
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
        <color attach="background" args={["#010510"]} />
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