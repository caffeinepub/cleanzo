import { Canvas } from "@react-three/fiber";
import { useFrame } from "@react-three/fiber";
import { Suspense, useMemo, useRef } from "react";
import type { Points } from "three";
import { Car3D } from "./Car3D";

function FloatingParticles() {
  const ref = useRef<Points>(null);

  const positions = useMemo(() => {
    const count = 180;
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 14;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 8;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 6;
    }
    return arr;
  }, []);

  useFrame((state) => {
    if (!ref.current) return;
    ref.current.rotation.y = state.clock.elapsedTime * 0.03;
    ref.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.02) * 0.08;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.06}
        color="#60a5fa"
        transparent
        opacity={0.7}
        sizeAttenuation
      />
    </points>
  );
}

function GroundReflection() {
  return (
    <mesh position={[0, -0.85, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[7, 4]} />
      <meshStandardMaterial
        color="#1e3a8a"
        emissive="#1d4ed8"
        emissiveIntensity={0.15}
        metalness={0.9}
        roughness={0.1}
        transparent
        opacity={0.25}
      />
    </mesh>
  );
}

export function Hero3D() {
  return (
    <Canvas
      camera={{ position: [0, 1.5, 9], fov: 50 }}
      style={{ background: "transparent" }}
      gl={{ antialias: true, alpha: true }}
    >
      <ambientLight intensity={0.35} />
      <pointLight position={[5, 5, 5]} intensity={2.5} color="#60a5fa" />
      <pointLight position={[-5, -3, 3]} intensity={1.8} color="#00C9A7" />
      <pointLight position={[0, 8, -4]} intensity={1.0} color="#ffffff" />
      <pointLight position={[2, 2, 4]} intensity={1.5} color="#ffffff" />
      <Suspense fallback={null}>
        <FloatingParticles />
        <Car3D />
        <GroundReflection />
      </Suspense>
    </Canvas>
  );
}
