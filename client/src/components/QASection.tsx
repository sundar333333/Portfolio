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

  const qaProgress = Math.max(0, (scrollProgress - 0.6) / 0.4);
  
  const sectionPerQA = 1 / qaData.length;
  
  return (
    <div className="fixed inset-0 z-40 pointer-events-none overflow-hidden">
      {qaData.map((qa, index) => {
        const qaStart = index * sectionPerQA;
        const qaEnd = (index + 1) * sectionPerQA;
        const qaMid = qaStart + sectionPerQA * 0.3;
        
        const localProgress = (qaProgress - qaStart) / sectionPerQA;
        
        const questionProgress = Math.max(0, Math.min(1, localProgress * 3));
        const questionY = 120 + (1 - questionProgress) * 300;
        const questionRotation = -20 + questionProgress * 20;
        const questionOpacity = localProgress < 0.1 ? localProgress * 10 :
                               localProgress > 0.5 ? Math.max(0, (0.7 - localProgress) * 5) : 1;
        
        const answerProgress = Math.max(0, Math.min(1, (localProgress - 0.2) * 2));
        const answerY = 50 - Math.max(0, localProgress - 0.6) * 300;
        const answerOpacity = localProgress < 0.25 ? 0 :
                             localProgress < 0.4 ? (localProgress - 0.25) * 6.67 :
                             localProgress > 0.8 ? Math.max(0, (1 - localProgress) * 5) : 1;

        const isActive = localProgress > -0.1 && localProgress < 1.1;
        
        if (!isActive) return null;

        return (
          <div key={index}>
            <motion.div
              className="absolute left-8 md:left-16"
              style={{
                top: questionY,
                opacity: questionOpacity,
                transform: `rotate(${questionRotation}deg)`,
                transformOrigin: "left center",
              }}
            >
              <span
                className="text-white font-serif italic whitespace-nowrap"
                style={{
                  fontSize: "clamp(2rem, 5vw, 4rem)",
                  textShadow: "0 0 30px rgba(255,255,255,0.3)",
                  fontWeight: 300,
                }}
              >
                {qa.question}
              </span>
            </motion.div>

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
                  fontSize: "clamp(0.9rem, 2vw, 1.25rem)",
                  lineHeight: 1.8,
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
