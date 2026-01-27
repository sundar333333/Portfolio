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

  // Q&A starts after hero completely fades (at 0.5 scroll progress)
  // Each Q&A has 3 phases, each phase takes same time as ABOUT ME scroll
  const qaStartProgress = 0.5;
  const qaEndProgress = 1.0;
  const qaTotalRange = qaEndProgress - qaStartProgress;
  
  // 3 Q&A pairs, each with 3 equal phases (question, answer, exit)
  // Total 9 phases spread across the Q&A range
  const totalPhases = qaData.length * 3;
  const phaseSize = qaTotalRange / totalPhases;
  
  // Calculate global Q&A progress
  const qaProgress = Math.max(0, (scrollProgress - qaStartProgress) / qaTotalRange);
  
  return (
    <div className="fixed inset-0 z-40 pointer-events-none overflow-hidden">
      {qaData.map((qa, index) => {
        const isLastQuestion = index === qaData.length - 1;
        
        // Each Q&A gets 3 phases worth of progress
        const qaPhaseStart = (index * 3) / totalPhases;
        
        // Calculate which phase we're in for this Q&A (0-3)
        const localProgress = (qaProgress - qaPhaseStart) / (3 / totalPhases);
        
        // Phase 0-1: Question scrolls from right to left
        // Phase 1-2: Answer pops up from bottom
        // Phase 2-3: Both move up and disappear (except last question)
        
        // Question X position: scrolls from right to left during phase 0-1
        const questionXStart = 105;
        const questionXEnd = 5;
        
        let questionX = questionXStart;
        if (localProgress >= 0 && localProgress < 1) {
          questionX = questionXStart - localProgress * (questionXStart - questionXEnd);
        } else if (localProgress >= 1) {
          questionX = questionXEnd;
        }
        
        // Question Y position - moves up during phase 2-3
        const questionYBase = 25;
        let questionY = questionYBase;
        if (localProgress > 2 && !isLastQuestion) {
          const exitProgress = localProgress - 2;
          questionY = questionYBase - exitProgress * 100;
        }
        
        // Question opacity
        let questionOpacity = 0;
        if (localProgress >= 0 && localProgress < 0.3) {
          questionOpacity = localProgress / 0.3; // Fade in
        } else if (localProgress >= 0.3 && localProgress < 2.5) {
          questionOpacity = 1; // Fully visible
        } else if (localProgress >= 2.5 && !isLastQuestion) {
          questionOpacity = Math.max(0, 1 - (localProgress - 2.5) / 0.5); // Fade out
        } else if (isLastQuestion && localProgress >= 0.3) {
          questionOpacity = 1; // Stay visible for last question
        }
        
        // Answer Y position: pops up during phase 1-2
        const answerYStart = 105;
        const answerYEnd = 38;
        
        let answerY = answerYStart;
        if (localProgress >= 1 && localProgress < 2) {
          const answerProgress = localProgress - 1;
          answerY = answerYStart - answerProgress * (answerYStart - answerYEnd);
        } else if (localProgress >= 2) {
          answerY = answerYEnd;
        }
        
        // Answer moves up with question during phase 2-3
        if (localProgress > 2 && !isLastQuestion) {
          const exitProgress = localProgress - 2;
          answerY = answerYEnd - exitProgress * 100;
        }
        
        // Answer opacity
        let answerOpacity = 0;
        if (localProgress >= 1 && localProgress < 1.3) {
          answerOpacity = (localProgress - 1) / 0.3; // Fade in
        } else if (localProgress >= 1.3 && localProgress < 2.5) {
          answerOpacity = 1; // Fully visible
        } else if (localProgress >= 2.5 && !isLastQuestion) {
          answerOpacity = Math.max(0, 1 - (localProgress - 2.5) / 0.5); // Fade out
        } else if (isLastQuestion && localProgress >= 1.3) {
          answerOpacity = 1; // Stay visible for last question
        }

        // Only render if this Q&A is in view
        const isActive = localProgress > -0.2 && localProgress < 3.2;
        
        if (!isActive) return null;

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

            {/* Answer - pops up from bottom */}
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
