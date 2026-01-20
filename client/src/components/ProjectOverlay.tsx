import { motion, AnimatePresence } from "framer-motion";
import { ExternalLink, FileText } from "lucide-react";
import { projects } from "@/lib/projects";

interface ProjectOverlayProps {
  currentProjectIndex: number;
  isVisible: boolean;
  onViewCaseStudy: (projectIndex: number) => void;
}

export function ProjectOverlay({ currentProjectIndex, isVisible, onViewCaseStudy }: ProjectOverlayProps) {
  const isHireMeSlide = currentProjectIndex >= projects.length;
  const currentProject = !isHireMeSlide ? projects[currentProjectIndex] : null;

  return (
    <AnimatePresence mode="wait">
      {isVisible && (
        <motion.div
          key={currentProjectIndex}
          className="fixed inset-0 z-20 pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {isHireMeSlide ? (
            <div className="absolute inset-0 flex flex-col items-center justify-end pb-32">
              <motion.div
                className="text-center"
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
                  Why should you hire me?
                </h2>
                <p className="text-white/60 text-lg mb-8 max-w-md mx-auto">
                  Let's create something amazing together
                </p>
                <motion.a
                  href="mailto:contact@sundarram.com"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-white text-black font-semibold rounded-full pointer-events-auto hover:bg-white/90 transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  data-testid="button-contact-me"
                >
                  Contact Me
                </motion.a>
              </motion.div>
            </div>
          ) : currentProject && (
            <>
              <motion.div
                className="absolute bottom-8 left-8 max-w-md"
                initial={{ x: -30, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-white/40 text-sm font-medium">
                    {String(currentProjectIndex + 1).padStart(2, '0')} / {String(projects.length).padStart(2, '0')}
                  </span>
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: currentProject.accentColor }}
                  />
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
                  {currentProject.title}
                </h2>
                <p className="text-white/60 text-lg">
                  {currentProject.description}
                </p>
              </motion.div>

              <motion.div
                className="absolute bottom-8 right-8 flex flex-col gap-3"
                initial={{ x: 30, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <motion.a
                  href={currentProject.prototypeLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-white text-black font-semibold rounded-full pointer-events-auto hover:bg-white/90 transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  data-testid={`button-view-prototype-${currentProjectIndex}`}
                >
                  <ExternalLink size={18} />
                  View Prototype
                </motion.a>
                
                <motion.button
                  onClick={() => onViewCaseStudy(currentProjectIndex)}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 border border-white/20 text-white font-semibold rounded-full pointer-events-auto hover:bg-white/20 transition-colors backdrop-blur-sm"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  data-testid={`button-view-case-study-${currentProjectIndex}`}
                >
                  <FileText size={18} />
                  View Case Study
                </motion.button>
              </motion.div>

              <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2">
                {projects.map((_, idx) => (
                  <div
                    key={idx}
                    className={`w-2 h-2 rounded-full transition-all ${
                      idx === currentProjectIndex 
                        ? "bg-white scale-125" 
                        : "bg-white/30"
                    }`}
                  />
                ))}
                <div
                  className={`w-2 h-2 rounded-full transition-all ${
                    currentProjectIndex >= projects.length 
                      ? "bg-white scale-125" 
                      : "bg-white/30"
                  }`}
                />
              </div>
            </>
          )}

          <motion.div 
            className="absolute top-1/2 right-4 -translate-y-1/2 text-white/30 text-sm hidden md:block"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <div className="flex flex-col items-center gap-2">
              <div className="w-px h-8 bg-white/20" />
              <span className="writing-vertical">SCROLL</span>
              <div className="w-px h-8 bg-white/20" />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
