import { useRef, useMemo, useEffect } from 'react';
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
  uniform sampler2D uTrailTexture;
  
  varying vec2 vUv;
  
  void main() {
    vec3 baseColor = vec3(0.0, 0.333, 1.0);
    vec3 pixelColor = vec3(0.15, 0.45, 1.0);
    
    vec2 gridUv = floor(vUv * uGridSize) / uGridSize;
    
    float trail = texture2D(uTrailTexture, vUv).r;
    
    vec3 color = mix(baseColor, pixelColor, trail * 0.8);
    
    vec2 cellUv = fract(vUv * uGridSize);
    float gap = 0.08;
    float cellMask = step(gap, cellUv.x) * step(gap, cellUv.y) * 
                     step(cellUv.x, 1.0 - gap) * step(cellUv.y, 1.0 - gap);
    
    color = mix(baseColor, color, cellMask * trail);
    
    gl_FragColor = vec4(color, 1.0);
  }
`;

interface PixelatedBackgroundProps {
  mousePosition: { x: number; y: number };
}

export function PixelatedBackground({ mousePosition }: PixelatedBackgroundProps) {
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const { viewport, gl } = useThree();
  
  const gridSize = 50;
  
  const { trailTexture, trailData, prevMouse } = useMemo(() => {
    const size = gridSize;
    const data = new Float32Array(size * size);
    const texture = new THREE.DataTexture(
      data,
      size,
      size,
      THREE.RedFormat,
      THREE.FloatType
    );
    texture.needsUpdate = true;
    return { 
      trailTexture: texture, 
      trailData: data,
      prevMouse: { x: 0.5, y: 0.5 }
    };
  }, []);
  
  const uniforms = useMemo(() => ({
    uMouse: { value: new THREE.Vector2(0.5, 0.5) },
    uTime: { value: 0 },
    uResolution: { value: new THREE.Vector2(viewport.width, viewport.height) },
    uGridSize: { value: gridSize },
    uTrailTexture: { value: trailTexture },
  }), [trailTexture]);
  
  useFrame((state) => {
    if (materialRef.current) {
      const normalizedX = (mousePosition.x + 1) / 2;
      const normalizedY = (mousePosition.y + 1) / 2;
      
      const currentMouse = materialRef.current.uniforms.uMouse.value;
      currentMouse.lerp(new THREE.Vector2(normalizedX, normalizedY), 0.15);
      
      const gridX = Math.floor(currentMouse.x * gridSize);
      const gridY = Math.floor(currentMouse.y * gridSize);
      
      for (let dx = -2; dx <= 2; dx++) {
        for (let dy = -2; dy <= 2; dy++) {
          const px = gridX + dx;
          const py = gridY + dy;
          if (px >= 0 && px < gridSize && py >= 0 && py < gridSize) {
            const dist = Math.sqrt(dx * dx + dy * dy);
            const intensity = Math.max(0, 1 - dist / 3);
            const idx = py * gridSize + px;
            trailData[idx] = Math.min(1, trailData[idx] + intensity * 0.5);
          }
        }
      }
      
      for (let i = 0; i < trailData.length; i++) {
        trailData[i] *= 0.96;
        if (trailData[i] < 0.01) trailData[i] = 0;
      }
      
      trailTexture.needsUpdate = true;
      
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
