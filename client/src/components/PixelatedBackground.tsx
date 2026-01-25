import { useRef, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

const vertexShader = `
  varying vec2 vUv;
  
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = `
  uniform vec2 uMouse;
  uniform float uTime;
  uniform vec2 uResolution;
  uniform float uGridSize;
  
  varying vec2 vUv;
  
  // Simple hash function for noise
  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
  }
  
  void main() {
    // Base blue color (#0055FF)
    vec3 baseColor = vec3(0.0, 0.333, 1.0);
    vec3 lightColor = vec3(0.4, 0.6, 1.0);
    vec3 highlightColor = vec3(0.7, 0.85, 1.0);
    
    // Create grid cells
    vec2 gridUv = floor(vUv * uGridSize) / uGridSize;
    vec2 cellCenter = gridUv + 0.5 / uGridSize;
    
    // Calculate distance from mouse to cell center
    float dist = distance(cellCenter, uMouse);
    
    // Hover effect radius
    float hoverRadius = 0.15;
    float trailRadius = 0.3;
    
    // Calculate hover intensity with smooth falloff
    float hoverIntensity = 1.0 - smoothstep(0.0, hoverRadius, dist);
    float trailIntensity = 1.0 - smoothstep(hoverRadius, trailRadius, dist);
    
    // Add digital noise to hovered cells
    float noise = hash(gridUv + floor(uTime * 3.0) * 0.1);
    float noiseIntensity = hoverIntensity * 0.3;
    
    // Mix colors based on proximity to mouse
    vec3 color = baseColor;
    
    // Trail effect - subtle lightening
    color = mix(color, lightColor, trailIntensity * 0.4);
    
    // Direct hover effect - brighter with noise
    color = mix(color, highlightColor, hoverIntensity * 0.7);
    
    // Add noise grain to hovered area
    color += vec3(noise * noiseIntensity);
    
    // Subtle grid lines
    vec2 cellUv = fract(vUv * uGridSize);
    float gridLine = step(0.95, cellUv.x) + step(0.95, cellUv.y);
    color = mix(color, color * 0.85, gridLine * 0.3 * trailIntensity);
    
    gl_FragColor = vec4(color, 1.0);
  }
`;

interface PixelatedBackgroundProps {
  mousePosition: { x: number; y: number };
}

export function PixelatedBackground({ mousePosition }: PixelatedBackgroundProps) {
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const { viewport } = useThree();
  
  const uniforms = useMemo(() => ({
    uMouse: { value: new THREE.Vector2(0.5, 0.5) },
    uTime: { value: 0 },
    uResolution: { value: new THREE.Vector2(viewport.width, viewport.height) },
    uGridSize: { value: 60.0 },
  }), []);
  
  useFrame((state) => {
    if (materialRef.current) {
      const normalizedX = (mousePosition.x + 1) / 2;
      const normalizedY = (mousePosition.y + 1) / 2;
      
      materialRef.current.uniforms.uMouse.value.lerp(
        new THREE.Vector2(normalizedX, normalizedY),
        0.1
      );
      materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
      materialRef.current.uniforms.uResolution.value.set(viewport.width, viewport.height);
    }
  });
  
  return (
    <mesh position={[0, 0, -20]} renderOrder={-1}>
      <planeGeometry args={[viewport.width * 3, viewport.height * 3]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        depthWrite={false}
      />
    </mesh>
  );
}
