import { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { MeshDistortMaterial, Float } from '@react-three/drei';
import * as THREE from 'three';

/**
 * HeroOrb — ambient, slow, mysterious.
 * Subtle pointer parallax. Calmer rotation. Lower emissive for a deeper feel.
 */
export default function HeroOrb() {
  const groupRef = useRef<THREE.Group>(null);
  const meshRef = useRef<THREE.Mesh>(null);
  const glassRef = useRef<THREE.Mesh>(null);
  const { pointer } = useThree();

  useFrame((state, delta) => {
    const time = state.clock.getElapsedTime();
    if (meshRef.current) {
      // ~50% slower — more cinematic
      meshRef.current.rotation.x = time * 0.015;
      meshRef.current.rotation.y = time * 0.025;
    }
    if (glassRef.current) {
      glassRef.current.rotation.x = time * 0.01;
      glassRef.current.rotation.y = time * 0.02;
    }
    if (groupRef.current) {
      // Smoothed pointer parallax — very subtle
      const targetX = pointer.x * 0.08;
      const targetY = pointer.y * 0.06;
      groupRef.current.rotation.y += (targetX - groupRef.current.rotation.y) * Math.min(1, delta * 1.8);
      groupRef.current.rotation.x += (-targetY - groupRef.current.rotation.x) * Math.min(1, delta * 1.8);
    }
  });

  return (
    <group ref={groupRef}>
      <Float speed={0.6} rotationIntensity={0.18} floatIntensity={0.28}>
        {/* Inner core — muted electric blue, slower distort */}
        <mesh ref={meshRef}>
          <sphereGeometry args={[1, 96, 96]} />
          <MeshDistortMaterial
            color="#6b8afe"
            speed={0.8}
            distort={0.22}
            radius={1}
            metalness={0.92}
            roughness={0.18}
            emissive="#4a6ce0"
            emissiveIntensity={0.08}
          />
        </mesh>

        {/* Outer glass shell — refined refraction */}
        <mesh ref={glassRef} scale={1.38}>
          <sphereGeometry args={[1, 96, 96]} />
          <meshPhysicalMaterial
            transparent
            opacity={0.035}
            color="#c8cdd4"
            metalness={0.95}
            roughness={0.04}
            transmission={0.65}
            thickness={0.6}
            ior={1.42}
            clearcoat={1}
            clearcoatRoughness={0.08}
            attenuationColor={new THREE.Color('#6b8afe')}
            attenuationDistance={3}
          />
        </mesh>

        {/* Atmospheric lighting — three-point, restrained */}
        <pointLight position={[4, 4, 4]} intensity={1.4} color="#6b8afe" />
        <pointLight position={[-4, -3, 2]} intensity={0.55} color="#a78bfa" />
        <pointLight position={[0, -4, -3]} intensity={0.35} color="#5eead4" />
        <ambientLight intensity={0.18} />
      </Float>
    </group>
  );
}

