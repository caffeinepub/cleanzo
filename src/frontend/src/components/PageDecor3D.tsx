import { Canvas, useFrame } from "@react-three/fiber";
import { Suspense, useMemo, useRef } from "react";
import type { Group, Mesh, Points } from "three";
import type * as THREE from "three";

// Single animated orb — each has its own ref and useFrame
function Orb({
  x,
  y,
  z,
  scale,
  speed,
  offset,
  color,
  emissive,
}: {
  x: number;
  y: number;
  z: number;
  scale: number;
  speed: number;
  offset: number;
  color: string;
  emissive: string;
}) {
  const ref = useRef<Mesh>(null);
  useFrame((state) => {
    if (!ref.current) return;
    ref.current.position.y =
      y + Math.sin(state.clock.elapsedTime * speed + offset) * 0.35;
    ref.current.position.x =
      x + Math.cos(state.clock.elapsedTime * speed * 0.5 + offset) * 0.2;
  });
  return (
    <mesh ref={ref} position={[x, y, z]}>
      <sphereGeometry args={[scale, 12, 12]} />
      <meshStandardMaterial
        color={color}
        emissive={emissive}
        emissiveIntensity={0.8}
        metalness={0.7}
        roughness={0.15}
        transparent
        opacity={0.75}
      />
    </mesh>
  );
}

// --- Orbs variant ---
function FloatingOrbs() {
  const orbData = useMemo(
    () => [
      {
        x: -6.5,
        y: 0.8,
        z: -2.5,
        scale: 0.18,
        speed: 0.4,
        offset: 0.0,
        color: "#2563eb",
        emissive: "#1d4ed8",
      },
      {
        x: -4.0,
        y: -0.6,
        z: -1.5,
        scale: 0.12,
        speed: 0.6,
        offset: 0.8,
        color: "#00C9A7",
        emissive: "#00a88a",
      },
      {
        x: -2.0,
        y: 1.2,
        z: -3.0,
        scale: 0.22,
        speed: 0.35,
        offset: 1.5,
        color: "#2563eb",
        emissive: "#1d4ed8",
      },
      {
        x: 0.5,
        y: -0.9,
        z: -2.0,
        scale: 0.09,
        speed: 0.75,
        offset: 2.2,
        color: "#00C9A7",
        emissive: "#00a88a",
      },
      {
        x: 2.5,
        y: 0.5,
        z: -1.8,
        scale: 0.16,
        speed: 0.45,
        offset: 3.0,
        color: "#2563eb",
        emissive: "#1d4ed8",
      },
      {
        x: 4.5,
        y: -0.3,
        z: -2.5,
        scale: 0.2,
        speed: 0.5,
        offset: 0.5,
        color: "#00C9A7",
        emissive: "#00a88a",
      },
      {
        x: 6.0,
        y: 1.0,
        z: -1.5,
        scale: 0.14,
        speed: 0.65,
        offset: 1.2,
        color: "#2563eb",
        emissive: "#1d4ed8",
      },
      {
        x: -5.0,
        y: -1.1,
        z: -3.5,
        scale: 0.1,
        speed: 0.55,
        offset: 2.8,
        color: "#00C9A7",
        emissive: "#00a88a",
      },
      {
        x: 1.5,
        y: 1.3,
        z: -2.8,
        scale: 0.13,
        speed: 0.42,
        offset: 4.0,
        color: "#2563eb",
        emissive: "#1d4ed8",
      },
      {
        x: -1.0,
        y: -0.4,
        z: -1.0,
        scale: 0.08,
        speed: 0.8,
        offset: 5.0,
        color: "#00C9A7",
        emissive: "#00a88a",
      },
    ],
    [],
  );

  return (
    <>
      {orbData.map((orb) => (
        <Orb key={`orb-${orb.x}-${orb.z}`} {...orb} />
      ))}
    </>
  );
}

// --- Rings variant ---
function RotatingRings() {
  const ring1 = useRef<Mesh>(null);
  const ring2 = useRef<Mesh>(null);
  const ring3 = useRef<Mesh>(null);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (ring1.current) {
      ring1.current.rotation.x = t * 0.18;
      ring1.current.rotation.y = t * 0.12;
    }
    if (ring2.current) {
      ring2.current.rotation.x = -t * 0.14;
      ring2.current.rotation.z = t * 0.22;
    }
    if (ring3.current) {
      ring3.current.rotation.y = t * 0.2;
      ring3.current.rotation.z = -t * 0.1;
      ring3.current.position.y = Math.sin(t * 0.4) * 0.3;
    }
  });

  return (
    <>
      <mesh ref={ring1} position={[-3.5, 0, -1]}>
        <torusGeometry args={[1.8, 0.04, 16, 60]} />
        <meshStandardMaterial
          color="#2563eb"
          emissive="#3b82f6"
          emissiveIntensity={1.2}
          transparent
          opacity={0.6}
        />
      </mesh>
      <mesh ref={ring2} position={[3, 0.3, -1.5]}>
        <torusGeometry args={[1.4, 0.03, 16, 60]} />
        <meshStandardMaterial
          color="#00C9A7"
          emissive="#00C9A7"
          emissiveIntensity={1.0}
          transparent
          opacity={0.55}
        />
      </mesh>
      <mesh ref={ring3} position={[0, -0.2, -2]}>
        <torusGeometry args={[2.2, 0.025, 16, 60]} />
        <meshStandardMaterial
          color="#60a5fa"
          emissive="#60a5fa"
          emissiveIntensity={0.8}
          transparent
          opacity={0.4}
        />
      </mesh>
    </>
  );
}

// --- Sparkles variant ---
function ShimmerSparkles() {
  const ref = useRef<Points>(null);
  const groupRef = useRef<Group>(null);

  const { positions, colors } = useMemo(() => {
    const count = 220;
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 18;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 4;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 5;
      const isBlue = Math.random() > 0.4;
      col[i * 3] = isBlue ? 0.38 : 0.0;
      col[i * 3 + 1] = isBlue ? 0.65 : 0.79;
      col[i * 3 + 2] = isBlue ? 0.98 : 0.66;
    }
    return { positions: pos, colors: col };
  }, []);

  useFrame((state) => {
    if (!ref.current) return;
    if (!groupRef.current) return;
    const mat = ref.current.material as THREE.PointsMaterial;
    mat.opacity = 0.5 + Math.sin(state.clock.elapsedTime * 1.5) * 0.3;
    groupRef.current.rotation.y = state.clock.elapsedTime * 0.05;
    groupRef.current.rotation.z =
      Math.sin(state.clock.elapsedTime * 0.2) * 0.05;
  });

  return (
    <group ref={groupRef}>
      <points ref={ref}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[positions, 3]} />
          <bufferAttribute attach="attributes-color" args={[colors, 3]} />
        </bufferGeometry>
        <pointsMaterial
          size={0.07}
          transparent
          opacity={0.7}
          sizeAttenuation
          vertexColors
        />
      </points>
    </group>
  );
}

interface PageDecor3DProps {
  variant: "orbs" | "rings" | "sparkles";
}

function SceneContent({ variant }: PageDecor3DProps) {
  return (
    <>
      <ambientLight intensity={0.2} />
      <pointLight position={[5, 5, 3]} intensity={1.5} color="#2563eb" />
      <pointLight position={[-5, -3, 3]} intensity={1.2} color="#00C9A7" />
      {variant === "orbs" && <FloatingOrbs />}
      {variant === "rings" && <RotatingRings />}
      {variant === "sparkles" && <ShimmerSparkles />}
    </>
  );
}

export function PageDecor3D({ variant }: PageDecor3DProps) {
  return (
    <Canvas
      camera={{ position: [0, 0, 7], fov: 55 }}
      style={{ background: "transparent", width: "100%", height: "100%" }}
      gl={{ antialias: true, alpha: true }}
    >
      <Suspense fallback={null}>
        <SceneContent variant={variant} />
      </Suspense>
    </Canvas>
  );
}
