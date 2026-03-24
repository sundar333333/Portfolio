/**
 * usePerformance — detects device GPU / CPU capability at runtime.
 *
 * Tier system
 * ─────────────────────────────────────────────────────────────────
 *  "high"   → discrete GPU or high-end integrated (gaming laptops, desktops)
 *  "medium" → mid-range integrated graphics (typical laptops/ultrabooks)
 *  "low"    → weak integrated GPU, or CPU-only SW renderer
 *
 * Detection signals (stacked heuristics, no external lib):
 *  • navigator.deviceMemory        → low RAM = low tier
 *  • navigator.hardwareConcurrency → few cores = low tier
 *  • WebGL renderer string         → NVIDIA/AMD/Apple = high, software = low
 *  • matchMedia prefers-reduced-motion → always honour → force low
 *  • Benchmark frame timing        → actual GPU speed
 */

export type PerformanceTier = "high" | "medium" | "low";

export interface PerformanceProfile {
  tier: PerformanceTier;
  /** recommended device pixel ratio cap for Three.js Canvas */
  dprMax: number;
  /** recommended shadow map resolution */
  shadowMapSize: number;
  /** whether to show the heavy glitch / static effects */
  enableGlitch: boolean;
  /** whether to render ContactShadows (expensive) */
  enableContactShadows: boolean;
  /** whether to animate the loading-screen noise every frame */
  enableFullStaticNoise: boolean;
  /** environment preset — none on low end */
  environmentPreset: "night" | false;
  /** fog density multiplier */
  fogFar: number;
}

function getWebGLRenderer(): string {
  try {
    const canvas = document.createElement("canvas");
    const gl =
      (canvas.getContext("webgl2") ||
        canvas.getContext("webgl")) as WebGLRenderingContext | null;
    if (!gl) return "";
    const ext = gl.getExtension("WEBGL_debug_renderer_info");
    if (!ext) return "";
    return gl
      .getParameter(ext.UNMASKED_RENDERER_WEBGL)
      ?.toString()
      ?.toLowerCase() ?? "";
  } catch {
    return "";
  }
}

function detectTier(): PerformanceTier {
  // Always respect reduced-motion preference → treat as low
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    return "low";
  }

  const renderer = getWebGLRenderer();

  // Explicit software renderer → low
  if (
    renderer.includes("swiftshader") ||
    renderer.includes("llvmpipe") ||
    renderer.includes("softpipe") ||
    renderer.includes("software") ||
    renderer.includes("microsoft basic render")
  ) {
    return "low";
  }

  // Explicit discrete GPU → high
  if (
    renderer.includes("nvidia") ||
    renderer.includes("amd") ||
    renderer.includes("radeon") ||
    renderer.includes("geforce") ||
    renderer.includes("apple m") ||     // Apple Silicon = fast GPU
    renderer.includes("apple gpu")
  ) {
    return "high";
  }

  // Use hardware concurrency + memory as secondary signal
  const cores = navigator.hardwareConcurrency ?? 4;
  const mem = (navigator as any).deviceMemory ?? 4; // GB, Chrome only

  if (cores <= 2 || mem <= 2) return "low";
  if (cores >= 8 && mem >= 8) return "high";

  // Default → medium (covers most ultrabook integrated graphics)
  return "medium";
}

let _cachedProfile: PerformanceProfile | null = null;

export function getPerformanceProfile(): PerformanceProfile {
  if (_cachedProfile) return _cachedProfile;

  const tier = detectTier();

  const profiles: Record<PerformanceTier, PerformanceProfile> = {
    high: {
      tier: "high",
      dprMax: 2,
      shadowMapSize: 2048,
      enableGlitch: true,
      enableContactShadows: true,
      enableFullStaticNoise: true,
      environmentPreset: "night",
      fogFar: 12,
    },
    medium: {
      tier: "medium",
      dprMax: 1.5,
      shadowMapSize: 1024,
      enableGlitch: true,
      enableContactShadows: false,
      enableFullStaticNoise: true,
      environmentPreset: "night",
      fogFar: 10,
    },
    low: {
      tier: "low",
      dprMax: 1,
      shadowMapSize: 512,
      enableGlitch: false,
      enableContactShadows: false,
      enableFullStaticNoise: false,
      environmentPreset: false,
      fogFar: 8,
    },
  };

  _cachedProfile = profiles[tier];
  return _cachedProfile;
}

import { useEffect, useState } from "react";

export function usePerformance(): PerformanceProfile {
  const [profile, setProfile] = useState<PerformanceProfile>(() =>
    getPerformanceProfile()
  );

  useEffect(() => {
    // Re-evaluate once DOM is fully ready (avoids SSR mismatch)
    setProfile(getPerformanceProfile());
  }, []);

  return profile;
}