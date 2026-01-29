import { Suspense, useRef, useMemo, useEffect, useState, useCallback } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, RoundedBox, ContactShadows, ScrollControls, useScroll, Scroll } from "@react-three/drei";
import * as THREE from "three";
import { WorkSection } from "./WorkSection";

interface Scene3DProps {
  hoveredText: string | null;
  onTVClick: () => void;
  isVideoPlaying: boolean;
  onWorkSectionChange?: (visible: boolean) => void;
  onScrollProgress?: (progress: number) => void;
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
      color: isHovered ? 0x8b5a2b : 0x7a4a1b,
      roughness: 0.65,
      metalness: 0.02,
      clearcoat: 0.2,
      clearcoatRoughness: 0.5,
    });
  }, [woodTexture, isHovered]);

  const controlPanelMaterial = useMemo(() => {
    return new THREE.MeshPhysicalMaterial({
      color: 0x1a1815,
      roughness: 0.4,
      metalness: 0.1,
      clearcoat: 0.3,
      clearcoatRoughness: 0.2,
    });
  }, []);

  const bezelMaterial = useMemo(() => {
    return new THREE.MeshPhysicalMaterial({
      color: 0x151515,
      roughness: 0.3,
      metalness: 0.1,
      clearcoat: 0.5,
      clearcoatRoughness: 0.15,
    });
  }, []);

  const goldTrimMaterial = useMemo(() => {
    return new THREE.MeshPhysicalMaterial({
      color: 0xc9a227,
      roughness: 0.25,
      metalness: 0.9,
      clearcoat: 0.4,
      clearcoatRoughness: 0.1,
    });
  }, []);

  const chromeMaterial = useMemo(() => {
    return new THREE.MeshPhysicalMaterial({
      color: 0xcccccc,
      roughness: 0.15,
      metalness: 0.95,
      clearcoat: 0.3,
      clearcoatRoughness: 0.05,
    });
  }, []);

  const dialMaterial = useMemo(() => {
    return new THREE.MeshPhysicalMaterial({
      color: 0x2a2520,
      roughness: 0.5,
      metalness: 0.1,
    });
  }, []);

  const antennaMaterial = useMemo(() => {
    return new THREE.MeshPhysicalMaterial({
      color: 0x666666,
      roughness: 0.25,
      metalness: 0.9,
    });
  }, []);

  const screenWidth = 0.48;
  const screenHeight = 0.40;

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
      <RoundedBox args={[0.95, 0.72, 0.48]} radius={0.025} smoothness={4} position={[0, 0, 0]} castShadow receiveShadow>
        <primitive object={cabinetMaterial} attach="material" />
      </RoundedBox>

      <RoundedBox args={[0.60, 0.52, 0.1]} radius={0.015} smoothness={4} position={[-0.12, 0.03, 0.21]} castShadow>
        <primitive object={bezelMaterial} attach="material" />
      </RoundedBox>

      <mesh position={[-0.12, 0.03, 0.265]} rotation={[0, 0, 0]}>
        <torusGeometry args={[0.28, 0.012, 8, 64]} />
        <primitive object={goldTrimMaterial} attach="material" />
      </mesh>

      <mesh position={[-0.12, 0.03, 0.26]}>
        <boxGeometry args={[screenWidth + 0.02, screenHeight + 0.02, 0.06]} />
        <meshStandardMaterial color="#0a0a0a" />
      </mesh>

      <mesh position={[-0.12, 0.03, 0.29]}>
        <planeGeometry args={[screenWidth, screenHeight]} />
        <primitive object={screenMaterial} attach="material" />
      </mesh>

      <mesh position={[-0.12, 0.03, 0.295]}>
        <planeGeometry args={[screenWidth + 0.01, screenHeight + 0.01]} />
        <meshPhysicalMaterial
          color="#1a2a20"
          roughness={0.02}
          metalness={0}
          transmission={0.05}
          thickness={0.01}
          clearcoat={1}
          clearcoatRoughness={0.03}
          transparent
          opacity={0.12}
        />
      </mesh>

      <group position={[0.34, 0, 0.24]}>
        <RoundedBox args={[0.20, 0.60, 0.06]} radius={0.01} smoothness={4}>
          <primitive object={controlPanelMaterial} attach="material" />
        </RoundedBox>

        <mesh position={[0, 0.24, 0.03]}>
          <boxGeometry args={[0.16, 0.01, 0.01]} />
          <primitive object={goldTrimMaterial} attach="material" />
        </mesh>

        <group position={[0, 0.15, 0.035]}>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.055, 0.055, 0.03, 32]} />
            <primitive object={chromeMaterial} attach="material" />
          </mesh>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.045, 0.045, 0.04, 32]} />
            <primitive object={dialMaterial} attach="material" />
          </mesh>
          {[...Array(12)].map((_, i) => {
            const angle = (i / 12) * Math.PI * 2;
            return (
              <mesh key={i} position={[Math.cos(angle) * 0.035, Math.sin(angle) * 0.035, 0.02]} rotation={[Math.PI / 2, 0, 0]}>
                <boxGeometry args={[0.003, 0.015, 0.008]} />
                <meshStandardMaterial color="#1a1a1a" />
              </mesh>
            );
          })}
        </group>

        <group position={[0, -0.02, 0.035]}>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.055, 0.055, 0.03, 32]} />
            <primitive object={chromeMaterial} attach="material" />
          </mesh>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.045, 0.045, 0.04, 32]} />
            <primitive object={dialMaterial} attach="material" />
          </mesh>
          {[...Array(24)].map((_, i) => {
            const angle = (i / 24) * Math.PI * 2;
            return (
              <mesh key={i} position={[Math.cos(angle) * 0.038, Math.sin(angle) * 0.038, 0.02]} rotation={[Math.PI / 2, 0, 0]}>
                <boxGeometry args={[0.002, 0.012, 0.006]} />
                <meshStandardMaterial color="#1a1a1a" />
              </mesh>
            );
          })}
        </group>

        <mesh position={[0, -0.12, 0.03]}>
          <boxGeometry args={[0.14, 0.015, 0.01]} />
          <primitive object={goldTrimMaterial} attach="material" />
        </mesh>
        <mesh position={[0, -0.14, 0.035]}>
          <boxGeometry args={[0.12, 0.025, 0.01]} />
          <meshStandardMaterial color="#d4c4a0" roughness={0.8} />
        </mesh>

        <group position={[0, -0.22, 0.03]}>
          {[...Array(8)].map((_, i) => (
            <mesh key={i} position={[0, -i * 0.015, 0]}>
              <boxGeometry args={[0.14, 0.008, 0.02]} />
              <meshStandardMaterial color="#0a0a0a" roughness={0.9} />
            </mesh>
          ))}
        </group>
      </group>

      <group position={[0, 0.42, 0]}>
        <mesh position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <sphereGeometry args={[0.035, 16, 16]} />
          <meshStandardMaterial color="#1a1a1a" roughness={0.4} />
        </mesh>
        
        <mesh position={[-0.18, 0.22, 0]} rotation={[0, 0, -0.5]}>
          <cylinderGeometry args={[0.006, 0.012, 0.5, 8]} />
          <primitive object={antennaMaterial} attach="material" />
        </mesh>
        <mesh position={[0.18, 0.22, 0]} rotation={[0, 0, 0.5]}>
          <cylinderGeometry args={[0.006, 0.012, 0.5, 8]} />
          <primitive object={antennaMaterial} attach="material" />
        </mesh>
        
        <mesh position={[-0.35, 0.42, 0]}>
          <sphereGeometry args={[0.012, 8, 8]} />
          <primitive object={chromeMaterial} attach="material" />
        </mesh>
        <mesh position={[0.35, 0.42, 0]}>
          <sphereGeometry args={[0.012, 8, 8]} />
          <primitive object={chromeMaterial} attach="material" />
        </mesh>
      </group>

      <mesh position={[-0.25, -0.40, 0.18]} rotation={[0.12, 0, 0.08]}>
        <boxGeometry args={[0.08, 0.12, 0.04]} />
        <primitive object={cabinetMaterial} attach="material" />
      </mesh>
      <mesh position={[0.25, -0.40, 0.18]} rotation={[0.12, 0, -0.08]}>
        <boxGeometry args={[0.08, 0.12, 0.04]} />
        <primitive object={cabinetMaterial} attach="material" />
      </mesh>

      <pointLight 
        ref={screenGlowRef}
        position={[-0.12, 0.03, 0.5]} 
        intensity={0.3} 
        color="#9ab8a0" 
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

function useGrassTexture() {
  const texture = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext("2d")!;
    
    const gradient = ctx.createLinearGradient(0, 0, 0, 512);
    gradient.addColorStop(0, "#3d6b35");
    gradient.addColorStop(0.5, "#4a7c42");
    gradient.addColorStop(1, "#3d6b35");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 512, 512);
    
    for (let i = 0; i < 15000; i++) {
      const x = Math.random() * 512;
      const y = Math.random() * 512;
      const height = 3 + Math.random() * 8;
      const width = 1 + Math.random() * 1.5;
      const hue = 85 + Math.random() * 30;
      const sat = 40 + Math.random() * 30;
      const light = 25 + Math.random() * 25;
      
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate((Math.random() - 0.5) * 0.4);
      ctx.fillStyle = `hsl(${hue}, ${sat}%, ${light}%)`;
      ctx.fillRect(-width/2, 0, width, -height);
      ctx.restore();
    }
    
    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(20, 20);
    tex.anisotropy = 16;
    return tex;
  }, []);
  
  return texture;
}

function GoalPost({ position }: { position: [number, number, number] }) {
  const postColor = "#e8e8e8";
  const postRadius = 0.06;
  const goalWidth = 3.5;
  const goalHeight = 1.2;
  const goalDepth = 0.8;
  
  return (
    <group position={position}>
      <mesh position={[-goalWidth/2, goalHeight/2, 0]}>
        <cylinderGeometry args={[postRadius, postRadius, goalHeight, 16]} />
        <meshStandardMaterial color={postColor} metalness={0.3} roughness={0.4} />
      </mesh>
      <mesh position={[goalWidth/2, goalHeight/2, 0]}>
        <cylinderGeometry args={[postRadius, postRadius, goalHeight, 16]} />
        <meshStandardMaterial color={postColor} metalness={0.3} roughness={0.4} />
      </mesh>
      <mesh position={[0, goalHeight, 0]} rotation={[0, 0, Math.PI/2]}>
        <cylinderGeometry args={[postRadius, postRadius, goalWidth, 16]} />
        <meshStandardMaterial color={postColor} metalness={0.3} roughness={0.4} />
      </mesh>
      
      <mesh position={[-goalWidth/2, goalHeight/2, -goalDepth/2]} rotation={[Math.PI/2, 0, 0]}>
        <cylinderGeometry args={[postRadius * 0.7, postRadius * 0.7, goalDepth, 8]} />
        <meshStandardMaterial color={postColor} metalness={0.3} roughness={0.4} />
      </mesh>
      <mesh position={[goalWidth/2, goalHeight/2, -goalDepth/2]} rotation={[Math.PI/2, 0, 0]}>
        <cylinderGeometry args={[postRadius * 0.7, postRadius * 0.7, goalDepth, 8]} />
        <meshStandardMaterial color={postColor} metalness={0.3} roughness={0.4} />
      </mesh>
      <mesh position={[0, goalHeight, -goalDepth/2]} rotation={[Math.PI/2, 0, 0]}>
        <cylinderGeometry args={[postRadius * 0.7, postRadius * 0.7, goalDepth, 8]} />
        <meshStandardMaterial color={postColor} metalness={0.3} roughness={0.4} />
      </mesh>
      
      <mesh position={[0, goalHeight/2, -goalDepth]}>
        <planeGeometry args={[goalWidth, goalHeight]} />
        <meshStandardMaterial 
          color="#ffffff" 
          transparent 
          opacity={0.15}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
}

function FloodLight({ position }: { position: [number, number, number] }) {
  const poleHeight = 8;
  
  return (
    <group position={position}>
      <mesh position={[0, poleHeight/2, 0]}>
        <cylinderGeometry args={[0.08, 0.12, poleHeight, 8]} />
        <meshStandardMaterial color="#888888" metalness={0.5} roughness={0.3} />
      </mesh>
      
      <group position={[0, poleHeight, 0]}>
        {[-0.3, 0, 0.3].map((xOffset, row) => (
          [-0.25, 0, 0.25].map((yOffset, col) => (
            <mesh key={`${row}-${col}`} position={[xOffset, yOffset * 0.3 + 0.3, 0.1]}>
              <boxGeometry args={[0.15, 0.15, 0.08]} />
              <meshStandardMaterial 
                color="#fffbe6" 
                emissive="#fff8dc"
                emissiveIntensity={0.8}
              />
            </mesh>
          ))
        ))}
      </group>
      
      <spotLight
        position={[0, poleHeight + 0.5, 0.5]}
        angle={0.6}
        penumbra={0.5}
        intensity={15}
        color="#fff8dc"
        distance={30}
        castShadow
      />
    </group>
  );
}

function FootballPitch({ visible }: { visible: boolean }) {
  const grassTexture = useGrassTexture();

  if (!visible) return null;

  return (
    <group>
      <mesh position={[0, -0.01, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[80, 80]} />
        <meshStandardMaterial 
          map={grassTexture}
          roughness={0.95}
          metalness={0.0}
          color="#4a7040"
        />
      </mesh>
      
      <mesh position={[0, 0.001, 3]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.08, 6]} />
        <meshStandardMaterial color="#ffffff" roughness={0.9} />
      </mesh>
      
      <GoalPost position={[0, 0, -4]} />
      
      <FloodLight position={[-8, 0, -6]} />
      <FloodLight position={[8, 0, -6]} />
    </group>
  );
}

function GlitchOverlay({ intensity }: { intensity: number }) {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
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
  onWorkSectionChange?: (visible: boolean) => void;
  onScrollProgress?: (progress: number) => void;
}

function ScrollSceneContent({ hoveredText, onTVClick, isVideoPlaying, onWorkSectionChange, onScrollProgress }: ScrollSceneProps) {
  const scroll = useScroll();
  const { camera } = useThree();
  const [showWorkSection, setShowWorkSection] = useState(false);
  const [showZoomOutTV, setShowZoomOutTV] = useState(false);
  const [glitchIntensity, setGlitchIntensity] = useState(0);
  const targetPosition = useRef({ x: 0, y: 0 });
  const transitionThreshold = 0.10;

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
    
    const startZ = 1.8;
    const screenZ = 0.3;
    
    const tvScreenY = 0.22;
    const zoomOutThreshold = 0.92;
    
    let targetZ: number;
    let targetY: number;
    let targetX = -0.05;
    
    if (offset < transitionThreshold) {
      const progress = offset / transitionThreshold;
      targetZ = startZ - (startZ - screenZ) * progress;
      targetY = tvScreenY;
    } else if (offset > zoomOutThreshold) {
      const zoomOutProgress = (offset - zoomOutThreshold) / (1 - zoomOutThreshold);
      targetZ = screenZ + zoomOutProgress * (startZ - screenZ);
      targetY = tvScreenY;
    } else {
      targetZ = screenZ;
      targetY = tvScreenY;
    }
    
    camera.position.x += (targetX - camera.position.x) * 0.1;
    camera.position.y += (targetY - camera.position.y) * 0.1;
    camera.position.z += (targetZ - camera.position.z) * 0.1;
    
    camera.lookAt(targetX, tvScreenY, 0);
    
    const glitchProgress = Math.max(0, Math.min(1, (offset - 0.15) / 0.3));
    setGlitchIntensity(glitchProgress);
    
    const isWorkVisible = offset > transitionThreshold && offset < zoomOutThreshold;
    const isZoomOutVisible = offset > zoomOutThreshold;
    
    setShowWorkSection(isWorkVisible);
    setShowZoomOutTV(isZoomOutVisible);
    onWorkSectionChange?.(isWorkVisible || isZoomOutVisible);
    
    if (isWorkVisible || isZoomOutVisible) {
      const workProgress = (offset - transitionThreshold) / (1 - transitionThreshold);
      onScrollProgress?.(workProgress);
    } else {
      onScrollProgress?.(0);
    }
  });

  const showLandingTV = !showWorkSection && !showZoomOutTV;
  const showTV = showLandingTV || showZoomOutTV;

  const getBackgroundColor = () => {
    if (showZoomOutTV) return "#b8c4a8";
    if (showWorkSection) return "#0066FF";
    return "#050403";
  };

  const bgColor = getBackgroundColor();

  return (
    <>
      <color attach="background" args={[bgColor]} />
      <fog attach="fog" args={[bgColor, 5, showZoomOutTV ? 40 : (showWorkSection ? 50 : 12)]} />
      
      {showZoomOutTV ? (
        <>
          <ambientLight intensity={0.6} color="#ffecd2" />
          <directionalLight
            position={[-10, 8, 10]}
            intensity={3}
            color="#ffcc80"
            castShadow
            shadow-mapSize-width={2048}
            shadow-mapSize-height={2048}
          />
          <directionalLight
            position={[10, 5, -5]}
            intensity={0.5}
            color="#87ceeb"
          />
          <hemisphereLight
            color="#ffecd2"
            groundColor="#4a7040"
            intensity={1.2}
          />
        </>
      ) : (
        <>
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
        </>
      )}

      <Environment preset={showZoomOutTV ? "sunset" : "night"} background={false} />
      
      <TiledFloor visible={showLandingTV} />
      <FootballPitch visible={showZoomOutTV} />

      {showLandingTV && (
        <ContactShadows
          position={[0, 0, 0]}
          opacity={0.6}
          scale={10}
          blur={2}
          far={4}
          color="#000000"
        />
      )}
      
      <VintageTV
        hoveredText={showZoomOutTV ? null : hoveredText}
        onClick={showZoomOutTV ? () => {} : onTVClick}
        isVideoPlaying={showZoomOutTV ? false : isVideoPlaying}
        visible={showTV}
        glitchIntensity={showZoomOutTV ? 0 : glitchIntensity}
      />

      <GlitchOverlay intensity={showZoomOutTV ? 0 : glitchIntensity} />

      <WorkSection visible={showWorkSection && !showZoomOutTV} />
    </>
  );
}

export function Scene3D({ hoveredText, onTVClick, isVideoPlaying, onWorkSectionChange, onScrollProgress }: Scene3DProps) {
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
          <ScrollControls pages={25} damping={0.2}>
            <ScrollSceneContent
              hoveredText={hoveredText}
              onTVClick={onTVClick}
              isVideoPlaying={isVideoPlaying}
              onWorkSectionChange={onWorkSectionChange}
              onScrollProgress={onScrollProgress}
            />
          </ScrollControls>
        </Suspense>
      </Canvas>
    </div>
  );
}
