import * as THREE from 'three';
import { PLATFORM, type BoxMaterial } from './model';

/**
 * Materials of the model: light limestone, clean concrete, dark low-reflection glass and aged bronze.
 * No texture files are used; the stone coursing is drawn in the shader from world-space positions, so it
 * stays fixed in space while a wall grows (it reads as courses being laid, never as a stretching texture).
 */

export const palette = {
  ivory: '#f4f0e8',
  forest: '#132a29',
  brass: '#b69a65',
  stone: '#e8dfce',
  stonePlain: '#efeae0',
  platform: '#e8e1d4',
  ground: '#ebe6dc',
  concrete: '#cdc6ba',
  roof: '#d9d1c2',
  bronze: '#8a6a3c',
  glass: '#1b2927',
  timber: '#8b5e37',
  fabric: '#e7ddcb',
  glow: '#ffd9a3',
  foliageDark: '#6d7a5b',
  foliageLight: '#9aa487'
} as const;

export interface StoneUniforms {
  /** 0 = plain white-card model, 1 = limestone with visible coursing. */
  uDetail: { value: number };
}

interface PatternOptions {
  /** Block length and course height in metres. */
  block: [number, number];
  /** Colour of the surface before the stone detail appears. */
  plain: string;
  /** How dark the joints get (0–1) and how much each block's tone varies. */
  joint: number;
  tint: number;
  uniforms: StoneUniforms;
  key: string;
  /** Ground only: fade to transparent with distance from the platform (start, end in metres). */
  fade?: [number, number];
}

function withStonePattern(material: THREE.MeshStandardMaterial, options: PatternOptions) {
  const plain = new THREE.Color(options.plain);
  const fade = options.fade;
  material.onBeforeCompile = shader => {
    shader.uniforms.uDetail = options.uniforms.uDetail;
    shader.uniforms.uBlock = { value: new THREE.Vector2(...options.block) };
    shader.uniforms.uPlain = { value: plain };
    shader.uniforms.uJoint = { value: new THREE.Vector2(options.joint, options.tint) };
    shader.uniforms.uFade = { value: new THREE.Vector2(fade?.[0] ?? 0, fade?.[1] ?? 0) };
    shader.uniforms.uPlatform = {
      value: new THREE.Vector4(
        (PLATFORM.minX + PLATFORM.maxX) / 2,
        (PLATFORM.minZ + PLATFORM.maxZ) / 2,
        (PLATFORM.maxX - PLATFORM.minX) / 2,
        (PLATFORM.maxZ - PLATFORM.minZ) / 2
      )
    };

    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\nvarying vec3 vSarhPosition;\nvarying vec3 vSarhNormal;')
      .replace(
        '#include <project_vertex>',
        /* glsl */ `#include <project_vertex>
        vec4 sarhPosition = vec4(transformed, 1.0);
        vec3 sarhNormal = objectNormal;
        #ifdef USE_INSTANCING
          sarhPosition = instanceMatrix * sarhPosition;
          sarhNormal = mat3(instanceMatrix) * sarhNormal;
        #endif
        vSarhPosition = (modelMatrix * sarhPosition).xyz;
        vSarhNormal = mat3(modelMatrix) * sarhNormal;`
      );

    shader.fragmentShader = shader.fragmentShader
      .replace(
        '#include <common>',
        /* glsl */ `#include <common>
        uniform float uDetail;
        uniform vec2 uBlock;
        uniform vec3 uPlain;
        uniform vec2 uJoint;
        uniform vec2 uFade;
        uniform vec4 uPlatform;
        varying vec3 vSarhPosition;
        varying vec3 vSarhNormal;
        float sarhHash(vec2 p) {
          return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
        }`
      )
      .replace(
        '#include <color_fragment>',
        /* glsl */ `#include <color_fragment>
        {
          vec3 facing = abs(normalize(vSarhNormal));
          vec2 surface = facing.y > 0.6
            ? vSarhPosition.xz
            : (facing.x > facing.z ? vec2(vSarhPosition.z, vSarhPosition.y) : vec2(vSarhPosition.x, vSarhPosition.y));
          vec2 cell = surface / uBlock;
          // Walls are laid in a running bond; paving is a plain grid.
          cell.x += facing.y > 0.6 ? 0.0 : mod(floor(cell.y), 2.0) * 0.5;
          vec2 id = floor(cell);
          vec2 local = fract(cell);
          vec2 footprint = fwidth(cell);
          vec2 width = clamp(footprint * 1.25, vec2(0.006, 0.012), vec2(0.45));
          vec2 edge = smoothstep(vec2(0.0), width, local) * smoothstep(vec2(0.0), width, 1.0 - local);
          float joint = 1.0 - edge.x * edge.y;
          // Far away the pattern would turn into noise: fade it out instead.
          float clarity = 1.0 - smoothstep(0.12, 0.5, max(footprint.x, footprint.y));
          float tone = sarhHash(id) - 0.5;
          vec3 stone = diffuseColor.rgb * (1.0 + tone * uJoint.y * clarity) * (1.0 - joint * uJoint.x * clarity);
          diffuseColor.rgb = mix(uPlain, stone, uDetail);
          if (uFade.y > 0.0) {
            vec2 away = abs(vSarhPosition.xz - uPlatform.xy) - uPlatform.zw;
            // The ground stops sooner on the side where the page text sits.
            away.x *= vSarhPosition.x > uPlatform.x ? 1.45 : 1.0;
            float distanceOut = length(max(away, 0.0));
            diffuseColor.a *= 1.0 - smoothstep(uFade.x, uFade.y, distanceOut);
          }
        }`
      );
  };
  material.customProgramCacheKey = () => `sarh-stone-${options.key}`;
  return material;
}

export function createMaterials() {
  const stoneUniforms: StoneUniforms = { uDetail: { value: 0 } };
  const settled: StoneUniforms = { uDetail: { value: 1 } };

  const stone = withStonePattern(
    new THREE.MeshStandardMaterial({ color: palette.stone, roughness: 0.94, metalness: 0 }),
    { block: [1.2, 0.6], plain: palette.stonePlain, joint: 0.15, tint: 0.06, uniforms: stoneUniforms, key: 'wall' }
  );
  const platform = withStonePattern(
    new THREE.MeshStandardMaterial({ color: palette.platform, roughness: 0.96, metalness: 0 }),
    { block: [1.2, 1.2], plain: palette.platform, joint: 0.1, tint: 0.03, uniforms: settled, key: 'platform' }
  );
  // The ground is a large paved plane that dissolves into the page, like the floor of the reference render.
  const ground = withStonePattern(
    new THREE.MeshStandardMaterial({ color: palette.ground, roughness: 1, metalness: 0, transparent: true }),
    { block: [2.4, 2.4], plain: palette.ground, joint: 0.085, tint: 0.02, uniforms: settled, key: 'ground', fade: [1.2, 8.5] }
  );

  const glass = new THREE.MeshStandardMaterial({
    color: palette.glass,
    roughness: 0.06,
    metalness: 0.1,
    transparent: true,
    opacity: 0,
    depthWrite: false,
    envMapIntensity: 1.5
  });

  const glow = new THREE.MeshBasicMaterial({ color: palette.glow, transparent: true, opacity: 0, toneMapped: false });

  const boxes: Record<BoxMaterial, THREE.Material> = {
    platform,
    stone,
    concrete: new THREE.MeshStandardMaterial({ color: palette.concrete, roughness: 0.95, metalness: 0 }),
    roof: new THREE.MeshStandardMaterial({ color: palette.roof, roughness: 1, metalness: 0 }),
    bronze: new THREE.MeshStandardMaterial({ color: palette.bronze, roughness: 0.42, metalness: 0.85, envMapIntensity: 1.1 }),
    glass,
    timber: new THREE.MeshStandardMaterial({ color: palette.timber, roughness: 0.72, metalness: 0 }),
    fabric: new THREE.MeshStandardMaterial({ color: palette.fabric, roughness: 1, metalness: 0 }),
    glow
  };

  const foliage = new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 1, metalness: 0 });
  const bark = new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 0.95, metalness: 0 });

  const dispose = () => {
    Object.values(boxes).forEach(material => material.dispose());
    ground.dispose();
    foliage.dispose();
    bark.dispose();
  };

  return { boxes, ground, glass, glow, foliage, bark, stoneUniforms, dispose };
}

export type Materials = ReturnType<typeof createMaterials>;

/** Material for the drafted lines. Each stroke is revealed from its start to its end by `uProgress`. */
export function createLineMaterial(color: string, ribbon: boolean) {
  return new THREE.ShaderMaterial({
    uniforms: {
      uProgress: { value: 0 },
      uOpacity: { value: 1 },
      uColor: { value: new THREE.Color(color) }
    },
    vertexShader: /* glsl */ `
      attribute float aAlong;
      attribute float aDelay;
      attribute float aSpan;
      uniform float uProgress;
      varying float vAlong;
      varying float vReveal;
      void main() {
        vAlong = aAlong;
        float reveal = clamp((uProgress - aDelay) / max(aSpan, 0.0001), 0.0, 1.0);
        vReveal = 1.0 - (1.0 - reveal) * (1.0 - reveal);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor;
      uniform float uOpacity;
      varying float vAlong;
      varying float vReveal;
      void main() {
        if (vAlong > vReveal) discard;
        gl_FragColor = vec4(uColor, uOpacity);
        #include <colorspace_fragment>
      }`,
    transparent: true,
    depthWrite: false,
    toneMapped: false,
    side: THREE.DoubleSide,
    polygonOffset: ribbon,
    polygonOffsetFactor: -2,
    polygonOffsetUnits: -2
  });
}
