import { useRef, useState, useEffect } from "react";
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
  scrollProgress: number;
  totalProjects: number;
  onClick: () => void;
  isActive: boolean;
}

function ProjectCard3D({ project, index, scrollProgress, totalProjects, onClick, isActive }: ProjectCardProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const texture = useTexture(project.image);
  
  const spacing = 4;
  const centerOffset = (totalProjects - 1) / 2;
  
  useFrame(() => {
    if (!meshRef.current) return;
    
    const baseX = (index - centerOffset) * spacing;
    const scrollOffset = scrollProgress * spacing * totalProjects;
    let x = baseX - scrollOffset;
    
    while (x < -spacing * 2) x += spacing * totalProjects;
    while (x > spacing * (totalProjects - 2)) x -= spacing * totalProjects;
    
    const distanceFromCenter = Math.abs(x);
    const z = -distanceFromCenter * 0.8;
    const rotationY = x * 0.15;
    const scale = Math.max(0.6, 1 - distanceFromCenter * 0.1);
    
    meshRef.current.position.x = x;
    meshRef.current.position.z = z;
    meshRef.current.rotation.y = rotationY;
    meshRef.current.scale.setScalar(scale);
    
    const material = meshRef.current.material as THREE.MeshBasicMaterial;
    material.opacity = Math.max(0.3, 1 - distanceFromCenter * 0.15);
  });

  return (
    <mesh
      ref={meshRef}
      onClick={onClick}
      onPointerOver={() => document.body.style.cursor = "pointer"}
      onPointerOut={() => document.body.style.cursor = "default"}
    >
      <planeGeometry args={[3, 2]} />
      <meshBasicMaterial 
        map={texture} 
        transparent 
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

interface CarouselSceneProps {
  scrollProgress: number;
  onProjectClick: (project: Project) => void;
  activeProject: number | null;
}

function CarouselScene({ scrollProgress, onProjectClick, activeProject }: CarouselSceneProps) {
  const { camera } = useThree();
  
  useFrame(() => {
    camera.position.z = 5;
    camera.position.y = 0;
    camera.lookAt(0, 0, 0);
  });

  return (
    <>
      <color attach="background" args={["#030308"]} />
      <ambientLight intensity={0.5} />
      <pointLight position={[0, 5, 5]} intensity={1} />
      
      {projects.map((project, index) => (
        <ProjectCard3D
          key={project.id}
          project={project}
          index={index}
          scrollProgress={scrollProgress}
          totalProjects={projects.length}
          onClick={() => onProjectClick(project)}
          isActive={activeProject === project.id}
        />
      ))}
    </>
  );
}

interface WorksSectionProps {
  visible: boolean;
}

export function WorksSection({ visible }: WorksSectionProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [activeProject, setActiveProject] = useState<number | null>(null);
  const [currentProjectIndex, setCurrentProjectIndex] = useState(0);
  const targetScrollRef = useRef(0);
  const currentScrollRef = useRef(0);
  const rafIdRef = useRef<number | null>(null);

  useEffect(() => {
    if (!visible) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      targetScrollRef.current += e.deltaY * 0.0005;
      targetScrollRef.current = Math.max(0, Math.min(1, targetScrollRef.current));
    };

    const animate = () => {
      currentScrollRef.current += (targetScrollRef.current - currentScrollRef.current) * 0.08;
      setScrollProgress(currentScrollRef.current);
      
      const projectIndex = Math.round(currentScrollRef.current * (projects.length - 1));
      setCurrentProjectIndex(Math.max(0, Math.min(projects.length - 1, projectIndex)));
      
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
  }, [visible]);

  const handleProjectClick = (project: Project) => {
    setActiveProject(project.id);
  };

  if (!visible) return null;

  const currentProject = projects[currentProjectIndex];

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-30 bg-[#030308]"
      data-testid="works-section"
    >
      <div className="absolute inset-0 pointer-events-none">
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            background: "radial-gradient(ellipse at 50% 50%, rgba(100, 100, 255, 0.1) 0%, transparent 60%)",
          }}
        />
      </div>

      <Canvas
        camera={{ position: [0, 0, 5], fov: 50 }}
        className="absolute inset-0"
      >
        <CarouselScene
          scrollProgress={scrollProgress}
          onProjectClick={handleProjectClick}
          activeProject={activeProject}
        />
      </Canvas>

      <div className="absolute bottom-12 left-12 z-10 pointer-events-none">
        <div className="text-white/40 text-xs uppercase tracking-[0.3em] mb-2">
          {currentProject.category}
        </div>
        <h2 className="text-white text-3xl md:text-4xl font-bold tracking-tight max-w-md">
          {currentProject.title}
        </h2>
        <div className="flex items-center gap-3 mt-4">
          <span className="text-white/60 text-sm">
            {String(currentProjectIndex + 1).padStart(2, "0")} / {String(projects.length).padStart(2, "0")}
          </span>
          <div className="flex gap-1">
            {projects.map((_, i) => (
              <div
                key={i}
                className={`w-8 h-0.5 transition-all duration-300 ${
                  i === currentProjectIndex ? "bg-white" : "bg-white/20"
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="absolute bottom-12 right-12 z-10 text-white/30 text-sm pointer-events-none">
        Scroll to explore
      </div>
    </div>
  );
}
