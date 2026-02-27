import { Suspense, useRef, useState, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, useGLTF, Environment, ContactShadows, useProgress } from "@react-three/drei";
import * as THREE from "three";

function RoomModel() {
  const { scene } = useGLTF("/static/room.glb");
  const groupRef = useRef<THREE.Group>(null);

  useEffect(() => {
    if (scene) {
      const box = new THREE.Box3().setFromObject(scene);
      const center = box.getCenter(new THREE.Vector3());
      scene.position.sub(center);
      
      const size = box.getSize(new THREE.Vector3());
      const maxDim = Math.max(size.x, size.y, size.z);
      if (maxDim > 10) {
        const scale = 8 / maxDim;
        scene.scale.setScalar(scale);
      }

      scene.traverse((child: THREE.Object3D) => {
        if ((child as THREE.Mesh).isMesh) {
          const mesh = child as THREE.Mesh;
          mesh.castShadow = true;
          mesh.receiveShadow = true;
        }
      });
    }
  }, [scene]);

  return (
    <group ref={groupRef}>
      <primitive object={scene} />
    </group>
  );
}

function Loader({ onLoaded }: { onLoaded: () => void }) {
  const { progress, loaded, total } = useProgress();
  
  useEffect(() => {
    if (progress >= 100) {
      setTimeout(() => onLoaded(), 300);
    }
  }, [progress, onLoaded]);
  
  return null;
}

function LoadingIndicator() {
  const { progress } = useProgress();
  
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center z-10 bg-white">
      <div className="w-16 h-16 border-4 border-black/10 border-t-black/60 rounded-full"
        style={{ animation: 'spin 1s linear infinite' }}
      />
      <p className="mt-4 text-black/40 text-sm tracking-wider">Loading 3D Room...</p>
      <div className="mt-3 w-48 h-1 bg-black/10 rounded-full overflow-hidden">
        <div className="h-full bg-black/40 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
      </div>
      <p className="mt-2 text-black/25 text-xs">{Math.round(progress)}%</p>
    </div>
  );
}

interface Room3DProps {
  isVisible: boolean;
}

export default function Room3D({ isVisible }: Room3DProps) {
  const [loaded, setLoaded] = useState(false);

  if (!isVisible) return null;

  return (
    <div
      className="fixed inset-0 z-30 bg-white"
      style={{ width: '100vw', height: '100vh' }}
      data-testid="room-3d-container"
    >
      {!loaded && <LoadingIndicator />}
      <Canvas
        shadows
        camera={{ position: [12, 5, 12], fov: 45, near: 0.1, far: 200 }}
        style={{
          width: '100%',
          height: '100%',
          opacity: loaded ? 1 : 0,
          transition: 'opacity 0.8s ease-out',
        }}
        gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.2 }}
      >
        <color attach="background" args={['#f5f5f5']} />
        
        <ambientLight intensity={0.6} />
        <directionalLight
          position={[8, 12, 5]}
          intensity={1.2}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          shadow-camera-far={50}
          shadow-camera-left={-15}
          shadow-camera-right={15}
          shadow-camera-top={15}
          shadow-camera-bottom={-15}
        />
        <pointLight position={[-5, 8, -5]} intensity={0.4} color="#ffeedd" />
        <hemisphereLight args={["#b1e1ff", "#b97a20", 0.3]} />

        <Suspense fallback={null}>
          <RoomModel />
          <Environment preset="apartment" />
          <Loader onLoaded={() => setLoaded(true)} />
        </Suspense>

        <ContactShadows
          position={[0, -3.5, 0]}
          opacity={0.4}
          scale={30}
          blur={2}
          far={10}
        />

        <gridHelper args={[40, 40, '#e0e0e0', '#e0e0e0']} position={[0, -3.5, 0]} />

        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={4}
          maxDistance={25}
          minPolarAngle={Math.PI / 6}
          maxPolarAngle={Math.PI / 2.2}
          target={[0, 0, 0]}
          enableDamping={true}
          dampingFactor={0.05}
          autoRotate={true}
          autoRotateSpeed={0.5}
        />
      </Canvas>
    </div>
  );
}
