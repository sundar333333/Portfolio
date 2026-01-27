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

  // Q&A starts ONLY after hero completely fades (at 0.65 scroll progress)
  const qaStartProgress = 0.65;
  const qaEndProgress = 1.0;
  const qaTotalRange = qaEndProgress - qaStartProgress;
  
  // Each Q&A pair gets equal portion for very slow scrolling
  const sectionPerQA = qaTotalRange / qaData.length;
  
  // Calculate local progress within Q&A section
  const qaProgress = Math.max(0, (scrollProgress - qaStartProgress) / qaTotalRange);
  
  return (
    <div className="fixed inset-0 z-40 pointer-events-none overflow-hidden">
      {qaData.map((qa, index) => {
        const isLastQuestion = index === qaData.length - 1;
        
        // Calculate progress for this specific Q&A pair
        const qaStart = index * sectionPerQA;
        
        // Local progress within this Q&A
        const localProgress = (qaProgress - qaStart) / sectionPerQA;
        
        // VERY SLOW Phase breakdown:
        // Phase 1: Question scrolls from right to left (0 - 0.4) - SLOW
        // Phase 2: Answer appears from bottom (0.4 - 0.6) - SLOW
        // Phase 3: Both visible together (0.6 - 0.75)
        // Phase 4: Both scroll upward and disappear (0.75 - 1.0)
        
        // Question X position: very slow scroll from right to left
        const questionXStart = 105; // Start off-screen right
        const questionXEnd = 5; // End at left side
        const questionPhaseEnd = 0.4; // Takes 40% of section to complete
        
        let questionX = questionXStart;
        if (localProgress >= 0 && localProgress < questionPhaseEnd) {
          const t = localProgress / questionPhaseEnd;
          questionX = questionXStart - t * (questionXStart - questionXEnd);
        } else if (localProgress >= questionPhaseEnd) {
          questionX = questionXEnd;
        }
        
        // Question Y position - LOWER on screen (28% from top instead of 18%)
        const questionYBase = 28;
        let questionY = questionYBase;
        if (localProgress > 0.75 && !isLastQuestion) {
          const upProgress = (localProgress - 0.75) / 0.25;
          questionY = questionYBase - upProgress * 80;
        }
        
        // Question opacity - slow fade in/out
        let questionOpacity = 0;
        if (localProgress >= 0 && localProgress < 0.25) {
          questionOpacity = localProgress / 0.25;
        } else if (localProgress >= 0.25 && localProgress < 0.8) {
          questionOpacity = 1;
        } else if (localProgress >= 0.8 && !isLastQuestion) {
          questionOpacity = Math.max(0, 1 - (localProgress - 0.8) / 0.2);
        } else if (isLastQuestion && localProgress >= 0.25) {
          questionOpacity = 1;
        }
        
        // Answer Y position: slow scroll from bottom - LOWER position (42% from top)
        const answerYStart = 105;
        const answerYEnd = 42;
        const answerPhaseStart = 0.4;
        const answerPhaseEnd = 0.6;
        
        let answerY = answerYStart;
        if (localProgress >= answerPhaseStart && localProgress < answerPhaseEnd) {
          const t = (localProgress - answerPhaseStart) / (answerPhaseEnd - answerPhaseStart);
          answerY = answerYStart - t * (answerYStart - answerYEnd);
        } else if (localProgress >= answerPhaseEnd) {
          answerY = answerYEnd;
        }
        
        // Answer moves up slowly with question
        if (localProgress > 0.75 && !isLastQuestion) {
          const upProgress = (localProgress - 0.75) / 0.25;
          answerY = answerYEnd - upProgress * 80;
        }
        
        // Answer opacity - slow fade
        let answerOpacity = 0;
        if (localProgress >= answerPhaseStart && localProgress < answerPhaseEnd) {
          answerOpacity = (localProgress - answerPhaseStart) / (answerPhaseEnd - answerPhaseStart);
        } else if (localProgress >= answerPhaseEnd && localProgress < 0.8) {
          answerOpacity = 1;
        } else if (localProgress >= 0.8 && !isLastQuestion) {
          answerOpacity = Math.max(0, 1 - (localProgress - 0.8) / 0.2);
        } else if (isLastQuestion && localProgress >= answerPhaseEnd) {
          answerOpacity = 1;
        }

        // Only render if this Q&A is active
        const isActive = localProgress > -0.1 && localProgress < 1.15;
        
        if (!isActive) return null;

        return (
          <div key={index}>
            {/* Question - scrolls slowly from right to left, positioned LOWER */}
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

            {/* Answer - scrolls slowly from bottom, WHITE text, positioned LOWER */}
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
