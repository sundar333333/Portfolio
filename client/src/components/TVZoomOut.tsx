import { Canvas, useFrame } from "@react-three/fiber";
import { RoundedBox } from "@react-three/drei";
import { useRef, useEffect, useMemo, useCallback, Suspense } from "react";
import * as THREE from "three";
import { motion } from "framer-motion";

interface TVZoomOutProps {
  visible: boolean;
  scrollProgress: number;
}

function useStaticTexture() {
  const textureRef = useRef<THREE.DataTexture | null>(null);

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

    return () => {
      if (textureRef.current) {
        textureRef.current.dispose();
      }
    };
  }, []);

  const updateTexture = useCallback(() => {
    if (!textureRef.current) return;
    
    const data = textureRef.current.image.data as Uint8Array;
    for (let i = 0; i < data.length; i += 4) {
      const noise = Math.random() * 255;
      data[i] = noise;
      data[i + 1] = noise;
      data[i + 2] = noise;
    }
    textureRef.current.needsUpdate = true;
  }, []);

  return { texture: textureRef.current, updateTexture };
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

    return () => {
      if (textureRef.current) {
        textureRef.current.dispose();
      }
    };
  }, []);

  useFrame(() => {
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

    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(Date.now() * 0.0005) * 0.02;
    }
  });

  const screenMaterial = useMemo(() => {
    if (textureRef.current) {
      return new THREE.MeshBasicMaterial({ map: textureRef.current });
    }
    return new THREE.MeshBasicMaterial({ color: 0x333333 });
  }, []);

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

  const screenWidth = 0.52;
  const screenHeight = 0.39;

  const cameraZ = 0.2 + zoomProgress * 1.8;

  return (
    <group ref={groupRef} position={[0, 0, -cameraZ]} scale={0.85}>
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
        <meshBasicMaterial color="#222222">
          {textureRef.current && <primitive object={textureRef.current} attach="map" />}
        </meshBasicMaterial>
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

      <pointLight position={[-0.08, 0.02, 0.5]} intensity={0.3} color="#ffffff" distance={1.5} />
    </group>
  );
}

export function TVZoomOut({ visible, scrollProgress }: TVZoomOutProps) {
  if (!visible) return null;

  const zoomOutStart = 0.88;
  const zoomOutEnd = 1.0;
  
  const zoomProgress = scrollProgress < zoomOutStart ? 0 :
                       scrollProgress > zoomOutEnd ? 1 :
                       (scrollProgress - zoomOutStart) / (zoomOutEnd - zoomOutStart);

  const opacity = zoomProgress < 0.1 ? zoomProgress * 10 : 1;

  return (
    <motion.div
      className="fixed inset-0 z-50 overflow-hidden"
      style={{
        opacity,
        backgroundColor: "#000000",
      }}
      data-testid="tv-zoom-out"
    >
      <Canvas
        camera={{ position: [0, 0, 0.5], fov: 50 }}
        gl={{ 
          antialias: true, 
          alpha: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 0.9,
        }}
        dpr={[1, 2]}
      >
        <Suspense fallback={null}>
          <ambientLight intensity={0.4} />
          <directionalLight position={[2, 3, 5]} intensity={0.8} />
          <pointLight position={[-2, 2, 3]} intensity={0.3} color="#4488ff" />
          <ZoomOutTV zoomProgress={zoomProgress} />
        </Suspense>
      </Canvas>

      {zoomProgress > 0.85 && (
        <motion.div
          className="absolute bottom-20 left-1/2 -translate-x-1/2"
          initial={{ opacity: 0 }}
          animate={{ opacity: (zoomProgress - 0.85) * 6.67 }}
        >
          <span
            style={{
              fontFamily: "'Anton', 'Archivo Black', sans-serif",
              fontSize: "clamp(1rem, 2vw, 1.5rem)",
              color: "#FFFFFF",
              opacity: 0.6,
              letterSpacing: "0.3em",
            }}
          >
            SIGNAL LOST
          </span>
        </motion.div>
      )}
    </motion.div>
  );
}
