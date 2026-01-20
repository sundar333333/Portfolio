import { Suspense, useRef, useMemo, useEffect, useState, useCallback } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, RoundedBox, ScrollControls, useScroll } from "@react-three/drei";
import * as THREE from "three";
import { projects } from "@/lib/projects";

interface Scene3DProps {
  hoveredText: string | null;
  onTVClick: () => void;
  isVideoPlaying: boolean;
  onScrollPhaseChange?: (phase: "landing" | "transition" | "gallery") => void;
  onProjectChange?: (projectIndex: number) => void;
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

function useProjectTextures() {
  const textures = useMemo(() => {
    return projects.map((project) => {
      const canvas = document.createElement("canvas");
      canvas.width = 512;
      canvas.height = 384;
      const ctx = canvas.getContext("2d")!;
      
      const color = project.accentColor;
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      gradient.addColorStop(0, color);
      gradient.addColorStop(0.5, adjustBrightness(color, -20));
      gradient.addColorStop(1, adjustBrightness(color, -40));
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      ctx.fillStyle = "rgba(255, 255, 255, 0.95)";
      ctx.font = "bold 32px Arial, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      
      const words = project.title.split(" ");
      const lines: string[] = [];
      let currentLine = "";
      
      words.forEach(word => {
        const testLine = currentLine ? `${currentLine} ${word}` : word;
        const metrics = ctx.measureText(testLine);
        if (metrics.width > canvas.width - 60) {
          lines.push(currentLine);
          currentLine = word;
        } else {
          currentLine = testLine;
        }
      });
      if (currentLine) lines.push(currentLine);
      
      const lineHeight = 40;
      const startY = canvas.height / 2 - ((lines.length - 1) * lineHeight) / 2;
      lines.forEach((line, i) => {
        ctx.fillText(line, canvas.width / 2, startY + i * lineHeight);
      });
      
      ctx.font = "18px Arial, sans-serif";
      ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
      ctx.fillText(project.description, canvas.width / 2, canvas.height - 40);
      
      const tex = new THREE.CanvasTexture(canvas);
      return tex;
    });
  }, []);
  
  return textures;
}

function adjustBrightness(hex: string, percent: number): string {
  const num = parseInt(hex.replace("#", ""), 16);
  const r = Math.min(255, Math.max(0, (num >> 16) + percent));
  const g = Math.min(255, Math.max(0, ((num >> 8) & 0x00ff) + percent));
  const b = Math.min(255, Math.max(0, (num & 0x0000ff) + percent));
  return `rgb(${r}, ${g}, ${b})`;
}

function useHireMeTexture() {
  const texture = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 384;
    const ctx = canvas.getContext("2d")!;
    
    const gradient = ctx.createRadialGradient(
      canvas.width / 2, canvas.height / 2, 0,
      canvas.width / 2, canvas.height / 2, canvas.width / 2
    );
    gradient.addColorStop(0, "#1a1a2e");
    gradient.addColorStop(1, "#0a0a12");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
    ctx.font = "bold 120px Arial, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("+", canvas.width / 2, canvas.height / 2 - 20);
    
    ctx.font = "bold 24px Arial, sans-serif";
    ctx.fillText("Your Project Here", canvas.width / 2, canvas.height / 2 + 70);
    
    const tex = new THREE.CanvasTexture(canvas);
    return tex;
  }, []);
  
  return texture;
}

interface ScrollingSceneProps {
  hoveredText: string | null;
  onClick: () => void;
  isVideoPlaying: boolean;
  onScrollPhaseChange?: (phase: "landing" | "transition" | "gallery") => void;
  onProjectChange?: (projectIndex: number) => void;
}

function ScrollingScene({ hoveredText, onClick, isVideoPlaying, onScrollPhaseChange, onProjectChange }: ScrollingSceneProps) {
  const scroll = useScroll();
  const groupRef = useRef<THREE.Group>(null);
  const tvRef = useRef<THREE.Group>(null);
  const floorRef = useRef<THREE.Mesh>(null);
  const screenMeshRef = useRef<THREE.Mesh>(null);
  const { camera } = useThree();
  
  const { texture: staticTexture, updateTexture } = useStaticTexture();
  const woodTexture = useWoodTexture();
  const tileTexture = useTileTexture();
  const projectTextures = useProjectTextures();
  const hireMeTexture = useHireMeTexture();
  
  const [isHovered, setIsHovered] = useState(false);
  const [currentPhase, setCurrentPhase] = useState<"landing" | "transition" | "gallery">("landing");
  const [currentProjectIndex, setCurrentProjectIndex] = useState(0);
  const screenGlowRef = useRef<THREE.PointLight>(null);
  const lastPhaseRef = useRef(currentPhase);
  const lastProjectRef = useRef(currentProjectIndex);

  const hoverCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const hoverTextureRef = useRef<THREE.CanvasTexture | null>(null);
  const videoCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const videoTextureRef = useRef<THREE.CanvasTexture | null>(null);
  const frameRef = useRef(0);

  useEffect(() => {
    const hoverCanvas = document.createElement("canvas");
    hoverCanvas.width = 512;
    hoverCanvas.height = 384;
    hoverCanvasRef.current = hoverCanvas;
    const hoverTex = new THREE.CanvasTexture(hoverCanvas);
    hoverTextureRef.current = hoverTex;

    const videoCanvas = document.createElement("canvas");
    videoCanvas.width = 512;
    videoCanvas.height = 384;
    videoCanvasRef.current = videoCanvas;
    const videoTex = new THREE.CanvasTexture(videoCanvas);
    videoTextureRef.current = videoTex;

    return () => {
      hoverTex.dispose();
      videoTex.dispose();
    };
  }, []);

  useFrame((state) => {
    const scrollOffset = scroll.offset;
    
    let newPhase: "landing" | "transition" | "gallery";
    if (scrollOffset < 0.15) {
      newPhase = "landing";
    } else if (scrollOffset < 0.2) {
      newPhase = "transition";
    } else {
      newPhase = "gallery";
    }
    
    if (newPhase !== lastPhaseRef.current) {
      lastPhaseRef.current = newPhase;
      setCurrentPhase(newPhase);
      onScrollPhaseChange?.(newPhase);
    }
    
    const galleryProgress = Math.max(0, (scrollOffset - 0.2) / 0.8);
    const totalSlides = projects.length + 1;
    const newProjectIndex = Math.min(
      Math.floor(galleryProgress * totalSlides),
      totalSlides - 1
    );
    
    if (newProjectIndex !== lastProjectRef.current) {
      lastProjectRef.current = newProjectIndex;
      setCurrentProjectIndex(newProjectIndex);
      onProjectChange?.(newProjectIndex);
    }

    if (tvRef.current) {
      if (scrollOffset < 0.15) {
        const zoomProgress = scrollOffset / 0.15;
        const targetZ = THREE.MathUtils.lerp(0, 1.5, zoomProgress);
        const targetScale = THREE.MathUtils.lerp(0.85, 3, zoomProgress);
        
        tvRef.current.position.z = targetZ;
        tvRef.current.scale.setScalar(targetScale);
        tvRef.current.position.y = THREE.MathUtils.lerp(0.22, 0.3, zoomProgress);
        tvRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.15) * 0.015 * (1 - zoomProgress);
      } else if (scrollOffset < 0.2) {
        const transitionProgress = (scrollOffset - 0.15) / 0.05;
        tvRef.current.position.z = THREE.MathUtils.lerp(1.5, 0.5, transitionProgress);
        tvRef.current.scale.setScalar(THREE.MathUtils.lerp(3, 1, transitionProgress));
        tvRef.current.position.y = THREE.MathUtils.lerp(0.3, 0.1, transitionProgress);
        tvRef.current.rotation.y = 0;
      } else {
        tvRef.current.position.z = 0.5;
        tvRef.current.scale.setScalar(1);
        tvRef.current.position.y = 0.1;
        tvRef.current.rotation.y = 0;
      }
    }

    if (floorRef.current) {
      const floorOpacity = scrollOffset < 0.15 ? 1 : Math.max(0, 1 - (scrollOffset - 0.15) / 0.05);
      (floorRef.current.material as THREE.MeshStandardMaterial).opacity = floorOpacity;
    }

    if (screenGlowRef.current) {
      screenGlowRef.current.intensity = 0.3 + Math.sin(state.clock.elapsedTime * 8) * 0.05;
    }

    if (screenMeshRef.current) {
      const mesh = screenMeshRef.current;
      
      if (currentPhase === "gallery") {
        if (currentProjectIndex < projects.length) {
          (mesh.material as THREE.MeshBasicMaterial).map = projectTextures[currentProjectIndex];
        } else {
          (mesh.material as THREE.MeshBasicMaterial).map = hireMeTexture;
        }
        (mesh.material as THREE.MeshBasicMaterial).needsUpdate = true;
      } else if (isVideoPlaying && videoCanvasRef.current && videoTextureRef.current) {
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
          (mesh.material as THREE.MeshBasicMaterial).map = videoTextureRef.current;
          (mesh.material as THREE.MeshBasicMaterial).needsUpdate = true;
        }
      } else if (hoveredText && hoverCanvasRef.current && hoverTextureRef.current) {
        const canvas = hoverCanvasRef.current;
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
          
          hoverTextureRef.current.needsUpdate = true;
          (mesh.material as THREE.MeshBasicMaterial).map = hoverTextureRef.current;
          (mesh.material as THREE.MeshBasicMaterial).needsUpdate = true;
        }
      } else if (staticTexture) {
        updateTexture();
        (mesh.material as THREE.MeshBasicMaterial).map = staticTexture;
        (mesh.material as THREE.MeshBasicMaterial).needsUpdate = true;
      }
    }

    const baseCameraY = currentPhase === "gallery" ? 0.3 : 0.55;
    const baseCameraZ = currentPhase === "gallery" ? 2.2 : 1.8;
    camera.position.y += (baseCameraY - camera.position.y) * 0.05;
    camera.position.z += (baseCameraZ - camera.position.z) * 0.05;
    
    const lookAtY = currentPhase === "gallery" ? 0.1 : 0.2;
    camera.lookAt(0, lookAtY, 0);
  });

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

  const screenMaterial = useMemo(() => {
    return new THREE.MeshBasicMaterial({ map: staticTexture });
  }, [staticTexture]);

  const screenWidth = 0.52;
  const screenHeight = 0.39;

  const currentProject = currentProjectIndex < projects.length ? projects[currentProjectIndex] : null;
  const bgColor = currentProject?.accentColor || "#1a1a2e";

  return (
    <group ref={groupRef}>
      {currentPhase === "gallery" && (
        <mesh position={[0, 0, -3]}>
          <planeGeometry args={[20, 15]} />
          <meshBasicMaterial color={bgColor} opacity={0.3} transparent />
        </mesh>
      )}

      <mesh 
        ref={floorRef}
        position={[0, -0.01, 0]} 
        rotation={[-Math.PI / 2, 0, 0]} 
        receiveShadow
      >
        <planeGeometry args={[30, 30]} />
        <meshStandardMaterial 
          map={tileTexture}
          roughness={0.85}
          metalness={0.05}
          transparent
        />
      </mesh>

      <group 
        ref={tvRef}
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

        <mesh ref={screenMeshRef} position={[-0.08, 0.02, 0.295]}>
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
    </group>
  );
}

export function Scene3D({ hoveredText, onTVClick, isVideoPlaying, onScrollPhaseChange, onProjectChange }: Scene3DProps) {
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
          shadow-bias={-0.0001}
        />

        <spotLight
          position={[-1.5, 2, 2]}
          angle={0.5}
          penumbra={0.9}
          intensity={3}
          color="#aab8cc"
        />

        <Suspense fallback={null}>
          <Environment preset="night" background={false} />
          
          <ScrollControls pages={5} damping={0.2}>
            <ScrollingScene
              hoveredText={hoveredText}
              onClick={onTVClick}
              isVideoPlaying={isVideoPlaying}
              onScrollPhaseChange={onScrollPhaseChange}
              onProjectChange={onProjectChange}
            />
          </ScrollControls>
        </Suspense>
      </Canvas>
    </div>
  );
}
