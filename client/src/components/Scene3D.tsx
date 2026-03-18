import { Suspense, useRef, useMemo, useEffect, useState, useCallback } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, ContactShadows, ScrollControls, useScroll, useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { WorkSection } from "./WorkSection";

interface Scene3DProps {
  hoveredText: string | null;
  onTVClick: () => void;
  isVideoPlaying: boolean;
  isMuted: boolean;
  onStopVideo: () => void;
  onWorkSectionChange?: (visible: boolean) => void;
  onScrollProgress?: (progress: number) => void;
  onWhiteSectionProgress?: (progress: number) => void;
  onCircleProgress?: (progress: number) => void;
}

function useStaticTexture() {
  const textureRef = useRef<THREE.DataTexture | null>(null);

  if (!textureRef.current) {
    const size = 256;
    const data = new Uint8Array(size * size * 4);
    for (let i = 0; i < data.length; i += 4) {
      const noise = Math.random() * 255;
      data[i] = noise;
      data[i + 1] = noise;
      data[i + 2] = noise;
      data[i + 3] = 255;
    }
    const tex = new THREE.DataTexture(data, size, size, THREE.RGBAFormat);
    tex.needsUpdate = true;
    textureRef.current = tex;
  }

  const updateTexture = useCallback(() => {
    if (textureRef.current) {
      const data = textureRef.current.image.data as Uint8Array;
      for (let i = 0; i < data.length; i += 4) {
        const noise = Math.random() * 255;
        data[i] = noise;
        data[i + 1] = noise;
        data[i + 2] = noise;
      }
      textureRef.current.needsUpdate = true;
    }
  }, []);

  return { textureRef, updateTexture };
}

function useTileTexture() {
  const texture = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = "#0a0908";
    ctx.fillRect(0, 0, 512, 512);
    const tileSize = 128;
    const groutWidth = 4;
    for (let x = 0; x < 512; x += tileSize) {
      for (let y = 0; y < 512; y += tileSize) {
        const brightness = 12 + Math.random() * 8;
        ctx.fillStyle = `rgb(${brightness}, ${brightness * 0.95}, ${brightness * 0.9})`;
        ctx.fillRect(x + groutWidth / 2, y + groutWidth / 2, tileSize - groutWidth, tileSize - groutWidth);
        for (let i = 0; i < 30; i++) {
          const px = x + groutWidth / 2 + Math.random() * (tileSize - groutWidth);
          const py = y + groutWidth / 2 + Math.random() * (tileSize - groutWidth);
          const variation = brightness + (Math.random() - 0.5) * 6;
          ctx.fillStyle = `rgb(${variation}, ${variation * 0.95}, ${variation * 0.9})`;
          ctx.fillRect(px, py, 2, 2);
        }
      }
    }
    ctx.strokeStyle = "#030302";
    ctx.lineWidth = groutWidth;
    for (let x = 0; x <= 512; x += tileSize) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, 512); ctx.stroke();
    }
    for (let y = 0; y <= 512; y += tileSize) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(512, y); ctx.stroke();
    }
    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(8, 8);
    return tex;
  }, []);
  return texture;
}

interface VintageTVProps {
  hoveredText: string | null;
  onClick: () => void;
  isVideoPlaying: boolean;
  isMuted: boolean;
  visible: boolean;
  glitchIntensity: number;
}

function VintageTV({ hoveredText, onClick, isVideoPlaying, isMuted, visible, glitchIntensity }: VintageTVProps) {
  const groupRef = useRef<THREE.Group>(null);
  const { textureRef, updateTexture } = useStaticTexture();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const canvasTextureRef = useRef<THREE.CanvasTexture | null>(null);
  const videoCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const videoTextureRef = useRef<THREE.CanvasTexture | null>(null);
  const videoElRef = useRef<HTMLVideoElement | null>(null);
  const [isHovered, setIsHovered] = useState(false);
  const screenGlowRef = useRef<THREE.PointLight>(null);
  const { scene: tvScene } = useGLTF("/static/vintage_tv_v2.glb");
  const screenMatRef = useRef<THREE.MeshBasicMaterial | null>(null);

  const UV_MIN_U = 0.3984;
  const UV_MIN_V = 0.0411;
  const UV_W = 0.2334;
  const UV_H = 0.2982;
  const ATLAS = 1024;

  useEffect(() => {
    const atlas = document.createElement("canvas");
    atlas.width = ATLAS;
    atlas.height = ATLAS;
    canvasRef.current = atlas;

    const tex = new THREE.CanvasTexture(atlas);
    tex.wrapS = THREE.ClampToEdgeWrapping;
    tex.wrapT = THREE.ClampToEdgeWrapping;
    tex.flipY = false;
    canvasTextureRef.current = tex;

    const videoAtlas = document.createElement("canvas");
    videoAtlas.width = ATLAS;
    videoAtlas.height = ATLAS;
    videoCanvasRef.current = videoAtlas;

    const videoTex = new THREE.CanvasTexture(videoAtlas);
    videoTex.wrapS = THREE.ClampToEdgeWrapping;
    videoTex.wrapT = THREE.ClampToEdgeWrapping;
    videoTex.flipY = false;
    videoTextureRef.current = videoTex;

    if (textureRef.current) {
      textureRef.current.repeat.set(1, 1);
      textureRef.current.offset.set(0, 0);
      textureRef.current.wrapS = THREE.ClampToEdgeWrapping;
      textureRef.current.wrapT = THREE.ClampToEdgeWrapping;
      textureRef.current.needsUpdate = true;
    }

    const mat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      map: tex,
    });
    screenMatRef.current = mat;

    tvScene.traverse((child: any) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
        if (child.name === "tv_low_tv-retro_0") {
          child.material = mat;
        }
      }
    });

    const video = document.createElement("video");
    video.src = "/static/tribute.mp4";
    video.crossOrigin = "anonymous";
    video.loop = true;
    video.playsInline = true;
    video.preload = "auto";
    video.muted = true;
    videoElRef.current = video;

    return () => {
      tex.dispose();
      videoTex.dispose();
      video.pause();
      video.src = "";
      videoElRef.current = null;
    };
  }, [tvScene]);

  useEffect(() => {
    const video = videoElRef.current;
    if (!video) return;
    if (isVideoPlaying) {
      video.muted = true;
      video.play().then(() => {
        setTimeout(() => { if (videoElRef.current) videoElRef.current.muted = isMuted; }, 100);
      }).catch(() => {});
    } else {
      video.pause();
      video.currentTime = 0;
    }
  }, [isVideoPlaying]);

  useEffect(() => {
    if (videoElRef.current) videoElRef.current.muted = isMuted;
  }, [isMuted]);

  useEffect(() => {
    const handleWheel = () => {
      if (videoElRef.current && !videoElRef.current.paused) {
        videoElRef.current.muted = true;
        videoElRef.current.pause();
      }
    };
    window.addEventListener("wheel", handleWheel, { passive: true });
    window.addEventListener("touchmove", handleWheel, { passive: true });
    return () => {
      window.removeEventListener("wheel", handleWheel);
      window.removeEventListener("touchmove", handleWheel);
    };
  }, []);

  useFrame((state) => {
    if (!visible) return;

    if (groupRef.current) {
      // TV is completely static — only gentle idle sway, no mouse interaction
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.15) * 0.015;
      groupRef.current.rotation.x = 0;

      // Position locked — glitch only during transition
      if (glitchIntensity > 0.1) {
        groupRef.current.position.x = 0.003 + (Math.random() - 0.5) * glitchIntensity * 0.05;
        groupRef.current.position.y = 0.22 + (Math.random() - 0.5) * glitchIntensity * 0.03;
      } else {
        groupRef.current.position.x = 0.003;
        groupRef.current.position.y = 0.22;
      }
    }

    if (screenGlowRef.current) {
      screenGlowRef.current.intensity =
        0.3 + Math.sin(state.clock.elapsedTime * 8) * 0.05 + glitchIntensity * 0.5;
    }

    const mat = screenMatRef.current;
    if (!mat) return;

    const sx = Math.round(UV_MIN_U * ATLAS);
    const sy = Math.round(UV_MIN_V * ATLAS);
    const sw = Math.round(UV_W * ATLAS);
    const sh = Math.round(UV_H * ATLAS);

    if (isVideoPlaying && videoCanvasRef.current && videoTextureRef.current && videoElRef.current) {
      const canvas = videoCanvasRef.current;
      const ctx = canvas.getContext("2d");
      const video = videoElRef.current;
      if (ctx && video.readyState >= 2) {
        ctx.clearRect(sx, sy, sw, sh);
        ctx.save();
        ctx.translate(sx + sw / 2, sy + sh / 2);
        ctx.rotate(Math.PI / 2);
        ctx.drawImage(video, -sh / 2, -sw / 2, sh, sw);
        ctx.restore();
        videoTextureRef.current.needsUpdate = true;
        mat.map = videoTextureRef.current;
        mat.color.set(0xffffff);
        mat.needsUpdate = true;
      }
    } else if (hoveredText && canvasRef.current && canvasTextureRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.fillStyle = "#0a0a0a";
        ctx.fillRect(sx, sy, sw, sh);
        for (let i = 0; i < 300; i++) {
          const x = sx + Math.random() * sw;
          const y = sy + Math.random() * sh;
          const gray = Math.random() * 60;
          ctx.fillStyle = `rgb(${gray},${gray},${gray})`;
          ctx.fillRect(x, y, 2, 2);
        }
        ctx.save();
        ctx.translate(sx + sw / 2, sy + sh / 2);
        ctx.rotate(Math.PI / 2);
        ctx.scale(-1, 1);
        ctx.fillStyle = "white";
        ctx.font = `bold ${Math.round(sh * 0.055)}px Arial, sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.shadowColor = "rgba(255,255,255,0.9)";
        ctx.shadowBlur = 10;
        const words = hoveredText.split(" ");
        const lines: string[] = [];
        for (let i = 0; i < words.length; i += 3) lines.push(words.slice(i, i + 3).join(" "));
        const lineH = Math.round(sw * 0.15);
        const startY = -((lines.length - 1) * lineH) / 2;
        lines.forEach((line, i) => ctx.fillText(line, 0, startY + i * lineH));
        ctx.restore();
        canvasTextureRef.current.needsUpdate = true;
        mat.map = canvasTextureRef.current;
        mat.color.set(0xffffff);
        mat.needsUpdate = true;
      }
    } else {
      if (canvasRef.current && canvasTextureRef.current) {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          const imageData = ctx.createImageData(sw, sh);
          const data = imageData.data;
          for (let i = 0; i < data.length; i += 4) {
            const n = Math.random() * 255;
            data[i] = n; data[i + 1] = n; data[i + 2] = n; data[i + 3] = 255;
          }
          ctx.putImageData(imageData, sx, sy);
          canvasTextureRef.current.needsUpdate = true;
          mat.map = canvasTextureRef.current;
          mat.color.set(0xffffff);
          mat.needsUpdate = true;
        }
      }
    }
  });

  const handleClick = useCallback((e: any) => {
    e.stopPropagation();
    onClick();
  }, [onClick]);

  if (!visible) return null;

  return (
    <group
      ref={groupRef}
      position={[0.003, 0.22, 0]}
      scale={0.19}
      onClick={handleClick}
      onPointerOver={() => setIsHovered(true)}
      onPointerOut={() => setIsHovered(false)}
    >
      <primitive object={tvScene} />
      <pointLight
        ref={screenGlowRef}
        position={[0, 0, 1.5]}
        intensity={0.3}
        color="#aaccff"
        distance={5}
        decay={2}
      />
      {isHovered && (
        <pointLight position={[0, 0, 2]} intensity={0.2} color="#ffddcc" distance={6} />
      )}
    </group>
  );
}

function TiledFloor({ visible }: { visible: boolean }) {
  const tileTexture = useTileTexture();
  if (!visible) return null;
  return (
    <mesh position={[0, -0.01, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <planeGeometry args={[30, 30]} />
      <meshStandardMaterial map={tileTexture} roughness={0.85} metalness={0.05} />
    </mesh>
  );
}

function GlitchOverlay({ intensity }: { intensity: number }) {
  const meshRef = useRef<THREE.Mesh>(null);
  useFrame(() => {
    if (meshRef.current && intensity > 0.1) {
      const material = meshRef.current.material as THREE.MeshBasicMaterial;
      material.opacity = intensity * 0.3 * (0.5 + Math.random() * 0.5);
      if (Math.random() < intensity * 0.3) {
        meshRef.current.position.x = (Math.random() - 0.5) * 0.1;
        meshRef.current.position.y = (Math.random() - 0.5) * 0.1;
      } else {
        meshRef.current.position.x = 0;
        meshRef.current.position.y = 0;
      }
    }
  });
  if (intensity < 0.1) return null;
  return (
    <mesh ref={meshRef} position={[0, 0, 0.3]}>
      <planeGeometry args={[3, 3]} />
      <meshBasicMaterial
        color={Math.random() > 0.5 ? "#ff00ff" : "#00ffff"}
        transparent
        opacity={0}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
}

interface ScrollSceneProps {
  hoveredText: string | null;
  onTVClick: () => void;
  isVideoPlaying: boolean;
  isMuted: boolean;
  onStopVideo: () => void;
  onWorkSectionChange?: (visible: boolean) => void;
  onScrollProgress?: (progress: number) => void;
  onWhiteSectionProgress?: (progress: number) => void;
  onCircleProgress?: (progress: number) => void;
}

function ScrollSceneContent({ hoveredText, onTVClick, isVideoPlaying, isMuted, onStopVideo, onWorkSectionChange, onScrollProgress, onWhiteSectionProgress, onCircleProgress }: ScrollSceneProps) {
  const scroll = useScroll();
  const { camera } = useThree();
  const [showWorkSection, setShowWorkSection] = useState(false);
  const [glitchIntensity, setGlitchIntensity] = useState(0);
  // Camera target — mouse drives this, TV never touched
  const mouseTarget = useRef({ x: 0, y: 0 });
  const smoothCamera = useRef({ x: 0, y: 0 });
  const gyroRef = useRef({ active: false, baseGamma: 0, baseBeta: 0, calibrated: false });
  const transitionThreshold = 0.10;
  const whiteSectionStart = 0.88;
  const circleStart = 0.94;

  const onStopVideoRef = useRef(onStopVideo);
  onStopVideoRef.current = onStopVideo;
  const isVideoPlayingRef = useRef(isVideoPlaying);
  isVideoPlayingRef.current = isVideoPlaying;
  const navAnimFrame = useRef<number>(0);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // Desktop only — live check
      if (window.innerWidth <= 768) return;
      // Map mouse to small camera offset range
      // x: left=-0.15 center=0 right=+0.15
      // y: top=+0.08 center=0 bottom=-0.08
      mouseTarget.current.x = (e.clientX / window.innerWidth - 0.5) * 0.30;
      mouseTarget.current.y = -(e.clientY / window.innerHeight - 0.5) * 0.16;
    };

    const handleOrientation = (e: DeviceOrientationEvent) => {
      const gamma = e.gamma ?? 0;
      const beta = e.beta ?? 0;
      const g = gyroRef.current;
      g.active = true;
      if (!g.calibrated) {
        g.baseGamma = gamma;
        g.baseBeta = beta;
        g.calibrated = true;
      }
      const deltaGamma = Math.max(-30, Math.min(30, gamma - g.baseGamma));
      const deltaBeta = Math.max(-30, Math.min(30, beta - g.baseBeta));
      mouseTarget.current.x = (deltaGamma / 30) * 0.12;
      mouseTarget.current.y = (deltaBeta / 30) * 0.08;
    };

    const requestGyro = async () => {
      if (typeof (DeviceOrientationEvent as any).requestPermission === "function") {
        try {
          const permission = await (DeviceOrientationEvent as any).requestPermission();
          if (permission === "granted") {
            window.addEventListener("deviceorientation", handleOrientation, true);
          }
        } catch {}
      } else {
        window.addEventListener("deviceorientation", handleOrientation, true);
      }
    };

    requestGyro();

    const handleWheel = () => { onStopVideoRef.current(); };
    const handleTouchMove = () => { onStopVideoRef.current(); };
    const handleNavigateTo = (e: Event) => {
      if (isVideoPlayingRef.current) onStopVideoRef.current();
      const section = (e as CustomEvent).detail?.section;
      if (!section) return;
      const targetOffsets: Record<string, number> = {
        landing: 0, about: 0.20, works: 1.0, room: 1.0, contact: 1.0,
      };
      const targetOffset = targetOffsets[section];
      if (targetOffset === undefined) return;
      const el = scroll.el;
      const maxScroll = el.scrollHeight - el.clientHeight;
      const targetScrollTop = targetOffset * maxScroll;
      cancelAnimationFrame(navAnimFrame.current);
      const startScrollTop = el.scrollTop;
      const distance = targetScrollTop - startScrollTop;
      if (Math.abs(distance) < 5) {
        if (section === "contact" || section === "room") {
          setTimeout(() => { window.dispatchEvent(new CustomEvent("navigateWhiteSection", { detail: { section } })); }, 100);
        }
        if (section === "works") {
          window.dispatchEvent(new CustomEvent("navigateWhiteSection", { detail: { section: "works" } }));
        }
        if (section === "landing" || section === "about") {
          window.dispatchEvent(new CustomEvent("navigateWhiteSection", { detail: { section: "reset" } }));
          requestAnimationFrame(() => { window.dispatchEvent(new Event("scroll")); });
        }
        return;
      }
      const duration = Math.min(3000, Math.max(1200, Math.abs(distance) * 0.8));
      const startTime = performance.now();
      const easeInOutCubic = (t: number) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
      const animateScroll = (now: number) => {
        const elapsed = now - startTime;
        const rawProgress = Math.min(1, elapsed / duration);
        el.scrollTop = startScrollTop + distance * easeInOutCubic(rawProgress);
        if (rawProgress < 1) {
          navAnimFrame.current = requestAnimationFrame(animateScroll);
        } else {
          setTimeout(() => { window.dispatchEvent(new Event("scroll")); }, 50);
          if (section === "contact" || section === "room") {
            setTimeout(() => { window.dispatchEvent(new CustomEvent("navigateWhiteSection", { detail: { section } })); }, 200);
          }
          if (section === "works") {
            window.dispatchEvent(new CustomEvent("navigateWhiteSection", { detail: { section: "works" } }));
          }
          if (section === "landing" || section === "about") {
            window.dispatchEvent(new CustomEvent("navigateWhiteSection", { detail: { section: "reset" } }));
          }
        }
      };
      navAnimFrame.current = requestAnimationFrame(animateScroll);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("wheel", handleWheel, { passive: true });
    window.addEventListener("touchmove", handleTouchMove, { passive: true });
    window.addEventListener("navigateTo", handleNavigateTo);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("wheel", handleWheel);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("navigateTo", handleNavigateTo);
      window.removeEventListener("deviceorientation", handleOrientation as any, true);
      cancelAnimationFrame(navAnimFrame.current);
    };
  }, []);

  useFrame(() => {
    const offset = scroll.offset;
    const startZ = 1.8;
    const screenZ = 0.3;
    const tvScreenY = 0.22;
    const baseCameraX = -0.05;
    let targetZ: number;
    let targetY: number;
    const isLanding = offset < transitionThreshold;

    // Smoothly lerp camera toward mouse target — only on landing page
    const lerpSpeed = 0.06;
    if (isLanding) {
      smoothCamera.current.x += (mouseTarget.current.x - smoothCamera.current.x) * lerpSpeed;
      smoothCamera.current.y += (mouseTarget.current.y - smoothCamera.current.y) * lerpSpeed;
    } else {
      // Ease back to center when off landing
      smoothCamera.current.x += (0 - smoothCamera.current.x) * lerpSpeed;
      smoothCamera.current.y += (0 - smoothCamera.current.y) * lerpSpeed;
    }

    if (offset < transitionThreshold) {
      const progress = offset / transitionThreshold;
      targetZ = startZ - (startZ - screenZ) * progress;
      targetY = tvScreenY;
    } else {
      targetZ = screenZ;
      targetY = tvScreenY;
    }

    // Camera moves — TV stays completely still
    camera.position.x += (baseCameraX + smoothCamera.current.x - camera.position.x) * 0.1;
    camera.position.y += (targetY + smoothCamera.current.y - camera.position.y) * 0.1;
    camera.position.z += (targetZ - camera.position.z) * 0.1;
    // Always look at the fixed TV centre
    camera.lookAt(baseCameraX, tvScreenY, 0);

    const glitchProgress = Math.max(0, Math.min(1, (offset - 0.15) / 0.3));
    setGlitchIntensity(glitchProgress);

    const isWorkVisible = offset > transitionThreshold;
    setShowWorkSection(isWorkVisible);
    onWorkSectionChange?.(isWorkVisible);

    if (isWorkVisible) {
      onScrollProgress?.((offset - transitionThreshold) / (1 - transitionThreshold));
    } else {
      onScrollProgress?.(0);
    }
    if (offset > whiteSectionStart) {
      onWhiteSectionProgress?.(Math.min(1, (offset - whiteSectionStart) / (1 - whiteSectionStart)));
    } else {
      onWhiteSectionProgress?.(0);
    }
    if (offset > circleStart) {
      onCircleProgress?.(Math.min(1, (offset - circleStart) / (1 - circleStart)));
    } else {
      onCircleProgress?.(0);
    }
  });

  const showLandingTV = !showWorkSection;
  const bgColor = showWorkSection ? "#0066FF" : "#050403";

  return (
    <>
      <color attach="background" args={[bgColor]} />
      <fog attach="fog" args={[bgColor, 3, showWorkSection ? 50 : 12]} />
      <ambientLight intensity={showLandingTV ? 0.08 : 0.05} color={showLandingTV ? "#1a1820" : "#1a1a40"} />
      <spotLight
        position={[0, 3.5, 1.5]}
        angle={0.35}
        penumbra={0.7}
        intensity={showLandingTV ? 15 : 5}
        color="#fff8f0"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-bias={-0.0001}
      />
      <spotLight
        position={[-1.5, 2, 2]}
        angle={0.5}
        penumbra={0.9}
        intensity={showLandingTV ? 3 : 1}
        color="#aab8cc"
      />
      <Environment preset="night" background={false} />
      <TiledFloor visible={showLandingTV} />
      {showLandingTV && (
        <ContactShadows position={[0, 0, 0]} opacity={0.6} scale={10} blur={2} far={4} color="#000000" />
      )}
      <VintageTV
        hoveredText={hoveredText}
        onClick={onTVClick}
        isVideoPlaying={isVideoPlaying}
        isMuted={isMuted}
        visible={showLandingTV}
        glitchIntensity={glitchIntensity}
      />
      <GlitchOverlay intensity={glitchIntensity} />
      <WorkSection visible={showWorkSection} />
    </>
  );
}

export function Scene3D({ hoveredText, onTVClick, isVideoPlaying, isMuted, onStopVideo, onWorkSectionChange, onScrollProgress, onWhiteSectionProgress, onCircleProgress }: Scene3DProps) {
  return (
    <div className="fixed inset-0 z-0" data-testid="scene-3d-container">
      <Canvas
        camera={{ position: [0, 0.55, 1.8], fov: 50 }}
        shadows
        gl={{
          antialias: true,
          alpha: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 0.9,
          failIfMajorPerformanceCaveat: false,
          preserveDrawingBuffer: true,
        }}
        dpr={[1, 1.5]}
        onCreated={({ gl }) => {
          gl.domElement.addEventListener("webglcontextlost", (e) => { e.preventDefault(); });
          gl.domElement.addEventListener("webglcontextrestored", () => {});
        }}
      >
        <Suspense fallback={null}>
          <ScrollControls pages={22} damping={0.2}>
            <ScrollSceneContent
              hoveredText={hoveredText}
              onTVClick={onTVClick}
              isVideoPlaying={isVideoPlaying}
              isMuted={isMuted}
              onStopVideo={onStopVideo}
              onWorkSectionChange={onWorkSectionChange}
              onScrollProgress={onScrollProgress}
              onWhiteSectionProgress={onWhiteSectionProgress}
              onCircleProgress={onCircleProgress}
            />
          </ScrollControls>
        </Suspense>
      </Canvas>
    </div>
  );
}

useGLTF.preload("/static/vintage_tv_v2.glb");