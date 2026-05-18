import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { MeshDistortMaterial, Float, MeshRefractionMaterial, Sphere } from '@react-three/drei';
import * as THREE from 'three';

export default function HeroOrb() {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    if (meshRef.current) {
      meshRef.current.rotation.x = time * 0.1;
      meshRef.current.rotation.y = time * 0.15;
    }
  });

  return (
    <Float speed={2} rotationIntensity={1} floatIntensity={1}>
      <mesh ref={meshRef}>
        <sphereGeometry args={[1, 64, 64]} />
        <MeshDistortMaterial
          color="#F5A623"
          speed={3}
          distort={0.4}
          radius={1}
          metalness={0.8}
          roughness={0.1}
          emissive="#F5A623"
          emissiveIntensity={0.2}
        />
      </mesh>
      
      {/* Outer glass sphere with refraction */}
      <Sphere args={[1.3, 64, 64]} scale={1.2}>
        <MeshDistortMaterial
          transparent
          opacity={0.1}
          color="#ffffff"
          distort={0.2}
          speed={2}
          metalness={1}
          roughness={0}
        />
      </Sphere>
      
      <pointLight position={[5, 5, 5]} intensity={2} color="#F5A623" />
      <pointLight position={[-5, -5, -5]} intensity={1} color="#ffffff" />
    </Float>
  );
}
