'use client';

import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, PerspectiveCamera, Stars, useGLTF } from '@react-three/drei/core';
import * as THREE from 'three';

// ─── GLB Model loader ─────────────────────────────────────────────────────────
// Khi có file GLB thật, đặt vào apps/web/public/models/ rồi dùng 2 component
// bên dưới để thay thế GrassBlock và DogeHead trong GRASS_BLOCKS / DOGES.
//
// Preload (tải trước khi render để tránh pop-in):
//   useGLTF.preload('/models/grass-block.glb');
//   useGLTF.preload('/models/doge.glb');

type ModelProps = {
  position: [number, number, number];
  scale: number;
  speed: number;
};

// Swap vào GRASS_BLOCKS khi có file:
//   <GrassBlockModel position={b.position} scale={b.scale} speed={b.speed} />
function GrassBlockModel({ position, scale, speed }: ModelProps) {
  const group = useRef<THREE.Group>(null!);
  const { scene } = useGLTF('/models/grass-block.glb');
  const clone = useMemo(() => scene.clone(), [scene]);
  const rotSpeed = useMemo(() => ({ x: (Math.random() - 0.5) * 0.3, y: (Math.random() - 0.5) * 0.5 }), []);

  useFrame((_, delta) => {
    group.current.rotation.x += rotSpeed.x * delta * speed;
    group.current.rotation.y += rotSpeed.y * delta * speed;
  });

  return (
    <Float speed={speed} rotationIntensity={0.2} floatIntensity={0.5}>
      <group ref={group} position={position} scale={scale}>
        <primitive object={clone} />
      </group>
    </Float>
  );
}

// Swap vào DOGES khi có file:
//   <DogeModel position={d.position} scale={d.scale} speed={d.speed} />
function DogeModel({ position, scale, speed }: ModelProps) {
  const group = useRef<THREE.Group>(null!);
  const { scene } = useGLTF('/models/doge.glb');
  const clone = useMemo(() => scene.clone(), [scene]);
  const rotSpeed = useMemo(() => ({ y: (Math.random() - 0.5) * 0.5 }), []);

  useFrame((_, delta) => {
    group.current.rotation.y += rotSpeed.y * delta * speed;
  });

  return (
    <Float speed={speed} floatIntensity={0.7} rotationIntensity={0.15}>
      <group ref={group} position={position} scale={scale}>
        <primitive object={clone} />
      </group>
    </Float>
  );
}

// Suppress unused warning khi chưa dùng
void GrassBlockModel;
void DogeModel;

// ─── Procedural pixel-art textures ───────────────────────────────────────────

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
    ctx.fillStyle = '#5d9e35';
    ctx.fillRect(0, 0, 16, 16);
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
    ctx.fillStyle = '#866043';
    ctx.fillRect(0, 4, 16, 12);
    const dirtTones = ['#7a5535', '#9b7050', '#6e4c2d', '#8f6640'];
    for (let i = 0; i < 40; i++) {
      ctx.fillStyle = dirtTones[Math.floor(i * 3.7) % dirtTones.length];
      ctx.fillRect(Math.floor(i * 4.3) % 16, 4 + (Math.floor(i * 3.1) % 12), 2, 1);
    }
    ctx.fillStyle = '#5d9e35';
    ctx.fillRect(0, 0, 16, 4);
    ctx.fillStyle = '#6db840';
    ctx.fillRect(2, 0, 1, 1); ctx.fillRect(7, 1, 2, 1); ctx.fillRect(12, 0, 1, 2);
    ctx.fillStyle = '#4a8329';
    ctx.fillRect(5, 0, 2, 1); ctx.fillRect(10, 1, 1, 1);
    ctx.fillStyle = '#4a8329';
    ctx.fillRect(0, 3, 1, 2); ctx.fillRect(4, 3, 2, 2);
    ctx.fillRect(9, 3, 1, 2); ctx.fillRect(14, 3, 2, 2);
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

function GrassBlock({ position, scale, speed }: { position: [number, number, number]; scale: number; speed: number }) {
  const mesh = useRef<THREE.Mesh>(null!);
  const rotSpeed = useMemo(() => ({ x: (Math.random() - 0.5) * 0.3, y: (Math.random() - 0.5) * 0.5 }), []);
  const materials = useMemo(() => {
    const top = makeGrassTopTexture();
    const side = makeGrassSideTexture();
    const bottom = makeDirtTexture();
    return [
      new THREE.MeshStandardMaterial({ map: side }),
      new THREE.MeshStandardMaterial({ map: side }),
      new THREE.MeshStandardMaterial({ map: top }),
      new THREE.MeshStandardMaterial({ map: bottom }),
      new THREE.MeshStandardMaterial({ map: side }),
      new THREE.MeshStandardMaterial({ map: side }),
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

// ─── Doge Head (procedural Shiba Inu) ────────────────────────────────────────

const FUR    = '#C8963C';
const LIGHT  = '#F0D898';
const DARK   = '#1a0800';
const PINK   = '#e8909a';
const NOSE   = '#2a1008';

function DogeHead({ position, scale, speed }: { position: [number, number, number]; scale: number; speed: number }) {
  const group = useRef<THREE.Group>(null!);
  const rotSpeed = useMemo(() => ({ y: (Math.random() - 0.5) * 0.6 }), []);

  useFrame((_, delta) => {
    group.current.rotation.y += rotSpeed.y * delta * speed;
  });

  return (
    <Float speed={speed} floatIntensity={0.7} rotationIntensity={0.15}>
      <group ref={group} position={position} scale={scale}>

        {/* ── Head ── */}
        <mesh position={[0, 0, 0]}>
          <sphereGeometry args={[0.5, 10, 10]} />
          <meshStandardMaterial color={FUR} roughness={0.85} />
        </mesh>

        {/* ── Forehead lighter patch ── */}
        <mesh position={[0, 0.18, 0.38]} scale={[0.55, 0.35, 0.18]}>
          <sphereGeometry args={[0.4, 8, 8]} />
          <meshStandardMaterial color={LIGHT} roughness={0.9} />
        </mesh>

        {/* ── Snout ── */}
        <mesh position={[0, -0.1, 0.42]} scale={[1.1, 0.75, 0.7]}>
          <sphereGeometry args={[0.22, 8, 8]} />
          <meshStandardMaterial color={LIGHT} roughness={0.9} />
        </mesh>

        {/* ── Nose ── */}
        <mesh position={[0, -0.04, 0.59]}>
          <sphereGeometry args={[0.075, 6, 6]} />
          <meshStandardMaterial color={NOSE} roughness={0.5} />
        </mesh>

        {/* ── Eyes ── */}
        <mesh position={[-0.19, 0.14, 0.44]}>
          <sphereGeometry args={[0.068, 7, 7]} />
          <meshStandardMaterial color={DARK} roughness={0.3} />
        </mesh>
        <mesh position={[0.19, 0.14, 0.44]}>
          <sphereGeometry args={[0.068, 7, 7]} />
          <meshStandardMaterial color={DARK} roughness={0.3} />
        </mesh>

        {/* ── Eye shine ── */}
        <mesh position={[-0.21, 0.16, 0.49]}>
          <sphereGeometry args={[0.022, 5, 5]} />
          <meshStandardMaterial color="#ffffff" roughness={0.1} />
        </mesh>
        <mesh position={[0.17, 0.16, 0.49]}>
          <sphereGeometry args={[0.022, 5, 5]} />
          <meshStandardMaterial color="#ffffff" roughness={0.1} />
        </mesh>

        {/* ── Ears (outer) ── */}
        <mesh position={[-0.35, 0.55, 0.05]} rotation={[0.25, -0.25, -0.35]}>
          <coneGeometry args={[0.2, 0.45, 4]} />
          <meshStandardMaterial color={FUR} roughness={0.9} />
        </mesh>
        <mesh position={[0.35, 0.55, 0.05]} rotation={[0.25, 0.25, 0.35]}>
          <coneGeometry args={[0.2, 0.45, 4]} />
          <meshStandardMaterial color={FUR} roughness={0.9} />
        </mesh>

        {/* ── Ears (inner pink) ── */}
        <mesh position={[-0.32, 0.55, 0.1]} rotation={[0.25, -0.25, -0.35]}>
          <coneGeometry args={[0.11, 0.3, 4]} />
          <meshStandardMaterial color={PINK} roughness={0.9} />
        </mesh>
        <mesh position={[0.32, 0.55, 0.1]} rotation={[0.25, 0.25, 0.35]}>
          <coneGeometry args={[0.11, 0.3, 4]} />
          <meshStandardMaterial color={PINK} roughness={0.9} />
        </mesh>

        {/* ── Cheek fluff ── */}
        <mesh position={[-0.42, -0.05, 0.28]} scale={[0.7, 0.65, 0.6]}>
          <sphereGeometry args={[0.22, 7, 7]} />
          <meshStandardMaterial color={LIGHT} roughness={0.9} />
        </mesh>
        <mesh position={[0.42, -0.05, 0.28]} scale={[0.7, 0.65, 0.6]}>
          <sphereGeometry args={[0.22, 7, 7]} />
          <meshStandardMaterial color={LIGHT} roughness={0.9} />
        </mesh>

      </group>
    </Float>
  );
}

// ─── Scene layout ─────────────────────────────────────────────────────────────

const GRASS_BLOCKS = [
  { id: 0,  position: [-8.2,  3.1, -6.0] as [number, number, number], scale: 0.75, speed: 0.55 },
  { id: 1,  position: [ 7.4,  4.2, -5.5] as [number, number, number], scale: 0.65, speed: 0.70 },
  { id: 2,  position: [-5.1, -4.8, -5.0] as [number, number, number], scale: 0.55, speed: 0.45 },
  { id: 3,  position: [ 4.8, -5.5, -6.5] as [number, number, number], scale: 0.80, speed: 0.60 },
  { id: 4,  position: [-2.3,  5.5, -7.0] as [number, number, number], scale: 0.45, speed: 0.80 },
  { id: 5,  position: [ 9.1, -1.2, -5.5] as [number, number, number], scale: 0.60, speed: 0.50 },
  { id: 6,  position: [-9.5, -0.5, -6.0] as [number, number, number], scale: 0.70, speed: 0.65 },
  { id: 7,  position: [ 1.5,  5.8, -6.5] as [number, number, number], scale: 0.50, speed: 0.75 },
  { id: 8,  position: [ 6.2,  1.8, -5.0] as [number, number, number], scale: 0.55, speed: 0.68 },
  { id: 9,  position: [-7.0,  1.5, -4.5] as [number, number, number], scale: 0.40, speed: 0.90 },
  { id: 10, position: [ 3.3, -2.5, -6.5] as [number, number, number], scale: 0.65, speed: 0.48 },
  { id: 11, position: [-4.5,  4.8, -6.0] as [number, number, number], scale: 0.45, speed: 0.82 },
];

const DOGES = [
  { id: 0, position: [-6.5,  2.0, -3.0] as [number, number, number], scale: 0.9, speed: 0.50 },
  { id: 1, position: [ 6.0, -2.5, -2.5] as [number, number, number], scale: 1.1, speed: 0.62 },
  { id: 2, position: [ 0.0,  4.2, -4.0] as [number, number, number], scale: 0.8, speed: 0.44 },
  { id: 3, position: [-3.5, -3.2, -3.5] as [number, number, number], scale: 1.0, speed: 0.70 },
  { id: 4, position: [ 8.0,  3.5, -4.0] as [number, number, number], scale: 0.75, speed: 0.55 },
];

// ─── Export ───────────────────────────────────────────────────────────────────

export function HeroScene() {
  return (
    <Canvas className="pointer-events-none" dpr={[1, 1.5]}>
      <PerspectiveCamera makeDefault position={[0, 0, 10]} fov={60} />
      <ambientLight intensity={0.7} />
      <directionalLight position={[5, 8, 3]} intensity={1.4} />
      <directionalLight position={[-5, -3, -2]} intensity={0.3} />
      <Stars radius={60} depth={30} count={800} factor={3} fade speed={0.5} />

      {GRASS_BLOCKS.map((b) => (
        <GrassBlock key={b.id} position={b.position} scale={b.scale} speed={b.speed} />
      ))}

      {DOGES.map((d) => (
        <DogeHead key={d.id} position={d.position} scale={d.scale} speed={d.speed} />
      ))}
    </Canvas>
  );
}
