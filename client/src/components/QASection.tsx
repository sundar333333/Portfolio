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

  // Q&A starts at 60% scroll progress
  const qaProgress = Math.max(0, Math.min(1, (scrollProgress - 0.55) / 0.45));
  
  // Each Q&A pair gets equal portion of the remaining scroll
  // Question phase: rotation from -90 to 0 to 90
  // Answer phase: pop up from bottom, scroll up, fade away
  const sectionPerQA = 1 / qaData.length;
  
  return (
    <div className="fixed inset-0 z-40 pointer-events-none overflow-hidden">
      {qaData.map((qa, index) => {
        const qaStart = index * sectionPerQA;
        const qaEnd = (index + 1) * sectionPerQA;
        
        // Local progress within this Q&A (0 to 1)
        const localProgress = (qaProgress - qaStart) / sectionPerQA;
        
        // Question phase: 0% to 40% of local progress
        // -90° at start, 0° at 20%, 90° at 40%, then fade
        const questionPhaseEnd = 0.4;
        const questionProgress = Math.min(1, localProgress / questionPhaseEnd);
        
        // Rotation: -90 → 0 → 90 as questionProgress goes 0 → 0.5 → 1
        const questionRotation = -90 + (questionProgress * 180);
        
        // Question opacity: fade in at start, fade out at end of question phase
        const questionOpacity = localProgress < 0 ? 0 :
                               localProgress < 0.05 ? localProgress * 20 :
                               localProgress < 0.35 ? 1 :
                               localProgress < 0.45 ? Math.max(0, (0.45 - localProgress) * 10) : 0;
        
        // Answer phase: 45% to 100% of local progress
        const answerPhaseStart = 0.45;
        const answerProgress = Math.max(0, (localProgress - answerPhaseStart) / (1 - answerPhaseStart));
        
        // Answer Y position: starts from bottom (100vh), moves up, then continues up and fades
        const answerY = answerProgress < 0.3 ? 
                        window.innerHeight * 0.4 * (1 - answerProgress / 0.3) : 
                        -window.innerHeight * 0.5 * ((answerProgress - 0.3) / 0.7);
        
        // Answer opacity: fade in as it comes up, stay visible, fade out as it goes up
        const answerOpacity = answerProgress < 0 ? 0 :
                             answerProgress < 0.15 ? answerProgress * 6.67 :
                             answerProgress < 0.7 ? 1 :
                             Math.max(0, (1 - answerProgress) * 3.33);

        const isActive = localProgress > -0.1 && localProgress < 1.2;
        
        if (!isActive) return null;

        return (
          <div key={index}>
            {/* Question - rotates from -90° to 0° to 90° */}
            <motion.div
              className="absolute"
              style={{
                left: "60px",
                top: "50%",
                opacity: questionOpacity,
                transform: `translateY(-50%) rotate(${questionRotation}deg)`,
                transformOrigin: "left center",
              }}
            >
              <span
                className="text-white whitespace-nowrap"
                style={{
                  fontFamily: "'Archivo Black', 'Anton', sans-serif",
                  fontSize: "clamp(3rem, 8vw, 6rem)",
                  fontWeight: 900,
                  letterSpacing: "0.02em",
                  textShadow: "0 0 40px rgba(255,255,255,0.4)",
                }}
              >
                {qa.question}
              </span>
            </motion.div>

            {/* Answer - pops up from bottom, scrolls upward */}
            <motion.div
              className="absolute left-8 md:left-16 right-8 md:right-16"
              style={{
                top: `calc(50% + ${answerY}px)`,
                opacity: answerOpacity,
                transform: "translateY(-50%)",
              }}
            >
              <p
                className="text-white/90 max-w-3xl"
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: "clamp(1rem, 2.5vw, 1.4rem)",
                  lineHeight: 1.9,
                  fontWeight: 300,
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
