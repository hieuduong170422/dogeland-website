'use client';

import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, PerspectiveCamera, Stars } from '@react-three/drei/core';
import * as THREE from 'three';

// Grass-colored Minecraft block
function Block({
  position,
  scale,
  speed,
}: {
  position: [number, number, number];
  scale: number;
  speed: number;
}) {
  const mesh = useRef<THREE.Mesh>(null!);
  const rotSpeed = useMemo(() => ({ x: (Math.random() - 0.5) * 0.3, y: (Math.random() - 0.5) * 0.5 }), []);

  useFrame((_, delta) => {
    mesh.current.rotation.x += rotSpeed.x * delta * speed;
    mesh.current.rotation.y += rotSpeed.y * delta * speed;
  });

  return (
    <Float speed={speed} rotationIntensity={0.2} floatIntensity={0.5}>
      <mesh ref={mesh} position={position} scale={scale}>
        <boxGeometry args={[1, 1, 1]} />
        {/* Top face — grass green */}
        <meshStandardMaterial
          attach="material-0"
          color="#4ade80"
          roughness={0.8}
          metalness={0.1}
        />
        <meshStandardMaterial attach="material-1" color="#4ade80" roughness={0.8} metalness={0.1} />
        <meshStandardMaterial attach="material-2" color="#16a34a" roughness={0.9} metalness={0} />
        <meshStandardMaterial attach="material-3" color="#854d0e" roughness={0.9} metalness={0} />
        <meshStandardMaterial attach="material-4" color="#713f12" roughness={0.9} metalness={0} />
        <meshStandardMaterial attach="material-5" color="#78716c" roughness={0.9} metalness={0} />
      </mesh>
    </Float>
  );
}

const BLOCKS = Array.from({ length: 18 }, (_, i) => ({
  id: i,
  position: [
    (Math.random() - 0.5) * 20,
    (Math.random() - 0.5) * 12,
    (Math.random() - 0.5) * 8 - 4,
  ] as [number, number, number],
  scale: 0.3 + Math.random() * 0.6,
  speed: 0.4 + Math.random() * 0.6,
}));

export function HeroScene() {
  return (
    <Canvas className="pointer-events-none" dpr={[1, 1.5]}>
      <PerspectiveCamera makeDefault position={[0, 0, 10]} fov={60} />
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 8, 3]} intensity={1.2} />
      <Stars radius={60} depth={30} count={800} factor={3} fade speed={0.5} />
      {BLOCKS.map((b) => (
        <Block key={b.id} position={b.position} scale={b.scale} speed={b.speed} />
      ))}
    </Canvas>
  );
}
