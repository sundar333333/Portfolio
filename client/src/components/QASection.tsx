import { motion } from "framer-motion";

interface QASectionProps {
  visible: boolean;
  scrollProgress: number;
}

const qaData = [
  {
    question: "Who Am I?",
    answer: "I'm Sundar Ram, a multidisciplinary designer with a strong foundation in both design and technology. I'm passionate about creating digital experiences that are not only visually appealing but also intuitive, functional, and user-centered. With a background in computer applications, I approach design with a problem-solving mindset—always focusing on clarity, usability, and real user needs. I believe good design should feel effortless to the user while solving meaningful problems behind the scenes."
  },
  {
    question: "What Do I Do?",
    answer: "I work as a UI/UX Designer, Product Designer, Web Designer, and Brand Designer, crafting experiences that balance user needs with business goals. My work spans from user research and wireframing to high-fidelity UI design and interaction planning.\n\nAlongside design, I have hands-on experience in frontend development using HTML, CSS, and JavaScript, which allows me to design interfaces that are technically feasible and developer-friendly. This dual perspective helps me collaborate effectively with developers and ensures that my designs translate smoothly from concept to code. I focus on building scalable, consistent, and engaging digital products across web and mobile platforms."
  },
  {
    question: "Where Did It All Start?",
    answer: "My journey into design began during my college days, when one of my close friends was actively freelancing as a UI/UX designer. Watching him work on real client projects sparked my curiosity about how design impacts user behavior and product success. He introduced me to the fundamentals of UI/UX, shared his experiences, and guided me through the early learning phase. That exposure inspired me to explore the field deeper, and what started as curiosity soon turned into a clear career path. Since then, I've continuously worked on improving my skills through projects, practice, and learning—shaping my identity as a designer."
  }
];

export function QASection({ visible, scrollProgress }: QASectionProps) {
  if (!visible) return null;

  // Q&A starts after hero fades (at 60% scroll progress)
  // Each Q&A pair needs: 1.5 scroll for question (bottom to middle), 1.5 scroll for question (middle to top)
  // Then 1.5 scroll for answer (bottom to middle), 1.5 scroll for answer (middle to top)
  // Total per Q&A: 6 scroll units, but we overlap: 3 scroll units per Q&A item (question + answer)
  
  const qaStartProgress = 0.6;
  const qaProgress = Math.max(0, (scrollProgress - qaStartProgress) / (1 - qaStartProgress));
  
  // Each Q&A takes about 0.25 of the remaining scroll (question phase + answer phase)
  // For 3 Q&As: 0.25 * 3 = 0.75, leaving 0.25 for final answer to stay in middle
  const scrollPerQA = 0.28;
  const scrollPerPhase = scrollPerQA / 4; // 4 phases: q-in, q-out, a-in, a-out
  
  return (
    <div className="fixed inset-0 z-40 pointer-events-none overflow-hidden">
      {qaData.map((qa, index) => {
        const qaStart = index * scrollPerQA;
        const isLastQA = index === qaData.length - 1;
        
        // Question phases
        const qInStart = qaStart;
        const qInEnd = qaStart + scrollPerPhase * 1.5;
        const qOutStart = qInEnd;
        const qOutEnd = qaStart + scrollPerPhase * 3;
        
        // Answer phases
        const aInStart = qOutStart;
        const aInEnd = qaStart + scrollPerPhase * 3;
        const aOutStart = aInEnd;
        const aOutEnd = isLastQA ? 1.5 : qaStart + scrollPerPhase * 4; // Last answer stays
        
        // Calculate question animation
        const qInProgress = Math.max(0, Math.min(1, (qaProgress - qInStart) / (qInEnd - qInStart)));
        const qOutProgress = Math.max(0, Math.min(1, (qaProgress - qOutStart) / (qOutEnd - qOutStart)));
        
        // Question position: starts at bottom-left (-45°), moves to center (0°), then to top-right (45°)
        // Y position: 100% (bottom) -> 50% (middle) -> 0% (top)
        // X position follows the diagonal
        let questionY, questionX, questionRotation, questionOpacity;
        
        if (qInProgress < 1) {
          // Phase 1: Bottom to middle (-45° angle)
          questionY = 100 - qInProgress * 50; // 100% to 50%
          questionX = -20 + qInProgress * 20; // starts off-screen left
          questionRotation = -45 + qInProgress * 45; // -45° to 0°
          questionOpacity = 0.3 + qInProgress * 0.7; // faded to full
        } else {
          // Phase 2: Middle to top (45° angle)
          questionY = 50 - qOutProgress * 50; // 50% to 0%
          questionX = qOutProgress * 30; // moves right as it goes up
          questionRotation = qOutProgress * 45; // 0° to 45°
          questionOpacity = 1 - qOutProgress; // full to faded
        }
        
        // Calculate answer animation
        const aInProgress = Math.max(0, Math.min(1, (qaProgress - aInStart) / (aInEnd - aInStart)));
        const aOutProgress = isLastQA 
          ? Math.max(0, Math.min(0.5, (qaProgress - aOutStart) / (aOutEnd - aOutStart))) // Last answer stops at middle
          : Math.max(0, Math.min(1, (qaProgress - aOutStart) / (aOutEnd - aOutStart)));
        
        let answerY, answerOpacity;
        
        if (aInProgress < 1) {
          // Phase 1: Bottom to middle
          answerY = 100 - aInProgress * 50; // 100% to 50%
          answerOpacity = aInProgress; // fade in
        } else {
          // Phase 2: Middle to top (or stay for last answer)
          if (isLastQA && aOutProgress >= 0.5) {
            // Last answer stays at middle
            answerY = 50;
            answerOpacity = 1;
          } else {
            answerY = 50 - aOutProgress * 50; // 50% to 0%
            answerOpacity = 1 - aOutProgress; // fade out
          }
        }
        
        // Check if this Q&A is active
        const isQuestionActive = qaProgress >= qInStart - 0.05 && qaProgress <= qOutEnd + 0.05 && questionOpacity > 0.01;
        const isAnswerActive = qaProgress >= aInStart - 0.05 && (isLastQA || qaProgress <= aOutEnd + 0.05) && answerOpacity > 0.01;
        
        return (
          <div key={index}>
            {/* Question */}
            {isQuestionActive && (
              <motion.div
                className="absolute left-8 md:left-16"
                style={{
                  top: `${questionY}%`,
                  left: `${Math.max(5, 5 + questionX)}%`,
                  opacity: questionOpacity,
                  transform: `rotate(${questionRotation}deg) translateY(-50%)`,
                  transformOrigin: "left center",
                }}
              >
                <span
                  className="whitespace-nowrap"
                  style={{
                    fontFamily: "'Times New Roman', Georgia, serif",
                    fontStyle: "italic",
                    fontSize: "clamp(3rem, 8vw, 6rem)",
                    fontWeight: 400,
                    color: `rgba(60, 60, 60, ${0.4 + questionOpacity * 0.6})`,
                    letterSpacing: "0.02em",
                  }}
                >
                  {qa.question}
                </span>
              </motion.div>
            )}

            {/* Answer */}
            {isAnswerActive && (
              <motion.div
                className="absolute left-8 md:left-16 right-8 md:right-16"
                style={{
                  top: `${answerY}%`,
                  opacity: answerOpacity,
                  transform: "translateY(-50%)",
                }}
              >
                <p
                  className="max-w-4xl"
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: "clamp(1rem, 2.5vw, 1.4rem)",
                    lineHeight: 1.9,
                    fontWeight: 300,
                    color: "rgba(255, 255, 255, 0.9)",
                    whiteSpace: "pre-line",
                  }}
                >
                  {qa.answer}
                </p>
              </motion.div>
            )}
          </div>
        );
      })}
    </div>
  );
}
