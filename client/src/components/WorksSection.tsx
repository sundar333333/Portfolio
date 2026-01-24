import { useRef, useState, useEffect, useCallback } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import * as THREE from "three";

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
  rotationAngle: number;
  totalProjects: number;
}

function ProjectCard3D({ project, index, rotationAngle, totalProjects }: ProjectCardProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const texture = useTexture(project.image);
  
  const radius = 8;
  const anglePerCard = (Math.PI * 0.6) / totalProjects;
  const startAngle = -Math.PI * 0.3;
  
  useFrame(() => {
    if (!meshRef.current) return;
    
    const cardAngle = startAngle + index * anglePerCard + rotationAngle;
    
    const x = Math.sin(cardAngle) * radius;
    const z = Math.cos(cardAngle) * radius - radius;
    
    meshRef.current.position.x = x;
    meshRef.current.position.z = z;
    meshRef.current.position.y = 0;
    
    meshRef.current.rotation.y = cardAngle;
    
    const distanceFromFront = Math.abs(cardAngle);
    const scale = Math.max(0.7, 1.1 - distanceFromFront * 0.3);
    meshRef.current.scale.set(scale, scale, 1);
    
    const material = meshRef.current.material as THREE.MeshBasicMaterial;
    material.opacity = Math.max(0.4, 1 - distanceFromFront * 0.4);
  });

  return (
    <mesh
      ref={meshRef}
      onPointerOver={() => document.body.style.cursor = "pointer"}
      onPointerOut={() => document.body.style.cursor = "default"}
    >
      <planeGeometry args={[2.5, 3.5]} />
      <meshBasicMaterial 
        map={texture} 
        transparent 
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

interface CarouselSceneProps {
  rotationAngle: number;
}

function CarouselScene({ rotationAngle }: CarouselSceneProps) {
  const { camera } = useThree();
  
  useFrame(() => {
    camera.position.set(0, 0, 4);
    camera.lookAt(0, 0, -4);
  });

  return (
    <>
      <color attach="background" args={["#ffffff"]} />
      <ambientLight intensity={0.8} />
      <pointLight position={[0, 5, 5]} intensity={0.5} />
      
      {projects.map((project, index) => (
        <ProjectCard3D
          key={project.id}
          project={project}
          index={index}
          rotationAngle={rotationAngle}
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
  const [rotationAngle, setRotationAngle] = useState(0);
  const [currentProjectIndex, setCurrentProjectIndex] = useState(0);
  const targetRotationRef = useRef(0);
  const currentRotationRef = useRef(0);
  const rafIdRef = useRef<number | null>(null);
  const scrollAccumulatorRef = useRef(0);

  useEffect(() => {
    if (!visible) {
      targetRotationRef.current = 0;
      currentRotationRef.current = 0;
      scrollAccumulatorRef.current = 0;
      setRotationAngle(0);
      return;
    }

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      
      if (e.deltaY < 0) {
        scrollAccumulatorRef.current += e.deltaY;
        
        if (scrollAccumulatorRef.current < -150) {
          if (onExitToLanding) {
            onExitToLanding();
          }
          scrollAccumulatorRef.current = 0;
          return;
        }
      } else {
        scrollAccumulatorRef.current = 0;
        targetRotationRef.current += e.deltaY * 0.001;
      }
    };

    const animate = () => {
      currentRotationRef.current += (targetRotationRef.current - currentRotationRef.current) * 0.06;
      setRotationAngle(currentRotationRef.current);
      
      const anglePerCard = (Math.PI * 0.6) / projects.length;
      const projectIndex = Math.round(currentRotationRef.current / anglePerCard);
      const clampedIndex = Math.max(0, Math.min(projects.length - 1, projectIndex));
      setCurrentProjectIndex(clampedIndex);
      
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

  const currentProject = projects[currentProjectIndex];

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-30 bg-white"
      data-testid="works-section"
    >
      <header className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-8 py-6">
        <h1 
          className="text-2xl md:text-3xl font-bold tracking-tight text-black"
          style={{ fontFamily: "'Anton', sans-serif" }}
        >
          SUNDAR RAM
        </h1>
        <nav className="flex items-center gap-8">
          <span className="text-black/70 text-sm uppercase tracking-widest cursor-pointer hover:text-black transition-colors">
            Works
          </span>
          <span className="text-black/70 text-sm uppercase tracking-widest cursor-pointer hover:text-black transition-colors">
            About
          </span>
          <span className="text-black/70 text-sm uppercase tracking-widest cursor-pointer hover:text-black transition-colors">
            Contact
          </span>
        </nav>
      </header>

      <Canvas
        camera={{ position: [0, 0, 4], fov: 50 }}
        className="absolute inset-0"
      >
        <CarouselScene rotationAngle={rotationAngle} />
      </Canvas>

      <div className="absolute bottom-12 left-12 z-10 pointer-events-none">
        <div className="text-black/40 text-xs uppercase tracking-[0.3em] mb-2">
          {currentProject.category}
        </div>
        <h2 className="text-black text-3xl md:text-4xl font-bold tracking-tight max-w-md">
          {currentProject.title}
        </h2>
        <div className="flex items-center gap-3 mt-4">
          <span className="text-black/60 text-sm">
            {String(currentProjectIndex + 1).padStart(2, "0")} / {String(projects.length).padStart(2, "0")}
          </span>
          <div className="flex gap-1">
            {projects.map((_, i) => (
              <div
                key={i}
                className={`w-8 h-0.5 transition-all duration-300 ${
                  i === currentProjectIndex ? "bg-black" : "bg-black/20"
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="absolute bottom-12 right-12 z-10 text-black/30 text-sm pointer-events-none">
        Scroll up to go back
      </div>
    </div>
  );
}
