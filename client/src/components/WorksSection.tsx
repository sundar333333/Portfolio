import { useRef, useState, useEffect, useMemo } from "react";
import { Canvas, useFrame, useThree, useLoader } from "@react-three/fiber";
import * as THREE from "three";
import { Header } from "./Header";

import currentPoster from "@assets/p3_1769264586742.png";
import eventifyPoster from "@assets/p4_1769264589735.png";
import spaceJumpPoster from "@assets/p2_1769264583465.png";
import tickingPoster from "@assets/p1_1769264580277.png";

interface Project {
  id: number;
  title: string;
  category: string;
  image: string;
}

const projects: Project[] = [
  { id: 1, title: "Current Mobile Payment", category: "Fintech", image: currentPoster },
  { id: 2, title: "Eventify", category: "Event Management", image: eventifyPoster },
  { id: 3, title: "Space Jump", category: "Mobile Game", image: spaceJumpPoster },
  { id: 4, title: "Ticking", category: "Movie Booking", image: tickingPoster },
];

interface ProjectCardProps {
  project: Project;
  index: number;
  totalProjects: number;
  carouselRotation: number;
  mousePosition: { x: number; y: number };
}

function ProjectCard({ project, index, totalProjects, carouselRotation, mousePosition }: ProjectCardProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const texture = useLoader(THREE.TextureLoader, project.image);
  
  const radius = 4;
  const angleOffset = (index / totalProjects) * Math.PI * 2;
  
  const enhancedTexture = useMemo(() => {
    texture.anisotropy = 16;
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.generateMipmaps = false;
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.needsUpdate = true;
    return texture;
  }, [texture]);

  useFrame(() => {
    if (!meshRef.current) return;
    
    const currentAngle = angleOffset + carouselRotation;
    
    const x = Math.sin(currentAngle) * radius;
    const z = -Math.cos(currentAngle) * radius;
    
    meshRef.current.position.x = x;
    meshRef.current.position.z = z;
    meshRef.current.position.y = 0;
    
    meshRef.current.rotation.y = -currentAngle;
    
    const normalizedAngle = ((currentAngle % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
    const isFront = normalizedAngle < 0.5 || normalizedAngle > Math.PI * 2 - 0.5;
    
    if (isFront) {
      const gyroX = mousePosition.y * 0.12;
      const gyroY = mousePosition.x * 0.12;
      meshRef.current.rotation.x = gyroX;
      meshRef.current.rotation.y = -currentAngle + gyroY;
    } else {
      meshRef.current.rotation.x *= 0.9;
    }
  });

  return (
    <mesh ref={meshRef}>
      <planeGeometry args={[2.8, 3.8]} />
      <meshBasicMaterial
        map={enhancedTexture}
        side={THREE.DoubleSide}
        toneMapped={false}
      />
    </mesh>
  );
}

interface CarouselSceneProps {
  carouselRotation: number;
  mousePosition: { x: number; y: number };
}

function CarouselScene({ carouselRotation, mousePosition }: CarouselSceneProps) {
  const { camera } = useThree();
  
  useFrame(() => {
    camera.position.set(0, 0.5, 8);
    camera.lookAt(0, 0, 0);
  });

  return (
    <>
      <color attach="background" args={["#fafafa"]} />
      <ambientLight intensity={2} />
      
      {projects.map((project, index) => (
        <ProjectCard
          key={project.id}
          project={project}
          index={index}
          totalProjects={projects.length}
          carouselRotation={carouselRotation}
          mousePosition={mousePosition}
        />
      ))}
    </>
  );
}

interface WorksSectionProps {
  visible: boolean;
  onExitToLanding?: () => void;
}

export function WorksSection({ visible, onExitToLanding }: WorksSectionProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [carouselRotation, setCarouselRotation] = useState(0);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  
  const velocityRef = useRef(0);
  const currentRotationRef = useRef(0);
  const rafIdRef = useRef<number | null>(null);
  const exitAccumulatorRef = useRef(0);

  const handleTextHover = () => {};

  useEffect(() => {
    if (!visible) {
      currentRotationRef.current = 0;
      velocityRef.current = 0;
      exitAccumulatorRef.current = 0;
      setCarouselRotation(0);
      return;
    }

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      
      const delta = e.deltaY;
      
      if (delta < 0) {
        exitAccumulatorRef.current += Math.abs(delta);
        if (exitAccumulatorRef.current > 300) {
          if (onExitToLanding) {
            onExitToLanding();
          }
          exitAccumulatorRef.current = 0;
          return;
        }
      } else {
        exitAccumulatorRef.current = 0;
      }
      
      velocityRef.current += delta * 0.0006;
    };

    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = (e.clientY / window.innerHeight) * 2 - 1;
      setMousePosition({ x, y });
    };

    const animate = () => {
      velocityRef.current *= 0.92;
      currentRotationRef.current += velocityRef.current;
      
      setCarouselRotation(currentRotationRef.current);
      rafIdRef.current = requestAnimationFrame(animate);
    };

    window.addEventListener("wheel", handleWheel, { passive: false });
    window.addEventListener("mousemove", handleMouseMove);
    rafIdRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("wheel", handleWheel);
      window.removeEventListener("mousemove", handleMouseMove);
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, [visible, onExitToLanding]);

  if (!visible) return null;

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-30 bg-[#fafafa]"
      data-testid="works-section"
    >
      <Header onTextHover={handleTextHover} theme="light" />

      <Canvas
        camera={{ position: [0, 0.5, 8], fov: 50 }}
        gl={{ 
          antialias: true, 
          toneMapping: THREE.NoToneMapping,
          outputColorSpace: THREE.SRGBColorSpace
        }}
        className="absolute inset-0"
      >
        <CarouselScene 
          carouselRotation={carouselRotation} 
          mousePosition={mousePosition}
        />
      </Canvas>
    </div>
  );
}
