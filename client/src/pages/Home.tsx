import { useState, useCallback, Component, type ReactNode } from "react";
import { LoadingScreen } from "@/components/LoadingScreen";
import { Header } from "@/components/Header";
import { CustomCursor } from "@/components/CustomCursor";
import { AudioToggle } from "@/components/AudioToggle";
import { Scene3D } from "@/components/Scene3D";
import { ProjectInfoOverlay } from "@/components/WorkSection";
import { PixelEffect } from "@/components/PixelEffect";
import { AboutHeroSection } from "@/components/AboutHeroSection";
import { QASection } from "@/components/QASection";
import { WhiteSection } from "@/components/WhiteSection";
import { useAudio } from "@/hooks/useAudio";
import { motion, AnimatePresence } from "framer-motion";

class WebGLErrorBoundary extends Component<{ children: ReactNode; fallback?: ReactNode }, { hasError: boolean }> {
  state = { hasError: false };
  static getDerivedStateFromError() { return { hasError: true }; }
  componentDidCatch() {}
  render() {
    if (this.state.hasError) return this.props.fallback || null;
    return this.props.children;
  }
}

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);
  const [hoveredText, setHoveredText] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(true);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [showWorkSection, setShowWorkSection] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [whiteSectionProgress, setWhiteSectionProgress] = useState(0);
  const [circleProgress, setCircleProgress] = useState(0);
  const [zoomProgress, setZoomProgress] = useState(0);
  const [isCaseStudyOpen, setIsCaseStudyOpen] = useState(false);
  const [isRoomEntered, setIsRoomEntered] = useState(false);
  
  const { stopStaticNoise, resumeStaticNoise } = useAudio(isMuted);

  const handleWorkSectionChange = useCallback((visible: boolean) => {
    setShowWorkSection(visible);
  }, []);

  const handleScrollProgress = useCallback((progress: number) => {
    setScrollProgress(progress);
  }, []);

  const handleWhiteSectionProgress = useCallback((progress: number) => {
    setWhiteSectionProgress(progress);
  }, []);

  const handleCircleProgress = useCallback((progress: number) => {
    setCircleProgress(progress);
  }, []);

  const handleCaseStudyChange = useCallback((isOpen: boolean) => {
    setIsCaseStudyOpen(isOpen);
  }, []);

  const handleEnterRoom = useCallback(() => {
    setIsRoomEntered(true);
  }, []);

  const handleExitRoom = useCallback(() => {
    setIsRoomEntered(false);
  }, []);

  const handleZoomProgress = useCallback((progress: number) => {
    setZoomProgress(progress);
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
    <div className="relative min-h-screen bg-black" data-testid="home-page">
      <AnimatePresence>
        {isLoading && <LoadingScreen onComplete={handleLoadingComplete} />}
      </AnimatePresence>

      {!isLoading && (
        <>
          <CustomCursor isDark={whiteSectionProgress > 0.5 && zoomProgress < 0.5} />
          
          <WebGLErrorBoundary>
            <Scene3D
              hoveredText={hoveredText}
              onTVClick={handleTVClick}
              isVideoPlaying={isVideoPlaying}
              onWorkSectionChange={handleWorkSectionChange}
              onScrollProgress={handleScrollProgress}
              onWhiteSectionProgress={handleWhiteSectionProgress}
              onCircleProgress={handleCircleProgress}
            />
          </WebGLErrorBoundary>

          <PixelEffect visible={showWorkSection && scrollProgress < 0.9} />
          <AboutHeroSection visible={showWorkSection && scrollProgress < 0.9} scrollProgress={scrollProgress} />
          <QASection visible={showWorkSection && scrollProgress < 0.9} scrollProgress={scrollProgress} />

          <WhiteSection progress={whiteSectionProgress} circleProgress={circleProgress} onCaseStudyChange={handleCaseStudyChange} onZoomProgress={handleZoomProgress} onEnterRoom={handleEnterRoom} />

          <AnimatePresence>
            {isRoomEntered && (
              <motion.div
                className="fixed inset-0 z-[70] bg-white"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.6 }}
                data-testid="room-white-screen"
              >
                <motion.button
                  className="fixed top-6 right-6 z-[71] w-12 h-12 flex items-center justify-center rounded-full border border-black/20 bg-transparent hover:bg-black/5 transition-colors"
                  onClick={handleExitRoom}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4, duration: 0.3 }}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  data-testid="button-exit-room"
                >
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <line x1="4" y1="4" x2="16" y2="16" />
                    <line x1="16" y1="4" x2="4" y2="16" />
                  </svg>
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>

          {!isCaseStudyOpen && !isRoomEntered && (
            <div className="absolute inset-0 z-30 flex flex-col pointer-events-none">
              <Header onTextHover={handleTextHover} isDarkText={whiteSectionProgress >= 1 && zoomProgress < 0.5} />
            </div>
          )}

          {!isCaseStudyOpen && !isRoomEntered && (
            <AudioToggle isMuted={isMuted} onToggle={handleAudioToggle} />
          )}

          {!isCaseStudyOpen && !isRoomEntered && (
            <>
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
        </>
      )}
    </div>
  );
}
