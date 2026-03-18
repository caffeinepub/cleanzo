import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import type { Group } from "three";

const WHEEL_POSITIONS: [number, number, number][] = [
  [1.1, -0.42, 0.82],
  [1.1, -0.42, -0.82],
  [-1.1, -0.42, 0.82],
  [-1.1, -0.42, -0.82],
];

const DROPLET_DATA = Array.from({ length: 14 }, (_, i) => {
  const angle = (i / 14) * Math.PI * 2;
  const radius = 2.6 + Math.sin(i * 1.7) * 0.4;
  const height = Math.sin(i * 0.9) * 0.8;
  return {
    x: Math.cos(angle) * radius,
    y: height,
    z: Math.sin(angle) * radius,
    scale: 0.04 + (i % 3) * 0.015,
    isBlue: i % 2 === 0,
  };
});

function SparkleDroplets() {
  const groupRef = useRef<Group>(null);

  useFrame((state) => {
    if (!groupRef.current) return;
    groupRef.current.rotation.y = state.clock.elapsedTime * 0.4;
  });

  return (
    <group ref={groupRef}>
      {DROPLET_DATA.map((d) => (
        <mesh
          key={`drop-${d.x.toFixed(2)}-${d.z.toFixed(2)}`}
          position={[d.x, d.y, d.z]}
        >
          <sphereGeometry args={[d.scale, 6, 6]} />
          <meshStandardMaterial
            color={d.isBlue ? "#60a5fa" : "#00C9A7"}
            emissive={d.isBlue ? "#2563eb" : "#00a88a"}
            emissiveIntensity={1.2}
            metalness={0.5}
            roughness={0.1}
          />
        </mesh>
      ))}
    </group>
  );
}

export function Car3D() {
  const carGroupRef = useRef<Group>(null);

  useFrame((state) => {
    if (!carGroupRef.current) return;
    const t = state.clock.elapsedTime;
    carGroupRef.current.position.y = Math.sin(t * 0.7) * 0.18;
    carGroupRef.current.rotation.y = Math.sin(t * 0.25) * 0.35;
  });

  return (
    <group ref={carGroupRef}>
      {/* Car body — main hull */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[3.4, 0.55, 1.5]} />
        <meshStandardMaterial
          color="#1a4fd8"
          emissive="#1240b0"
          emissiveIntensity={0.25}
          metalness={0.88}
          roughness={0.1}
        />
      </mesh>

      {/* Front bumper slope */}
      <mesh position={[1.55, -0.05, 0]} rotation={[0, 0, -0.3]}>
        <boxGeometry args={[0.5, 0.4, 1.5]} />
        <meshStandardMaterial
          color="#1a4fd8"
          emissive="#1240b0"
          emissiveIntensity={0.25}
          metalness={0.88}
          roughness={0.1}
        />
      </mesh>

      {/* Rear bumper slope */}
      <mesh position={[-1.55, -0.05, 0]} rotation={[0, 0, 0.3]}>
        <boxGeometry args={[0.5, 0.4, 1.5]} />
        <meshStandardMaterial
          color="#1a4fd8"
          emissive="#1240b0"
          emissiveIntensity={0.25}
          metalness={0.88}
          roughness={0.1}
        />
      </mesh>

      {/* Roof cabin */}
      <mesh position={[-0.15, 0.58, 0]}>
        <boxGeometry args={[1.8, 0.48, 1.25]} />
        <meshStandardMaterial
          color="#1a4fd8"
          emissive="#1240b0"
          emissiveIntensity={0.25}
          metalness={0.88}
          roughness={0.1}
        />
      </mesh>

      {/* Windshield — front glass */}
      <mesh position={[0.72, 0.48, 0]} rotation={[0, 0, -0.55]}>
        <boxGeometry args={[0.7, 0.05, 1.18]} />
        <meshStandardMaterial
          color="#93c5fd"
          emissive="#3b82f6"
          emissiveIntensity={0.6}
          metalness={0.1}
          roughness={0.0}
          transparent
          opacity={0.55}
        />
      </mesh>

      {/* Rear glass */}
      <mesh position={[-0.98, 0.44, 0]} rotation={[0, 0, 0.5]}>
        <boxGeometry args={[0.6, 0.05, 1.18]} />
        <meshStandardMaterial
          color="#93c5fd"
          emissive="#3b82f6"
          emissiveIntensity={0.4}
          metalness={0.1}
          roughness={0.0}
          transparent
          opacity={0.45}
        />
      </mesh>

      {/* Side windows */}
      <mesh position={[-0.15, 0.62, 0.64]}>
        <boxGeometry args={[1.5, 0.3, 0.02]} />
        <meshStandardMaterial
          color="#bfdbfe"
          emissive="#3b82f6"
          emissiveIntensity={0.3}
          transparent
          opacity={0.4}
        />
      </mesh>
      <mesh position={[-0.15, 0.62, -0.64]}>
        <boxGeometry args={[1.5, 0.3, 0.02]} />
        <meshStandardMaterial
          color="#bfdbfe"
          emissive="#3b82f6"
          emissiveIntensity={0.3}
          transparent
          opacity={0.4}
        />
      </mesh>

      {/* Headlights */}
      <mesh position={[1.72, 0.05, 0.45]}>
        <sphereGeometry args={[0.1, 10, 10]} />
        <meshStandardMaterial
          color="#ffffff"
          emissive="#93c5fd"
          emissiveIntensity={3}
          metalness={0.1}
          roughness={0.0}
        />
      </mesh>
      <mesh position={[1.72, 0.05, -0.45]}>
        <sphereGeometry args={[0.1, 10, 10]} />
        <meshStandardMaterial
          color="#ffffff"
          emissive="#93c5fd"
          emissiveIntensity={3}
          metalness={0.1}
          roughness={0.0}
        />
      </mesh>

      {/* Tail lights */}
      <mesh position={[-1.72, 0.05, 0.45]}>
        <sphereGeometry args={[0.09, 10, 10]} />
        <meshStandardMaterial
          color="#ff4444"
          emissive="#ff2222"
          emissiveIntensity={2.5}
        />
      </mesh>
      <mesh position={[-1.72, 0.05, -0.45]}>
        <sphereGeometry args={[0.09, 10, 10]} />
        <meshStandardMaterial
          color="#ff4444"
          emissive="#ff2222"
          emissiveIntensity={2.5}
        />
      </mesh>

      {/* Wheels */}
      {WHEEL_POSITIONS.map(([x, y, z]) => (
        <group
          key={`wheel-${x}-${z}`}
          position={[x, y, z]}
          rotation={[Math.PI / 2, 0, 0]}
        >
          <mesh>
            <cylinderGeometry args={[0.38, 0.38, 0.28, 20]} />
            <meshStandardMaterial
              color="#111827"
              metalness={0.6}
              roughness={0.4}
            />
          </mesh>
          <mesh>
            <cylinderGeometry args={[0.22, 0.22, 0.3, 12]} />
            <meshStandardMaterial
              color="#60a5fa"
              emissive="#2563eb"
              emissiveIntensity={0.5}
              metalness={0.9}
              roughness={0.05}
            />
          </mesh>
          <mesh>
            <cylinderGeometry args={[0.07, 0.07, 0.32, 8]} />
            <meshStandardMaterial
              color="#e2e8f0"
              metalness={1}
              roughness={0.0}
            />
          </mesh>
        </group>
      ))}

      {/* Sparkle droplets orbiting around car */}
      <SparkleDroplets />
    </group>
  );
}
