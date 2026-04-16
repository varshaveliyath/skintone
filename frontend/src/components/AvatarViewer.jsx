import React, { useRef, useEffect, Suspense, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import {
  OrbitControls,
  Environment,
  ContactShadows,
  useGLTF,
  Html,
} from '@react-three/drei';
import * as THREE from 'three';

/* ─────────────────────────────────────────────
   SKIN TONE LERP HELPER
────────────────────────────────────────────── */
function hexToThreeColor(hex) {
  const c = new THREE.Color();
  c.set(hex || '#c68642');
  return c;
}

/* ─────────────────────────────────────────────
   PROCEDURAL AVATAR — built from Three.js primitives
   Fully works with zero external files.
────────────────────────────────────────────── */
function ProceduralAvatar({ gender, skinColor, topColor, bottomColor, shoeColor }) {
  const groupRef = useRef();
  const skinMat   = useRef(new THREE.MeshStandardMaterial({ color: hexToThreeColor(skinColor), roughness: 0.6, metalness: 0.05 }));
  const topMat    = useRef(new THREE.MeshStandardMaterial({ color: hexToThreeColor(topColor),    roughness: 0.7, metalness: 0.0 }));
  const bottomMat = useRef(new THREE.MeshStandardMaterial({ color: hexToThreeColor(bottomColor), roughness: 0.75, metalness: 0.0 }));
  const shoeMat   = useRef(new THREE.MeshStandardMaterial({ color: hexToThreeColor(shoeColor),   roughness: 0.4, metalness: 0.15 }));
  const hairMat = useRef(new THREE.MeshStandardMaterial({ color: '#2c1a0e', roughness: 0.9 })).current;

  // Lerp colors smoothly
  useFrame(() => {
    skinMat.current.color.lerp(hexToThreeColor(skinColor), 0.05);
    topMat.current.color.lerp(hexToThreeColor(topColor), 0.08);
    bottomMat.current.color.lerp(hexToThreeColor(bottomColor), 0.08);
    shoeMat.current.color.lerp(hexToThreeColor(shoeColor), 0.08);
  });

  // Continuous 360° Spin + Idle Sway
  useFrame((state) => {
    if (!groupRef.current) return;
    // Base 360 rotation
    groupRef.current.rotation.y += 0.008;
    // Add subtle idle sway on top of rotation
    const sway = Math.sin(state.clock.elapsedTime * 1.2) * 0.012;
    groupRef.current.position.y = sway - 0.55; // RAISED: stands on pedestal
  });

  const isFemale = gender === 'female';
  const hipScale = isFemale ? 1.15 : 1.0;
  const shoulderScale = isFemale ? 0.92 : 1.1;
  const waistScale = isFemale ? 0.78 : 0.92;
  const heightScale = isFemale ? 0.97 : 1.0;

  return (
    <group ref={groupRef} position={[0, -0.6, 0]} scale={[1, heightScale, 1]}>
      {/* ── HEAD ── */}
      <mesh position={[0, 3.05, 0]} material={skinMat.current} castShadow>
        <sphereGeometry args={[0.28, 32, 32]} />
      </mesh>
      {/* ── NECK — lengthened to meet torso top ── */}
      <mesh position={[0, 2.64, 0]} material={skinMat.current} castShadow>
        <cylinderGeometry args={[0.1, 0.13, 0.44, 16]} />
      </mesh>

      {/* ── HAIR ── */}
      <mesh position={[0, 3.16, 0]} material={hairMat} castShadow>
        <sphereGeometry args={isFemale ? [0.305, 32, 32, 0, Math.PI * 2, 0, Math.PI * 0.6] : [0.285, 32, 32, 0, Math.PI * 2, 0, Math.PI * 0.5]} />
      </mesh>
      {isFemale && (
        <>
          {/* Long hair sides (Forward) - Angled for natural curvature */}
          <mesh position={[-0.23, 2.92, 0.08]} rotation={[0, 0, 0.06]} material={hairMat} castShadow>
            <capsuleGeometry args={[0.09, 0.55, 8, 16]} />
          </mesh>
          <mesh position={[0.23, 2.92, 0.08]} rotation={[0, 0, -0.06]} material={hairMat} castShadow>
            <capsuleGeometry args={[0.09, 0.55, 8, 16]} />
          </mesh>
          {/* Mid-Side hair */}
          <mesh position={[-0.24, 2.92, -0.05]} rotation={[0, 0, 0.03]} material={hairMat} castShadow>
            <capsuleGeometry args={[0.1, 0.55, 8, 16]} />
          </mesh>
          <mesh position={[0.24, 2.92, -0.05]} rotation={[0, 0, -0.03]} material={hairMat} castShadow>
            <capsuleGeometry args={[0.1, 0.55, 8, 16]} />
          </mesh>
          {/* Back hair (Full curtain) - Angled back slightly */}
          <mesh position={[0, 2.88, -0.18]} rotation={[-0.1, 0, 0]} material={hairMat} castShadow>
            <capsuleGeometry args={[0.22, 0.5, 8, 16]} />
          </mesh>
          <mesh position={[-0.14, 2.9, -0.15]} rotation={[-0.08, 0, 0.03]} material={hairMat} castShadow>
            <capsuleGeometry args={[0.14, 0.55, 8, 16]} />
          </mesh>
          <mesh position={[0.14, 2.9, -0.15]} rotation={[-0.08, 0, -0.03]} material={hairMat} castShadow>
            <capsuleGeometry args={[0.14, 0.55, 8, 16]} />
          </mesh>
        </>
      )}

      {/* ── TORSO / TOP ── */}
      <mesh position={[0, 2.1, 0]} material={topMat.current} castShadow>
        <cylinderGeometry args={[shoulderScale * 0.31, waistScale * 0.28, 0.9, 16]} />
      </mesh>

      {/* ── SHOULDERS (joint balls) ── */}
      <mesh position={[-shoulderScale * 0.35, 2.44, 0]} material={topMat.current} castShadow>
        <sphereGeometry args={[0.13, 16, 16]} />
      </mesh>
      <mesh position={[shoulderScale * 0.35, 2.44, 0]} material={topMat.current} castShadow>
        <sphereGeometry args={[0.13, 16, 16]} />
      </mesh>

      {/* ── UPPER ARMS — slight splay only ── */}
      <mesh position={[-shoulderScale * 0.44, 2.02, 0]} rotation={[0, 0, 0.08]} material={topMat.current} castShadow>
        <capsuleGeometry args={[0.075, 0.5, 8, 16]} />
      </mesh>
      <mesh position={[shoulderScale * 0.44, 2.02, 0]} rotation={[0, 0, -0.08]} material={topMat.current} castShadow>
        <capsuleGeometry args={[0.075, 0.5, 8, 16]} />
      </mesh>

      {/* ── ELBOW JOINT BALLS ── */}
      <mesh position={[-shoulderScale * 0.46, 1.73, 0]} material={topMat.current} castShadow>
        <sphereGeometry args={[0.075, 12, 12]} />
      </mesh>
      <mesh position={[shoulderScale * 0.46, 1.73, 0]} material={topMat.current} castShadow>
        <sphereGeometry args={[0.075, 12, 12]} />
      </mesh>

      {/* ── FOREARMS — match same rotation as upper arm ── */}
      <mesh position={[-shoulderScale * 0.46, 1.45, 0]} rotation={[0, 0, 0.08]} material={skinMat.current} castShadow>
        <capsuleGeometry args={[0.06, 0.42, 8, 16]} />
      </mesh>
      <mesh position={[shoulderScale * 0.46, 1.45, 0]} rotation={[0, 0, -0.08]} material={skinMat.current} castShadow>
        <capsuleGeometry args={[0.06, 0.42, 8, 16]} />
      </mesh>

      {/* ── HANDS ── */}
      <mesh position={[-shoulderScale * 0.48, 1.2, 0]} material={skinMat.current} castShadow>
        <sphereGeometry args={[0.075, 12, 12]} />
      </mesh>
      <mesh position={[shoulderScale * 0.48, 1.2, 0]} material={skinMat.current} castShadow>
        <sphereGeometry args={[0.075, 12, 12]} />
      </mesh>

      {/* ── HIPS / BOTTOM ── */}
      <mesh position={[0, 1.55, 0]} material={bottomMat.current} castShadow>
        <cylinderGeometry args={[hipScale * 0.3, hipScale * 0.28, 0.28, 16]} />
      </mesh>

      {/* ── UPPER LEGS ── */}
      <mesh position={[-0.15, 1.1, 0]} material={bottomMat.current} castShadow>
        <capsuleGeometry args={[hipScale * 0.1, 0.55, 8, 16]} />
      </mesh>
      <mesh position={[0.15, 1.1, 0]} material={bottomMat.current} castShadow>
        <capsuleGeometry args={[hipScale * 0.1, 0.55, 8, 16]} />
      </mesh>

      {/* ── LOWER LEGS ── */}
      <mesh position={[-0.15, 0.58, 0]} material={bottomMat.current} castShadow>
        <capsuleGeometry args={[0.08, 0.5, 8, 16]} />
      </mesh>
      <mesh position={[0.15, 0.58, 0]} material={bottomMat.current} castShadow>
        <capsuleGeometry args={[0.08, 0.5, 8, 16]} />
      </mesh>

      {/* ── SHOES ── */}
      <mesh position={[-0.15, 0.17, 0.04]} material={shoeMat.current} castShadow>
        <boxGeometry args={[0.18, 0.12, 0.32]} />
      </mesh>
      <mesh position={[0.15, 0.17, 0.04]} material={shoeMat.current} castShadow>
        <boxGeometry args={[0.18, 0.12, 0.32]} />
      </mesh>

      {/* Shoe toe rounding */}
      <mesh position={[-0.15, 0.18, 0.18]} material={shoeMat.current} castShadow>
        <sphereGeometry args={[0.09, 12, 12]} />
      </mesh>
      <mesh position={[0.15, 0.18, 0.18]} material={shoeMat.current} castShadow>
        <sphereGeometry args={[0.09, 12, 12]} />
      </mesh>

      {/* ── STUDIO PEDESTAL — Shifted down to match feet ── */}
      <group position={[0, -0.2, 0]}>
        <mesh position={[0, 0, 0]} receiveShadow>
          <cylinderGeometry args={[0.85, 0.95, 0.12, 64]} />
          <meshStandardMaterial color="#050505" metalness={0.9} roughness={0.1} />
        </mesh>
        {/* Glow Rim */}
        <mesh position={[0, 0.061, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.84, 0.008, 16, 100]} />
          <meshBasicMaterial color="#6366f1" />
        </mesh>
        {/* Under Glow Ring */}
        <mesh position={[0, -0.061, 0]}>
          <cylinderGeometry args={[0.96, 0.96, 0.02, 64]} />
          <meshBasicMaterial color="#312e81" opacity={0.6} transparent />
        </mesh>
      </group>
    </group>
  );
}

/* ─────────────────────────────────────────────
   GLB AVATAR — photorealistic Avaturn model
   Auto-activates when files exist in /public/avatars/
────────────────────────────────────────────── */
function GLBAvatar({ src, skinColor, topColor, bottomColor, shoeColor }) {
  const { scene } = useGLTF(src);
  const groupRef = useRef();

  // Clone scene to avoid cross-contamination between male/female
  const clonedScene = useMemo(() => scene.clone(true), [scene]);

  useEffect(() => {
    if (!clonedScene) return;
    clonedScene.traverse((child) => {
      if (!child.isMesh || !child.material) return;
      const name = child.name.toLowerCase();

      if (name.includes('skin') || name.includes('body') || name.includes('head') || name.includes('face') || name.includes('hand')) {
        child.material = child.material.clone();
        child.material.color.set(skinColor);
      } else if (name.includes('top') || name.includes('shirt') || name.includes('jacket') || name.includes('blouse') || name.includes('sweater')) {
        child.material = child.material.clone();
        child.material.color.set(topColor);
      } else if (name.includes('bottom') || name.includes('pants') || name.includes('trouser') || name.includes('skirt') || name.includes('jean')) {
        child.material = child.material.clone();
        child.material.color.set(bottomColor);
      } else if (name.includes('shoe') || name.includes('foot') || name.includes('sneaker') || name.includes('boot')) {
        child.material = child.material.clone();
        child.material.color.set(shoeColor);
      }
    });
  }, [clonedScene, skinColor, topColor, bottomColor, shoeColor]);

  // Idle sway
  useFrame((state) => {
    if (!groupRef.current) return;
    groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.4) * 0.06;
  });

  return <primitive ref={groupRef} object={clonedScene} position={[0, -0.6, 0]} />;
}

/* ─────────────────────────────────────────────
   AVATAR WITH FALLBACK
────────────────────────────────────────────── */
function AvatarWithFallback({ gender, skinColor, topColor, bottomColor, shoeColor }) {
  const maleSrc   = '/avatars/avatar_male.glb';
  const femaleSrc = '/avatars/avatar_female.glb';
  const src = gender === 'male' ? maleSrc : femaleSrc;

  // Try GLB first — if it 404s, suspense will throw and we catch with ErrorBoundary
  return (
    <Suspense fallback={null}>
      <GLBAvatarFallback
        src={src}
        gender={gender}
        skinColor={skinColor}
        topColor={topColor}
        bottomColor={bottomColor}
        shoeColor={shoeColor}
      />
    </Suspense>
  );
}

// Separate component — if useGLTF fails, parent's ErrorBoundary shows procedural
function GLBAvatarFallback({ src, gender, skinColor, topColor, bottomColor, shoeColor }) {
  return (
    <GLBAvatar
      src={src}
      skinColor={skinColor}
      topColor={topColor}
      bottomColor={bottomColor}
      shoeColor={shoeColor}
    />
  );
}

/* ─────────────────────────────────────────────
   SCENE LIGHTING
────────────────────────────────────────────── */
function SceneLighting() {
  return (
    <>
      <ambientLight intensity={0.7} />
      <directionalLight position={[5, 10, 5]} intensity={1.8} castShadow shadow-mapSize={[2048, 2048]} />
      <directionalLight position={[-5, 5, -2]} intensity={0.6} color="#9333ea" />
      <pointLight position={[0, 5, 4]} intensity={1.2} color="#ffffff" />
      <spotLight
        position={[0, 10, 0]}
        angle={0.3}
        penumbra={1}
        intensity={1.5}
        castShadow
        color="#ffffff"
      />
    </>
  );
}

/* ─────────────────────────────────────────────
   ERROR BOUNDARY — if GLB fails, render procedural
────────────────────────────────────────────── */
class AvatarErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() { return { hasError: true }; }

  render() {
    if (this.state.hasError) {
      const { gender, skinColor, topColor, bottomColor, shoeColor } = this.props;
      return (
        <ProceduralAvatar
          gender={gender}
          skinColor={skinColor}
          topColor={topColor}
          bottomColor={bottomColor}
          shoeColor={shoeColor}
        />
      );
    }
    return this.props.children;
  }
}

/* ─────────────────────────────────────────────
   MAIN EXPORTED COMPONENT
────────────────────────────────────────────── */
export default function AvatarViewer({ gender = 'female', skinColor = '#c68642', topColor = '#2c3e7a', bottomColor = '#1a1a2e', shoeColor = '#f8f8f8', useGlb = false }) {
  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      camera={{ position: [0, 1.2, 7.5], fov: 45 }}
      style={{ width: '100%', height: '100%', background: 'transparent' }}
      gl={{ antialias: true, alpha: true }}
    >
      <SceneLighting />
      <Environment preset="city" backgroundIntensity={0} />

      <AvatarErrorBoundary
        gender={gender}
        skinColor={skinColor}
        topColor={topColor}
        bottomColor={bottomColor}
        shoeColor={shoeColor}
      >
        {useGlb ? (
          <AvatarWithFallback
            gender={gender}
            skinColor={skinColor}
            topColor={topColor}
            bottomColor={bottomColor}
            shoeColor={shoeColor}
          />
        ) : (
          <ProceduralAvatar
            gender={gender}
            skinColor={skinColor}
            topColor={topColor}
            bottomColor={bottomColor}
            shoeColor={shoeColor}
          />
        )}
      </AvatarErrorBoundary>

      <ContactShadows
        position={[0, -1.12, 0]}
        opacity={0.45}
        scale={3}
        blur={1.8}
        far={2}
        color="#9333ea"
      />

      <OrbitControls
        enablePan={false}
        minDistance={4}
        maxDistance={10}
        minPolarAngle={Math.PI / 6}
        maxPolarAngle={Math.PI * 0.6}
        target={[0, 1.4, 0]}
      />
    </Canvas>
  );
}
