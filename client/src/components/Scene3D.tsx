import { Suspense, useRef, useMemo, useEffect, useState, useCallback } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, RoundedBox, ContactShadows, ScrollControls, useScroll, Scroll } from "@react-three/drei";
import * as THREE from "three";
import { WorkSection } from "./WorkSection";

interface Scene3DProps {
  hoveredText: string | null;
  onTVClick: () => void;
  isVideoPlaying: boolean;
}

function useStaticTexture() {
  const textureRef = useRef<THREE.DataTexture | null>(null);
  const [, forceUpdate] = useState(0);

  useEffect(() => {
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
    forceUpdate(n => n + 1);

    return () => {
      if (textureRef.current) {
        textureRef.current.dispose();
      }
    };
  }, []);

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

  return { texture: textureRef.current, updateTexture };
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
        ctx.fillRect(
          x + groutWidth / 2, 
          y + groutWidth / 2, 
          tileSize - groutWidth, 
          tileSize - groutWidth
        );
        
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
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(8, 8);
    return tex;
  }, []);
  
  return texture;
}

function useWoodTexture() {
  const texture = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext("2d")!;
    
    const gradient = ctx.createLinearGradient(0, 0, 0, 512);
    gradient.addColorStop(0, "#2a1a0a");
    gradient.addColorStop(0.25, "#3a2515");
    gradient.addColorStop(0.5, "#2d1c0c");
    gradient.addColorStop(0.75, "#3a2515");
    gradient.addColorStop(1, "#2a1a0a");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 512, 512);
    
    ctx.strokeStyle = "rgba(20, 10, 0, 0.3)";
    ctx.lineWidth = 1;
    for (let i = 0; i < 80; i++) {
      const y = Math.random() * 512;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.bezierCurveTo(
        128, y + (Math.random() - 0.5) * 6,
        384, y + (Math.random() - 0.5) * 6,
        512, y + (Math.random() - 0.5) * 4
      );
      ctx.stroke();
    }
    
    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    return tex;
  }, []);
  
  return texture;
}

interface VintageTVProps {
  hoveredText: string | null;
  onClick: () => void;
  isVideoPlaying: boolean;
  visible: boolean;
  glitchIntensity: number;
}

function VintageTV({ hoveredText, onClick, isVideoPlaying, visible, glitchIntensity }: VintageTVProps) {
  const groupRef = useRef<THREE.Group>(null);
  const { texture: staticTexture, updateTexture } = useStaticTexture();
  const woodTexture = useWoodTexture();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const canvasTextureRef = useRef<THREE.CanvasTexture | null>(null);
  const videoCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const videoTextureRef = useRef<THREE.CanvasTexture | null>(null);
  const frameRef = useRef(0);
  const [isHovered, setIsHovered] = useState(false);
  const screenGlowRef = useRef<THREE.PointLight>(null);

  useEffect(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 384;
    canvasRef.current = canvas;
    const tex = new THREE.CanvasTexture(canvas);
    canvasTextureRef.current = tex;

    const videoCanvas = document.createElement("canvas");
    videoCanvas.width = 512;
    videoCanvas.height = 384;
    videoCanvasRef.current = videoCanvas;
    const videoTex = new THREE.CanvasTexture(videoCanvas);
    videoTextureRef.current = videoTex;

    return () => {
      tex.dispose();
      videoTex.dispose();
    };
  }, []);

  useFrame((state) => {
    if (!visible) return;
    
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.15) * 0.015;
      
      if (glitchIntensity > 0.1) {
        groupRef.current.position.x = (Math.random() - 0.5) * glitchIntensity * 0.05;
        groupRef.current.position.y = 0.22 + (Math.random() - 0.5) * glitchIntensity * 0.03;
      } else {
        groupRef.current.position.x = 0;
        groupRef.current.position.y = 0.22;
      }
    }

    if (screenGlowRef.current) {
      screenGlowRef.current.intensity = 0.3 + Math.sin(state.clock.elapsedTime * 8) * 0.05 + glitchIntensity * 0.5;
    }

    if (isVideoPlaying && videoCanvasRef.current && videoTextureRef.current) {
      const canvas = videoCanvasRef.current;
      const ctx = canvas.getContext("2d");
      
      if (ctx) {
        frameRef.current += 1;
        
        const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        gradient.addColorStop(0, `hsl(${(frameRef.current * 2) % 360}, 70%, 20%)`);
        gradient.addColorStop(0.5, `hsl(${(frameRef.current * 2 + 60) % 360}, 80%, 30%)`);
        gradient.addColorStop(1, `hsl(${(frameRef.current * 2 + 120) % 360}, 70%, 20%)`);
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.fillStyle = "white";
        ctx.font = "bold 48px Arial, sans-serif";
        ctx.textAlign = "center";
        ctx.shadowColor = "rgba(0, 0, 0, 0.5)";
        ctx.shadowBlur = 10;
        
        ctx.fillText("MESSI", canvas.width / 2, canvas.height / 2 - 40);
        ctx.fillText("GOAT", canvas.width / 2, canvas.height / 2 + 30);
        ctx.font = "20px Arial, sans-serif";
        ctx.fillText("Best Moments Tribute", canvas.width / 2, canvas.height / 2 + 80);
        
        for (let y = 0; y < canvas.height; y += 3) {
          ctx.fillStyle = `rgba(0, 0, 0, ${0.03 + Math.sin(y * 0.5 + frameRef.current * 0.1) * 0.02})`;
          ctx.fillRect(0, y, canvas.width, 1);
        }
        
        videoTextureRef.current.needsUpdate = true;
      }
    } else if (hoveredText && canvasRef.current && canvasTextureRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      
      if (ctx) {
        ctx.fillStyle = "#0a0a0a";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        for (let i = 0; i < 600; i++) {
          const x = Math.random() * canvas.width;
          const y = Math.random() * canvas.height;
          const gray = Math.random() * 60;
          ctx.fillStyle = `rgb(${gray}, ${gray}, ${gray})`;
          ctx.fillRect(x, y, 2, 2);
        }

        ctx.fillStyle = "white";
        ctx.font = "bold 28px Arial, sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        
        ctx.shadowColor = "rgba(255, 255, 255, 0.9)";
        ctx.shadowBlur = 15;
        
        const words = hoveredText.split(" ");
        const maxWordsPerLine = 3;
        const lines: string[] = [];
        
        for (let i = 0; i < words.length; i += maxWordsPerLine) {
          lines.push(words.slice(i, i + maxWordsPerLine).join(" "));
        }
        
        const lineHeight = 40;
        const startY = canvas.height / 2 - ((lines.length - 1) * lineHeight) / 2;
        
        lines.forEach((line, i) => {
          ctx.fillText(line, canvas.width / 2, startY + i * lineHeight);
        });
        
        for (let y = 0; y < canvas.height; y += 2) {
          ctx.fillStyle = "rgba(0, 0, 0, 0.1)";
          ctx.fillRect(0, y, canvas.width, 1);
        }
        
        canvasTextureRef.current.needsUpdate = true;
      }
    } else if (!isVideoPlaying) {
      updateTexture();
    }
  });

  const screenMaterial = useMemo(() => {
    if (isVideoPlaying && videoTextureRef.current) {
      return new THREE.MeshBasicMaterial({ map: videoTextureRef.current });
    }
    if (hoveredText && canvasTextureRef.current) {
      return new THREE.MeshBasicMaterial({ map: canvasTextureRef.current });
    }
    if (staticTexture) {
      return new THREE.MeshBasicMaterial({ map: staticTexture });
    }
    return new THREE.MeshBasicMaterial({ color: 0x333333 });
  }, [staticTexture, hoveredText, isVideoPlaying]);

  const handleClick = useCallback((e: any) => {
    e.stopPropagation();
    onClick();
  }, [onClick]);

  const cabinetMaterial = useMemo(() => {
    return new THREE.MeshPhysicalMaterial({
      map: woodTexture,
      color: isHovered ? 0x4a3520 : 0x3a2815,
      roughness: 0.7,
      metalness: 0.02,
      clearcoat: 0.15,
      clearcoatRoughness: 0.6,
    });
  }, [woodTexture, isHovered]);

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

  const screenWidth = 0.52;
  const screenHeight = 0.39;

  if (!visible) return null;

  return (
    <group 
      ref={groupRef} 
      position={[0, 0.22, 0]}
      scale={0.85}
      onClick={handleClick}
      onPointerOver={() => setIsHovered(true)}
      onPointerOut={() => setIsHovered(false)}
    >
      <RoundedBox args={[0.85, 0.65, 0.55]} radius={0.03} smoothness={4} position={[0, 0, 0]} castShadow receiveShadow>
        <primitive object={cabinetMaterial} attach="material" />
      </RoundedBox>

      <RoundedBox args={[0.58, 0.46, 0.08]} radius={0.02} smoothness={4} position={[-0.08, 0.02, 0.25]} castShadow>
        <primitive object={bezelMaterial} attach="material" />
      </RoundedBox>

      <mesh position={[-0.08, 0.02, 0.22]}>
        <boxGeometry args={[screenWidth + 0.02, screenHeight + 0.02, 0.08]} />
        <meshStandardMaterial color="#050505" />
      </mesh>

      <mesh position={[-0.08, 0.02, 0.295]}>
        <planeGeometry args={[screenWidth, screenHeight]} />
        <primitive object={screenMaterial} attach="material" />
      </mesh>

      <mesh position={[-0.08, 0.02, 0.30]}>
        <planeGeometry args={[screenWidth + 0.01, screenHeight + 0.01]} />
        <meshPhysicalMaterial
          color="#111111"
          roughness={0.02}
          metalness={0}
          transmission={0.05}
          thickness={0.01}
          clearcoat={1}
          clearcoatRoughness={0.03}
          transparent
          opacity={0.15}
        />
      </mesh>

      <group position={[0.32, 0, 0.28]}>
        <RoundedBox args={[0.14, 0.5, 0.04]} radius={0.01} smoothness={4}>
          <primitive object={plasticMaterial} attach="material" />
        </RoundedBox>

        {[-0.12, -0.05, 0.02, 0.09, 0.16].map((y, i) => (
          <mesh key={i} position={[0, y, 0.025]}>
            <boxGeometry args={[0.1, 0.015, 0.01]} />
            <meshStandardMaterial color="#0a0a0a" roughness={0.9} />
          </mesh>
        ))}

        <group position={[0, -0.18, 0.025]}>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.035, 0.035, 0.025, 32]} />
            <primitive object={metalMaterial} attach="material" />
          </mesh>
          <mesh position={[0.012, 0, 0.015]}>
            <boxGeometry args={[0.008, 0.02, 0.005]} />
            <meshStandardMaterial color="#333333" />
          </mesh>
        </group>

        <mesh position={[0.04, -0.18, 0.03]}>
          <sphereGeometry args={[0.008, 12, 12]} />
          <meshBasicMaterial color="#ff2200" />
        </mesh>
      </group>

      <mesh position={[-0.2, 0.4, 0]} rotation={[0, 0, -0.35]}>
        <cylinderGeometry args={[0.008, 0.012, 0.45, 8]} />
        <primitive object={metalMaterial} attach="material" />
      </mesh>
      <mesh position={[0.15, 0.4, 0]} rotation={[0, 0, 0.35]}>
        <cylinderGeometry args={[0.008, 0.012, 0.45, 8]} />
        <primitive object={metalMaterial} attach="material" />
      </mesh>

      <mesh position={[-0.32, 0.55, 0]}>
        <sphereGeometry args={[0.015, 12, 12]} />
        <primitive object={metalMaterial} attach="material" />
      </mesh>
      <mesh position={[0.27, 0.55, 0]}>
        <sphereGeometry args={[0.015, 12, 12]} />
        <primitive object={metalMaterial} attach="material" />
      </mesh>

      <mesh position={[-0.025, 0.33, 0]}>
        <boxGeometry args={[0.08, 0.02, 0.1]} />
        <meshStandardMaterial color="#1a1510" roughness={0.8} />
      </mesh>

      <mesh position={[-0.3, -0.38, 0.18]} rotation={[0.08, 0, 0.05]}>
        <cylinderGeometry args={[0.025, 0.04, 0.12, 8]} />
        <primitive object={cabinetMaterial} attach="material" />
      </mesh>
      <mesh position={[0.3, -0.38, 0.18]} rotation={[0.08, 0, -0.05]}>
        <cylinderGeometry args={[0.025, 0.04, 0.12, 8]} />
        <primitive object={cabinetMaterial} attach="material" />
      </mesh>
      <mesh position={[-0.3, -0.38, -0.18]} rotation={[-0.08, 0, 0.05]}>
        <cylinderGeometry args={[0.025, 0.04, 0.12, 8]} />
        <primitive object={cabinetMaterial} attach="material" />
      </mesh>
      <mesh position={[0.3, -0.38, -0.18]} rotation={[-0.08, 0, -0.05]}>
        <cylinderGeometry args={[0.025, 0.04, 0.12, 8]} />
        <primitive object={cabinetMaterial} attach="material" />
      </mesh>

      <pointLight 
        ref={screenGlowRef}
        position={[-0.08, 0.02, 0.5]} 
        intensity={0.3} 
        color="#aaccff" 
        distance={1.5} 
        decay={2} 
      />
      
      {isHovered && (
        <pointLight position={[0, 0, 0.8]} intensity={0.2} color="#ffddcc" distance={2} />
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
      <meshStandardMaterial 
        map={tileTexture}
        roughness={0.85}
        metalness={0.05}
      />
    </mesh>
  );
}

function GlitchOverlay({ intensity }: { intensity: number }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const colorRef = useRef(new THREE.Color("#00ffff"));
  const targetOpacity = useRef(0);
  
  useFrame((state) => {
    if (meshRef.current && intensity > 0.05) {
      const material = meshRef.current.material as THREE.MeshBasicMaterial;
      
      const flickerSpeed = intensity * 0.4;
      const flicker = Math.sin(state.clock.elapsedTime * 20) * 0.5 + 0.5;
      const baseOpacity = intensity * 0.25 * flicker;
      
      targetOpacity.current += (baseOpacity - targetOpacity.current) * 0.15;
      material.opacity = targetOpacity.current;
      
      if (Math.random() < flickerSpeed * 0.5) {
        const hue = Math.random() > 0.5 ? 0.85 : 0.5;
        colorRef.current.setHSL(hue, 1, 0.5);
        material.color.copy(colorRef.current);
      }
      
      const jitterAmount = intensity * intensity * 0.08;
      if (Math.random() < intensity * 0.4) {
        meshRef.current.position.x = (Math.random() - 0.5) * jitterAmount;
        meshRef.current.position.y = (Math.random() - 0.5) * jitterAmount;
      } else {
        meshRef.current.position.x *= 0.8;
        meshRef.current.position.y *= 0.8;
      }
    } else if (meshRef.current) {
      const material = meshRef.current.material as THREE.MeshBasicMaterial;
      material.opacity *= 0.9;
      meshRef.current.position.x *= 0.9;
      meshRef.current.position.y *= 0.9;
    }
  });

  if (intensity < 0.02) return null;

  return (
    <mesh ref={meshRef} position={[0, 0, 0.3]}>
      <planeGeometry args={[4, 4]} />
      <meshBasicMaterial 
        color="#00ffff"
        transparent
        opacity={0}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </mesh>
  );
}

interface ScrollSceneProps {
  hoveredText: string | null;
  onTVClick: () => void;
  isVideoPlaying: boolean;
}

function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function easeOutQuart(t: number): number {
  return 1 - Math.pow(1 - t, 4);
}

function ScrollSceneContent({ hoveredText, onTVClick, isVideoPlaying }: ScrollSceneProps) {
  const scroll = useScroll();
  const { camera } = useThree();
  const [transitionProgress, setTransitionProgress] = useState(0);
  const [glitchIntensity, setGlitchIntensity] = useState(0);
  const targetPosition = useRef({ x: 0, y: 0 });
  const smoothedProgress = useRef(0);
  const lookAtY = useRef(0.22);
  const lookAtZ = useRef(0.3);
  const transitionThreshold = 0.4;

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      targetPosition.current.x = (e.clientX / window.innerWidth - 0.5) * 0.15;
      targetPosition.current.y = (e.clientY / window.innerHeight - 0.5) * 0.1;
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  useFrame(() => {
    const offset = scroll.offset;
    
    smoothedProgress.current += (offset - smoothedProgress.current) * 0.04;
    const smoothOffset = smoothedProgress.current;
    
    const startZ = 1.8;
    const screenZ = 0.15;
    const endZ = -20;
    
    let targetZ: number;
    let targetY: number;
    let targetLookY: number;
    let targetLookZ: number;
    
    if (smoothOffset < transitionThreshold) {
      const progress = easeOutQuart(smoothOffset / transitionThreshold);
      targetZ = startZ - (startZ - screenZ) * progress;
      targetY = 0.55 - progress * 0.33;
      targetLookY = 0.22;
      targetLookZ = 0.3;
    } else {
      const rawProgress = (smoothOffset - transitionThreshold) / (1 - transitionThreshold);
      const postProgress = easeInOutCubic(rawProgress);
      targetZ = screenZ - (screenZ - endZ) * postProgress;
      targetY = 0.22 + postProgress * 2;
      targetLookY = 0.22 + postProgress * 3;
      targetLookZ = 0.3 - postProgress * 25;
    }
    
    camera.position.z += (targetZ - camera.position.z) * 0.06;
    camera.position.x += (targetPosition.current.x * (1 - smoothOffset) - camera.position.x) * 0.02;
    camera.position.y += (-targetPosition.current.y + targetY - camera.position.y) * 0.04;
    
    lookAtY.current += (targetLookY - lookAtY.current) * 0.03;
    lookAtZ.current += (targetLookZ - lookAtZ.current) * 0.03;
    camera.lookAt(0, lookAtY.current, lookAtZ.current);
    
    const fadeStart = transitionThreshold - 0.08;
    const fadeEnd = transitionThreshold + 0.08;
    const fadeProgress = Math.max(0, Math.min(1, (smoothOffset - fadeStart) / (fadeEnd - fadeStart)));
    const easedFade = easeInOutCubic(fadeProgress);
    setTransitionProgress(easedFade);
    
    const glitchStart = transitionThreshold - 0.15;
    const glitchEnd = transitionThreshold + 0.1;
    const glitchRaw = Math.max(0, Math.min(1, (smoothOffset - glitchStart) / (glitchEnd - glitchStart)));
    const glitchEased = Math.sin(glitchRaw * Math.PI);
    setGlitchIntensity(glitchEased);
  });
  
  const showWorkSection = transitionProgress > 0.5;
  const tvOpacity = 1 - transitionProgress;
  const workOpacity = transitionProgress;

  const bgR = 0.02 + transitionProgress * 0.005;
  const bgG = 0.016 + transitionProgress * 0.005;
  const bgB = 0.012 + transitionProgress * 0.02;
  
  const ambientIntensity = 0.08 - transitionProgress * 0.03;
  const spotIntensity1 = 15 - transitionProgress * 10;
  const spotIntensity2 = 3 - transitionProgress * 2;
  const fogFar = 12 + transitionProgress * 38;

  return (
    <>
      <color attach="background" args={[bgR, bgG, bgB]} />
      <fog attach="fog" args={[new THREE.Color(bgR, bgG, bgB), 3, fogFar]} />
      
      <ambientLight intensity={ambientIntensity} color={transitionProgress > 0.5 ? "#1a1a40" : "#1a1820"} />

      <spotLight
        position={[0, 3.5, 1.5]}
        angle={0.35}
        penumbra={0.7}
        intensity={spotIntensity1}
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
        intensity={spotIntensity2}
        color="#aab8cc"
      />

      <Environment preset="night" background={false} />
      
      <TiledFloor visible={tvOpacity > 0.1} />

      {tvOpacity > 0.1 && (
        <ContactShadows
          position={[0, 0, 0]}
          opacity={0.6 * tvOpacity}
          scale={10}
          blur={2}
          far={4}
          color="#000000"
        />
      )}
      
      <VintageTV
        hoveredText={hoveredText}
        onClick={onTVClick}
        isVideoPlaying={isVideoPlaying}
        visible={tvOpacity > 0.05}
        glitchIntensity={glitchIntensity}
      />

      <GlitchOverlay intensity={glitchIntensity} />

      <WorkSection visible={workOpacity > 0.05} />
    </>
  );
}

export function Scene3D({ hoveredText, onTVClick, isVideoPlaying }: Scene3DProps) {
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
        }}
        dpr={[1, 2]}
      >
        <Suspense fallback={null}>
          <ScrollControls pages={2} damping={0.12}>
            <ScrollSceneContent
              hoveredText={hoveredText}
              onTVClick={onTVClick}
              isVideoPlaying={isVideoPlaying}
            />
          </ScrollControls>
        </Suspense>
      </Canvas>
    </div>
  );
}
