import { useEffect, useRef, RefObject } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import Lenis from "lenis";

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
  containerRef: RefObject<HTMLDivElement>;
}

function ProjectCard({ project, index, containerRef }: ProjectCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: cardRef,
    container: containerRef,
    offset: ["start end", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], [80, -80]);
  const opacity = useTransform(scrollYProgress, [0, 0.15, 0.85, 1], [0, 1, 1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.15, 0.85, 1], [0.95, 1, 1, 0.95]);

  return (
    <motion.div
      ref={cardRef}
      className="relative flex flex-col items-center justify-center min-h-screen py-32"
      style={{ opacity }}
      data-testid={`project-card-${project.id}`}
    >
      <motion.div
        className="relative w-full max-w-4xl mx-auto px-8"
        style={{ y, scale }}
      >
        <div className="relative overflow-hidden rounded-2xl shadow-2xl group cursor-pointer">
          <motion.img
            src={project.image}
            alt={project.title}
            className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-105"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: index * 0.1 }}
          />
          
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          
          <div className="absolute inset-0 border border-white/10 rounded-2xl pointer-events-none" />
          
          <motion.div 
            className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            style={{
              background: "linear-gradient(135deg, rgba(255,255,255,0.1) 0%, transparent 50%, rgba(255,255,255,0.05) 100%)",
            }}
          />
        </div>
        
        <motion.div 
          className="mt-8 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <span className="text-white/40 text-sm uppercase tracking-[0.3em] font-light">
            {project.category}
          </span>
          <h2 className="mt-3 text-3xl md:text-4xl font-bold text-white tracking-tight">
            {project.title}
          </h2>
        </motion.div>
      </motion.div>
      
      <div className="absolute left-8 top-1/2 -translate-y-1/2 hidden lg:block">
        <span className="text-white/20 text-8xl font-bold">
          {String(index + 1).padStart(2, "0")}
        </span>
      </div>
    </motion.div>
  );
}

interface WorksSectionProps {
  visible: boolean;
}

export function WorksSection({ visible }: WorksSectionProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const lenisRef = useRef<Lenis | null>(null);
  const rafIdRef = useRef<number | null>(null);

  useEffect(() => {
    if (!visible || !containerRef.current || !contentRef.current) return;

    lenisRef.current = new Lenis({
      wrapper: containerRef.current,
      content: contentRef.current,
      duration: 1.4,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      wheelMultiplier: 0.8,
      touchMultiplier: 1.5,
    });

    function raf(time: number) {
      lenisRef.current?.raf(time);
      rafIdRef.current = requestAnimationFrame(raf);
    }

    rafIdRef.current = requestAnimationFrame(raf);

    return () => {
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
      lenisRef.current?.destroy();
      lenisRef.current = null;
    };
  }, [visible]);

  if (!visible) return null;

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-30 bg-[#030308] overflow-y-auto overflow-x-hidden"
      data-testid="works-section"
    >
      <div ref={contentRef}>
        <div className="absolute inset-0 pointer-events-none">
          <div 
            className="absolute inset-0 opacity-30"
            style={{
              background: "radial-gradient(ellipse at 50% 0%, rgba(100, 100, 255, 0.15) 0%, transparent 50%)",
            }}
          />
          <div 
            className="absolute inset-0 opacity-20"
            style={{
              background: "radial-gradient(ellipse at 50% 100%, rgba(255, 100, 200, 0.1) 0%, transparent 50%)",
            }}
          />
        </div>

        <div className="relative z-10">
          <div className="min-h-[50vh] flex items-center justify-center">
            <motion.div
              className="text-center"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.3 }}
            >
              <span className="text-white/30 text-sm uppercase tracking-[0.5em]">
                Selected Works
              </span>
              <h1 className="mt-4 text-6xl md:text-8xl font-bold text-white tracking-tight">
                Projects
              </h1>
            </motion.div>
          </div>

          {projects.map((project, index) => (
            <ProjectCard 
              key={project.id} 
              project={project} 
              index={index} 
              containerRef={containerRef}
            />
          ))}

          <div className="min-h-[30vh] flex items-center justify-center">
            <motion.p
              className="text-white/30 text-lg tracking-wide"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.8 }}
            >
              More projects coming soon
            </motion.p>
          </div>
        </div>
      </div>
    </div>
  );
}
