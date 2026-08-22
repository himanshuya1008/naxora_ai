import { useEffect, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Line, MeshDistortMaterial, Sparkles } from '@react-three/drei';
import * as THREE from 'three';

const reducedMotion = () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Tracks normalized pointer position on window (not the canvas — the canvas
// is pointer-events:none so it never steals clicks from hero buttons/links
// behind/around it) via a plain ref, same "write a ref, never setState"
// pattern as CursorGlow.jsx, so mouse movement never triggers a re-render.
function usePointerRef() {
  const pointer = useRef({ x: 0, y: 0 });
  useEffect(() => {
    if (reducedMotion()) return undefined;
    const handleMove = (e) => {
      pointer.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.current.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener('pointermove', handleMove, { passive: true });
    return () => window.removeEventListener('pointermove', handleMove);
  }, []);
  return pointer;
}

// One ring of orbiting nodes, connected to the ring's own center by thin
// lines — a literal "neural network" motif in 3D, not just a torus. Nodes
// sit at fixed local angles and orbit "for free" by rotating the parent
// group each frame, rather than recomputing world positions every frame.
function OrbitRing({ radius, tilt, tiltY = 0, speed, nodeCount = 3, color }) {
  const ref = useRef();
  useFrame((_, delta) => {
    if (reducedMotion() || !ref.current) return;
    ref.current.rotation.z += delta * speed;
  });

  const nodes = Array.from({ length: nodeCount }, (_, i) => {
    const angle = (i / nodeCount) * Math.PI * 2;
    return [Math.cos(angle) * radius, Math.sin(angle) * radius, 0];
  });

  return (
    <group ref={ref} rotation={[tilt, tiltY, 0]}>
      <mesh>
        <torusGeometry args={[radius, 0.007, 8, 96]} />
        <meshBasicMaterial color={color} transparent opacity={0.32} />
      </mesh>
      {nodes.map((pos, i) => (
        <group key={i}>
          <mesh position={pos}>
            <sphereGeometry args={[0.045, 12, 12]} />
            <meshBasicMaterial color={color} />
          </mesh>
          <Line points={[[0, 0, 0], pos]} color={color} transparent opacity={0.16} lineWidth={1} />
        </group>
      ))}
    </group>
  );
}

const COOL_BLUE = new THREE.Color('#2563EB');
const BRIGHT_BLUE = new THREE.Color('#60A5FA');

// Two bright points on the core's front face — the single detail that
// flips the read from "glowing ball" to "a head looking at you." They're
// children of `core`, so they rotate with its bounded look-around motion
// instead of spinning away and disappearing.
function Eyes() {
  return (
    <>
      {[-0.32, 0.32].map((x) => (
        <mesh key={x} position={[x, 0.12, 1.02]}>
          <sphereGeometry args={[0.09, 16, 16]} />
          <meshBasicMaterial color="#eaf2ff" toneMapped={false} />
        </mesh>
      ))}
    </>
  );
}

function Core({ pointer }) {
  const group = useRef();
  const core = useRef();

  // Deliberately NOT a continuous spin — a full 360° rotation is exactly
  // what makes a glowing mesh read as "a spinning bubble" rather than a
  // presence looking around. Rotation is bounded (a head glancing side to
  // side / nodding), driven by slow, non-integer-ratio sine waves so it
  // never repeats the same beat twice; the eyes stay roughly camera-facing
  // throughout instead of rotating out of view.
  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (!reducedMotion() && core.current) {
      core.current.rotation.y = Math.sin(t * 0.32) * 0.36 + Math.sin(t * 0.11) * 0.14;
      core.current.rotation.x = Math.sin(t * 0.24) * 0.14;
      core.current.rotation.z = Math.sin(t * 0.6) * 0.05;

      const breathe = 1 + Math.sin(t * 1.1) * 0.05;
      core.current.scale.setScalar(breathe);

      const mat = core.current.material;
      if (mat) {
        mat.emissiveIntensity = 0.55 + Math.sin(t * 1.7) * 0.22 + Math.sin(t * 0.33) * 0.18;
        mat.color.lerpColors(COOL_BLUE, BRIGHT_BLUE, (Math.sin(t * 0.42) + 1) / 2);
      }
    }
    if (group.current) {
      const targetX = pointer.current.y * 0.22;
      const targetY = pointer.current.x * 0.32;
      group.current.rotation.x = THREE.MathUtils.lerp(group.current.rotation.x, targetX, 0.04);
      group.current.rotation.y = THREE.MathUtils.lerp(group.current.rotation.y, targetY, 0.04);
    }
  });

  return (
    <group ref={group}>
      <mesh ref={core}>
        {/* detail 1 (not 6) — a faceted, gem-like low-poly form instead of
            a smooth sphere, so it reads as a built object, not a bubble. */}
        <icosahedronGeometry args={[1.15, 1]} />
        <MeshDistortMaterial color="#2563EB" emissive="#1E40AF" emissiveIntensity={0.7} roughness={0.25} metalness={0.4} distort={0.15} speed={1.6} />
        <Eyes />
      </mesh>
      <OrbitRing radius={1.85} tilt={0.45} tiltY={0.2} speed={0.14} nodeCount={3} color="#60A5FA" />
      <OrbitRing radius={2.3} tilt={-0.6} tiltY={-0.3} speed={-0.09} nodeCount={4} color="#93C5FD" />
    </group>
  );
}

/**
 * A real WebGL scene (not flat SVG) used as this app's "AI presence"
 * visual — a faceted, glowing head-like core with two bright eyes, two
 * counter-rotating orbit rings with connected nodes, and an ambient
 * particle field. The core glances/nods within a bounded range rather
 * than spinning continuously, so it reads as alert and thinking rather
 * than a rotating ornament. Loaded lazily (see LiveAiOrb.jsx) since
 * three.js is a meaningfully heavy dependency that shouldn't block the
 * initial page bundle for a decorative element.
 */
export default function AiCoreScene() {
  const pointer = usePointerRef();

  return (
    <Canvas
      dpr={[1, 1.5]}
      gl={{ alpha: true, antialias: true, powerPreference: 'low-power' }}
      camera={{ position: [0, 0, 6], fov: 38 }}
      style={{ pointerEvents: 'none' }}
    >
      <ambientLight intensity={0.75} />
      <pointLight position={[3, 3, 5]} intensity={2.2} decay={0} color="#60A5FA" />
      <pointLight position={[-3, -2, 3]} intensity={1.1} decay={0} color="#3B82F6" />
      <Core pointer={pointer} />
      <Sparkles count={70} scale={[6, 5, 3]} size={2} speed={0.15} color="#93C5FD" opacity={0.5} />
    </Canvas>
  );
}
