import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { RoundedBox, Environment, ContactShadows, useGLTF } from "@react-three/drei";
import { useRef, useEffect, useMemo, Suspense, useState } from "react";
import * as THREE from "three";
import { motion } from "framer-motion";

interface TVZoomOutProps {
  visible: boolean;
  scrollProgress: number;
}

function useWoodTexture() {
  const texture = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    const gradient = ctx.createLinearGradient(0, 0, 512, 512);
    gradient.addColorStop(0, "#4a3520");
    gradient.addColorStop(0.3, "#5a4230");
    gradient.addColorStop(0.5, "#4a3520");
    gradient.addColorStop(0.7, "#3a2815");
    gradient.addColorStop(1, "#4a3520");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 512, 512);

    ctx.strokeStyle = "rgba(30, 20, 10, 0.3)";
    ctx.lineWidth = 1;
    for (let i = 0; i < 100; i++) {
      const y = Math.random() * 512;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.bezierCurveTo(
        128, y + (Math.random() - 0.5) * 20,
        384, y + (Math.random() - 0.5) * 20,
        512, y + (Math.random() - 0.5) * 30
      );
      ctx.stroke();
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    return tex;
  }, []);

  return texture;
}

interface ZoomOutTVProps {
  zoomProgress: number;
}

function ZoomOutTV({ zoomProgress }: ZoomOutTVProps) {
  const groupRef = useRef<THREE.Group>(null);
  const textureRef = useRef<THREE.DataTexture | null>(null);
  const woodTexture = useWoodTexture();
  const screenGlowRef = useRef<THREE.PointLight>(null);
  const { camera } = useThree();
  const { scene: tvScene } = useGLTF("/static/vintage_tv_v2.glb");

  const canvasAtlasRef = useRef<HTMLCanvasElement | null>(null);
  const canvasTextureRef = useRef<THREE.CanvasTexture | null>(null);
  const screenMatRef = useRef<THREE.MeshBasicMaterial | null>(null);

  useEffect(() => {
    const ATLAS = 1024;
    const atlas = document.createElement("canvas");
    atlas.width = ATLAS;
    atlas.height = ATLAS;
    canvasAtlasRef.current = atlas;

    const tex = new THREE.CanvasTexture(atlas);
    tex.wrapS = THREE.ClampToEdgeWrapping;
    tex.wrapT = THREE.ClampToEdgeWrapping;
    tex.flipY = false;
    canvasTextureRef.current = tex;

    const mat = new THREE.MeshBasicMaterial({ map: tex, color: 0xffffff });
    screenMatRef.current = mat;

    tvScene.traverse((child: any) => {
      child.castShadow = true;
      child.receiveShadow = true;
      if (child.isMesh && child.name === "tv_low_tv-retro_0") {
        child.material = mat;
      }
    });

    return () => { tex.dispose(); };
  }, [tvScene]);

  useEffect(() => {
    const size = 256;
    const data = new Uint8Array(size * size * 4);
    for (let i = 0; i < data.length; i += 4) {
      const noise = Math.random() * 255;
      data[i] = noise; data[i + 1] = noise; data[i + 2] = noise; data[i + 3] = 255;
    }
    const tex = new THREE.DataTexture(data, size, size, THREE.RGBAFormat);
    tex.needsUpdate = true;
    textureRef.current = tex;
    return () => { if (textureRef.current) textureRef.current.dispose(); };
  }, []);

  useFrame((state) => {
    const ATLAS = 1024;
    const UV_MIN_U = 0.3984, UV_MIN_V = 0.0411, UV_W = 0.2334, UV_H = 0.2982;
    const sx = Math.round(UV_MIN_U * ATLAS);
    const sy = Math.round(UV_MIN_V * ATLAS);
    const sw = Math.round(UV_W * ATLAS);
    const sh = Math.round(UV_H * ATLAS);

    if (canvasAtlasRef.current && canvasTextureRef.current) {
      const ctx = canvasAtlasRef.current.getContext("2d");
      if (ctx) {
        const imageData = ctx.createImageData(sw, sh);
        const data = imageData.data;
        for (let i = 0; i < data.length; i += 4) {
          const n = Math.random() * 255;
          data[i] = n; data[i + 1] = n; data[i + 2] = n; data[i + 3] = 255;
        }
        ctx.putImageData(imageData, sx, sy);
        canvasTextureRef.current.needsUpdate = true;
      }
    }

    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.15) * 0.015;
    }
    if (screenGlowRef.current) {
      screenGlowRef.current.intensity = 0.3 + Math.sin(state.clock.elapsedTime * 8) * 0.05;
    }

    const startZ = 0.35;
    const endZ = 1.8;
    const targetZ = startZ + zoomProgress * (endZ - startZ);

    camera.position.z += (targetZ - camera.position.z) * 0.15;
    camera.position.x += (0.003 - camera.position.x) * 0.15;
    camera.position.y += (0.22 - camera.position.y) * 0.15;
    camera.lookAt(0.003, 0.22, 0);
  });

  const cabinetMaterial = useMemo(() => {
    return new THREE.MeshPhysicalMaterial({
      map: woodTexture,
      color: 0x3a2815,
      roughness: 0.7,
      metalness: 0.02,
      clearcoat: 0.15,
      clearcoatRoughness: 0.6,
    });
  }, [woodTexture]);

  const plasticMaterial = useMemo(() => {
    return new THREE.MeshPhysicalMaterial({
      color: 0x1a1a1a,
      roughness: 0.4,
      metalness: 0.1,
      clearcoat: 0.3,
      clearcoatRoughness: 0.2,
    });
  }, []);

  const bezelMaterial = useMemo(() => {
    return new THREE.MeshPhysicalMaterial({
      color: 0x2a2a2a,
      roughness: 0.35,
      metalness: 0.15,
      clearcoat: 0.4,
      clearcoatRoughness: 0.15,
    });
  }, []);

  const metalMaterial = useMemo(() => {
    return new THREE.MeshPhysicalMaterial({
      color: 0x888888,
      roughness: 0.3,
      metalness: 0.85,
      clearcoat: 0.2,
      clearcoatRoughness: 0.1,
    });
  }, []);

  return (
    <>
      <group ref={groupRef} position={[0.003, 0.22, 0]} scale={0.19}>
        <primitive object={tvScene} />
        <pointLight
          ref={screenGlowRef}
          position={[0, 0, 60]}
          intensity={0.3}
          color="#ffffff"
          distance={200}
        />
      </group>

      <ContactShadows
        position={[0, -0.1, 0]}
        opacity={0.5}
        scale={8}
        blur={2}
        far={3}
        color="#000000"
      />
    </>
  );
}

function TiledFloor() {
  const floorTexture = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    ctx.fillStyle = "#0a0908";
    ctx.fillRect(0, 0, 512, 512);

    const tileSize = 64;
    ctx.strokeStyle = "#1a1815";
    ctx.lineWidth = 2;

    for (let x = 0; x <= 512; x += tileSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, 512);
      ctx.stroke();
    }
    for (let y = 0; y <= 512; y += tileSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(512, y);
      ctx.stroke();
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(8, 8);
    return tex;
  }, []);

  if (!floorTexture) return null;

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
      <planeGeometry args={[20, 20]} />
      <meshStandardMaterial map={floorTexture} roughness={0.85} metalness={0.05} />
    </mesh>
  );
}

export function TVZoomOut({ visible, scrollProgress }: TVZoomOutProps) {
  if (!visible) return null;

  const zoomOutStart = 0.88;
  const zoomOutEnd = 1.0;

  const zoomProgress = scrollProgress < zoomOutStart ? 0 :
                       scrollProgress > zoomOutEnd ? 1 :
                       (scrollProgress - zoomOutStart) / (zoomOutEnd - zoomOutStart);

  const opacity = zoomProgress < 0.05 ? zoomProgress * 20 : 1;

  return (
    <motion.div
      className="fixed inset-0 overflow-hidden"
      style={{
        opacity,
        pointerEvents: "auto",
        zIndex: 35,
      }}
      data-testid="tv-zoom-out"
    >
      <Canvas
        camera={{ position: [0.003, 0.22, 0.35], fov: 50 }}
        shadows
        gl={{
          antialias: true,
          alpha: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 0.9,
        }}
        dpr={[1, 2]}
        style={{ pointerEvents: "auto" }}
      >
        <Suspense fallback={null}>
          <color attach="background" args={["#050403"]} />
          <fog attach="fog" args={["#050403", 3, 12]} />

          <ambientLight intensity={0.08} color="#1a1820" />

          <spotLight
            position={[0, 3.5, 1.5]}
            angle={0.35}
            penumbra={0.7}
            intensity={15}
            color="#fff8f0"
            castShadow
            shadow-mapSize-width={2048}
            shadow-mapSize-height={2048}
          />

          <spotLight
            position={[-1.5, 2, 2]}
            angle={0.5}
            penumbra={0.9}
            intensity={3}
            color="#aab8cc"
          />

          <Environment preset="night" background={false} />

          <TiledFloor />
          <ZoomOutTV zoomProgress={zoomProgress} />
        </Suspense>
      </Canvas>
    </motion.div>
  );
}

useGLTF.preload("/static/vintage_tv_v2.glb");