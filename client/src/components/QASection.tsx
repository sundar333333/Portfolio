import { useRef, useEffect, useState } from "react";
import { motion, useSpring, useTransform } from "framer-motion";

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

function toTitleCase(str: string): string {
  return str.split(' ').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ');
}

function interpolate(value: number, inputRange: [number, number], outputRange: [number, number]): number {
  const [inputMin, inputMax] = inputRange;
  const [outputMin, outputMax] = outputRange;
  const clampedValue = Math.max(inputMin, Math.min(inputMax, value));
  const ratio = (clampedValue - inputMin) / (inputMax - inputMin);
  return outputMin + ratio * (outputMax - outputMin);
}

function QuestionText({ 
  text, 
  progress,
  isActive 
}: { 
  text: string; 
  progress: number;
  isActive: boolean;
}) {
  const springConfig = { stiffness: 50, damping: 20, mass: 1.5 };
  
  const smoothProgress = useSpring(progress, springConfig);
  
  const y = interpolate(progress, [0, 0.5], [200, 0]);
  const yExit = interpolate(progress, [0.5, 1], [0, -200]);
  const finalY = progress < 0.5 ? y : yExit;
  
  const rotationEnter = interpolate(progress, [0, 0.5], [45, 0]);
  const rotationExit = interpolate(progress, [0.5, 1], [0, -15]);
  const rotation = progress < 0.5 ? rotationEnter : rotationExit;
  
  const scaleEnter = interpolate(progress, [0, 0.5], [0.7, 1.0]);
  const scaleExit = interpolate(progress, [0.5, 1], [1.0, 1.3]);
  const scale = progress < 0.5 ? scaleEnter : scaleExit;
  
  let opacity = 1;
  let fontWeight = 400;
  
  if (progress < 0.3) {
    opacity = interpolate(progress, [0, 0.3], [0, 1]);
    fontWeight = 400;
  } else if (progress < 0.7) {
    opacity = 1;
    fontWeight = interpolate(progress, [0.3, 0.7], [400, 900]);
  } else {
    opacity = interpolate(progress, [0.7, 1], [1, 0]);
    fontWeight = 900;
  }

  if (!isActive) return null;

  return (
    <motion.div
      className="absolute left-8 md:left-16"
      style={{
        top: "40%",
        transform: `translateY(${finalY}px) rotate(${rotation}deg) scale(${scale})`,
        transformOrigin: "left center",
        opacity: opacity,
        willChange: "transform, opacity",
      }}
    >
      <span
        className="whitespace-nowrap"
        style={{
          fontFamily: "'Times New Roman', Georgia, serif",
          fontStyle: "italic",
          fontSize: "clamp(3rem, 8vw, 6rem)",
          color: "#000000",
          fontWeight: Math.round(fontWeight),
          textShadow: "0 0 40px rgba(0,0,0,0.2)",
          display: "block",
          textTransform: "capitalize",
        }}
      >
        {text}
      </span>
    </motion.div>
  );
}

function AnswerText({ 
  text, 
  progress,
  isActive,
  isLastAnswer 
}: { 
  text: string; 
  progress: number;
  isActive: boolean;
  isLastAnswer: boolean;
}) {
  const y = interpolate(progress, [0, 0.5], [300, 0]);
  const yExit = isLastAnswer ? 0 : interpolate(progress, [0.5, 1], [0, -300]);
  const finalY = progress < 0.5 ? y : yExit;
  
  let opacity = 1;
  if (progress < 0.2) {
    opacity = interpolate(progress, [0, 0.2], [0, 1]);
  } else if (progress < 0.8 || isLastAnswer) {
    opacity = 1;
  } else {
    opacity = isLastAnswer ? 1 : interpolate(progress, [0.8, 1], [1, 0]);
  }

  if (!isActive) return null;

  return (
    <motion.div
      className="absolute left-8 md:left-16 right-8 md:right-32"
      style={{
        top: "50%",
        transform: `translateY(calc(-50% + ${finalY}px))`,
        opacity: opacity,
        willChange: "transform, opacity",
      }}
    >
      <p
        style={{
          fontFamily: "'Inter', 'DM Sans', sans-serif",
          fontSize: "clamp(1rem, 2.5vw, 1.4rem)",
          lineHeight: 1.9,
          color: "#FFFFFF",
          fontWeight: 300,
          whiteSpace: "pre-line",
          maxWidth: "800px",
          letterSpacing: "0.02em",
        }}
      >
        {text}
      </p>
    </motion.div>
  );
}

export function QASection({ visible, scrollProgress }: QASectionProps) {
  if (!visible) return null;

  const qaStartScroll = 0.55;
  const qaEndScroll = 0.98;
  
  const normalizedProgress = Math.max(0, Math.min(1, 
    (scrollProgress - qaStartScroll) / (qaEndScroll - qaStartScroll)
  ));
  
  const sectionHeight = 1.75;
  const totalSections = qaData.length * 2;
  const sectionDuration = 1 / totalSections;
  
  return (
    <div className="fixed inset-0 z-40 pointer-events-none overflow-hidden">
      {qaData.map((qa, index) => {
        const questionStart = (index * 2) * sectionDuration;
        const questionEnd = (index * 2 + 1) * sectionDuration;
        const answerStart = (index * 2 + 1) * sectionDuration;
        const answerEnd = (index * 2 + 2) * sectionDuration;
        
        const questionProgress = Math.max(0, Math.min(1, 
          (normalizedProgress - questionStart) / (questionEnd - questionStart)
        ));
        
        const answerProgress = Math.max(0, Math.min(1, 
          (normalizedProgress - answerStart) / (answerEnd - answerStart)
        ));
        
        const isQuestionActive = normalizedProgress >= questionStart && normalizedProgress < questionEnd + 0.1;
        const isAnswerActive = normalizedProgress >= answerStart - 0.05 && 
          (index === qaData.length - 1 ? true : normalizedProgress < answerEnd + 0.1);
        
        const isLastAnswer = index === qaData.length - 1;

        return (
          <div key={index}>
            <QuestionText
              text={qa.question}
              progress={questionProgress}
              isActive={isQuestionActive}
            />
            <AnswerText
              text={qa.answer}
              progress={answerProgress}
              isActive={isAnswerActive}
              isLastAnswer={isLastAnswer}
            />
          </div>
        );
      })}
    </div>
  );
}
