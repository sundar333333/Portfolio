import { Suspense, useEffect, useRef, useMemo } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, useGLTF, Environment, useProgress } from "@react-three/drei";
import * as THREE from "three";

const MODEL_URL = "https://rgd8w4vqllunko1j.public.blob.vercel-storage.com/3DRoomorginal1.compressed.glb";

// ─── Sky dome — dark navy real space ─────────────────────────────
function SkyDome() {
  const texture = useMemo(() => {
    const W = 2048, H = 1024;
    const canvas = document.createElement("canvas");
    canvas.width = W; canvas.height = H;
    const ctx = canvas.getContext("2d")!;

    // Dark navy base — like your reference screenshot
    const base = ctx.createLinearGradient(0, 0, 0, H);
    base.addColorStop(0,   "#00061a");
    base.addColorStop(0.4, "#000d28");
    base.addColorStop(0.7, "#000a20");
    base.addColorStop(1,   "#000510");
    ctx.fillStyle = base;
    ctx.fillRect(0, 0, W, H);

    // Horizontal gradient — slightly lighter in middle like reference
    const horiz = ctx.createLinearGradient(0, 0, W, 0);
    horiz.addColorStop(0,   "rgba(0,5,20,0.6)");
    horiz.addColorStop(0.3, "rgba(0,10,35,0.3)");
    horiz.addColorStop(0.5, "rgba(0,15,45,0.2)");
    horiz.addColorStop(0.7, "rgba(0,10,35,0.3)");
    horiz.addColorStop(1,   "rgba(0,5,20,0.6)");
    ctx.fillStyle = horiz;
    ctx.fillRect(0, 0, W, H);

    // Very subtle blue glow zones — dark, not bright
    const glow = (x: number, y: number, r: number, a: number) => {
      const g = ctx.createRadialGradient(x, y, 0, x, y, r);
      g.addColorStop(0, `rgba(5,20,80,${a})`);
      g.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);
    };
    glow(600,  200, 450, 0.35);
    glow(1400, 300, 500, 0.3);
    glow(300,  700, 350, 0.25);
    glow(1700, 600, 400, 0.28);

    // Realistic stars — 3 tiers
    const seed = (n: number) => { let x = Math.sin(n * 127.1) * 43758.5453; return x - Math.floor(x); };

    // Tier 1 — many faint dots (barely visible like real sky)
    for (let i = 0; i < 3000; i++) {
      const sx = seed(i * 3.1) * W;
      const sy = seed(i * 7.3) * H;
      const br = 60 + seed(i * 4.1) * 100;
      const al = 0.15 + seed(i * 6.2) * 0.35;
      ctx.fillStyle = `rgba(${br},${br},${Math.min(255,br+30)},${al})`;
      ctx.fillRect(sx, sy, 1, 1);
    }

    // Tier 2 — medium brightness
    for (let i = 0; i < 500; i++) {
      const sx = seed(i * 5.7 + 100) * W;
      const sy = seed(i * 2.9 + 100) * H;
      const br = 140 + seed(i * 8.3) * 100;
      const al = 0.4 + seed(i * 3.4) * 0.4;
      const bl = Math.min(255, br + 20);
      ctx.fillStyle = `rgba(${Math.max(0,br-20)},${Math.max(0,br-10)},${bl},${al})`;
      ctx.fillRect(sx, sy, 1.5, 1.5);
    }

    // Tier 3 — bright stars with soft halo (no cartoon cross/sparkle)
    for (let i = 0; i < 80; i++) {
      const sx = seed(i * 9.1 + 200) * W;
      const sy = seed(i * 4.7 + 200) * H;
      const br = 200 + seed(i * 6.1) * 55;
      // Soft circular glow only — NO cross shape
      const halo = ctx.createRadialGradient(sx, sy, 0, sx, sy, 3.5);
      halo.addColorStop(0,   `rgba(${br},${br},255,0.9)`);
      halo.addColorStop(0.5, `rgba(${br},${br},255,0.2)`);
      halo.addColorStop(1,   "rgba(0,0,0,0)");
      ctx.fillStyle = halo;
      ctx.fillRect(sx - 4, sy - 4, 8, 8);
    }

    // Saturn planet — top right
    const px = 1760, py = 95, pr = 52;
    const patm = ctx.createRadialGradient(px, py, pr*0.9, px, py, pr*2.3);
    patm.addColorStop(0, "rgba(40,60,150,0.2)"); patm.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = patm; ctx.beginPath(); ctx.arc(px, py, pr*2.3, 0, Math.PI*2); ctx.fill();
    const pbody = ctx.createRadialGradient(px-14, py-14, 3, px, py, pr);
    pbody.addColorStop(0, "#ccd8f8"); pbody.addColorStop(0.3, "#8899dd");
    pbody.addColorStop(0.65, "#4455aa"); pbody.addColorStop(1, "#1a2060");
    ctx.fillStyle = pbody; ctx.beginPath(); ctx.arc(px, py, pr, 0, Math.PI*2); ctx.fill();
    ctx.save(); ctx.translate(px, py); ctx.rotate(-0.2); ctx.scale(1, 0.25);
    [{ri:1.1,ro:1.42,a:0.3,r:150,g:162,b:228},{ri:1.48,ro:1.78,a:0.18,r:120,g:135,b:210},{ri:1.82,ro:2.02,a:0.1,r:100,g:115,b:195}]
    .forEach(({ri,ro,a,r,g,b}) => {
      const rg = ctx.createRadialGradient(0,0,pr*ri,0,0,pr*ro);
      rg.addColorStop(0,`rgba(${r},${g},${b},0)`); rg.addColorStop(0.3,`rgba(${r},${g},${b},${a})`);
      rg.addColorStop(0.7,`rgba(${r},${g},${b},${a*0.5})`); rg.addColorStop(1,`rgba(${r},${g},${b},0)`);
      ctx.fillStyle=rg; ctx.beginPath(); ctx.arc(0,0,pr*ro,0,Math.PI*2); ctx.fill();
    });
    ctx.restore();

    // Mars — left
    const mx=90, my=480, mr=28;
    const matm=ctx.createRadialGradient(mx,my,mr,mx,my,mr*2);
    matm.addColorStop(0,"rgba(170,50,20,0.15)"); matm.addColorStop(1,"rgba(0,0,0,0)");
    ctx.fillStyle=matm; ctx.beginPath(); ctx.arc(mx,my,mr*2,0,Math.PI*2); ctx.fill();
    const mbody=ctx.createRadialGradient(mx-7,my-7,2,mx,my,mr);
    mbody.addColorStop(0,"#f09070"); mbody.addColorStop(0.5,"#c04530"); mbody.addColorStop(1,"#4a1010");
    ctx.fillStyle=mbody; ctx.beginPath(); ctx.arc(mx,my,mr,0,Math.PI*2); ctx.fill();

    // Dark vignette corners
    const vig = ctx.createRadialGradient(W/2,H/2,H*0.2,W/2,H/2,H*0.9);
    vig.addColorStop(0,"rgba(0,0,0,0)"); vig.addColorStop(1,"rgba(0,0,15,0.85)");
    ctx.fillStyle=vig; ctx.fillRect(0,0,W,H);

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

// ─── Star points (3D, no cross shapes) ───────────────────────────
function StarField() {
  const ref = useRef<THREE.Points>(null);
  const { positions, colors } = useMemo(() => {
    const count = 500;
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    const seed = (n: number) => { let x = Math.sin(n*91.3)*43758.5; return x-Math.floor(x); };
    for (let i = 0; i < count; i++) {
      const theta = seed(i*2.3)*Math.PI*2;
      const phi   = Math.acos(2*seed(i*3.7)-1);
      const r     = 46 + seed(i*5.1)*8;
      pos[i*3]   = r*Math.sin(phi)*Math.cos(theta);
      pos[i*3+1] = r*Math.sin(phi)*Math.sin(theta);
      pos[i*3+2] = r*Math.cos(phi);
      const b = 0.55 + seed(i*4.3)*0.45;
      col[i*3]=b*0.8; col[i*3+1]=b*0.85; col[i*3+2]=b;
    }
    return { positions: pos, colors: col };
  }, []);
  useFrame((_,dt)=>{ if(ref.current) ref.current.rotation.y += dt*0.0015; });
  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" array={positions} count={positions.length/3} itemSize={3}/>
        <bufferAttribute attach="attributes-color"    array={colors}    count={colors.length/3}    itemSize={3}/>
      </bufferGeometry>
      <pointsMaterial size={0.06} vertexColors transparent opacity={0.55} sizeAttenuation/>
    </points>
  );
}

// ─── RGB lights — found at runtime from monitor mesh position ─────
function RGBLights() {
  const { scene } = useThree();
  const r1 = useRef<THREE.PointLight>(null);
  const r2 = useRef<THREE.PointLight>(null);
  const r3 = useRef<THREE.PointLight>(null);
  const t  = useRef(0);
  const placed = useRef(false);

  useEffect(() => {
    if (placed.current) return;
    // Wait for scene to populate then find monitor mesh
    const timer = setTimeout(() => {
      let monitorPos: THREE.Vector3 | null = null;

      scene.traverse((obj) => {
        const name = obj.name.toLowerCase();
        // Cube.049 is the monitor mesh confirmed from GLB analysis
        if (name.includes("cube.049") || name.includes("cube049")) {
          const wp = new THREE.Vector3();
          obj.getWorldPosition(wp);
          monitorPos = wp.clone();
        }
      });

      if (monitorPos && r1.current && r2.current && r3.current) {
        const mp = monitorPos as THREE.Vector3;
        console.log("Monitor world position:", mp);
        // Place lights relative to monitor actual world position
        r1.current.position.set(mp.x,     mp.y + 0.3, mp.z - 0.3); // behind screen
        r2.current.position.set(mp.x + 0.4, mp.y - 0.2, mp.z + 0.2); // PC tower side
        r3.current.position.set(mp.x - 0.4, mp.y + 0.5, mp.z);      // wall above
        placed.current = true;
      }
    }, 3000);
    return () => clearTimeout(timer);
  }, [scene]);

  useFrame((_,dt) => {
    t.current += dt * 0.45;
    const s = t.current;
    r1.current?.color.setHSL((s*0.06)%1, 1, 0.5);
    r2.current?.color.setHSL(((s*0.06)+0.33)%1, 1, 0.5);
    r3.current?.color.setHSL(((s*0.06)+0.66)%1, 1, 0.5);
  });

  return (
    <>
      <pointLight ref={r1} position={[0,0,0]} intensity={5}   distance={1.5} decay={3} color="#ff00aa"/>
      <pointLight ref={r2} position={[0,0,0]} intensity={4}   distance={1.2} decay={3} color="#00aaff"/>
      <pointLight ref={r3} position={[0,0,0]} intensity={3.5} distance={1.5} decay={3} color="#aa00ff"/>
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
          m.color = new THREE.Color(0x080808); m.roughness=0.9; m.metalness=0;
          m.map=null; m.normalMap=null; m.roughnessMap=null; m.aoMap=null; m.needsUpdate=true;
        }
        if (mesh.name === "Plane.003") {
          m.color = new THREE.Color(0x080808); m.roughness=0.9; m.metalness=0;
          m.map=null; m.normalMap=null; m.roughnessMap=null; m.aoMap=null; m.needsUpdate=true;
        }
        if (m.name === "Glass_material") {
          m.transparent=true; m.opacity=0.3; m.roughness=0.05; m.metalness=0.1;
          m.color=new THREE.Color(0x88aacc); m.map=null;
          m.emissive=new THREE.Color(0x000000); m.emissiveIntensity=0; m.emissiveMap=null;
          m.side=THREE.DoubleSide; (m as THREE.MeshPhysicalMaterial).transmission=0; m.needsUpdate=true;
        }
      });
      if (mesh.name==="Handle.005") mesh.material=new THREE.MeshBasicMaterial({color:0x080808});
      mesh.castShadow=true; mesh.receiveShadow=true;
    });
  }, [scene]);
  return <primitive object={scene} scale={1} position={[0,-1,0]} rotation={[0,Math.PI/4,0]}/>;
}

// ─── Main export ──────────────────────────────────────────────────
export default function Room3D({ isVisible=true, onBack }: { isVisible?: boolean; onBack?: () => void }) {
  const { progress } = useProgress();
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[100]" style={{ width:"100vw", height:"100vh", background:"#00061a" }}>
      <button onClick={onBack} style={{
        position:"absolute", top:"20px", left:"20px", zIndex:200,
        display:"flex", alignItems:"center", gap:"8px",
        background:"rgba(255,255,255,0.08)", border:"1px solid rgba(255,255,255,0.2)",
        color:"#ffffff", padding:"10px 18px", borderRadius:"999px",
        cursor:"pointer", fontSize:"14px", fontFamily:"inherit",
        backdropFilter:"blur(8px)", transition:"background 0.2s",
      }}
        onMouseEnter={e=>(e.currentTarget.style.background="rgba(255,255,255,0.18)")}
        onMouseLeave={e=>(e.currentTarget.style.background="rgba(255,255,255,0.08)")}
      >← Back</button>

      {progress < 100 && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white z-[110] bg-black">
          <div className="w-48 h-1 bg-white/20 rounded-full mb-4 overflow-hidden">
            <div className="h-full bg-blue-500 transition-all duration-300" style={{width:`${progress}%`}}/>
          </div>
          <p className="text-sm tracking-widest uppercase">Building Room... {Math.round(progress)}%</p>
        </div>
      )}

      <Canvas camera={{position:[5,5,5], fov:45}} shadows
        gl={{toneMapping:THREE.ACESFilmicToneMapping, toneMappingExposure:0.7,
             outputColorSpace:THREE.SRGBColorSpace, powerPreference:"high-performance"}}>
        <color attach="background" args={["#00061a"]}/>
        <SkyDome/>
        <StarField/>
        <ambientLight intensity={0.4}/>
        <spotLight position={[0,8,0]} angle={0.5} penumbra={1} intensity={1.2} castShadow shadow-mapSize={[1024,1024]}/>
        <directionalLight position={[3,6,3]} intensity={0.3}/>
        <directionalLight position={[-3,6,-3]} intensity={0.2}/>
        <RGBLights/>
        <Suspense fallback={null}>
          <RoomModel/>
          <Environment preset="apartment"/>
        </Suspense>
        <OrbitControls makeDefault enableDamping minDistance={2} maxDistance={20}
          minPolarAngle={Math.PI/6} maxPolarAngle={Math.PI/2.2}
          minAzimuthAngle={Math.PI/6} maxAzimuthAngle={Math.PI*0.75}/>
      </Canvas>
    </div>
  );
}