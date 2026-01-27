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

  // Q&A starts after hero completely fades (at 0.6 scroll progress)
  const qaStartProgress = 0.6;
  const qaEndProgress = 1.0;
  const qaTotalRange = qaEndProgress - qaStartProgress;
  
  // Each Q&A pair gets equal portion - this makes Q&A scroll slower relative to content
  const sectionPerQA = qaTotalRange / qaData.length;
  
  // Calculate local progress within Q&A section (0 to 1)
  const qaProgress = Math.max(0, (scrollProgress - qaStartProgress) / qaTotalRange);
  
  return (
    <div className="fixed inset-0 z-40 pointer-events-none overflow-hidden">
      {qaData.map((qa, index) => {
        const isLastQuestion = index === qaData.length - 1;
        
        // Calculate progress for this specific Q&A pair
        const qaStart = index * sectionPerQA;
        
        // Local progress within this Q&A (scaled for slower animation)
        const localProgress = (qaProgress - qaStart) / sectionPerQA;
        
        // Phase breakdown for slower Q&A animation:
        // Phase 1: Question scrolls from right to left position (0 - 0.2)
        // Phase 2: Answer appears from bottom (0.2 - 0.4)
        // Phase 3: Both visible together (0.4 - 0.6)
        // Phase 4: Both scroll upward and disappear (0.6 - 1.0) - except last question
        
        // Question X position: starts off-screen right, moves to left side
        const questionXStart = 120; // Start off-screen right (percentage)
        const questionXEnd = 5; // End at left side (percentage from left)
        const questionPhaseEnd = 0.2;
        
        let questionX = questionXStart;
        if (localProgress >= 0 && localProgress < questionPhaseEnd) {
          questionX = questionXStart - (localProgress / questionPhaseEnd) * (questionXStart - questionXEnd);
        } else if (localProgress >= questionPhaseEnd) {
          questionX = questionXEnd;
        }
        
        // Question Y position: starts above center, moves up when scrolling away
        const questionYBase = 18; // Percentage from top
        let questionY = questionYBase;
        if (localProgress > 0.6 && !isLastQuestion) {
          questionY = questionYBase - (localProgress - 0.6) * 80;
        }
        
        // Question opacity
        let questionOpacity = 0;
        if (localProgress >= 0 && localProgress < 0.15) {
          questionOpacity = localProgress / 0.15; // Fade in
        } else if (localProgress >= 0.15 && localProgress < 0.7) {
          questionOpacity = 1; // Fully visible
        } else if (localProgress >= 0.7 && !isLastQuestion) {
          questionOpacity = Math.max(0, 1 - (localProgress - 0.7) / 0.3); // Fade out
        } else if (isLastQuestion && localProgress >= 0.15) {
          questionOpacity = 1; // Stay visible for last question
        }
        
        // Answer Y position: starts off-screen bottom, moves to below question
        const answerYStart = 120; // Start off-screen bottom (percentage)
        const answerYEnd = 32; // End below question (percentage from top)
        const answerPhaseStart = 0.2;
        const answerPhaseEnd = 0.4;
        
        let answerY = answerYStart;
        if (localProgress >= answerPhaseStart && localProgress < answerPhaseEnd) {
          const answerProgress = (localProgress - answerPhaseStart) / (answerPhaseEnd - answerPhaseStart);
          answerY = answerYStart - answerProgress * (answerYStart - answerYEnd);
        } else if (localProgress >= answerPhaseEnd) {
          answerY = answerYEnd;
        }
        
        // Answer moves up with question when scrolling away
        if (localProgress > 0.6 && !isLastQuestion) {
          answerY = answerYEnd - (localProgress - 0.6) * 80;
        }
        
        // Answer opacity
        let answerOpacity = 0;
        if (localProgress >= answerPhaseStart && localProgress < answerPhaseEnd) {
          answerOpacity = (localProgress - answerPhaseStart) / (answerPhaseEnd - answerPhaseStart); // Fade in
        } else if (localProgress >= answerPhaseEnd && localProgress < 0.7) {
          answerOpacity = 1; // Fully visible
        } else if (localProgress >= 0.7 && !isLastQuestion) {
          answerOpacity = Math.max(0, 1 - (localProgress - 0.7) / 0.3); // Fade out
        } else if (isLastQuestion && localProgress >= answerPhaseEnd) {
          answerOpacity = 1; // Stay visible for last question
        }

        // Only render if this Q&A is active
        const isActive = localProgress > -0.1 && localProgress < 1.2;
        
        if (!isActive) return null;

        return (
          <div key={index}>
            {/* Question - scrolls from right to left, positioned at top-left */}
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

            {/* Answer - scrolls from bottom to below question, left-aligned */}
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
                  color: "#000000",
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
