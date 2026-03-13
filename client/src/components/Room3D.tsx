import { Suspense, useEffect, useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, useGLTF, Environment, useProgress } from "@react-three/drei";
import * as THREE from "three";

const MODEL_URL = "https://rgd8w4vqllunko1j.public.blob.vercel-storage.com/3DRoomorginal1.compressed.glb";

// ─── Procedural nebula sky dome ───────────────────────────────────
function SkyDome() {
  const texture = useMemo(() => {
    const W = 2048, H = 1024;
    const canvas = document.createElement("canvas");
    canvas.width = W; canvas.height = H;
    const ctx = canvas.getContext("2d")!;

    // Deep space base
    const base = ctx.createLinearGradient(0, 0, W, H);
    base.addColorStop(0,    "#020614");
    base.addColorStop(0.25, "#03091f");
    base.addColorStop(0.5,  "#050d28");
    base.addColorStop(0.75, "#030818");
    base.addColorStop(1,    "#020614");
    ctx.fillStyle = base;
    ctx.fillRect(0, 0, W, H);

    // Helper: paint a soft glowing nebula cloud
    const nebula = (
      x: number, y: number, rx: number, ry: number,
      r: number, g: number, b: number, alpha: number
    ) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.scale(rx / 200, ry / 200);
      const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, 200);
      grad.addColorStop(0,   `rgba(${r},${g},${b},${alpha})`);
      grad.addColorStop(0.4, `rgba(${r},${g},${b},${alpha * 0.6})`);
      grad.addColorStop(1,   `rgba(${r},${g},${b},0)`);
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(0, 0, 200, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    };

    // ── Pink/magenta clouds (left side like reference) ──
    nebula(180,  420, 380, 260,  220, 40,  150, 0.55);
    nebula(280,  600, 300, 200,  200, 20,  120, 0.45);
    nebula(100,  300, 250, 180,  180, 30,  130, 0.4);
    nebula(350,  750, 280, 160,  230, 50,  160, 0.35);

    // ── Cyan/blue clouds (centre-top like reference) ──
    nebula(700,  200, 420, 260,  20,  160, 220, 0.5);
    nebula(820,  350, 340, 220,  10,  140, 200, 0.45);
    nebula(600,  150, 300, 180,  30,  180, 230, 0.4);
    nebula(950,  280, 260, 180,  15,  120, 190, 0.38);

    // ── Gold/yellow accent (bottom-left like reference) ──
    nebula(250,  820, 320, 200,  200, 140, 30,  0.4);
    nebula(150,  700, 260, 160,  180, 120, 20,  0.35);
    nebula(420,  900, 240, 140,  210, 160, 40,  0.3);

    // ── Deep purple/indigo fills ──
    nebula(1400, 300, 380, 280,  80,  20,  160, 0.45);
    nebula(1600, 500, 300, 220,  60,  10,  140, 0.4);
    nebula(1200, 600, 340, 240,  100, 30,  180, 0.35);

    // ── Right side pink accent ──
    nebula(1750, 400, 320, 240,  210, 40,  140, 0.5);
    nebula(1850, 600, 260, 180,  200, 30,  120, 0.4);
    nebula(1650, 700, 280, 200,  190, 50,  150, 0.35);

    // ── Extra cyan wisps ──
    nebula(1100, 150, 280, 160,  20,  200, 240, 0.35);
    nebula(1300, 400, 220, 140,  15,  170, 210, 0.3);

    // ── Bright core glow (centre — like the bright white-cyan in reference) ──
    nebula(680,  220, 160, 120,  180, 230, 255, 0.6);
    nebula(720,  190, 100, 80,   230, 250, 255, 0.5);

    // ── Scattered small bright stars ──
    const rng = (n: number) => Math.floor(Math.random() * n);
    for (let i = 0; i < 1800; i++) {
      const x = rng(W), y = rng(H);
      const size = Math.random() < 0.05 ? 2 : 1;
      const brightness = Math.floor(180 + Math.random() * 75);
      ctx.fillStyle = `rgba(${brightness},${brightness},${Math.min(255, brightness + 20)},${0.6 + Math.random() * 0.4})`;
      ctx.fillRect(x, y, size, size);
    }

    // ── A few large bright star sparkles ──
    const sparkle = (x: number, y: number, size: number) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.fillStyle = "rgba(255,255,255,0.9)";
      for (let a = 0; a < 4; a++) {
        ctx.save();
        ctx.rotate((a * Math.PI) / 4);
        ctx.fillRect(-size / 2, -1, size, 2);
        ctx.restore();
      }
      ctx.restore();
    };
    sparkle(1900, 80,  18);
    sparkle(420,  120, 12);
    sparkle(1100, 500, 10);
    sparkle(780,  780, 8);

    // ── Saturn-like planet (top right like reference) ──
    const px = 1760, py = 130, pr = 52;
    const planetGrad = ctx.createRadialGradient(px - 12, py - 12, 4, px, py, pr);
    planetGrad.addColorStop(0,   "#aabbee");
    planetGrad.addColorStop(0.4, "#5566bb");
    planetGrad.addColorStop(1,   "#1a2060");
    ctx.fillStyle = planetGrad;
    ctx.beginPath();
    ctx.arc(px, py, pr, 0, Math.PI * 2);
    ctx.fill();
    // rings
    ctx.save();
    ctx.translate(px, py);
    ctx.rotate(-0.25);
    ctx.scale(1, 0.28);
    for (let ring = 0; ring < 3; ring++) {
      const ri = pr * (1.1 + ring * 0.28);
      const ro = pr * (1.35 + ring * 0.28);
      const ringAlpha = 0.35 - ring * 0.08;
      const ringGrad = ctx.createRadialGradient(0, 0, ri, 0, 0, ro);
      ringGrad.addColorStop(0,   `rgba(130,150,220,0)`);
      ringGrad.addColorStop(0.3, `rgba(130,150,220,${ringAlpha})`);
      ringGrad.addColorStop(0.7, `rgba(100,120,200,${ringAlpha * 0.7})`);
      ringGrad.addColorStop(1,   `rgba(80,100,180,0)`);
      ctx.fillStyle = ringGrad;
      ctx.beginPath();
      ctx.arc(0, 0, ro, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    // ── Vignette edges ──
    const vig = ctx.createRadialGradient(W/2, H/2, H * 0.3, W/2, H/2, H * 0.9);
    vig.addColorStop(0, "rgba(0,0,0,0)");
    vig.addColorStop(1, "rgba(0,0,10,0.55)");
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

// ─── Starfield (extra stars on top of dome) ───────────────────────
function StarField() {
  const starsRef = useRef<THREE.Points>(null);

  const { positions, colors } = useMemo(() => {
    const count = 1200;
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = 44 + Math.random() * 10;
      pos[i * 3]     = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = r * Math.cos(phi);
      const b = 0.75 + Math.random() * 0.25;
      col[i * 3]     = b * 0.88;
      col[i * 3 + 1] = b * 0.92;
      col[i * 3 + 2] = b;
    }
    return { positions: pos, colors: col };
  }, []);

  useFrame((_, delta) => {
    if (starsRef.current) starsRef.current.rotation.y += delta * 0.004;
  });

  return (
    <points ref={starsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" array={positions} count={positions.length / 3} itemSize={3} />
        <bufferAttribute attach="attributes-color"    array={colors}    count={colors.length / 3}    itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.1} vertexColors transparent opacity={0.8} sizeAttenuation />
    </points>
  );
}

// ─── RGB lights — behind monitor + wall accents ───────────────────
function RGBLights() {
  const light1 = useRef<THREE.PointLight>(null);
  const light2 = useRef<THREE.PointLight>(null);
  const light3 = useRef<THREE.PointLight>(null);
  const light4 = useRef<THREE.PointLight>(null);
  const timeRef = useRef(0);

  useFrame((_, delta) => {
    timeRef.current += delta * 0.6;
    const t = timeRef.current;
    light1.current?.color.setHSL((t * 0.08) % 1, 1, 0.5);
    light2.current?.color.setHSL(((t * 0.08) + 0.25) % 1, 1, 0.5);
    light3.current?.color.setHSL(((t * 0.08) + 0.5) % 1, 1, 0.5);
    light4.current?.color.setHSL(((t * 0.08) + 0.75) % 1, 1, 0.5);
  });

  return (
    <>
      <pointLight ref={light1} position={[0.6,  0.8, -1.8]} intensity={3}   distance={3.5} decay={2} color="#ff0080" />
      <pointLight ref={light2} position={[1.4,  0.2, -1.6]} intensity={2.5} distance={3}   decay={2} color="#00aaff" />
      <pointLight ref={light3} position={[-0.5, 1.2, -2.0]} intensity={2}   distance={4}   decay={2} color="#aa00ff" />
      <pointLight ref={light4} position={[2.5,  0.5, -0.5]} intensity={1.5} distance={3}   decay={2} color="#00ffaa" />
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
    <div className="fixed inset-0 z-[100]" style={{ width: "100vw", height: "100vh", background: "#030a1a" }}>

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
        <color attach="background" args={["#030a1a"]} />
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