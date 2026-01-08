import { Suspense, useRef, useMemo, useEffect, useState, useCallback } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Stars } from "@react-three/drei";
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

interface VintageTVProps {
  hoveredText: string | null;
  onClick: () => void;
  isVideoPlaying: boolean;
}

function VintageTV({ hoveredText, onClick, isVideoPlaying }: VintageTVProps) {
  const groupRef = useRef<THREE.Group>(null);
  const { texture: staticTexture, updateTexture } = useStaticTexture();
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
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.03;
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
        
        const time = state.clock.elapsedTime;
        for (let i = 0; i < 8; i++) {
          const x = ((time * 80 + i * 60) % canvas.width);
          const y = 30 + i * 45;
          ctx.beginPath();
          ctx.arc(x, y, 4, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 255, 255, ${0.4 + Math.random() * 0.4})`;
          ctx.fill();
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

  const woodColor = isHovered ? "#a86b32" : "#8B5A2B";
  const chromeColor = "#d8d1c5";

  return (
    <group 
      ref={groupRef} 
      position={[0, 0.5, 0]} 
      scale={1.2}
      onClick={handleClick}
      onPointerOver={() => setIsHovered(true)}
      onPointerOut={() => setIsHovered(false)}
    >
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[2.8, 2.2, 1.4]} />
        <meshStandardMaterial color={woodColor} roughness={0.6} metalness={0.1} />
      </mesh>

      <mesh position={[0, 0, 0.71]}>
        <boxGeometry args={[2.6, 2.0, 0.05]} />
        <meshStandardMaterial color="#6b4423" roughness={0.5} />
      </mesh>

      <mesh position={[-0.3, 0.05, 0.74]}>
        <boxGeometry args={[1.7, 1.4, 0.02]} />
        <meshStandardMaterial color={chromeColor} metalness={0.8} roughness={0.25} />
      </mesh>

      <mesh position={[-0.3, 0.05, 0.76]}>
        <planeGeometry args={[1.5, 1.2]} />
        <primitive object={screenMaterial} attach="material" />
      </mesh>

      <mesh position={[-0.3, 0.05, 0.73]}>
        <boxGeometry args={[1.6, 1.3, 0.08]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>

      <group position={[1.0, 0, 0.72]}>
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[0.5, 1.8, 0.04]} />
          <meshStandardMaterial color="#9a7b5a" roughness={0.5} />
        </mesh>

        {[0.5, 0.35, 0.2, 0.05, -0.1, -0.25, -0.4, -0.55].map((y, i) => (
          <mesh key={i} position={[0, y, 0.03]}>
            <boxGeometry args={[0.4, 0.03, 0.02]} />
            <meshStandardMaterial color="#5a4a3a" roughness={0.7} />
          </mesh>
        ))}

        <mesh position={[0, -0.75, 0.04]}>
          <cylinderGeometry args={[0.12, 0.12, 0.08, 32]} />
          <meshStandardMaterial color={chromeColor} metalness={0.9} roughness={0.2} />
        </mesh>
        <mesh position={[0, -0.75, 0.08]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.08, 0.02, 8, 32]} />
          <meshStandardMaterial color="#4a4a4a" metalness={0.7} roughness={0.3} />
        </mesh>
      </group>

      <mesh position={[-0.5, 1.3, 0]} rotation={[0, 0, -0.5]}>
        <cylinderGeometry args={[0.015, 0.025, 1.4, 8]} />
        <meshStandardMaterial color="#c0c0c0" metalness={0.9} roughness={0.15} />
      </mesh>
      <mesh position={[0.5, 1.3, 0]} rotation={[0, 0, 0.5]}>
        <cylinderGeometry args={[0.015, 0.025, 1.4, 8]} />
        <meshStandardMaterial color="#c0c0c0" metalness={0.9} roughness={0.15} />
      </mesh>

      <mesh position={[-0.82, 1.75, 0]}>
        <sphereGeometry args={[0.04, 16, 16]} />
        <meshStandardMaterial color="#888888" metalness={0.8} roughness={0.2} />
      </mesh>
      <mesh position={[0.82, 1.75, 0]}>
        <sphereGeometry args={[0.04, 16, 16]} />
        <meshStandardMaterial color="#888888" metalness={0.8} roughness={0.2} />
      </mesh>

      <mesh position={[0, 0.95, 0]}>
        <boxGeometry args={[0.3, 0.15, 0.3]} />
        <meshStandardMaterial color="#5a4a3a" roughness={0.6} />
      </mesh>

      <mesh position={[-0.7, -1.3, 0.3]} rotation={[0.15, 0, 0.1]}>
        <cylinderGeometry args={[0.06, 0.1, 0.4, 8]} />
        <meshStandardMaterial color={woodColor} roughness={0.6} />
      </mesh>
      <mesh position={[0.7, -1.3, 0.3]} rotation={[0.15, 0, -0.1]}>
        <cylinderGeometry args={[0.06, 0.1, 0.4, 8]} />
        <meshStandardMaterial color={woodColor} roughness={0.6} />
      </mesh>

      <pointLight position={[0, 0, 1.5]} intensity={0.8} color="#ffffff" distance={4} />
      
      {isHovered && (
        <pointLight position={[0, 0, 2]} intensity={0.5} color="#ffcc88" />
      )}
    </group>
  );
}

function CameraController() {
  const { camera } = useThree();
  const targetPosition = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      targetPosition.current.x = (e.clientX / window.innerWidth - 0.5) * 0.3;
      targetPosition.current.y = (e.clientY / window.innerHeight - 0.5) * 0.2;
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  useFrame(() => {
    camera.position.x += (targetPosition.current.x - camera.position.x) * 0.05;
    camera.position.y += (-targetPosition.current.y + 1.2 - camera.position.y) * 0.05;
    camera.lookAt(0, 0.5, 0);
  });

  return null;
}

function Room() {
  return (
    <group>
      <mesh position={[0, -1.6, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[50, 50]} />
        <meshStandardMaterial color="#120d08" roughness={0.9} />
      </mesh>

      <mesh position={[0, 0, -6]}>
        <planeGeometry args={[50, 20]} />
        <meshStandardMaterial color="#0a0805" roughness={1} />
      </mesh>
    </group>
  );
}

export function Scene3D({ hoveredText, onTVClick, isVideoPlaying }: Scene3DProps) {
  return (
    <div className="fixed inset-0 z-0" data-testid="scene-3d-container">
      <Canvas
        camera={{ position: [0, 1.2, 4.5], fov: 50 }}
        gl={{ antialias: true, alpha: true }}
        dpr={[1, 2]}
      >
        <color attach="background" args={["#0a0806"]} />
        <fog attach="fog" args={["#0a0806", 10, 50]} />
        
        <ambientLight intensity={0.8} />
        <pointLight position={[0, 4, 4]} intensity={2} color="#ffffff" />
        <pointLight position={[-3, 2, 2]} intensity={1} color="#ffd7a1" />
        <pointLight position={[3, 2, 2]} intensity={1} color="#a1c4ff" />
        <spotLight
          position={[0, 5, 3]}
          angle={0.5}
          penumbra={0.5}
          intensity={3}
          color="#ffffff"
          castShadow
        />
        <spotLight
          position={[2, 3, 4]}
          angle={0.4}
          penumbra={0.8}
          intensity={1.5}
          color="#ffeedd"
        />

        <Suspense fallback={null}>
          <Stars
            radius={100}
            depth={50}
            count={3000}
            factor={4}
            saturation={0}
            fade
            speed={0.5}
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
