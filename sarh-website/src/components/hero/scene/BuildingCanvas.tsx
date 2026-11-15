'use client';

import { Environment, Lightformer } from '@react-three/drei';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { storyStore } from '@/lib/story-store';
import { createLineMaterial, createMaterials, palette } from './materials';
import {
  TIMELINE,
  createLines,
  createModel,
  type BoxMaterial,
  type BoxPart,
  type CylinderPart,
  type LineSegment,
  type SpherePart
} from './model';
import { CAMERA_FOV, updateCamera } from './rig';

/**
 * The 3D scene of the scroll story: one <canvas>, one procedural model, one progress value.
 *
 * Performance rules applied here:
 *  - Rendering is on demand: a frame is drawn only when the story progress (or the canvas size) changes,
 *    so nothing runs while the page is still, scrolled elsewhere, or in a background tab.
 *  - Every repeated element is instanced; the whole building is about a dozen draw calls.
 *  - Quality adapts to measured frame times (resolution first, then shadows). If the device still cannot
 *    keep up, the scene reports failure and the page falls back to the static poster.
 */

export interface BuildingCanvasProps {
  /** Called once, after the first frame is on screen. */
  onReady: () => void;
  /** Called when WebGL is lost or the device cannot render the scene smoothly. The poster takes over. */
  onFail: (reason: 'context-lost' | 'slow') => void;
  /** Testing aid (?3d=force): hold the best quality and never downgrade. */
  force?: boolean;
  /**
   * The browser only offers software rendering. The scene then starts at the lightest quality (no shadows,
   * no anti-aliasing, DPR 1) and the measured frame time decides whether it may stay.
   */
  software?: boolean;
  /** Testing aid: upper limit for the device pixel ratio (used when capturing the fallback frames). */
  maxDpr?: number;
}

/** Quality tiers, from best to lightest. */
const TIERS = [
  { dpr: 1.5, shadow: 2048 },
  { dpr: 1.25, shadow: 1024 },
  { dpr: 1, shadow: 0 }
] as const;

const EPSILON = 0.0005;
const clamp01 = (value: number) => Math.min(Math.max(value, 0), 1);
const within = (progress: number, window: readonly [number, number]) =>
  window[1] <= window[0] ? 1 : clamp01((progress - window[0]) / (window[1] - window[0]));
const easeOut = (t: number) => 1 - (1 - t) * (1 - t) * (1 - t);
const easeInOut = (t: number) => t * t * (3 - 2 * t);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

const IDENTITY = new THREE.Quaternion();
const UP = new THREE.Vector3(0, 1, 0);

/** Builds all GPU objects once. Returns the root group and a function that poses it for a progress value. */
function buildScene() {
  const model = createModel();
  const lines = createLines();
  const materials = createMaterials();
  const root = new THREE.Group();
  const disposables: { dispose: () => void }[] = [materials];

  // ── Ground: one paved plane that fades into the page and catches the shadows ────────────────────
  const groundGeometry = new THREE.PlaneGeometry(96, 96);
  groundGeometry.rotateX(-Math.PI / 2);
  disposables.push(groundGeometry);
  const ground = new THREE.Mesh(groundGeometry, materials.ground);
  ground.receiveShadow = true;
  ground.renderOrder = -1;
  ground.name = 'ground';
  root.add(ground);

  // ── Boxes: one instanced mesh per material ─────────────────────────────────────────────────────
  const boxGeometry = new THREE.BoxGeometry(1, 1, 1);
  disposables.push(boxGeometry);
  const grouped = new Map<BoxMaterial, BoxPart[]>();
  for (const part of model.boxes) {
    const list = grouped.get(part.material);
    if (list) list.push(part);
    else grouped.set(part.material, [part]);
  }
  const boxBatches = [...grouped].map(([material, parts]) => {
    const mesh = new THREE.InstancedMesh(boxGeometry, materials.boxes[material], parts.length);
    const lit = material !== 'glass' && material !== 'glow';
    mesh.castShadow = lit;
    mesh.receiveShadow = lit;
    mesh.frustumCulled = false;
    // Transparent layers are drawn in a fixed order: interior light, then glass, then the drafted lines.
    mesh.renderOrder = material === 'glass' ? 1 : 0;
    mesh.name = `boxes:${material}`;
    root.add(mesh);
    return { material, mesh, parts };
  });

  // ── Foliage: instanced soft volumes with a little colour variation ─────────────────────────────
  const sphereGeometry = new THREE.IcosahedronGeometry(1, 2);
  disposables.push(sphereGeometry);
  const foliage = new THREE.InstancedMesh(sphereGeometry, materials.foliage, model.spheres.length);
  foliage.castShadow = true;
  foliage.receiveShadow = true;
  foliage.frustumCulled = false;
  const dark = new THREE.Color(palette.foliageDark);
  const light = new THREE.Color(palette.foliageLight);
  const tone = new THREE.Color();
  model.spheres.forEach((sphere, index) => foliage.setColorAt(index, tone.copy(dark).lerp(light, sphere.tone)));
  root.add(foliage);

  // ── Trunks and the clay pot: instanced tapered cylinders ───────────────────────────────────────
  const cylinderGeometry = new THREE.CylinderGeometry(0.7, 1, 1, 12, 1);
  cylinderGeometry.translate(0, 0.5, 0);
  disposables.push(cylinderGeometry);
  const cylinders = new THREE.InstancedMesh(cylinderGeometry, materials.bark, model.cylinders.length);
  cylinders.castShadow = true;
  cylinders.receiveShadow = true;
  cylinders.frustumCulled = false;
  model.cylinders.forEach((cylinder, index) => cylinders.setColorAt(index, tone.set(cylinder.color)));
  root.add(cylinders);

  // ── Drawn lines ────────────────────────────────────────────────────────────────────────────────
  const ribbons = (segments: LineSegment[], color: string, name: string) => {
    const position = new Float32Array(segments.length * 12);
    const along = new Float32Array(segments.length * 4);
    const delay = new Float32Array(segments.length * 4);
    const span = new Float32Array(segments.length * 4);
    const index = new Uint32Array(segments.length * 6);
    const a = new THREE.Vector3();
    const b = new THREE.Vector3();
    const dir = new THREE.Vector3();
    const side = new THREE.Vector3();
    segments.forEach((segment, i) => {
      a.fromArray(segment.a);
      b.fromArray(segment.b);
      dir.subVectors(b, a).normalize();
      side.crossVectors(UP, dir).normalize().multiplyScalar(segment.width / 2);
      // Square caps: extend both ends by half the width so corners close cleanly.
      a.addScaledVector(dir, -segment.width / 2);
      b.addScaledVector(dir, segment.width / 2);
      const points = [a.clone().add(side), a.clone().sub(side), b.clone().add(side), b.clone().sub(side)];
      points.forEach((point, k) => {
        point.toArray(position, i * 12 + k * 3);
        along[i * 4 + k] = k < 2 ? 0 : 1;
        delay[i * 4 + k] = segment.delay;
        span[i * 4 + k] = segment.span;
      });
      index.set([i * 4, i * 4 + 2, i * 4 + 1, i * 4 + 1, i * 4 + 2, i * 4 + 3], i * 6);
    });
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(position, 3));
    geometry.setAttribute('aAlong', new THREE.BufferAttribute(along, 1));
    geometry.setAttribute('aDelay', new THREE.BufferAttribute(delay, 1));
    geometry.setAttribute('aSpan', new THREE.BufferAttribute(span, 1));
    geometry.setIndex(new THREE.BufferAttribute(index, 1));
    const material = createLineMaterial(color, true);
    const mesh = new THREE.Mesh(geometry, material);
    mesh.frustumCulled = false;
    mesh.renderOrder = 2;
    mesh.name = name;
    disposables.push(geometry, material);
    root.add(mesh);
    return { uniforms: material.uniforms, mesh };
  };

  const hairlines = (segments: LineSegment[], color: string, name: string) => {
    const position = new Float32Array(segments.length * 6);
    const along = new Float32Array(segments.length * 2);
    const delay = new Float32Array(segments.length * 2);
    const span = new Float32Array(segments.length * 2);
    segments.forEach((segment, i) => {
      position.set(segment.a, i * 6);
      position.set(segment.b, i * 6 + 3);
      along[i * 2 + 1] = 1;
      delay[i * 2] = delay[i * 2 + 1] = segment.delay;
      span[i * 2] = span[i * 2 + 1] = segment.span;
    });
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(position, 3));
    geometry.setAttribute('aAlong', new THREE.BufferAttribute(along, 1));
    geometry.setAttribute('aDelay', new THREE.BufferAttribute(delay, 1));
    geometry.setAttribute('aSpan', new THREE.BufferAttribute(span, 1));
    const material = createLineMaterial(color, false);
    const mesh = new THREE.LineSegments(geometry, material);
    mesh.frustumCulled = false;
    mesh.renderOrder = 3;
    mesh.name = name;
    disposables.push(geometry, material);
    root.add(mesh);
    return { uniforms: material.uniforms, mesh };
  };

  const parcelLines = ribbons(lines.parcel, '#8c7446', 'lines:parcel');
  const gridLines = ribbons(lines.grid, palette.forest, 'lines:grid');
  const planLines = ribbons(lines.plan, palette.forest, 'lines:plan');
  const massingLines = hairlines(lines.massing, palette.forest, 'lines:massing');

  // ── Posing ─────────────────────────────────────────────────────────────────────────────────────
  const matrix = new THREE.Matrix4();
  const position = new THREE.Vector3();
  const scale = new THREE.Vector3();
  const rotation = new THREE.Quaternion();
  const axis = new THREE.Vector3();

  const poseBox = (part: BoxPart, amount: number) => {
    const [cx, cy, cz] = part.center;
    const [sx, sy, sz] = part.size;
    if (part.grow === 'none') {
      position.set(cx, cy, cz);
      scale.set(sx, sy, sz);
      return;
    }
    if (amount <= EPSILON) {
      // Collapsed completely: nothing is drawn, not even a footprint.
      position.set(cx, cy, cz);
      scale.set(0, 0, 0);
      return;
    }
    switch (part.grow) {
      case 'x+':
        position.set(cx - (sx * (1 - amount)) / 2, cy, cz);
        scale.set(sx * amount, sy, sz);
        break;
      case 'x-':
        position.set(cx + (sx * (1 - amount)) / 2, cy, cz);
        scale.set(sx * amount, sy, sz);
        break;
      case 'y+':
        position.set(cx, cy - (sy * (1 - amount)) / 2, cz);
        scale.set(sx, sy * amount, sz);
        break;
      case 'y-':
        position.set(cx, cy + (sy * (1 - amount)) / 2, cz);
        scale.set(sx, sy * amount, sz);
        break;
      case 'z+':
        position.set(cx, cy, cz - (sz * (1 - amount)) / 2);
        scale.set(sx, sy, sz * amount);
        break;
      case 'z-':
        position.set(cx, cy, cz + (sz * (1 - amount)) / 2);
        scale.set(sx, sy, sz * amount);
        break;
      default:
        // 'pop': scales up from its base.
        position.set(cx, cy - (sy * (1 - amount)) / 2, cz);
        scale.set(sx * amount, sy * amount, sz * amount);
    }
  };

  const poseSphere = (sphere: SpherePart, amount: number) => {
    position.set(sphere.center[0], sphere.center[1] - sphere.radius[1] * (1 - amount) * 0.5, sphere.center[2]);
    scale.set(sphere.radius[0] * amount, sphere.radius[1] * amount, sphere.radius[2] * amount);
  };

  const poseCylinder = (cylinder: CylinderPart, amount: number) => {
    position.fromArray(cylinder.bottom);
    axis.fromArray(cylinder.top).sub(position);
    const length = axis.length();
    rotation.setFromUnitVectors(UP, axis.normalize());
    if (amount <= EPSILON) scale.set(0, 0, 0);
    else scale.set(cylinder.radius, length * amount, cylinder.radius);
  };

  const pose = (progress: number) => {
    for (const batch of boxBatches) {
      batch.parts.forEach((part, index) => {
        poseBox(part, easeOut(within(progress, [part.from, part.to])));
        matrix.compose(position, IDENTITY, scale);
        batch.mesh.setMatrixAt(index, matrix);
      });
      batch.mesh.instanceMatrix.needsUpdate = true;
    }
    model.spheres.forEach((sphere, index) => {
      poseSphere(sphere, easeOut(within(progress, [sphere.from, sphere.to])));
      matrix.compose(position, IDENTITY, scale);
      foliage.setMatrixAt(index, matrix);
    });
    foliage.instanceMatrix.needsUpdate = true;
    model.cylinders.forEach((cylinder, index) => {
      poseCylinder(cylinder, easeOut(within(progress, [cylinder.from, cylinder.to])));
      matrix.compose(position, rotation, scale);
      cylinders.setMatrixAt(index, matrix);
    });
    cylinders.instanceMatrix.needsUpdate = true;

    // Materials: stone detail and warmth, glass, interior light.
    materials.stoneUniforms.uDetail.value = easeInOut(within(progress, TIMELINE.stoneDetail));
    const glazing = easeInOut(within(progress, TIMELINE.glazing));
    materials.glass.opacity = 0.46 * glazing;
    const interior = easeInOut(within(progress, TIMELINE.interior));
    materials.glow.opacity = interior;
    for (const batch of boxBatches) {
      if (batch.material === 'glass') batch.mesh.visible = glazing > 0.002;
      if (batch.material === 'glow') batch.mesh.visible = interior > 0.002 || progress > TIMELINE.landscape[0];
    }

    // Lines: each set is drafted inside its own window and leaves as the finished surfaces arrive.
    const ink = 1 - easeInOut(within(progress, TIMELINE.linesFade));
    parcelLines.uniforms.uProgress.value = within(progress, TIMELINE.parcel);
    parcelLines.uniforms.uOpacity.value = 0.95 * ink;
    gridLines.uniforms.uProgress.value = within(progress, TIMELINE.grid);
    gridLines.uniforms.uOpacity.value = 0.42 * ink;
    planLines.uniforms.uProgress.value = within(progress, TIMELINE.plan);
    planLines.uniforms.uOpacity.value = 0.85 * ink;
    massingLines.uniforms.uProgress.value = within(progress, TIMELINE.massing);
    massingLines.uniforms.uOpacity.value = 0.55 * (1 - easeInOut(within(progress, TIMELINE.massingFade)));
    parcelLines.mesh.visible = gridLines.mesh.visible = planLines.mesh.visible = ink > 0.002;

    return { interior, warmth: easeInOut(within(progress, [0.7, 0.95])) };
  };

  const dispose = () => disposables.forEach(item => item.dispose());

  return { root, pose, dispose };
}

interface SceneProps extends BuildingCanvasProps {
  tier: number;
  onTier: (tier: number) => void;
}

function Scene({ onReady, onFail, force = false, tier, onTier }: SceneProps) {
  const { camera, gl, invalidate, size } = useThree();
  const scene = useMemo(() => buildScene(), []);
  const keyLight = useRef<THREE.DirectionalLight>(null);
  const roomLight = useRef<THREE.PointLight>(null);
  const upperLight = useRef<THREE.PointLight>(null);
  const state = useRef({ progress: -1, width: 0, height: 0, ready: false, last: 0, samples: [] as number[], strikes: 0 });
  const callbacks = useRef({ onReady, onFail, onTier, tier });

  useEffect(() => {
    callbacks.current = { onReady, onFail, onTier, tier };
  });

  // The store asks for a frame whenever the story progress changes.
  useEffect(() => {
    storyStore.invalidate = () => invalidate();
    invalidate();
    return () => {
      storyStore.invalidate = null;
    };
  }, [invalidate]);

  useEffect(() => () => scene.dispose(), [scene]);

  useEffect(() => {
    const canvas = gl.domElement;
    const onLost = (event: Event) => {
      event.preventDefault();
      callbacks.current.onFail('context-lost');
    };
    canvas.addEventListener('webglcontextlost', onLost);
    return () => canvas.removeEventListener('webglcontextlost', onLost);
  }, [gl]);

  // Shadow resolution follows the quality tier.
  useEffect(() => {
    const light = keyLight.current;
    const resolution = TIERS[tier].shadow;
    if (!light || !resolution) return;
    light.shadow.mapSize.set(resolution, resolution);
    light.shadow.map?.dispose();
    light.shadow.map = null;
    invalidate();
  }, [tier, invalidate]);

  useFrame(frame => {
    const current = state.current;
    const progress = storyStore.progress;

    if (progress !== current.progress || size.width !== current.width || size.height !== current.height) {
      current.progress = progress;
      current.width = size.width;
      current.height = size.height;

      const { interior, warmth } = scene.pose(progress);
      updateCamera(camera as THREE.PerspectiveCamera, progress, size.width, size.height);
      if (keyLight.current) {
        keyLight.current.intensity = lerp(2.5, 3.0, warmth);
        keyLight.current.color.setRGB(1, lerp(0.975, 0.945, warmth), lerp(0.94, 0.85, warmth));
      }
      if (roomLight.current) roomLight.current.intensity = 60 * interior;
      if (upperLight.current) upperLight.current.intensity = 26 * interior;
    }

    if (!current.ready) {
      current.ready = true;
      callbacks.current.onReady();
    }

    // Testing aid (?3d=force): publish the previous frame's cost on the canvas element for measurement.
    if (force) {
      const { domElement, info } = frame.gl;
      domElement.setAttribute('data-calls', String(info.render.calls));
      domElement.setAttribute('data-triangles', String(info.render.triangles));
      return;
    }

    // Adaptive quality: judge only runs of consecutive frames (the canvas is idle between scrolls).
    const now = performance.now();
    const delta = now - current.last;
    current.last = now;
    if (delta > 150) {
      current.samples.length = 0;
      return;
    }
    current.samples.push(delta);
    if (current.samples.length < 36) return;
    const average = current.samples.reduce((sum, value) => sum + value, 0) / current.samples.length;
    current.samples.length = 0;
    if (average < 30) {
      current.strikes = 0;
      return;
    }
    current.strikes += 1;
    if (current.strikes < 2) return;
    current.strikes = 0;
    const { tier: active } = callbacks.current;
    if (active < TIERS.length - 1) callbacks.current.onTier(active + 1);
    else if (average > 45) callbacks.current.onFail('slow');
  });

  return (
    <>
      <primitive object={scene.root} />

      <hemisphereLight args={['#fffaf2', '#d6c8b1', 0.42]} />
      <directionalLight
        ref={keyLight}
        position={[-21, 27, 25]}
        intensity={2.5}
        castShadow={TIERS[tier].shadow > 0}
        shadow-bias={-0.0004}
        shadow-normalBias={0.04}
        shadow-radius={3}
      >
        <orthographicCamera attach="shadow-camera" args={[-25, 25, 20, -20, 1, 110]} />
      </directionalLight>
      <directionalLight position={[20, 11, -15]} intensity={0.4} color="#dfe9f2" />
      <pointLight ref={roomLight} position={[4.2, 2.6, 2.3]} color="#ffcf96" intensity={0} distance={15} decay={2} />
      <pointLight ref={upperLight} position={[-3.2, 5.4, 0.3]} color="#ffcf96" intensity={0} distance={9} decay={2} />

      {/* A small procedural studio for reflections on glass and bronze: no HDR file is downloaded. */}
      <Environment resolution={64} frames={1} background={false} environmentIntensity={0.42}>
        <color attach="background" args={['#e9e2d4']} />
        <Lightformer form="rect" intensity={2.4} color="#fff3df" position={[-8, 9, 8]} scale={[14, 8, 1]} target={[0, 2, 0]} />
        <Lightformer form="rect" intensity={0.9} color="#e3ecf3" position={[10, 5, -8]} scale={[12, 6, 1]} target={[0, 2, 0]} />
        <Lightformer form="circle" intensity={1.4} color="#ffffff" position={[0, 14, 0]} scale={10} target={[0, 0, 0]} />
      </Environment>
    </>
  );
}

export default function BuildingCanvas({ onReady, onFail, force = false, software = false, maxDpr }: BuildingCanvasProps) {
  // Software rendering starts at the lightest tier and smaller screens one tier lower than desktop.
  // From there the measured frame times decide: quality is never tied to the kind of device alone.
  const [tier, setTier] = useState(() => {
    if (software) return TIERS.length - 1;
    return typeof window !== 'undefined' && window.matchMedia('(max-width: 1023.98px)').matches ? 1 : 0;
  });
  const quality = TIERS[force ? 0 : tier];

  return (
    <Canvas
      aria-hidden="true"
      frameloop="demand"
      dpr={[1, maxDpr ?? quality.dpr]}
      shadows={quality.shadow > 0 ? 'percentage' : false}
      camera={{ fov: CAMERA_FOV, near: 2, far: 420, position: [45, 36, 60] }}
      gl={{
        antialias: !software || force,
        alpha: true,
        stencil: false,
        powerPreference: 'high-performance',
        // Software rendering is accepted: whether it is fast enough is measured, not assumed.
        failIfMajorPerformanceCaveat: false
      }}
      resize={{ scroll: false, debounce: { scroll: 0, resize: 60 } }}
      onCreated={({ gl }) => {
        gl.toneMapping = THREE.NeutralToneMapping;
        gl.toneMappingExposure = 1;
        gl.setClearColor(0x000000, 0);
      }}
      style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
    >
      <Scene onReady={onReady} onFail={onFail} force={force} tier={force ? 0 : tier} onTier={setTier} />
    </Canvas>
  );
}
