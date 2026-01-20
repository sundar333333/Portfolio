import { useState, useCallback } from "react";
import { LoadingScreen } from "@/components/LoadingScreen";
import { Header } from "@/components/Header";
import { CustomCursor } from "@/components/CustomCursor";
import { AudioToggle } from "@/components/AudioToggle";
import { Scene3D } from "@/components/Scene3D";
import { ProjectOverlay } from "@/components/ProjectOverlay";
import { CaseStudyModal } from "@/components/CaseStudyModal";
import { useAudio } from "@/hooks/useAudio";
import { motion, AnimatePresence } from "framer-motion";

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);
  const [hoveredText, setHoveredText] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(true);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [scrollPhase, setScrollPhase] = useState<"landing" | "transition" | "gallery">("landing");
  const [currentProjectIndex, setCurrentProjectIndex] = useState(0);
  const [caseStudyModalProject, setCaseStudyModalProject] = useState<number | null>(null);
  
  const { stopStaticNoise, resumeStaticNoise } = useAudio(isMuted);

  const handleLoadingComplete = useCallback(() => {
    setIsLoading(false);
  }, []);

  const handleTextHover = useCallback((text: string | null) => {
    setHoveredText(text);
  }, []);

  const handleTVClick = useCallback(() => {
    if (scrollPhase !== "landing") return;
    
    if (isVideoPlaying) {
      setIsVideoPlaying(false);
      resumeStaticNoise();
    } else {
      setIsVideoPlaying(true);
      stopStaticNoise();
    }
  }, [isVideoPlaying, stopStaticNoise, resumeStaticNoise, scrollPhase]);

  const handleAudioToggle = useCallback(() => {
    setIsMuted((prev) => !prev);
  }, []);

  const handleScrollPhaseChange = useCallback((phase: "landing" | "transition" | "gallery") => {
    setScrollPhase(phase);
    if (phase !== "landing" && isVideoPlaying) {
      setIsVideoPlaying(false);
      resumeStaticNoise();
    }
  }, [isVideoPlaying, resumeStaticNoise]);

  const handleProjectChange = useCallback((index: number) => {
    setCurrentProjectIndex(index);
  }, []);

  const handleViewCaseStudy = useCallback((projectIndex: number) => {
    setCaseStudyModalProject(projectIndex);
  }, []);

  const handleCloseCaseStudyModal = useCallback(() => {
    setCaseStudyModalProject(null);
  }, []);

  return (
    <div className="relative min-h-screen bg-black overflow-hidden" data-testid="home-page">
      <AnimatePresence>
        {isLoading && <LoadingScreen onComplete={handleLoadingComplete} />}
      </AnimatePresence>

      {!isLoading && (
        <>
          <CustomCursor />
          
          <Scene3D
            hoveredText={hoveredText}
            onTVClick={handleTVClick}
            isVideoPlaying={isVideoPlaying}
            onScrollPhaseChange={handleScrollPhaseChange}
            onProjectChange={handleProjectChange}
          />

          <AnimatePresence>
            {scrollPhase === "landing" && (
              <motion.div 
                className="absolute inset-0 z-10 flex flex-col pointer-events-none"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Header onTextHover={handleTextHover} />
              </motion.div>
            )}
          </AnimatePresence>

          <ProjectOverlay
            currentProjectIndex={currentProjectIndex}
            isVisible={scrollPhase === "gallery"}
            onViewCaseStudy={handleViewCaseStudy}
          />

          <CaseStudyModal
            projectIndex={caseStudyModalProject}
            onClose={handleCloseCaseStudyModal}
          />

          <AudioToggle isMuted={isMuted} onToggle={handleAudioToggle} />

          <AnimatePresence>
            {isVideoPlaying && scrollPhase === "landing" && (
              <motion.div
                className="fixed bottom-6 left-6 z-50 flex items-center gap-3 px-4 py-2 bg-white/10 border border-white/20 rounded-full backdrop-blur-sm"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                data-testid="video-playing-indicator"
              >
                <motion.div
                  className="w-2 h-2 bg-red-500 rounded-full"
                  animate={{ opacity: [1, 0.5, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                />
                <span className="text-white/80 text-sm font-medium">
                  Now Playing: Messi Tribute
                </span>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {scrollPhase === "landing" && (
              <motion.div 
                className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 px-4 w-full max-w-md"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ delay: 2 }}
              >
                <div
                  className="flex flex-col items-center gap-2 text-white/40 text-xs text-center"
                  data-testid="scroll-hint"
                >
                  <motion.div
                    className="w-6 h-10 border-2 border-white/30 rounded-full flex items-start justify-center p-1"
                    initial={{ opacity: 0.5 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1, repeat: Infinity, repeatType: "reverse" }}
                  >
                    <motion.div
                      className="w-1.5 h-2.5 bg-white/50 rounded-full"
                      animate={{ y: [0, 12, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    />
                  </motion.div>
                  <span>Scroll to explore projects</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </div>
  );
}
