import { useRef, useEffect, useCallback, useState } from "react";

export function useAudio(isMuted: boolean) {
  const audioContextRef = useRef<AudioContext | null>(null);
  const staticSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const initializingRef = useRef(false);

  const createStaticNoise = useCallback(() => {
    if (!audioContextRef.current) return;

    if (staticSourceRef.current) {
      try {
        staticSourceRef.current.stop();
      } catch (e) {}
    }

    const ctx = audioContextRef.current;
    const bufferSize = ctx.sampleRate * 2;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.08;
    }

    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;

    const gainNode = ctx.createGain();
    gainNode.gain.value = isMuted ? 0 : 0.04;

    source.connect(gainNode);
    gainNode.connect(ctx.destination);

    source.start();
    staticSourceRef.current = source;
    gainNodeRef.current = gainNode;
  }, [isMuted]);

  const initAudio = useCallback(async () => {
    if (isInitialized || initializingRef.current) return;
    initializingRef.current = true;

    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) {
        initializingRef.current = false;
        return;
      }

      if (!audioContextRef.current) {
        audioContextRef.current = new AudioContextClass();
      }
      
      if (audioContextRef.current.state === "suspended") {
        await audioContextRef.current.resume();
      }

      if (audioContextRef.current.state === "running") {
        createStaticNoise();
        setIsInitialized(true);
      } else {
        initializingRef.current = false;
      }
    } catch (e) {
      console.warn("Audio initialization failed:", e);
      initializingRef.current = false;
    }
  }, [isInitialized, createStaticNoise]);

  useEffect(() => {
    const handleInteraction = () => {
      if (!isInitialized) {
        initAudio();
      }
    };

    document.addEventListener("click", handleInteraction);
    document.addEventListener("keydown", handleInteraction);
    document.addEventListener("pointerdown", handleInteraction);

    return () => {
      document.removeEventListener("click", handleInteraction);
      document.removeEventListener("keydown", handleInteraction);
      document.removeEventListener("pointerdown", handleInteraction);
    };
  }, [initAudio, isInitialized]);

  useEffect(() => {
    if (gainNodeRef.current && audioContextRef.current) {
      const targetValue = isMuted ? 0 : 0.04;
      gainNodeRef.current.gain.setTargetAtTime(
        targetValue,
        audioContextRef.current.currentTime,
        0.1
      );
    }
  }, [isMuted]);

  const stopStaticNoise = useCallback(() => {
    if (staticSourceRef.current) {
      try {
        staticSourceRef.current.stop();
        staticSourceRef.current = null;
      } catch (e) {}
    }
  }, []);

  const resumeStaticNoise = useCallback(() => {
    if (audioContextRef.current && !staticSourceRef.current && isInitialized) {
      createStaticNoise();
    }
  }, [createStaticNoise, isInitialized]);

  useEffect(() => {
    return () => {
      stopStaticNoise();
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, [stopStaticNoise]);

  return { stopStaticNoise, resumeStaticNoise, initAudio, isInitialized };
}
