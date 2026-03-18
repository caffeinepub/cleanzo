import { Canvas, useFrame } from "@react-three/fiber";
import { Suspense, useMemo, useRef } from "react";
import type { Mesh, Points } from "three";

function FloatingRing({
  position,
  rotation,
  color,
  speed,
}: {
  position: [number, number, number];
  rotation: [number, number, number];
  color: string;
  speed: number;
}) {
  const meshRef = useRef<Mesh>(null);
  useFrame((state) => {
    if (!meshRef.current) return;
    meshRef.current.rotation.x =
      rotation[0] + state.clock.elapsedTime * speed * 0.4;
    meshRef.current.rotation.y =
      rotation[1] + state.clock.elapsedTime * speed * 0.3;
    meshRef.current.position.y =
      position[1] + Math.sin(state.clock.elapsedTime * speed * 0.5) * 0.18;
  });
  return (
    <mesh ref={meshRef} position={position}>
      <torusGeometry args={[1.1, 0.025, 16, 80]} />
      <meshStandardMaterial
        color={color}
        transparent
        opacity={0.18}
        metalness={0.9}
        roughness={0.1}
      />
    </mesh>
  );
}

function GlassSphere({
  position,
  radius,
  speed,
}: {
  position: [number, number, number];
  radius: number;
  speed: number;
}) {
  const meshRef = useRef<Mesh>(null);
  useFrame((state) => {
    if (!meshRef.current) return;
    meshRef.current.position.y =
      position[1] + Math.sin(state.clock.elapsedTime * speed) * 0.22;
    meshRef.current.rotation.y = state.clock.elapsedTime * speed * 0.2;
  });
  return (
    <mesh ref={meshRef} position={position}>
      <sphereGeometry args={[radius, 32, 32]} />
      <meshStandardMaterial
        color="#a0c4ff"
        transparent
        opacity={0.12}
        metalness={0.95}
        roughness={0.05}
        envMapIntensity={1}
      />
    </mesh>
  );
}

function SubtleParticles() {
  const ref = useRef<Points>(null);

  const positions = useMemo(() => {
    const count = 80;
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 18;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 10;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 8 - 2;
    }
    return arr;
  }, []);

  useFrame((state) => {
    if (!ref.current) return;
    ref.current.rotation.y = state.clock.elapsedTime * 0.012;
    ref.current.rotation.x = state.clock.elapsedTime * 0.005;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.035}
        color="#60a5fa"
        transparent
        opacity={0.32}
        sizeAttenuation
      />
    </points>
  );
}

export function Hero3D() {
  return (
    <Canvas
      camera={{ position: [0, 0, 7], fov: 55 }}
      style={{ background: "transparent" }}
      gl={{ antialias: true, alpha: true }}
    >
      <ambientLight intensity={0.15} />
      <pointLight position={[4, 5, 4]} intensity={3.5} color="#fffaf0" />
      <pointLight position={[-5, 2, 2]} intensity={3.0} color="#00C9A7" />
      <pointLight position={[0, -3, 2]} intensity={1.2} color="#4f9eff" />
      <pointLight position={[3, -1, -3]} intensity={1.8} color="#a78bfa" />

      <Suspense fallback={null}>
        {/* Large outer rings */}
        <FloatingRing
          position={[0, 0, 0]}
          rotation={[0.5, 0, 0]}
          color="#00C9A7"
          speed={0.3}
        />
        <FloatingRing
          position={[0, 0.2, -0.5]}
          rotation={[1.2, 0.4, 0]}
          color="#60a5fa"
          speed={0.22}
        />
        <FloatingRing
          position={[0, -0.1, 0.3]}
          rotation={[0.3, 1.0, 0.5]}
          color="#a78bfa"
          speed={0.18}
        />

        {/* Smaller accent rings */}
        <FloatingRing
          position={[2.5, 1.0, -1]}
          rotation={[0.8, 0.3, 0]}
          color="#60a5fa"
          speed={0.4}
        />
        <FloatingRing
          position={[-2.5, -0.8, -1]}
          rotation={[0.2, 0.9, 0.2]}
          color="#00C9A7"
          speed={0.35}
        />

        {/* Glass spheres */}
        <GlassSphere position={[2.8, 0.5, 0]} radius={0.45} speed={0.6} />
        <GlassSphere position={[-2.6, 0.8, -0.5]} radius={0.35} speed={0.45} />
        <GlassSphere position={[0.5, 2.2, -1]} radius={0.28} speed={0.7} />
        <GlassSphere position={[-0.8, -1.8, 0.5]} radius={0.22} speed={0.55} />

        <SubtleParticles />
      </Suspense>
    </Canvas>
  );
}
