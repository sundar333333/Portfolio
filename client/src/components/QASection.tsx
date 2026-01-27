import { motion } from "framer-motion";

interface QASectionProps {
  visible: boolean;
  scrollProgress: number;
}

const qaData = [
  {
    question: "Who Am I ?",
    answer: "I'm Sundar Ram, a multidisciplinary designer with a strong foundation in both design and technology. I'm passionate about creating digital experiences that are not only visually appealing but also intuitive, functional, and user-centered. With a background in computer applications, I approach design with a problem-solving mindset—always focusing on clarity, usability, and real user needs. I believe good design should feel effortless to the user while solving meaningful problems behind the scenes."
  },
  {
    question: "What Do I Do ?",
    answer: "I work as a UI/UX Designer, Product Designer, Web Designer, and Brand Designer, crafting experiences that balance user needs with business goals. My work spans from user research and wireframing to high-fidelity UI design and interaction planning.\n\nAlongside design, I have hands-on experience in frontend development using HTML, CSS, and JavaScript, which allows me to design interfaces that are technically feasible and developer-friendly. This dual perspective helps me collaborate effectively with developers and ensures that my designs translate smoothly from concept to code. I focus on building scalable, consistent, and engaging digital products across web and mobile platforms."
  },
  {
    question: "Where Did It All Start ?",
    answer: "My journey into design began during my college days, when one of my close friends was actively freelancing as a UI/UX designer. Watching him work on real client projects sparked my curiosity about how design impacts user behavior and product success. He introduced me to the fundamentals of UI/UX, shared his experiences, and guided me through the early learning phase. That exposure inspired me to explore the field deeper, and what started as curiosity soon turned into a clear career path. Since then, I've continuously worked on improving my skills through projects, practice, and learning—shaping my identity as a designer."
  }
];

export function QASection({ visible, scrollProgress }: QASectionProps) {
  if (!visible) return null;

  // Q&A starts after hero completely disappears (at 0.12)
  // Each phase gets ~0.098 of scroll progress (same as ABOUT ME duration)
  const qaStartProgress = 0.12;
  const qaEndProgress = 1.0;
  const qaTotalRange = qaEndProgress - qaStartProgress;
  
  // 3 Q&A pairs × 3 phases each = 9 total phases
  // Each phase gets equal scroll time (matching ABOUT ME)
  const totalPhases = 9;
  const phaseSize = qaTotalRange / totalPhases;
  
  return (
    <div className="fixed inset-0 z-40 pointer-events-none overflow-hidden">
      {qaData.map((qa, index) => {
        const isLastQuestion = index === qaData.length - 1;
        
        // Each Q&A pair gets 3 phases
        // Phase 1: Question scrolls right to left
        // Phase 2: Answer scrolls bottom to meet question
        // Phase 3: Both scroll up and disappear
        
        const qaPhaseStart = qaStartProgress + (index * 3 * phaseSize);
        const phase1End = qaPhaseStart + phaseSize;
        const phase2End = phase1End + phaseSize;
        const phase3End = phase2End + phaseSize;
        
        // Determine current phase progress
        let phase1Progress = 0;
        let phase2Progress = 0;
        let phase3Progress = 0;
        
        if (scrollProgress >= qaPhaseStart && scrollProgress < phase1End) {
          phase1Progress = (scrollProgress - qaPhaseStart) / phaseSize;
        } else if (scrollProgress >= phase1End) {
          phase1Progress = 1;
        }
        
        if (scrollProgress >= phase1End && scrollProgress < phase2End) {
          phase2Progress = (scrollProgress - phase1End) / phaseSize;
        } else if (scrollProgress >= phase2End) {
          phase2Progress = 1;
        }
        
        if (scrollProgress >= phase2End && scrollProgress < phase3End) {
          phase3Progress = (scrollProgress - phase2End) / phaseSize;
        } else if (scrollProgress >= phase3End) {
          phase3Progress = 1;
        }
        
        // Only render if we're in this Q&A's range
        if (scrollProgress < qaPhaseStart - 0.01 || scrollProgress > phase3End + 0.01) {
          return null;
        }
        
        // Question X: scrolls from right (105%) to left (5%) during phase 1
        const questionXStart = 105;
        const questionXEnd = 5;
        const questionX = questionXStart - phase1Progress * (questionXStart - questionXEnd);
        
        // Question Y: stays at 25%, then moves up during phase 3
        const questionYBase = 25;
        let questionY = questionYBase;
        if (phase3Progress > 0 && !isLastQuestion) {
          questionY = questionYBase - phase3Progress * 80;
        }
        
        // Question opacity
        let questionOpacity = 0;
        if (phase1Progress > 0 && phase1Progress < 0.3) {
          questionOpacity = phase1Progress / 0.3;
        } else if (phase1Progress >= 0.3 && phase3Progress < 0.7) {
          questionOpacity = 1;
        } else if (phase3Progress >= 0.7 && !isLastQuestion) {
          questionOpacity = Math.max(0, 1 - (phase3Progress - 0.7) / 0.3);
        } else if (isLastQuestion && phase1Progress >= 0.3) {
          questionOpacity = 1;
        }
        
        // Answer Y: scrolls from bottom (105%) to position (38%) during phase 2
        const answerYStart = 105;
        const answerYEnd = 38;
        let answerY = answerYStart;
        if (phase2Progress > 0) {
          answerY = answerYStart - phase2Progress * (answerYStart - answerYEnd);
        }
        
        // Answer moves up with question during phase 3
        if (phase3Progress > 0 && !isLastQuestion) {
          answerY = answerYEnd - phase3Progress * 80;
        }
        
        // Answer opacity
        let answerOpacity = 0;
        if (phase2Progress > 0 && phase2Progress < 0.3) {
          answerOpacity = phase2Progress / 0.3;
        } else if (phase2Progress >= 0.3 && phase3Progress < 0.7) {
          answerOpacity = 1;
        } else if (phase3Progress >= 0.7 && !isLastQuestion) {
          answerOpacity = Math.max(0, 1 - (phase3Progress - 0.7) / 0.3);
        } else if (isLastQuestion && phase2Progress >= 0.3) {
          answerOpacity = 1;
        }

        return (
          <div key={index}>
            {/* Question - scrolls from right to left */}
            <motion.div
              className="absolute"
              style={{
                left: `${questionX}%`,
                top: `${questionY}%`,
                opacity: questionOpacity,
              }}
            >
              <span
                style={{
                  fontFamily: "'Anton', 'Archivo Black', sans-serif",
                  fontSize: "clamp(2.5rem, 6vw, 4.5rem)",
                  fontWeight: 400,
                  color: "#000000",
                  letterSpacing: "0.02em",
                  whiteSpace: "nowrap",
                }}
              >
                {qa.question}
              </span>
            </motion.div>

            {/* Answer - scrolls from bottom */}
            <motion.div
              className="absolute"
              style={{
                left: "5%",
                top: `${answerY}%`,
                opacity: answerOpacity,
                maxWidth: "55%",
              }}
            >
              <p
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: "clamp(0.9rem, 1.5vw, 1.1rem)",
                  lineHeight: 1.8,
                  fontWeight: 400,
                  color: "#FFFFFF",
                  whiteSpace: "pre-line",
                }}
              >
                {qa.answer}
              </p>
            </motion.div>
          </div>
        );
      })}
    </div>
  );
}
