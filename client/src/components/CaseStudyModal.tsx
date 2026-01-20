import { motion, AnimatePresence } from "framer-motion";
import { X, Download } from "lucide-react";
import { projects } from "@/lib/projects";

interface CaseStudyModalProps {
  projectIndex: number | null;
  onClose: () => void;
}

export function CaseStudyModal({ projectIndex, onClose }: CaseStudyModalProps) {
  const project = projectIndex !== null && projectIndex < projects.length 
    ? projects[projectIndex] 
    : null;

  return (
    <AnimatePresence>
      {project && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
          
          <motion.div
            className="relative bg-neutral-900 rounded-2xl overflow-hidden max-w-4xl w-full max-h-[90vh] shadow-2xl"
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
          >
            <div className="sticky top-0 z-10 flex items-center justify-between p-4 bg-neutral-900/90 backdrop-blur-sm border-b border-white/10">
              <div>
                <h2 className="text-xl font-bold text-white">{project.title}</h2>
                <p className="text-white/60 text-sm">{project.description}</p>
              </div>
              
              <div className="flex items-center gap-2">
                <motion.a
                  href={project.prototypeLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-white text-black font-medium rounded-full text-sm hover:bg-white/90 transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  data-testid="modal-view-prototype"
                >
                  View Prototype
                </motion.a>
                
                <motion.button
                  onClick={onClose}
                  className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  data-testid="button-close-modal"
                >
                  <X size={20} className="text-white" />
                </motion.button>
              </div>
            </div>
            
            <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
              <img
                src={project.caseStudyImage}
                alt={`${project.title} Case Study`}
                className="w-full h-auto"
                data-testid="case-study-image"
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
