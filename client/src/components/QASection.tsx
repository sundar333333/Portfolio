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

  // Q&A starts after hero completely fades
  const qaStartProgress = 0.5;
  const qaEndProgress = 1.0;
  const qaTotalRange = qaEndProgress - qaStartProgress;
  
  // Each Q&A pair gets exactly 1/3 of the total Q&A range - NO OVERLAP
  const sectionPerQA = qaTotalRange / qaData.length;
  
  return (
    <div className="fixed inset-0 z-40 pointer-events-none overflow-hidden">
      {qaData.map((qa, index) => {
        const isLastQuestion = index === qaData.length - 1;
        
        // Calculate the exact start and end for this Q&A pair
        const qaStart = qaStartProgress + (index * sectionPerQA);
        const qaEnd = qaStart + sectionPerQA;
        
        // Local progress within this Q&A (0 to 1)
        const localProgress = (scrollProgress - qaStart) / sectionPerQA;
        
        // Only render this Q&A if we're in its range
        if (localProgress < -0.05 || localProgress > 1.05) return null;
        
        // Phase breakdown within each Q&A's dedicated section:
        // Phase 1 (0 - 0.33): Question scrolls from right to left
        // Phase 2 (0.33 - 0.66): Answer pops up from bottom
        // Phase 3 (0.66 - 1.0): Both move up and disappear (except last)
        
        // Question X position
        const questionXStart = 105;
        const questionXEnd = 5;
        const questionPhaseEnd = 0.33;
        
        let questionX = questionXStart;
        if (localProgress >= 0 && localProgress < questionPhaseEnd) {
          questionX = questionXStart - (localProgress / questionPhaseEnd) * (questionXStart - questionXEnd);
        } else if (localProgress >= questionPhaseEnd) {
          questionX = questionXEnd;
        }
        
        // Question Y position
        const questionYBase = 25;
        let questionY = questionYBase;
        if (localProgress > 0.66 && !isLastQuestion) {
          const exitProgress = (localProgress - 0.66) / 0.34;
          questionY = questionYBase - exitProgress * 80;
        }
        
        // Question opacity
        let questionOpacity = 0;
        if (localProgress >= 0 && localProgress < 0.15) {
          questionOpacity = localProgress / 0.15;
        } else if (localProgress >= 0.15 && localProgress < 0.75) {
          questionOpacity = 1;
        } else if (localProgress >= 0.75 && !isLastQuestion) {
          questionOpacity = Math.max(0, 1 - (localProgress - 0.75) / 0.25);
        } else if (isLastQuestion && localProgress >= 0.15) {
          questionOpacity = 1;
        }
        
        // Answer Y position
        const answerYStart = 105;
        const answerYEnd = 38;
        const answerPhaseStart = 0.33;
        const answerPhaseEnd = 0.66;
        
        let answerY = answerYStart;
        if (localProgress >= answerPhaseStart && localProgress < answerPhaseEnd) {
          const answerProgress = (localProgress - answerPhaseStart) / (answerPhaseEnd - answerPhaseStart);
          answerY = answerYStart - answerProgress * (answerYStart - answerYEnd);
        } else if (localProgress >= answerPhaseEnd) {
          answerY = answerYEnd;
        }
        
        // Answer moves up with question
        if (localProgress > 0.66 && !isLastQuestion) {
          const exitProgress = (localProgress - 0.66) / 0.34;
          answerY = answerYEnd - exitProgress * 80;
        }
        
        // Answer opacity
        let answerOpacity = 0;
        if (localProgress >= answerPhaseStart && localProgress < answerPhaseStart + 0.15) {
          answerOpacity = (localProgress - answerPhaseStart) / 0.15;
        } else if (localProgress >= answerPhaseStart + 0.15 && localProgress < 0.75) {
          answerOpacity = 1;
        } else if (localProgress >= 0.75 && !isLastQuestion) {
          answerOpacity = Math.max(0, 1 - (localProgress - 0.75) / 0.25);
        } else if (isLastQuestion && localProgress >= answerPhaseStart + 0.15) {
          answerOpacity = 1;
        }

        return (
          <div key={index}>
            {/* Question */}
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

            {/* Answer */}
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
