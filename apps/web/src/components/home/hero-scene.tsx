'use client';

import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, PerspectiveCamera, Stars } from '@react-three/drei/core';
import * as THREE from 'three';

// ─── Procedural pixel-art textures (no external files needed) ───────────────

function makePixelTexture(draw: (ctx: CanvasRenderingContext2D) => void, size = 16): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  draw(ctx);
  const tex = new THREE.CanvasTexture(canvas);
  tex.magFilter = THREE.NearestFilter;
  tex.minFilter = THREE.NearestFilter;
  return tex;
}

function makeGrassTopTexture() {
  return makePixelTexture((ctx) => {
    // Base green
    ctx.fillStyle = '#5d9e35';
    ctx.fillRect(0, 0, 16, 16);
    // Darker patches
    const dark = ['#4a8329', '#52902f', '#3f7022', '#61a83a'];
    const light = ['#6db840', '#74c445', '#68af3c'];
    for (let i = 0; i < 30; i++) {
      ctx.fillStyle = dark[Math.floor(i * 7.3) % dark.length];
      ctx.fillRect(Math.floor(i * 3.7) % 16, Math.floor(i * 5.1) % 16, 2, 2);
    }
    for (let i = 0; i < 20; i++) {
      ctx.fillStyle = light[Math.floor(i * 4.1) % light.length];
      ctx.fillRect(Math.floor(i * 6.3) % 16, Math.floor(i * 3.9) % 16, 1, 1);
    }
  });
}

function makeGrassSideTexture() {
  return makePixelTexture((ctx) => {
    // Dirt bottom (2/3)
    ctx.fillStyle = '#866043';
    ctx.fillRect(0, 4, 16, 12);
    // Dirt noise
    const dirtTones = ['#7a5535', '#9b7050', '#6e4c2d', '#8f6640'];
    for (let i = 0; i < 40; i++) {
      ctx.fillStyle = dirtTones[Math.floor(i * 3.7) % dirtTones.length];
      ctx.fillRect(Math.floor(i * 4.3) % 16, 4 + (Math.floor(i * 3.1) % 12), 2, 1);
    }
    // Grass top strip (4px)
    ctx.fillStyle = '#5d9e35';
    ctx.fillRect(0, 0, 16, 4);
    // Grass highlights
    ctx.fillStyle = '#6db840';
    ctx.fillRect(2, 0, 1, 1);
    ctx.fillRect(7, 1, 2, 1);
    ctx.fillRect(12, 0, 1, 2);
    ctx.fillStyle = '#4a8329';
    ctx.fillRect(5, 0, 2, 1);
    ctx.fillRect(10, 1, 1, 1);
    // Grass-to-dirt transition fringe
    ctx.fillStyle = '#4a8329';
    ctx.fillRect(0, 3, 1, 2);
    ctx.fillRect(4, 3, 2, 2);
    ctx.fillRect(9, 3, 1, 2);
    ctx.fillRect(14, 3, 2, 2);
    ctx.fillStyle = '#5d9e35';
    ctx.fillRect(2, 3, 1, 1);
    ctx.fillRect(11, 3, 2, 1);
  });
}

function makeDirtTexture() {
  return makePixelTexture((ctx) => {
    ctx.fillStyle = '#866043';
    ctx.fillRect(0, 0, 16, 16);
    const tones = ['#7a5535', '#9b7050', '#6e4c2d', '#8f6640', '#795030'];
    for (let i = 0; i < 50; i++) {
      ctx.fillStyle = tones[Math.floor(i * 3.7) % tones.length];
      ctx.fillRect(Math.floor(i * 4.3) % 16, Math.floor(i * 3.1) % 16, 2, 1);
    }
  });
}

// ─── Grass Block ─────────────────────────────────────────────────────────────

function GrassBlock({
  position,
  scale,
  speed,
}: {
  position: [number, number, number];
  scale: number;
  speed: number;
}) {
  const mesh = useRef<THREE.Mesh>(null!);
  const rotSpeed = useMemo(() => ({
    x: (Math.random() - 0.5) * 0.3,
    y: (Math.random() - 0.5) * 0.5,
  }), []);

  const materials = useMemo(() => {
    const top = makeGrassTopTexture();
    const side = makeGrassSideTexture();
    const bottom = makeDirtTexture();
    return [
      new THREE.MeshStandardMaterial({ map: side }),    // +X right
      new THREE.MeshStandardMaterial({ map: side }),    // -X left
      new THREE.MeshStandardMaterial({ map: top }),     // +Y top
      new THREE.MeshStandardMaterial({ map: bottom }),  // -Y bottom
      new THREE.MeshStandardMaterial({ map: side }),    // +Z front
      new THREE.MeshStandardMaterial({ map: side }),    // -Z back
    ];
  }, []);

  useFrame((_, delta) => {
    mesh.current.rotation.x += rotSpeed.x * delta * speed;
    mesh.current.rotation.y += rotSpeed.y * delta * speed;
  });

  return (
    <Float speed={speed} rotationIntensity={0.2} floatIntensity={0.5}>
      <mesh ref={mesh} position={position} scale={scale} material={materials}>
        <boxGeometry args={[1, 1, 1]} />
      </mesh>
    </Float>
  );
}

// ─── Block positions (fixed seed — same layout every render) ─────────────────

const BLOCKS = [
  { id: 0,  position: [-8.2,  3.1, -5.0] as [number, number, number], scale: 0.85, speed: 0.55 },
  { id: 1,  position: [ 7.4,  4.2, -3.5] as [number, number, number], scale: 0.70, speed: 0.70 },
  { id: 2,  position: [-5.1, -3.8, -4.0] as [number, number, number], scale: 0.55, speed: 0.45 },
  { id: 3,  position: [ 4.8, -4.5, -5.5] as [number, number, number], scale: 0.90, speed: 0.60 },
  { id: 4,  position: [-2.3,  5.5, -6.0] as [number, number, number], scale: 0.45, speed: 0.80 },
  { id: 5,  position: [ 9.1, -1.2, -4.5] as [number, number, number], scale: 0.65, speed: 0.50 },
  { id: 6,  position: [-9.5, -0.5, -5.0] as [number, number, number], scale: 0.75, speed: 0.65 },
  { id: 7,  position: [ 1.5,  5.8, -3.0] as [number, number, number], scale: 0.50, speed: 0.75 },
  { id: 8,  position: [-3.8, -5.2, -6.5] as [number, number, number], scale: 0.80, speed: 0.55 },
  { id: 9,  position: [ 6.2,  1.8, -4.0] as [number, number, number], scale: 0.60, speed: 0.68 },
  { id: 10, position: [-7.0,  1.5, -3.5] as [number, number, number], scale: 0.40, speed: 0.90 },
  { id: 11, position: [ 3.3, -2.5, -5.5] as [number, number, number], scale: 0.70, speed: 0.48 },
  { id: 12, position: [-1.0,  2.8, -7.0] as [number, number, number], scale: 0.85, speed: 0.58 },
  { id: 13, position: [ 8.5, -3.8, -4.5] as [number, number, number], scale: 0.55, speed: 0.72 },
  { id: 14, position: [-6.5, -2.0, -3.0] as [number, number, number], scale: 0.65, speed: 0.62 },
  { id: 15, position: [ 0.8, -5.5, -6.0] as [number, number, number], scale: 0.75, speed: 0.44 },
  { id: 16, position: [-4.5,  4.8, -5.0] as [number, number, number], scale: 0.50, speed: 0.82 },
  { id: 17, position: [ 5.5,  3.5, -6.5] as [number, number, number], scale: 0.90, speed: 0.52 },
];

// ─── Scene ───────────────────────────────────────────────────────────────────

export function HeroScene() {
  return (
    <Canvas className="pointer-events-none" dpr={[1, 1.5]}>
      <PerspectiveCamera makeDefault position={[0, 0, 10]} fov={60} />
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 8, 3]} intensity={1.4} castShadow />
      <directionalLight position={[-5, -3, -2]} intensity={0.3} />
      <Stars radius={60} depth={30} count={800} factor={3} fade speed={0.5} />
      {BLOCKS.map((b) => (
        <GrassBlock key={b.id} position={b.position} scale={b.scale} speed={b.speed} />
      ))}
    </Canvas>
  );
}
