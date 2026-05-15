import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, MeshDistortMaterial, Environment } from '@react-three/drei';
import * as THREE from 'three';

interface Props {
  type?: 'crystal' | 'badge' | 'core';
  color?: string;
}

function Crystal({ type = 'core', color = '#8B5CF6' }: Props) {
  const meshRef = useRef<THREE.Mesh>(null);
  const meshRef2 = useRef<THREE.Mesh>(null);
  const timeRef = useRef(0);

  useFrame((state, delta) => {
    timeRef.current += delta;
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.005;
      meshRef.current.rotation.x = Math.sin(timeRef.current * 0.5) * 0.2;
    }
    if (meshRef2.current && type === 'badge') {
      meshRef2.current.rotation.y -= 0.01;
      meshRef2.current.rotation.z += 0.005;
    }
  });

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
      {type === 'core' && (
        <group>
          <mesh ref={meshRef}>
            <octahedronGeometry args={[1.5, 0]} />
            <MeshDistortMaterial 
              color={color} 
              emissive="#4F46E5"
              emissiveIntensity={0.8}
              clearcoat={1} 
              clearcoatRoughness={0.1} 
              metalness={0.9} 
              roughness={0.1}
              distort={0.2}
              speed={2}
              wireframe={true}
            />
          </mesh>
          <mesh>
            <octahedronGeometry args={[1, 0]} />
            <meshPhysicalMaterial 
              color="#00FFB2"
              emissive="#00FFB2"
              emissiveIntensity={0.5}
              transmission={0.9}
              opacity={0.8}
              transparent
              roughness={0.1}
              metalness={0.1}
            />
          </mesh>
        </group>
      )}

      {type === 'crystal' && (
        <group>
          <mesh ref={meshRef}>
            <octahedronGeometry args={[1, 0]} />
            <meshPhysicalMaterial 
              color={color}
              emissive={color}
              emissiveIntensity={0.6}
              transmission={0.9}
              opacity={0.9}
              transparent
              roughness={0.1}
              metalness={0.5}
              clearcoat={1}
            />
          </mesh>
          <mesh ref={meshRef2}>
            <octahedronGeometry args={[1.2, 0]} />
            <MeshDistortMaterial 
              color="#ffffff" 
              emissive={color}
              emissiveIntensity={0.2}
              clearcoat={1} 
              transparent
              opacity={0.3}
              metalness={0.9} 
              roughness={0.1}
              distort={0.3}
              speed={3}
              wireframe={true}
            />
          </mesh>
        </group>
      )}

      {type === 'badge' && (
        <group scale={[0.8, 0.8, 0.8]}>
          <mesh ref={meshRef}>
            <torusGeometry args={[1, 0.1, 16, 32]} />
            <meshPhysicalMaterial 
              color={color}
              emissive={color}
              emissiveIntensity={0.5}
              metalness={1}
              roughness={0.2}
            />
          </mesh>
          <mesh ref={meshRef2}>
            <icosahedronGeometry args={[0.7, 0]} />
            <meshPhysicalMaterial 
              color="#FACC15"
              emissive="#FACC15"
              emissiveIntensity={0.4}
              metalness={0.8}
              roughness={0.2}
              wireframe={true}
            />
          </mesh>
        </group>
      )}
    </Float>
  );
}

export default function HolographicCrystal({ type = 'core', color = '#8B5CF6' }: Props) {
  return (
    <div className="w-full h-full absolute inset-0 pointer-events-none">
      <Canvas camera={{ position: [0, 0, 4.5], fov: type === 'badge' ? 35 : 45 }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <spotLight position={[-10, -10, -5]} intensity={0.5} color="#00FFB2" />
        <Crystal type={type} color={color} />
        <Environment preset="night" />
      </Canvas>
    </div>
  );
}
