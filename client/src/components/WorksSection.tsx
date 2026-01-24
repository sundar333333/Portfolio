import { useRef, useState, useEffect, useCallback } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
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
  {
    id: 1,
    title: "Current Mobile Payment App",
    category: "Fintech",
    image: currentPoster,
  },
  {
    id: 2,
    title: "Eventify",
    category: "Event Management",
    image: eventifyPoster,
  },
  {
    id: 3,
    title: "Space Jump",
    category: "Mobile Game",
    image: spaceJumpPoster,
  },
  {
    id: 4,
    title: "Ticking",
    category: "Movie Booking",
    image: tickingPoster,
  },
];

interface ProjectCardProps {
  project: Project;
  index: number;
  scrollX: number;
  totalProjects: number;
}

function ProjectCard3D({ project, index, scrollX, totalProjects }: ProjectCardProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const texture = useTexture(project.image);
  
  const cardWidth = 3;
  const cardGap = 0.5;
  const spacing = cardWidth + cardGap;
  const curveRadius = 12;
  
  useFrame(() => {
    if (!meshRef.current) return;
    
    const baseX = index * spacing - (totalProjects * spacing) / 2 + spacing / 2;
    const x = baseX - scrollX;
    
    const angle = x / curveRadius;
    const curvedX = Math.sin(angle) * curveRadius;
    const curvedZ = Math.cos(angle) * curveRadius - curveRadius;
    
    meshRef.current.position.x = curvedX;
    meshRef.current.position.z = curvedZ;
    meshRef.current.position.y = 0;
    
    meshRef.current.rotation.y = angle;
    
    const distanceFromCenter = Math.abs(x);
    const maxDistance = 8;
    const normalizedDistance = Math.min(distanceFromCenter / maxDistance, 1);
    const scale = 1 - normalizedDistance * 0.3;
    meshRef.current.scale.set(scale, scale, 1);
    
    const material = meshRef.current.material as THREE.MeshBasicMaterial;
    material.opacity = 1 - normalizedDistance * 0.5;
  });

  return (
    <mesh
      ref={meshRef}
      onPointerOver={() => document.body.style.cursor = "pointer"}
      onPointerOut={() => document.body.style.cursor = "default"}
    >
      <planeGeometry args={[cardWidth, cardWidth * 1.4]} />
      <meshBasicMaterial 
        map={texture} 
        transparent 
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

interface CarouselSceneProps {
  scrollX: number;
}

function CarouselScene({ scrollX }: CarouselSceneProps) {
  const { camera } = useThree();
  
  useFrame(() => {
    camera.position.set(0, 0, 6);
    camera.lookAt(0, 0, 0);
  });

  return (
    <>
      <color attach="background" args={["#fafafa"]} />
      <ambientLight intensity={1} />
      
      {projects.map((project, index) => (
        <ProjectCard3D
          key={project.id}
          project={project}
          index={index}
          scrollX={scrollX}
          totalProjects={projects.length}
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
  const [scrollX, setScrollX] = useState(0);
  const targetScrollRef = useRef(0);
  const currentScrollRef = useRef(0);
  const rafIdRef = useRef<number | null>(null);
  const exitAccumulatorRef = useRef(0);
  const canExitRef = useRef(true);

  const handleTextHover = useCallback(() => {}, []);

  useEffect(() => {
    if (!visible) {
      targetScrollRef.current = 0;
      currentScrollRef.current = 0;
      exitAccumulatorRef.current = 0;
      canExitRef.current = true;
      setScrollX(0);
      return;
    }

    const cardWidth = 3;
    const cardGap = 0.5;
    const spacing = cardWidth + cardGap;
    const maxScroll = (projects.length - 1) * spacing;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      
      const delta = e.deltaY || e.deltaX;
      
      if (delta < 0 && currentScrollRef.current <= 0 && canExitRef.current) {
        exitAccumulatorRef.current += Math.abs(delta);
        
        if (exitAccumulatorRef.current > 200) {
          if (onExitToLanding) {
            onExitToLanding();
          }
          exitAccumulatorRef.current = 0;
          canExitRef.current = false;
          return;
        }
      } else {
        exitAccumulatorRef.current = 0;
      }
      
      if (delta > 0) {
        canExitRef.current = true;
      }
      
      targetScrollRef.current += delta * 0.008;
      targetScrollRef.current = Math.max(0, Math.min(maxScroll, targetScrollRef.current));
    };

    const animate = () => {
      currentScrollRef.current += (targetScrollRef.current - currentScrollRef.current) * 0.08;
      setScrollX(currentScrollRef.current);
      rafIdRef.current = requestAnimationFrame(animate);
    };

    window.addEventListener("wheel", handleWheel, { passive: false });
    rafIdRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("wheel", handleWheel);
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
        camera={{ position: [0, 0, 6], fov: 50 }}
        className="absolute inset-0"
      >
        <CarouselScene scrollX={scrollX} />
      </Canvas>
    </div>
  );
}
