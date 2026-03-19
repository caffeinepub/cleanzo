import { Canvas, useFrame } from "@react-three/fiber";
import { Suspense, useMemo, useRef } from "react";
import type { Group, Mesh, Points } from "three";
import type * as THREE from "three";

// Single animated orb
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

// --- Orbs variant (About Us) ---
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

// --- Rings variant (Why Cleanzo) ---
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

// --- Sparkles variant (Pricing) ---
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
    if (!ref.current || !groupRef.current) return;
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

// --- Waves variant (Contact) ---
// Animated sine-wave ribbon meshes flowing across the scene
function FlowingWaves() {
  const wave1 = useRef<Mesh>(null);
  const wave2 = useRef<Mesh>(null);
  const wave3 = useRef<Mesh>(null);
  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (wave1.current) {
      wave1.current.position.y = Math.sin(t * 0.5) * 0.4;
      wave1.current.rotation.z = Math.sin(t * 0.3) * 0.08;
    }
    if (wave2.current) {
      wave2.current.position.y = Math.sin(t * 0.4 + 1.2) * 0.35 - 0.5;
      wave2.current.rotation.z = Math.cos(t * 0.25) * 0.06;
    }
    if (wave3.current) {
      wave3.current.position.y = Math.cos(t * 0.6 + 2.4) * 0.3 + 0.6;
      wave3.current.rotation.z = Math.sin(t * 0.35 + 0.5) * 0.1;
    }
  });
  return (
    <>
      <mesh ref={wave1} position={[0, 0, -2]} rotation={[0, 0, 0]}>
        <torusGeometry args={[5.5, 0.025, 8, 80, Math.PI * 1.4]} />
        <meshStandardMaterial
          color="#38bdf8"
          emissive="#38bdf8"
          emissiveIntensity={1.1}
          transparent
          opacity={0.5}
        />
      </mesh>
      <mesh
        ref={wave2}
        position={[0, -0.5, -2.5]}
        rotation={[0, 0, Math.PI * 0.05]}
      >
        <torusGeometry args={[6.5, 0.018, 8, 80, Math.PI * 1.2]} />
        <meshStandardMaterial
          color="#00C9A7"
          emissive="#00C9A7"
          emissiveIntensity={0.9}
          transparent
          opacity={0.4}
        />
      </mesh>
      <mesh
        ref={wave3}
        position={[0, 0.6, -1.5]}
        rotation={[0, 0, -Math.PI * 0.04]}
      >
        <torusGeometry args={[4.2, 0.022, 8, 80, Math.PI * 1.6]} />
        <meshStandardMaterial
          color="#818cf8"
          emissive="#818cf8"
          emissiveIntensity={0.8}
          transparent
          opacity={0.45}
        />
      </mesh>
    </>
  );
}

// --- Stars variant (Referral) ---
// Slow drifting star field with golden twinkling particles
function DriftingStars() {
  const ref = useRef<Points>(null);
  const groupRef = useRef<Group>(null);
  const { positions, colors } = useMemo(() => {
    const count = 180;
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 20;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 5;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 6;
      const isGold = Math.random() > 0.5;
      col[i * 3] = isGold ? 0.95 : 0.55;
      col[i * 3 + 1] = isGold ? 0.78 : 0.65;
      col[i * 3 + 2] = isGold ? 0.2 : 0.95;
    }
    return { positions: pos, colors: col };
  }, []);
  useFrame((state) => {
    if (!ref.current || !groupRef.current) return;
    const mat = ref.current.material as THREE.PointsMaterial;
    mat.opacity = 0.4 + Math.sin(state.clock.elapsedTime * 0.8) * 0.35;
    groupRef.current.rotation.y = state.clock.elapsedTime * 0.025;
    groupRef.current.position.x =
      Math.sin(state.clock.elapsedTime * 0.15) * 0.3;
  });
  return (
    <group ref={groupRef}>
      <points ref={ref}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[positions, 3]} />
          <bufferAttribute attach="attributes-color" args={[colors, 3]} />
        </bufferGeometry>
        <pointsMaterial
          size={0.09}
          transparent
          opacity={0.6}
          sizeAttenuation
          vertexColors
        />
      </points>
    </group>
  );
}

// --- Helix variant (FAQ) ---
// Two intertwined rotating helices suggesting knowledge/structure
function DoubleHelix() {
  const group = useRef<Group>(null);
  const helixData = useMemo(() => {
    const count = 32;
    const data: {
      x1: number;
      y: number;
      z1: number;
      x2: number;
      z2: number;
    }[] = [];
    for (let i = 0; i < count; i++) {
      const t = (i / count) * Math.PI * 4 - Math.PI * 2;
      const radius = 0.6;
      data.push({
        x1: Math.cos(t) * radius,
        y: (i / count) * 4 - 2,
        z1: Math.sin(t) * radius,
        x2: Math.cos(t + Math.PI) * radius,
        z2: Math.sin(t + Math.PI) * radius,
      });
    }
    return data;
  }, []);
  useFrame((state) => {
    if (!group.current) return;
    group.current.rotation.y = state.clock.elapsedTime * 0.3;
    group.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.18) * 0.15;
  });
  return (
    <group ref={group}>
      {helixData.map((d, idx) => (
        <group key={`helix-${d.x1.toFixed(3)}-${d.y.toFixed(3)}`}>
          <mesh position={[d.x1 * 8 - 4, d.y, d.z1 * 1.5 - 2]}>
            <sphereGeometry args={[0.1, 8, 8]} />
            <meshStandardMaterial
              color="#2563eb"
              emissive="#3b82f6"
              emissiveIntensity={1.2}
              transparent
              opacity={0.8}
            />
          </mesh>
          <mesh position={[d.x2 * 8 + 4, d.y, d.z2 * 1.5 - 2]}>
            <sphereGeometry args={[0.08, 8, 8]} />
            <meshStandardMaterial
              color="#00C9A7"
              emissive="#00C9A7"
              emissiveIntensity={1.0}
              transparent
              opacity={0.75}
            />
          </mesh>
          {idx % 4 === 0 && (
            <mesh
              position={[
                (d.x1 * 8 - 4 + d.x2 * 8 + 4) / 2,
                d.y,
                ((d.z1 - d.z2) * 1.5) / 2 - 2,
              ]}
            >
              <cylinderGeometry
                args={[
                  0.015,
                  0.015,
                  Math.abs(d.x1 * 8 - 4 - (d.x2 * 8 + 4)),
                  6,
                ]}
              />
              <meshStandardMaterial
                color="#94a3b8"
                emissive="#94a3b8"
                emissiveIntensity={0.5}
                transparent
                opacity={0.4}
              />
            </mesh>
          )}
        </group>
      ))}
    </group>
  );
}

export type PageDecor3DVariant =
  | "orbs"
  | "rings"
  | "sparkles"
  | "waves"
  | "stars"
  | "helix";

interface PageDecor3DProps {
  variant: PageDecor3DVariant;
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
      {variant === "waves" && <FlowingWaves />}
      {variant === "stars" && <DriftingStars />}
      {variant === "helix" && <DoubleHelix />}
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
