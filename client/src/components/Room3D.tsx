import { Suspense, useEffect, useRef, useMemo, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, useGLTF, Environment, useProgress } from "@react-three/drei";
import * as THREE from "three";

const MODEL_URL = "https://rgd8w4vqllunko1j.public.blob.vercel-storage.com/3DRoomorginal1.compressed.glb";

// ─── Loading screen ───────────────────────────────────────────────
function LoadingScreen({ progress }: { progress: number }) {
  return (
    <div style={{
      position: "absolute", inset: 0, zIndex: 110,
      background: "linear-gradient(135deg, #000a1e 0%, #001030 50%, #000820 100%)",
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center", gap: "32px",
    }}>
      {/* Animated planet/orbit */}
      <div style={{ position: "relative", width: 120, height: 120 }}>
        {/* Orbit ring */}
        <div style={{
          position: "absolute", inset: 0, borderRadius: "50%",
          border: "1px solid rgba(100,150,255,0.25)",
          animation: "spin 3s linear infinite",
        }}/>
        {/* Orbiting dot */}
        <div style={{
          position: "absolute", top: -4, left: "50%", marginLeft: -4,
          width: 8, height: 8, borderRadius: "50%",
          background: "radial-gradient(circle, #88aaff, #4466dd)",
          boxShadow: "0 0 12px #4466dd",
          animation: "spin 3s linear infinite",
          transformOrigin: "4px 64px",
        }}/>
        {/* Planet */}
        <div style={{
          position: "absolute", inset: "30%",
          borderRadius: "50%",
          background: "radial-gradient(circle at 35% 35%, #8899cc, #334488 60%, #111830)",
          boxShadow: "0 0 30px rgba(80,120,220,0.4), inset -4px -4px 12px rgba(0,0,30,0.6)",
        }}/>
        {/* Planet ring */}
        <div style={{
          position: "absolute", top: "44%", left: "12%", right: "12%", height: "12%",
          borderRadius: "50%",
          border: "2px solid rgba(160,185,255,0.35)",
          transform: "rotateX(70deg)",
        }}/>
      </div>

      {/* Title */}
      <div style={{ textAlign: "center" }}>
        <p style={{
          color: "rgba(180,200,255,0.9)", fontSize: "11px",
          letterSpacing: "6px", textTransform: "uppercase",
          fontFamily: "inherit", marginBottom: "20px",
          textShadow: "0 0 20px rgba(100,150,255,0.5)",
        }}>
          Entering the Room
        </p>

        {/* Progress bar */}
        <div style={{
          width: 220, height: 2,
          background: "rgba(100,150,255,0.15)",
          borderRadius: 2, overflow: "hidden", position: "relative",
        }}>
          <div style={{
            height: "100%", borderRadius: 2,
            background: "linear-gradient(90deg, #334488, #88aaff, #334488)",
            backgroundSize: "200% 100%",
            width: `${progress}%`,
            transition: "width 0.3s ease",
            animation: "shimmer 2s linear infinite",
          }}/>
        </div>

        <p style={{
          color: "rgba(120,160,255,0.6)", fontSize: "10px",
          letterSpacing: "3px", fontFamily: "inherit",
          marginTop: "12px", textTransform: "uppercase",
        }}>
          {Math.round(progress)}%
        </p>
      </div>

      {/* CSS keyframes */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes shimmer {
          0%   { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </div>
  );
}

// ─── Sky dome ─────────────────────────────────────────────────────
function SkyDome() {
  const texture = useMemo(() => {
    const W = 2048, H = 1024;
    const canvas = document.createElement("canvas");
    canvas.width = W; canvas.height = H;
    const ctx = canvas.getContext("2d")!;

    // Slightly darker deep blue
    const base = ctx.createLinearGradient(0, 0, 0, H);
    base.addColorStop(0,   "#010820");
    base.addColorStop(0.3, "#020e30");
    base.addColorStop(0.6, "#010b28");
    base.addColorStop(1,   "#010718");
    ctx.fillStyle = base; ctx.fillRect(0, 0, W, H);

    const horiz = ctx.createLinearGradient(0, 0, W, 0);
    horiz.addColorStop(0,   "rgba(1,5,25,0.6)");
    horiz.addColorStop(0.4, "rgba(3,15,55,0.3)");
    horiz.addColorStop(0.6, "rgba(3,15,55,0.3)");
    horiz.addColorStop(1,   "rgba(1,5,25,0.6)");
    ctx.fillStyle = horiz; ctx.fillRect(0, 0, W, H);

    const glow = (x: number, y: number, r: number, ri: number, gi: number, bi: number, a: number) => {
      const g = ctx.createRadialGradient(x, y, 0, x, y, r);
      g.addColorStop(0,   `rgba(${ri},${gi},${bi},${a})`);
      g.addColorStop(0.5, `rgba(${ri},${gi},${bi},${a * 0.35})`);
      g.addColorStop(1,   "rgba(0,0,0,0)");
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    };
    glow(500,  150, 500, 8,  30, 110, 0.45);
    glow(1200, 200, 600, 6,  28, 100, 0.4);
    glow(800,  600, 450, 9,  35, 120, 0.38);
    glow(200,  500, 380, 5,  20,  90, 0.32);
    glow(1700, 700, 420, 8,  30, 110, 0.35);

    const mw = ctx.createLinearGradient(0, 350, 0, 680);
    mw.addColorStop(0,   "rgba(0,0,0,0)");
    mw.addColorStop(0.4, "rgba(8,22,70,0.18)");
    mw.addColorStop(0.6, "rgba(8,22,70,0.18)");
    mw.addColorStop(1,   "rgba(0,0,0,0)");
    ctx.fillStyle = mw; ctx.fillRect(0, 0, W, H);

    const seed = (n: number) => { let x = Math.sin(n * 127.1) * 43758.5453; return x - Math.floor(x); };

    const drawStar = (sx: number, sy: number, radius: number, r: number, g: number, b: number, alpha: number, glowR = 0) => {
      if (glowR > 0) {
        const halo = ctx.createRadialGradient(sx, sy, 0, sx, sy, glowR);
        halo.addColorStop(0,   `rgba(${r},${g},${b},${alpha * 0.5})`);
        halo.addColorStop(0.5, `rgba(${r},${g},${b},${alpha * 0.12})`);
        halo.addColorStop(1,   "rgba(0,0,0,0)");
        ctx.fillStyle = halo; ctx.beginPath(); ctx.arc(sx, sy, glowR, 0, Math.PI * 2); ctx.fill();
      }
      ctx.fillStyle = `rgba(${r},${g},${b},${alpha})`;
      ctx.beginPath(); ctx.arc(sx, sy, radius, 0, Math.PI * 2); ctx.fill();
    };

    for (let i = 0; i < 2500; i++) {
      drawStar(seed(i*3.1)*W, seed(i*7.3)*H,
        0.5+seed(i*2.1)*0.4,
        170+seed(i*4.1)*85|0, 170+seed(i*4.1)*85|0,
        Math.min(255,(170+seed(i*4.1)*85|0)+25),
        0.45+seed(i*6.2)*0.45);
    }
    for (let i = 0; i < 500; i++) {
      const br = (200+seed(i*8.3)*55)|0;
      drawStar(seed(i*5.7+100)*W, seed(i*2.9+100)*H,
        0.9+seed(i*4.1)*0.6,
        Math.max(180,br-15), Math.max(185,br-10), br,
        0.65+seed(i*3.4)*0.35);
    }
    for (let i = 0; i < 80; i++) {
      const br = (230+seed(i*6.1)*25)|0;
      const rad = 1.4+seed(i*3.3)*0.6;
      drawStar(seed(i*9.1+200)*W, seed(i*4.7+200)*H, rad, br, br, 255, 0.95, rad*5);
    }

    // Saturn — top right
    const px=1580, py=160, pr=80;
    const satAtm=ctx.createRadialGradient(px,py,pr*0.8,px,py,pr*3);
    satAtm.addColorStop(0,"rgba(80,110,200,0.28)"); satAtm.addColorStop(1,"rgba(0,0,0,0)");
    ctx.fillStyle=satAtm; ctx.beginPath(); ctx.arc(px,py,pr*3,0,Math.PI*2); ctx.fill();
    const satBody=ctx.createRadialGradient(px-22,py-22,5,px,py,pr);
    satBody.addColorStop(0,"#dde8ff"); satBody.addColorStop(0.2,"#aabbee");
    satBody.addColorStop(0.5,"#7788cc"); satBody.addColorStop(0.75,"#4455aa"); satBody.addColorStop(1,"#1a2060");
    ctx.fillStyle=satBody; ctx.beginPath(); ctx.arc(px,py,pr,0,Math.PI*2); ctx.fill();
    ctx.save(); ctx.beginPath(); ctx.arc(px,py,pr,0,Math.PI*2); ctx.clip();
    [{y:-0.3,h:0.12,a:0.12},{y:-0.1,h:0.08,a:0.08},{y:0.1,h:0.1,a:0.1},{y:0.3,h:0.07,a:0.06}]
    .forEach(({y,h,a})=>{ ctx.fillStyle=`rgba(70,90,170,${a})`; ctx.fillRect(px-pr,py+y*pr,pr*2,h*pr); });
    ctx.restore();
    ctx.save(); ctx.translate(px,py); ctx.rotate(-0.18); ctx.scale(1,0.28);
    [{ri:1.15,ro:1.55,a:0.5,r:180,g:190,b:240},{ri:1.60,ro:2.00,a:0.35,r:150,g:165,b:220},{ri:2.05,ro:2.35,a:0.2,r:120,g:138,b:205}]
    .forEach(({ri,ro,a,r,g,b})=>{
      const rg=ctx.createRadialGradient(0,0,pr*ri,0,0,pr*ro);
      rg.addColorStop(0,`rgba(${r},${g},${b},0)`); rg.addColorStop(0.2,`rgba(${r},${g},${b},${a})`);
      rg.addColorStop(0.8,`rgba(${r},${g},${b},${a*0.7})`); rg.addColorStop(1,`rgba(${r},${g},${b},0)`);
      ctx.fillStyle=rg; ctx.beginPath(); ctx.arc(0,0,pr*ro,0,Math.PI*2); ctx.fill();
    });
    ctx.restore();

    // Mars
    const mx=90,my=500,mr=32;
    const matm=ctx.createRadialGradient(mx,my,mr,mx,my,mr*2.2);
    matm.addColorStop(0,"rgba(160,50,20,0.2)"); matm.addColorStop(1,"rgba(0,0,0,0)");
    ctx.fillStyle=matm; ctx.beginPath(); ctx.arc(mx,my,mr*2.2,0,Math.PI*2); ctx.fill();
    const mbody=ctx.createRadialGradient(mx-9,my-9,2,mx,my,mr);
    mbody.addColorStop(0,"#f5a080"); mbody.addColorStop(0.4,"#d05535"); mbody.addColorStop(1,"#4a1010");
    ctx.fillStyle=mbody; ctx.beginPath(); ctx.arc(mx,my,mr,0,Math.PI*2); ctx.fill();

    const vig=ctx.createRadialGradient(W/2,H/2,H*0.15,W/2,H/2,H*0.85);
    vig.addColorStop(0,"rgba(0,0,0,0)"); vig.addColorStop(1,"rgba(0,0,15,0.75)");
    ctx.fillStyle=vig; ctx.fillRect(0,0,W,H);

    const tex=new THREE.CanvasTexture(canvas);
    tex.colorSpace=THREE.SRGBColorSpace;
    return tex;
  }, []);

  return (
    <mesh scale={[-1,1,1]}>
      <sphereGeometry args={[58,64,64]}/>
      <meshBasicMaterial map={texture} side={THREE.BackSide}/>
    </mesh>
  );
}

// ─── Star field ───────────────────────────────────────────────────
function StarField() {
  const ref = useRef<THREE.Points>(null);
  const { positions, colors } = useMemo(() => {
    const count = 700;
    const pos = new Float32Array(count*3);
    const col = new Float32Array(count*3);
    const seed = (n: number) => { let x=Math.sin(n*91.3)*43758.5; return x-Math.floor(x); };
    for (let i=0;i<count;i++) {
      const theta=seed(i*2.3)*Math.PI*2, phi=Math.acos(2*seed(i*3.7)-1), r=46+seed(i*5.1)*8;
      pos[i*3]=r*Math.sin(phi)*Math.cos(theta);
      pos[i*3+1]=r*Math.sin(phi)*Math.sin(theta);
      pos[i*3+2]=r*Math.cos(phi);
      const b=0.75+seed(i*4.3)*0.25;
      col[i*3]=b*0.85; col[i*3+1]=b*0.9; col[i*3+2]=b;
    }
    return { positions:pos, colors:col };
  }, []);
  useFrame((_,dt)=>{ if(ref.current) ref.current.rotation.y+=dt*0.0015; });
  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" array={positions} count={positions.length/3} itemSize={3}/>
        <bufferAttribute attach="attributes-color"    array={colors}    count={colors.length/3}    itemSize={3}/>
      </bufferGeometry>
      <pointsMaterial size={0.08} vertexColors transparent opacity={0.85} sizeAttenuation/>
    </points>
  );
}

// ─── Room model — no RGB lights ───────────────────────────────────
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
          m.color=new THREE.Color(0x080808); m.roughness=0.9; m.metalness=0;
          m.map=null; m.normalMap=null; m.roughnessMap=null; m.aoMap=null; m.needsUpdate=true;
        }
        if (mesh.name === "Plane.003") {
          m.color=new THREE.Color(0x080808); m.roughness=0.9; m.metalness=0;
          m.map=null; m.normalMap=null; m.roughnessMap=null; m.aoMap=null; m.needsUpdate=true;
        }
        if (m.name === "Glass_material") {
          m.transparent=true; m.opacity=0.15; m.roughness=0.0; m.metalness=0.0;
          m.color=new THREE.Color(0xaaccff); m.map=null;
          m.emissive=new THREE.Color(0x000000); m.emissiveIntensity=0; m.emissiveMap=null;
          m.side=THREE.DoubleSide;
          (m as THREE.MeshPhysicalMaterial).transmission=0; m.needsUpdate=true;
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
    <div className="fixed inset-0 z-[100]" style={{width:"100vw",height:"100vh",background:"#010820"}}>
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

      {progress < 100 && <LoadingScreen progress={progress} />}

      <Canvas camera={{position:[5,5,5],fov:45}} shadows
        gl={{toneMapping:THREE.ACESFilmicToneMapping, toneMappingExposure:0.7,
             outputColorSpace:THREE.SRGBColorSpace, powerPreference:"high-performance"}}>
        <color attach="background" args={["#010820"]}/>
        <SkyDome/>
        <StarField/>
        <ambientLight intensity={0.4}/>
        <spotLight position={[0,8,0]} angle={0.5} penumbra={1} intensity={1.2} castShadow shadow-mapSize={[1024,1024]}/>
        <directionalLight position={[3,6,3]} intensity={0.3}/>
        <directionalLight position={[-3,6,-3]} intensity={0.2}/>
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