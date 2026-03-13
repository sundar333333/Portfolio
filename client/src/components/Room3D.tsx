import { Suspense, useEffect, useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, useGLTF, Environment, useProgress } from "@react-three/drei";
import * as THREE from "three";

const MODEL_URL = "https://rgd8w4vqllunko1j.public.blob.vercel-storage.com/3DRoomorginal1.compressed.glb";

// ─── Starry Sky Background ────────────────────────────────────────
function StarField() {
  const starsRef = useRef<THREE.Points>(null);

  const { positions, colors } = useMemo(() => {
    const count = 2000;
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = 40 + Math.random() * 20;
      pos[i * 3]     = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = r * Math.cos(phi);
      const brightness = 0.7 + Math.random() * 0.3;
      col[i * 3]     = brightness * 0.85;
      col[i * 3 + 1] = brightness * 0.9;
      col[i * 3 + 2] = brightness;
    }
    return { positions: pos, colors: col };
  }, []);

  useFrame((_, delta) => {
    if (starsRef.current) starsRef.current.rotation.y += delta * 0.005;
  });

  return (
    <points ref={starsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" array={positions} count={positions.length / 3} itemSize={3} />
        <bufferAttribute attach="attributes-color"    array={colors}    count={colors.length / 3}    itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.12} vertexColors transparent opacity={0.9} sizeAttenuation />
    </points>
  );
}

// ─── Sky dome with procedural space texture ───────────────────────
function SkyDome() {
  const texture = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 1024;
    canvas.height = 512;
    const ctx = canvas.getContext("2d")!;

    // Deep space base gradient
    const bg = ctx.createLinearGradient(0, 0, 0, 512);
    bg.addColorStop(0,   "#020818");
    bg.addColorStop(0.3, "#050d2a");
    bg.addColorStop(0.6, "#071232");
    bg.addColorStop(1,   "#030810");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, 1024, 512);

    // Nebula clouds
    const addNebula = (x: number, y: number, r: number, color: string, alpha: number) => {
      const grad = ctx.createRadialGradient(x, y, 0, x, y, r);
      grad.addColorStop(0, `rgba(${color},${alpha})`);
      grad.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 1024, 512);
    };

    addNebula(200, 150, 200, "20,40,120",  0.4);
    addNebula(700, 100, 180, "10,30,100",  0.35);
    addNebula(500, 300, 250, "15,20,80",   0.3);
    addNebula(850, 350, 160, "30,15,80",   0.2);
    addNebula(100, 350, 140, "10,50,100",  0.25);

    // Saturn-like planet
    const px = 820, py = 160, pr = 55;
    const planetGrad = ctx.createRadialGradient(px - 10, py - 10, 5, px, py, pr);
    planetGrad.addColorStop(0,   "#8899cc");
    planetGrad.addColorStop(0.5, "#4455aa");
    planetGrad.addColorStop(1,   "#1a2255");
    ctx.fillStyle = planetGrad;
    ctx.beginPath();
    ctx.arc(px, py, pr, 0, Math.PI * 2);
    ctx.fill();

    // Planet rings
    ctx.save();
    ctx.translate(px, py);
    ctx.rotate(-0.3);
    ctx.scale(1, 0.3);
    const ringGrad = ctx.createRadialGradient(0, 0, pr * 0.9, 0, 0, pr * 1.8);
    ringGrad.addColorStop(0,   "rgba(100,120,200,0)");
    ringGrad.addColorStop(0.3, "rgba(100,120,200,0.4)");
    ringGrad.addColorStop(0.6, "rgba(80,100,180,0.25)");
    ringGrad.addColorStop(1,   "rgba(60,80,160,0)");
    ctx.fillStyle = ringGrad;
    ctx.beginPath();
    ctx.arc(0, 0, pr * 1.8, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    return new THREE.CanvasTexture(canvas);
  }, []);

  return (
    <mesh scale={[-1, 1, 1]}>
      <sphereGeometry args={[58, 32, 32]} />
      <meshBasicMaterial map={texture} side={THREE.BackSide} />
    </mesh>
  );
}

// ─── Animated RGB lights behind the PC ───────────────────────────
function RGBLights() {
  const light1 = useRef<THREE.PointLight>(null);
  const light2 = useRef<THREE.PointLight>(null);
  const light3 = useRef<THREE.PointLight>(null);
  const timeRef = useRef(0);

  useFrame((_, delta) => {
    timeRef.current += delta * 0.8;
    const t = timeRef.current;
    light1.current?.color.setHSL((t * 0.1) % 1, 1, 0.5);
    light2.current?.color.setHSL(((t * 0.1) + 0.33) % 1, 1, 0.5);
    light3.current?.color.setHSL(((t * 0.1) + 0.66) % 1, 1, 0.5);
  });

  return (
    <>
      <pointLight ref={light1} position={[1.2,  0.5, -0.3]} intensity={2}   distance={3}   decay={2} color="#ff0080" />
      <pointLight ref={light2} position={[0.8, -0.5, -0.2]} intensity={1.5} distance={2.5} decay={2} color="#00ff80" />
      <pointLight ref={light3} position={[1.8,  0.3,  0.2]} intensity={1.5} distance={2.5} decay={2} color="#0080ff" />
    </>
  );
}

// ─── Room model ───────────────────────────────────────────────────
function RoomModel() {
  const { scene } = useGLTF(MODEL_URL, 'https://www.gstatic.com/draco/versioned/decoders/1.5.5/');

  useEffect(() => {
    scene.traverse((child) => {
      const mesh = child as THREE.Mesh;
      if (!mesh.isMesh) return;

      const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
      materials.forEach((mat) => {
        const m = mat as THREE.MeshStandardMaterial;
        if (m.map) m.map.colorSpace = THREE.SRGBColorSpace;
        m.envMapIntensity = 0.05;

        if (m.name === 'black_wall') {
          m.color = new THREE.Color(0x080808);
          m.roughness = 0.9; m.metalness = 0;
          m.map = null; m.normalMap = null; m.roughnessMap = null; m.aoMap = null;
          m.needsUpdate = true;
        }
        if (mesh.name === 'Plane.003') {
          m.color = new THREE.Color(0x080808);
          m.roughness = 0.9; m.metalness = 0;
          m.map = null; m.normalMap = null; m.roughnessMap = null; m.aoMap = null;
          m.needsUpdate = true;
        }
        if (m.name === 'Glass_material') {
          m.transparent = true; m.opacity = 0.3;
          m.roughness = 0.05; m.metalness = 0.1;
          m.color = new THREE.Color(0x88aacc);
          m.map = null; m.emissive = new THREE.Color(0x000000);
          m.emissiveIntensity = 0; m.emissiveMap = null;
          m.side = THREE.DoubleSide;
          (m as THREE.MeshPhysicalMaterial).transmission = 0;
          m.needsUpdate = true;
        }
      });

      if (mesh.name === 'Handle.005') {
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

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[100]" style={{ width: '100vw', height: '100vh', background: '#020818' }}>

      <button
        onClick={onBack}
        style={{
          position: 'absolute', top: '20px', left: '20px', zIndex: 200,
          display: 'flex', alignItems: 'center', gap: '8px',
          background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.2)',
          color: '#ffffff', padding: '10px 18px', borderRadius: '999px',
          cursor: 'pointer', fontSize: '14px', fontFamily: 'inherit',
          backdropFilter: 'blur(8px)', transition: 'background 0.2s',
        }}
        onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.18)')}
        onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.08)')}
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
        <color attach="background" args={['#020818']} />
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