import { useState, useCallback } from "react";
import { LoadingScreen } from "@/components/LoadingScreen";
import { Header } from "@/components/Header";
import { CustomCursor } from "@/components/CustomCursor";
import { AudioToggle } from "@/components/AudioToggle";
import { Scene3D } from "@/components/Scene3D";
import { ProjectInfoOverlay } from "@/components/WorkSection";
import { PixelEffect } from "@/components/PixelEffect";
import { useAudio } from "@/hooks/useAudio";
import { motion, AnimatePresence } from "framer-motion";

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);
  const [hoveredText, setHoveredText] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(true);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [showWorkSection, setShowWorkSection] = useState(false);
  
  const { stopStaticNoise, resumeStaticNoise } = useAudio(isMuted);

  const handleWorkSectionChange = useCallback((visible: boolean) => {
    setShowWorkSection(visible);
  }, []);

  const handleLoadingComplete = useCallback(() => {
    setIsLoading(false);
  }, []);

  const handleTextHover = useCallback((text: string | null) => {
    setHoveredText(text);
  }, []);

  const handleTVClick = useCallback(() => {
    if (isVideoPlaying) {
      setIsVideoPlaying(false);
      resumeStaticNoise();
    } else {
      setIsVideoPlaying(true);
      stopStaticNoise();
    }
  }, [isVideoPlaying, stopStaticNoise, resumeStaticNoise]);

  const handleAudioToggle = useCallback(() => {
    setIsMuted((prev) => !prev);
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
            onWorkSectionChange={handleWorkSectionChange}
          />

          <PixelEffect visible={showWorkSection} />

          <div className="absolute inset-0 z-10 flex flex-col pointer-events-none">
            <Header onTextHover={handleTextHover} />
          </div>

          <AudioToggle isMuted={isMuted} onToggle={handleAudioToggle} />

          <AnimatePresence>
            {isVideoPlaying && (
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

          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 px-4 w-full max-w-md">
            <motion.div
              className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 text-white/40 text-xs text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2 }}
              data-testid="text-interaction-hint"
            >
              <span>Hover over text to see it on the TV</span>
              <span className="hidden sm:block w-1 h-1 bg-white/40 rounded-full" />
              <span>Click TV for a special tribute</span>
            </motion.div>
          </div>
        </>
      )}
    </div>
  );
}
