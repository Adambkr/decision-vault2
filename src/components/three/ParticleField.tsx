import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export default function ParticleField() {
  const count = 220;
  const meshRef = useRef<THREE.Points>(null);

  const particles = useMemo(() => {
    const temp = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      temp[i * 3] = (Math.random() - 0.5) * 18;
      temp[i * 3 + 1] = (Math.random() - 0.5) * 18;
      temp[i * 3 + 2] = (Math.random() - 0.5) * 8;
    }
    return temp;
  }, [count]);

  const colors = useMemo(() => {
    const temp = new Float32Array(count * 3);
    const palette = [
      new THREE.Color('#6b8afe'),
      new THREE.Color('#a78bfa'),
      new THREE.Color('#5eead4'),
      new THREE.Color('#c8cdd4'),
    ];
    for (let i = 0; i < count; i++) {
      const c = palette[Math.floor(Math.random() * palette.length)];
      temp[i * 3] = c.r;
      temp[i * 3 + 1] = c.g;
      temp[i * 3 + 2] = c.b;
    }
    return temp;
  }, [count]);

  useFrame((state) => {
    if (meshRef.current) {
      // Slower, more atmospheric drift
      meshRef.current.rotation.y = state.clock.getElapsedTime() * 0.008;
      meshRef.current.rotation.x = state.clock.getElapsedTime() * 0.004;
    }
  });

  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={particles}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={count}
          array={colors}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.022}
        transparent
        opacity={0.2}
        sizeAttenuation
        vertexColors
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}
