import { Suspense, useRef, useState, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, useGLTF, Environment, ContactShadows } from "@react-three/drei";
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

function AutoRotate() {
  const { camera } = useThree();
  const angleRef = useRef(0);
  const [userInteracted, setUserInteracted] = useState(false);

  useEffect(() => {
    const handlePointerDown = () => setUserInteracted(true);
    window.addEventListener("pointerdown", handlePointerDown);
    return () => window.removeEventListener("pointerdown", handlePointerDown);
  }, []);

  useFrame((_, delta) => {
    if (userInteracted) return;
    angleRef.current += delta * 0.15;
    const radius = 12;
    camera.position.x = Math.sin(angleRef.current) * radius;
    camera.position.z = Math.cos(angleRef.current) * radius;
    camera.position.y = 5;
    camera.lookAt(0, 0, 0);
  });

  return null;
}

function LoadingIndicator() {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center">
      <div className="w-16 h-16 border-4 border-black/10 border-t-black/60 rounded-full"
        style={{ animation: 'spin 1s linear infinite' }}
      />
      <p className="mt-4 text-black/40 text-sm tracking-wider">Loading 3D Room...</p>
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
    <div className="absolute inset-0" data-testid="room-3d-container">
      {!loaded && <LoadingIndicator />}
      <Canvas
        shadows
        camera={{ position: [12, 5, 12], fov: 45, near: 0.1, far: 200 }}
        style={{ opacity: loaded ? 1 : 0, transition: 'opacity 0.8s ease-out' }}
        gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.2 }}
        onCreated={() => {
          setTimeout(() => setLoaded(true), 500);
        }}
      >
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
        </Suspense>

        <ContactShadows
          position={[0, -3.5, 0]}
          opacity={0.4}
          scale={30}
          blur={2}
          far={10}
        />

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
        />
        <AutoRotate />
      </Canvas>
    </div>
  );
}
