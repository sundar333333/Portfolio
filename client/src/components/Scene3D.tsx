import { Suspense, useRef, useMemo, useEffect, useState, useCallback } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Stars, Environment, RoundedBox } from "@react-three/drei";
import * as THREE from "three";

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

function useWoodTexture() {
  const texture = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext("2d")!;
    
    const gradient = ctx.createLinearGradient(0, 0, 512, 512);
    gradient.addColorStop(0, "#8B5A2B");
    gradient.addColorStop(0.3, "#A0522D");
    gradient.addColorStop(0.5, "#8B4513");
    gradient.addColorStop(0.7, "#A0522D");
    gradient.addColorStop(1, "#8B5A2B");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 512, 512);
    
    ctx.strokeStyle = "rgba(60, 30, 10, 0.15)";
    ctx.lineWidth = 1;
    for (let i = 0; i < 100; i++) {
      const y = Math.random() * 512;
      const startX = Math.random() * 100;
      const length = 200 + Math.random() * 300;
      ctx.beginPath();
      ctx.moveTo(startX, y);
      ctx.bezierCurveTo(
        startX + length * 0.3, y + (Math.random() - 0.5) * 8,
        startX + length * 0.7, y + (Math.random() - 0.5) * 8,
        startX + length, y
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
}

function VintageTV({ hoveredText, onClick, isVideoPlaying }: VintageTVProps) {
  const groupRef = useRef<THREE.Group>(null);
  const { texture: staticTexture, updateTexture } = useStaticTexture();
  const woodTexture = useWoodTexture();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const canvasTextureRef = useRef<THREE.CanvasTexture | null>(null);
  const videoCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const videoTextureRef = useRef<THREE.CanvasTexture | null>(null);
  const frameRef = useRef(0);
  const [isHovered, setIsHovered] = useState(false);

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
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.2) * 0.02;
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
        ctx.font = "bold 32px Arial, sans-serif";
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
        
        const lineHeight = 45;
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

  const woodMaterial = useMemo(() => {
    return new THREE.MeshPhysicalMaterial({
      map: woodTexture,
      color: isHovered ? 0xb86b32 : 0x9a5c2e,
      roughness: 0.55,
      metalness: 0.05,
      clearcoat: 0.3,
      clearcoatRoughness: 0.4,
    });
  }, [woodTexture, isHovered]);

  const chromeMaterial = useMemo(() => {
    return new THREE.MeshPhysicalMaterial({
      color: 0xc8c0b5,
      roughness: 0.25,
      metalness: 0.9,
      clearcoat: 0.5,
      clearcoatRoughness: 0.1,
    });
  }, []);

  const glassMaterial = useMemo(() => {
    return new THREE.MeshPhysicalMaterial({
      color: 0x222222,
      roughness: 0.05,
      metalness: 0,
      transmission: 0.1,
      thickness: 0.02,
      clearcoat: 1,
      clearcoatRoughness: 0.05,
      ior: 1.5,
    });
  }, []);

  return (
    <group 
      ref={groupRef} 
      position={[0, 0.3, 0]} 
      scale={1.1}
      onClick={handleClick}
      onPointerOver={() => setIsHovered(true)}
      onPointerOut={() => setIsHovered(false)}
    >
      <RoundedBox args={[2.6, 2.0, 1.3]} radius={0.08} smoothness={4} position={[0, 0, 0]}>
        <primitive object={woodMaterial} attach="material" />
      </RoundedBox>

      <RoundedBox args={[2.4, 1.8, 0.1]} radius={0.04} smoothness={4} position={[0, 0.05, 0.61]}>
        <meshPhysicalMaterial color="#5a3a20" roughness={0.5} clearcoat={0.2} />
      </RoundedBox>

      <RoundedBox args={[1.55, 1.25, 0.06]} radius={0.02} smoothness={4} position={[-0.35, 0.05, 0.67]}>
        <primitive object={chromeMaterial} attach="material" />
      </RoundedBox>

      <mesh position={[-0.35, 0.05, 0.72]}>
        <planeGeometry args={[1.4, 1.1]} />
        <primitive object={screenMaterial} attach="material" />
      </mesh>

      <mesh position={[-0.35, 0.05, 0.73]}>
        <planeGeometry args={[1.42, 1.12]} />
        <primitive object={glassMaterial} attach="material" />
      </mesh>

      <RoundedBox args={[1.5, 1.2, 0.1]} radius={0.03} smoothness={4} position={[-0.35, 0.05, 0.64]}>
        <meshStandardMaterial color="#0a0a0a" />
      </RoundedBox>

      <group position={[0.95, 0, 0.66]}>
        <RoundedBox args={[0.45, 1.6, 0.05]} radius={0.02} smoothness={4}>
          <meshPhysicalMaterial color="#7a5a3a" roughness={0.5} clearcoat={0.2} />
        </RoundedBox>

        {[0.5, 0.38, 0.26, 0.14, 0.02, -0.1, -0.22, -0.34, -0.46].map((y, i) => (
          <mesh key={i} position={[0, y, 0.03]}>
            <boxGeometry args={[0.35, 0.02, 0.01]} />
            <meshStandardMaterial color="#3a2a1a" roughness={0.8} />
          </mesh>
        ))}

        <group position={[0, -0.65, 0.03]}>
          <mesh>
            <cylinderGeometry args={[0.1, 0.1, 0.06, 32]} />
            <primitive object={chromeMaterial} attach="material" />
          </mesh>
          <mesh position={[0, 0, 0.02]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.06, 0.015, 8, 32]} />
            <meshStandardMaterial color="#3a3a3a" metalness={0.7} roughness={0.3} />
          </mesh>
          <mesh position={[0.03, 0, 0.035]}>
            <boxGeometry args={[0.02, 0.05, 0.01]} />
            <meshStandardMaterial color="#2a2a2a" />
          </mesh>
        </group>

        <mesh position={[0.12, -0.65, 0.05]}>
          <sphereGeometry args={[0.015, 8, 8]} />
          <meshBasicMaterial color="#ff3300" />
        </mesh>
      </group>

      <mesh position={[-0.45, 1.15, 0]} rotation={[0, 0, -0.45]}>
        <cylinderGeometry args={[0.012, 0.02, 1.3, 8]} />
        <primitive object={chromeMaterial} attach="material" />
      </mesh>
      <mesh position={[0.45, 1.15, 0]} rotation={[0, 0, 0.45]}>
        <cylinderGeometry args={[0.012, 0.02, 1.3, 8]} />
        <primitive object={chromeMaterial} attach="material" />
      </mesh>

      <mesh position={[-0.73, 1.58, 0]}>
        <sphereGeometry args={[0.03, 16, 16]} />
        <primitive object={chromeMaterial} attach="material" />
      </mesh>
      <mesh position={[0.73, 1.58, 0]}>
        <sphereGeometry args={[0.03, 16, 16]} />
        <primitive object={chromeMaterial} attach="material" />
      </mesh>

      <mesh position={[0, 0.88, 0]}>
        <boxGeometry args={[0.25, 0.12, 0.25]} />
        <meshPhysicalMaterial color="#4a3a2a" roughness={0.5} clearcoat={0.2} />
      </mesh>

      <mesh position={[-0.65, -1.15, 0.35]} rotation={[0.12, 0, 0.08]}>
        <cylinderGeometry args={[0.045, 0.08, 0.35, 8]} />
        <primitive object={woodMaterial} attach="material" />
      </mesh>
      <mesh position={[0.65, -1.15, 0.35]} rotation={[0.12, 0, -0.08]}>
        <cylinderGeometry args={[0.045, 0.08, 0.35, 8]} />
        <primitive object={woodMaterial} attach="material" />
      </mesh>

      <pointLight position={[0, 0, 1.2]} intensity={0.6} color="#ffffee" distance={3} decay={2} />
      
      {isHovered && (
        <pointLight position={[0, 0, 1.8]} intensity={0.4} color="#ffddaa" distance={4} />
      )}
    </group>
  );
}

function CameraController() {
  const { camera } = useThree();
  const targetPosition = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      targetPosition.current.x = (e.clientX / window.innerWidth - 0.5) * 0.25;
      targetPosition.current.y = (e.clientY / window.innerHeight - 0.5) * 0.15;
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  useFrame(() => {
    camera.position.x += (targetPosition.current.x - camera.position.x) * 0.03;
    camera.position.y += (-targetPosition.current.y + 1 - camera.position.y) * 0.03;
    camera.lookAt(0, 0.3, 0);
  });

  return null;
}

function Room() {
  return (
    <group>
      <mesh position={[0, -1.35, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[30, 30]} />
        <meshStandardMaterial color="#1a1510" roughness={0.95} />
      </mesh>

      <mesh position={[0, 2, -5]}>
        <planeGeometry args={[30, 12]} />
        <meshStandardMaterial color="#0f0c08" roughness={1} />
      </mesh>
    </group>
  );
}

export function Scene3D({ hoveredText, onTVClick, isVideoPlaying }: Scene3DProps) {
  return (
    <div className="fixed inset-0 z-0" data-testid="scene-3d-container">
      <Canvas
        camera={{ position: [0, 1, 4], fov: 45 }}
        gl={{ 
          antialias: true, 
          alpha: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.2,
        }}
        dpr={[1, 2]}
      >
        <color attach="background" args={["#0c0a08"]} />
        <fog attach="fog" args={["#0c0a08", 8, 25]} />
        
        <ambientLight intensity={0.4} />
        
        <spotLight
          position={[2, 4, 4]}
          angle={0.5}
          penumbra={0.8}
          intensity={3}
          color="#fff5e6"
          castShadow
        />
        <spotLight
          position={[-2, 3, 3]}
          angle={0.6}
          penumbra={0.7}
          intensity={2}
          color="#e6f0ff"
        />
        <pointLight position={[0, 2, 2]} intensity={1.5} color="#ffffff" distance={8} decay={2} />
        
        <rectAreaLight
          position={[0, 2, 2]}
          width={3}
          height={2}
          intensity={2}
          color="#fffaf0"
        />

        <Suspense fallback={null}>
          <Environment preset="apartment" background={false} />
          <Stars
            radius={80}
            depth={40}
            count={2000}
            factor={3}
            saturation={0}
            fade
            speed={0.3}
          />
          <Room />
          <VintageTV
            hoveredText={hoveredText}
            onClick={onTVClick}
            isVideoPlaying={isVideoPlaying}
          />
          <CameraController />
        </Suspense>
      </Canvas>
    </div>
  );
}
