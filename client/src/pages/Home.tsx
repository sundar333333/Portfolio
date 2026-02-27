import { useState, useCallback, useEffect, Component, type ReactNode } from "react";
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

function hasWebGL(): boolean {
  try {
    const canvas = document.createElement("canvas");
    return !!(canvas.getContext("webgl2") || canvas.getContext("webgl"));
  } catch {
    return false;
  }
}

export default function Home() {
  const [isLoading, setIsLoading] = useState(() => {
    const skip = sessionStorage.getItem('skipLoading');
    if (skip === 'true') {
      sessionStorage.removeItem('skipLoading');
      return false;
    }
    return true;
  });
  const [webglSupported] = useState(() => hasWebGL());
  const [hoveredText, setHoveredText] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(true);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [showWorkSection, setShowWorkSection] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [whiteSectionProgress, setWhiteSectionProgress] = useState(0);
  const [circleProgress, setCircleProgress] = useState(0);
  const [zoomProgress, setZoomProgress] = useState(0);
  const [postZoomProgress, setPostZoomProgress] = useState(0);
  const [isCaseStudyOpen, setIsCaseStudyOpen] = useState(false);
  const [isEntered, setIsEntered] = useState(false);
  
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

  const handleZoomProgress = useCallback((progress: number) => {
    setZoomProgress(progress);
  }, []);

  const handlePostZoomProgress = useCallback((progress: number) => {
    setPostZoomProgress(progress);
  }, []);

  const handleEnter = useCallback(() => {
    setIsEntered(true);
  }, []);

  const handleBack = useCallback(() => {
    setIsEntered(false);
  }, []);

  const handleScrollToTop = useCallback(() => {
    setZoomProgress(0);
    setPostZoomProgress(0);
    setWhiteSectionProgress(0);
    setCircleProgress(0);
    setScrollProgress(0);
    setShowWorkSection(false);
    setIsEntered(false);
    window.scrollTo({ top: 0 });
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

  const handleStopVideo = useCallback(() => {
    setIsVideoPlaying(false);
    setIsMuted(true);
  }, []);

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
          
          {webglSupported && (
            <WebGLErrorBoundary>
              <Scene3D
                hoveredText={hoveredText}
                onTVClick={handleTVClick}
                isVideoPlaying={isVideoPlaying}
                isMuted={isMuted}
                onStopVideo={handleStopVideo}
                onWorkSectionChange={handleWorkSectionChange}
                onScrollProgress={handleScrollProgress}
                onWhiteSectionProgress={handleWhiteSectionProgress}
                onCircleProgress={handleCircleProgress}
              />
            </WebGLErrorBoundary>
          )}
          {!webglSupported && (
            <div className="fixed inset-0 flex items-center justify-center bg-black z-10">
              <p className="text-white/60 text-sm text-center px-8">Open this site in a browser tab for the full 3D experience</p>
            </div>
          )}

          <PixelEffect visible={showWorkSection && scrollProgress < 0.9} />
          <AboutHeroSection visible={showWorkSection && scrollProgress < 0.9} scrollProgress={scrollProgress} />
          <QASection visible={showWorkSection && scrollProgress < 0.9} scrollProgress={scrollProgress} />

          <WhiteSection progress={whiteSectionProgress} circleProgress={circleProgress} onCaseStudyChange={handleCaseStudyChange} onZoomProgress={handleZoomProgress} onPostZoomProgress={handlePostZoomProgress} onScrollToTop={handleScrollToTop} onEnter={handleEnter} onBack={handleBack} isEntered={isEntered} />

          {!isCaseStudyOpen && !isEntered && (
            <div className="absolute inset-0 z-30 flex flex-col pointer-events-none">
              <Header onTextHover={handleTextHover} isDarkText={whiteSectionProgress >= 1 && zoomProgress < 0.5} />
            </div>
          )}

          {!isCaseStudyOpen && !isEntered && (() => {
            const phase1Weight = 0.35;
            const phase2Weight = 0.25;
            const phase3Weight = 0.25;
            const phase4Weight = 0.15;
            const sceneOffset = showWorkSection ? (scrollProgress * 0.9 + whiteSectionProgress * 0.1) : 0;
            const totalProgress =
              Math.min(1, sceneOffset) * phase1Weight +
              circleProgress * phase2Weight +
              zoomProgress * phase3Weight +
              postZoomProgress * phase4Weight;
            const isDark = whiteSectionProgress > 0.5 && zoomProgress < 0.5;
            const labels = ['Home', 'About', 'Works', 'Contact'];
            const positions = [0, 0.33, 0.60, 0.85];
            const baseColor = isDark ? '0,0,0' : '255,255,255';
            return (
              <div
                className="fixed right-6 top-1/2 -translate-y-1/2 z-40"
                data-testid="scroll-tracker"
              >
                <div className="flex flex-col items-end gap-0">
                  {positions.map((pos, i) => {
                    const isActive = totalProgress >= pos;
                    const isCurrent = i === 0 ? totalProgress < positions[1] :
                      i < positions.length - 1 ? totalProgress >= pos && totalProgress < positions[i + 1] :
                      totalProgress >= pos;
                    const segmentProgress = i < positions.length - 1
                      ? Math.max(0, Math.min(1, (totalProgress - pos) / (positions[i + 1] - pos)))
                      : totalProgress >= pos ? 1 : 0;
                    return (
                      <div key={i} className="flex flex-col items-end">
                        <div className="flex items-center gap-3">
                          <span
                            className="text-[10px] font-medium tracking-[0.15em] uppercase whitespace-nowrap transition-all duration-500"
                            style={{
                              fontFamily: "'Inter', sans-serif",
                              color: isCurrent ? `rgba(${baseColor},0.7)` : `rgba(${baseColor},0.2)`,
                              transform: isCurrent ? 'translateX(0)' : 'translateX(4px)',
                            }}
                          >
                            {labels[i]}
                          </span>
                          <div
                            className="rounded-full transition-all duration-400 ease-out"
                            style={{
                              width: isCurrent ? '12px' : '6px',
                              height: isCurrent ? '12px' : '6px',
                              backgroundColor: isActive ? `rgba(${baseColor},${isCurrent ? 0.8 : 0.35})` : `rgba(${baseColor},0.12)`,
                              boxShadow: isCurrent ? `0 0 8px rgba(${baseColor},0.3)` : 'none',
                            }}
                          />
                        </div>
                        {i < positions.length - 1 && (
                          <div className="flex justify-end" style={{ width: '6px', marginRight: isCurrent ? '3px' : '0px' }}>
                            <div
                              className="relative overflow-hidden rounded-full my-1"
                              style={{
                                width: '2px',
                                height: '32px',
                                backgroundColor: `rgba(${baseColor},0.08)`,
                              }}
                            >
                              <div
                                className="absolute top-0 left-0 w-full rounded-full transition-all duration-300 ease-out"
                                style={{
                                  height: `${segmentProgress * 100}%`,
                                  backgroundColor: `rgba(${baseColor},0.35)`,
                                }}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })()}

          {!isCaseStudyOpen && !isEntered && (
            <AudioToggle isMuted={isMuted} onToggle={handleAudioToggle} />
          )}

          {!isCaseStudyOpen && !isEntered && (
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

              {postZoomProgress < 0.85 && (
                <motion.div
                  className="fixed bottom-8 left-1/2 -translate-x-1/2 z-40 flex flex-col items-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: postZoomProgress > 0.7 ? 0 : 1 }}
                  transition={{ delay: postZoomProgress > 0 ? 0 : 2.5, duration: 0.5 }}
                  data-testid="scroll-indicator"
                >
                  <motion.svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    className={`${(whiteSectionProgress > 0.5 && zoomProgress < 0.5) ? 'stroke-black/40' : 'stroke-white/40'}`}
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    animate={{ y: [0, 6, 0] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <path d="M12 5v14" />
                    <path d="M5 12l7 7 7-7" />
                  </motion.svg>
                </motion.div>
              )}

            </>
          )}
        </>
      )}
    </div>
  );
}
