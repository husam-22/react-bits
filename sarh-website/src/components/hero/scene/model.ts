/**
 * The procedural building: "من الأرض إلى الصرح".
 *
 * One model, described as data, is used for every stage of the story. Each element belongs to one of the
 * five groups required by the brief (Site, Plan, Structure, Envelope, Landscape) and carries the window of
 * story progress in which it is built. The scene only ever reads a single progress value and derives every
 * transform from it, so scrolling back plays the construction in reverse.
 *
 * Units are metres. X runs left→right, Y up, Z towards the viewer. Y = 0 is the top of the model base.
 * The massing follows the supplied reference render: a two-storey main block (A), a lower living wing that
 * projects forward (B) and an open frame wing on the left (C), on a stone platform with steps.
 */

export type V3 = [number, number, number];

export type Group = 'site' | 'structure' | 'envelope' | 'landscape';

export type BoxMaterial =
  | 'platform'
  | 'stone'
  | 'concrete'
  | 'roof'
  | 'bronze'
  | 'glass'
  | 'timber'
  | 'fabric'
  | 'glow';

/** How a box appears: it grows along one axis from a fixed face, or scales up from its base ("pop"). */
export type Grow = 'x+' | 'x-' | 'y+' | 'y-' | 'z+' | 'z-' | 'pop' | 'none';

export interface BoxPart {
  group: Group;
  material: BoxMaterial;
  center: V3;
  size: V3;
  /** Story progress at which the part starts and finishes appearing. */
  from: number;
  to: number;
  grow: Grow;
}

export interface SpherePart {
  center: V3;
  radius: V3;
  from: number;
  to: number;
  /** 0 → 1, picks a tone between the two foliage colours. */
  tone: number;
}

export interface CylinderPart {
  bottom: V3;
  top: V3;
  radius: number;
  from: number;
  to: number;
  color: string;
}

/** Story timeline (fractions of the pinned section's progress). Matches the table in the brief. */
export const TIMELINE = {
  /** 0–20%: the plot and a light coordinate grid. */
  parcel: [0.02, 0.1],
  grid: [0.05, 0.19],
  /** 20–45%: the plan is drawn, then the outlines of the masses. */
  plan: [0.2, 0.43],
  massing: [0.35, 0.46],
  /** 45–70%: columns first, then slabs. */
  columns: [0.45, 0.58],
  slabs: [0.56, 0.7],
  /** 70–90%: façades, glazing, stone and light. */
  walls: [0.7, 0.85],
  massingFade: [0.72, 0.86],
  stoneDetail: [0.76, 0.9],
  glazing: [0.82, 0.9],
  fittings: [0.84, 0.91],
  interior: [0.86, 0.94],
  /** 90–100%: landscape, then the finished building settles. */
  landscape: [0.87, 0.98],
  /** The drafted lines leave as the finished surfaces arrive. */
  linesFade: [0.74, 0.9]
} as const satisfies Record<string, readonly [number, number]>;

/** Levels. */
const GROUND = 0.45; // top of the stone platform = ground floor level
const FLOOR = 3.6; // first floor level (top of slab)
const SLAB = 0.3;
const ROOF = 7.2; // top of the main block's roof slab
const PARAPET_A = 7.75;
const PARAPET_B = 4.4;
const HEAD_B = 3.1; // head of the living wing glazing
const SPLIT = FLOOR - SLAB / 2; // where lower and upper stone panels meet (hides the slab edge)

/** Structural grid. The coordinate grid drawn on the plot uses the same lines. */
export const GRID_X = [-12, -8, -4, 0, 4, 8];
export const GRID_Z = [-6, -2, 2, 5.5];

/** The stone platform the building stands on, and the plot boundary drawn around it. */
export const PLATFORM = { minX: -12.7, maxX: 8.9, minZ: -6.7, maxZ: 8.2 };
export const PARCEL = { minX: -15.1, maxX: 11.3, minZ: -9.0, maxZ: 11.5 };

/**
 * Two boxes used to frame the camera. The story opens wide on the plot and ends closer on the building:
 * the camera distance is interpolated between the fit of the first box and the fit of the second.
 */
export const SITE_BOUNDS = {
  min: [PARCEL.minX, 0, PARCEL.minZ] as V3,
  max: [PARCEL.maxX + 1.9, 0.6, PARCEL.maxZ + 1.9] as V3
};
export const BUILDING_BOUNDS = {
  min: [PLATFORM.minX, 0, PLATFORM.minZ] as V3,
  // The entrance steps reach a little in front of the platform.
  max: [PLATFORM.maxX, PARAPET_A + 0.25, PLATFORM.maxZ + 1.0] as V3
};

/** Where the camera looks: the centre of the platform. */
export const FOCUS: V3 = [(PLATFORM.minX + PLATFORM.maxX) / 2, 0, (PLATFORM.minZ + PLATFORM.maxZ) / 2];

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** Spreads `count` starts across a window so that every item still gets `share` of the window to finish. */
const staggered = (window: readonly [number, number], index: number, count: number, share = 0.45): [number, number] => {
  const length = (window[1] - window[0]) * share;
  const start = lerp(window[0], window[1] - length, count <= 1 ? 0 : index / (count - 1));
  return [start, start + length];
};

export function createModel() {
  const boxes: BoxPart[] = [];
  const spheres: SpherePart[] = [];
  const cylinders: CylinderPart[] = [];

  const box = (
    group: Group,
    material: BoxMaterial,
    x: [number, number],
    y: [number, number],
    z: [number, number],
    window: readonly [number, number],
    grow: Grow
  ) => {
    boxes.push({
      group,
      material,
      center: [(x[0] + x[1]) / 2, (y[0] + y[1]) / 2, (z[0] + z[1]) / 2],
      size: [Math.abs(x[1] - x[0]), Math.abs(y[1] - y[0]), Math.abs(z[1] - z[0])],
      from: window[0],
      to: window[1],
      grow
    });
  };

  const always = [0, 0] as const;

  // ── Site ──────────────────────────────────────────────────────────────────────────────────────
  box('site', 'platform', [PLATFORM.minX, PLATFORM.maxX], [0, GROUND], [PLATFORM.minZ, PLATFORM.maxZ], always, 'none');

  // ── Structure: columns, then slabs ────────────────────────────────────────────────────────────
  const columns: { x: number; z: number; top: number }[] = [];
  for (const x of [-8, -4, 0]) for (const z of [-6, -2, 2]) columns.push({ x, z, top: ROOF - SLAB });
  for (const [x, z] of [
    [4, -2],
    [8, -2],
    [4, 2],
    [8, 2],
    [0, 5.5],
    [4, 5.5],
    [8, 5.5]
  ]) {
    columns.push({ x, z, top: FLOOR - SLAB });
  }
  columns.push({ x: -12, z: -2, top: ROOF - SLAB }, { x: -12, z: 2, top: ROOF - SLAB });
  columns.sort((a, b) => a.x - b.x || a.z - b.z);
  columns.forEach((column, index) => {
    box(
      'structure',
      'concrete',
      [column.x - 0.2, column.x + 0.2],
      [GROUND, column.top],
      [column.z - 0.2, column.z + 0.2],
      staggered(TIMELINE.columns, index, columns.length, 0.5),
      'y+'
    );
  });

  const slab = (x: [number, number], z: [number, number], top: number, order: number, grow: Grow) =>
    box('structure', 'concrete', x, [top - SLAB, top], z, staggered(TIMELINE.slabs, order, 7, 0.4), grow);

  slab([-8.2, 0.2], [-6.2, 2.2], FLOOR, 0, 'x+'); // main block, first floor
  slab([0.2, 8.2], [-2.2, 2.2], FLOOR, 1, 'x+'); // living wing roof (rear)
  slab([-0.2, 8.2], [2.2, 5.7], FLOOR, 1, 'x+'); // living wing roof (front)
  slab([-12.2, -8.2], [-2.2, 2.2], FLOOR, 2, 'x-'); // frame wing terrace
  slab([-8.2, 0.2], [-6.2, 2.2], ROOF, 3, 'x+'); // main block roof
  slab([-5.5, -0.9], [2.2, 3.2], FLOOR, 5, 'z+'); // front balcony
  // frame wing: roof beams and pergola slats
  slab([-12.2, -8.2], [1.85, 2.15], ROOF, 4, 'x-');
  slab([-12.2, -8.2], [-2.15, -1.85], ROOF, 4, 'x-');
  slab([-12.15, -11.85], [-1.85, 1.85], ROOF, 5, 'z+');
  for (const [index, x] of [-11, -10, -9].entries()) {
    box('structure', 'concrete', [x - 0.07, x + 0.07], [ROOF - 0.26, ROOF - 0.04], [-1.85, 1.85], staggered(TIMELINE.slabs, 5 + index * 0.3, 7, 0.4), 'z+');
  }

  // ── Envelope: stone panels ────────────────────────────────────────────────────────────────────
  type Panel = { x: [number, number]; y: [number, number]; z: [number, number] };
  const panels: Panel[] = [];
  /** A wall along X at depth `z` (0.5 thick, centred on the grid line). */
  const wallX = (z: number, x0: number, x1: number, y0: number, y1: number) =>
    panels.push({ x: [x0, x1], y: [y0, y1], z: [z - 0.25, z + 0.25] });
  /** A wall along Z at position `x`. */
  const wallZ = (x: number, z0: number, z1: number, y0: number, y1: number) =>
    panels.push({ x: [x - 0.25, x + 0.25], y: [y0, y1], z: [z0, z1] });

  // Main block (A), ground floor
  wallX(2, -8.25, -5.0, GROUND, SPLIT); // front, left of the entrance
  wallX(2, -2.4, 0.25, GROUND, SPLIT); // front, right of the entrance
  wallX(2, -5.0, -2.4, 3.05, SPLIT); // entrance lintel
  wallZ(-8, -6.25, 1.75, GROUND, SPLIT); // left side
  wallX(-6, -8.25, 0.25, GROUND, SPLIT); // rear
  wallZ(0, -5.75, -4.7, GROUND, SPLIT); // right side, around the slim window
  wallZ(0, -3.5, -2.25, GROUND, SPLIT);
  wallZ(0, -4.7, -3.5, GROUND, 1.2);
  wallZ(0, -4.7, -3.5, 2.9, SPLIT);
  // Main block (A), first floor and parapet
  wallX(2, -8.25, -7.3, SPLIT, PARAPET_A); // front
  wallX(2, -6.1, -5.2, SPLIT, PARAPET_A);
  wallX(2, -1.2, 0.25, SPLIT, PARAPET_A);
  wallX(2, -7.3, -6.1, SPLIT, 3.9); // below the lattice screen
  wallX(2, -7.3, -6.1, 6.6, PARAPET_A); // above it
  wallX(2, -5.2, -1.2, 6.3, PARAPET_A); // above the balcony window
  wallZ(-8, -6.25, 1.75, SPLIT, PARAPET_A); // left side
  wallX(-6, -8.25, 0.25, SPLIT, PARAPET_A); // rear
  wallZ(0, -5.75, -1.0, SPLIT, PARAPET_A); // right side, around the terrace door
  wallZ(0, 1.2, 1.75, SPLIT, PARAPET_A);
  wallZ(0, -1.0, 1.2, 6.2, PARAPET_A);
  // Living wing (B)
  wallX(5.5, -0.25, 1.4, GROUND, PARAPET_B); // front pier
  wallX(5.5, 1.4, 7.75, HEAD_B, PARAPET_B); // front fascia above the glazing
  panels.push({ x: [7.75, 8.25], y: [GROUND, PARAPET_B], z: [5.25, 5.75] }); // corner pier
  wallZ(8, -1.75, 2.4, GROUND, PARAPET_B); // right side, solid part
  wallZ(8, 2.4, 5.25, HEAD_B, PARAPET_B); // right side fascia
  wallX(-2, 0.25, 8.25, GROUND, PARAPET_B); // rear
  wallZ(0, 2.25, 5.25, GROUND, PARAPET_B); // left side, facing the entrance court

  // Lower panels first, then upper ones, left to right: the façade climbs like masonry being laid.
  panels
    .map(panel => ({ panel, order: panel.y[0] * 0.55 + (panel.x[0] + 12) * 0.06 + (6 - panel.z[1]) * 0.02 }))
    .sort((a, b) => a.order - b.order)
    .forEach(({ panel }, index, list) => {
      box('envelope', 'stone', panel.x, panel.y, panel.z, staggered(TIMELINE.walls, index, list.length, 0.42), 'y+');
    });

  // Roof finishes
  box('envelope', 'roof', [-7.75, -0.25], [ROOF, ROOF + 0.05], [-5.75, 1.75], [0.84, 0.88], 'x+');
  box('envelope', 'roof', [0.25, 7.75], [FLOOR, FLOOR + 0.05], [-1.75, 5.25], [0.84, 0.88], 'x+');

  // ── Envelope: glazing, bronze frames, screen, door, railings ──────────────────────────────────
  const glass = (x: [number, number], y: [number, number], z: [number, number]) =>
    box('envelope', 'glass', x, y, z, TIMELINE.glazing, 'none');
  const bronze = (x: [number, number], y: [number, number], z: [number, number], order = 0, grow: Grow = 'y+') =>
    box('envelope', 'bronze', x, y, z, staggered(TIMELINE.fittings, order, 6, 0.5), grow);

  // Balcony window, first floor front
  glass([-5.2, -1.2], [FLOOR, 6.3], [1.8, 1.86]);
  for (const x of [-5.2, -3.87, -2.53, -1.2]) bronze([x - 0.045, x + 0.045], [FLOOR, 6.3], [1.76, 1.9], 0);
  bronze([-5.2, -1.2], [6.22, 6.3], [1.76, 1.9], 1, 'x+');
  // Lattice screen (mashrabiya) with dark glass behind it
  glass([-7.3, -6.1], [3.9, 6.6], [1.8, 1.86]);
  for (let i = 0; i <= 6; i++) {
    const x = -7.3 + (i * 1.2) / 6;
    bronze([x - 0.022, x + 0.022], [3.9, 6.6], [2.08, 2.13], 2);
  }
  for (let i = 0; i <= 13; i++) {
    const y = 3.9 + (i * 2.7) / 13;
    bronze([-7.3, -6.1], [y - 0.022, y + 0.022], [2.07, 2.12], 3, 'x+');
  }
  // Entrance: timber door of vertical slats, glazed sidelight, bronze frame and pull
  for (let i = 0; i < 9; i++) {
    const x = -4.3 + i * 0.2;
    box('envelope', 'timber', [x + 0.01, x + 0.19], [GROUND, 3.0], [1.84, 1.92], staggered(TIMELINE.fittings, i, 9, 0.5), 'y+');
  }
  glass([-5.0, -4.3], [GROUND, 3.05], [1.84, 1.9]);
  bronze([-4.36, -4.28], [GROUND, 3.05], [1.8, 1.94], 1);
  bronze([-2.92, -2.86], [1.3, 2.5], [1.95, 2.01], 4);
  // Slim window and terrace door on the right side of the main block
  glass([-0.08, -0.02], [1.2, 2.9], [-4.7, -3.5]);
  glass([-0.08, -0.02], [FLOOR, 6.2], [-1.0, 1.2]);
  bronze([-0.12, 0.02], [FLOOR, 6.2], [0.06, 0.14], 2);
  // Living wing: glazing that turns the corner, with slim bronze mullions
  glass([1.4, 7.75], [GROUND, HEAD_B], [5.27, 5.33]);
  for (const x of [1.4, 2.99, 4.58, 6.16, 7.75]) bronze([x - 0.05, x + 0.05], [GROUND, HEAD_B], [5.22, 5.38], 1);
  bronze([1.4, 7.75], [HEAD_B - 0.09, HEAD_B], [5.22, 5.38], 2, 'x+');
  glass([7.77, 7.83], [GROUND, HEAD_B], [2.4, 5.25]);
  for (const z of [2.4, 3.83]) bronze([7.72, 7.88], [GROUND, HEAD_B], [z - 0.05, z + 0.05], 1);
  bronze([7.72, 7.88], [HEAD_B - 0.09, HEAD_B], [2.4, 5.25], 2, 'z+');

  // Railings: a top rail on slim balusters
  const railX = (z: number, x0: number, x1: number, floor: number, order: number) => {
    bronze([x0, x1], [floor + 1.0, floor + 1.06], [z - 0.03, z + 0.03], order, 'x+');
    const count = Math.round((x1 - x0) / 0.15);
    for (let i = 0; i <= count; i++) {
      const x = lerp(x0, x1, i / count);
      bronze([x - 0.012, x + 0.012], [floor, floor + 1.0], [z - 0.012, z + 0.012], order + 1);
    }
  };
  const railZ = (x: number, z0: number, z1: number, floor: number, order: number) => {
    bronze([x - 0.03, x + 0.03], [floor + 1.0, floor + 1.06], [z0, z1], order, 'z+');
    const count = Math.round((z1 - z0) / 0.15);
    for (let i = 0; i <= count; i++) {
      const z = lerp(z0, z1, i / count);
      bronze([x - 0.012, x + 0.012], [floor, floor + 1.0], [z - 0.012, z + 0.012], order + 1);
    }
  };
  railX(3.14, -5.47, -0.93, FLOOR, 3); // front balcony
  railZ(-5.47, 2.3, 3.14, FLOOR, 3);
  railZ(-0.93, 2.3, 3.14, FLOOR, 3);
  railX(2.12, -12.15, -8.3, FLOOR, 4); // frame wing terrace
  railZ(-12.12, -2.12, 2.12, FLOOR, 4);

  // ── Envelope: a few interior volumes that read through the glass, and warm light ───────────────
  const interior = (material: BoxMaterial, x: [number, number], y: [number, number], z: [number, number]) =>
    box('envelope', material, x, y, z, [TIMELINE.interior[0], TIMELINE.interior[0] + 0.04], 'pop');
  interior('fabric', [2.4, 5.4], [GROUND, GROUND + 0.42], [0.1, 1.05]); // sofa seat
  interior('fabric', [2.4, 5.4], [GROUND + 0.42, GROUND + 0.86], [0.1, 0.38]); // sofa back
  interior('fabric', [6.1, 7.0], [GROUND, GROUND + 0.42], [2.5, 3.4]); // armchair
  interior('fabric', [6.75, 7.0], [GROUND + 0.42, GROUND + 0.82], [2.5, 3.4]);
  interior('timber', [3.2, 4.6], [GROUND, GROUND + 0.34], [1.9, 2.7]); // low table
  interior('bronze', [6.57, 6.63], [GROUND, GROUND + 1.45], [0.47, 0.53]); // floor lamp
  interior('glow', [6.4, 6.8], [GROUND + 1.45, GROUND + 1.85], [0.3, 0.7]);
  interior('fabric', [1.5, 2.0], [GROUND + 0.05, HEAD_B - 0.05], [5.02, 5.12]); // curtains
  interior('fabric', [7.1, 7.6], [GROUND + 0.05, HEAD_B - 0.05], [5.02, 5.12]);
  interior('fabric', [-5.1, -4.5], [FLOOR + 0.05, 6.2], [1.55, 1.65]);
  interior('fabric', [-1.9, -1.3], [FLOOR + 0.05, 6.2], [1.55, 1.65]);
  interior('glow', [1.8, 7.2], [FLOOR - SLAB - 0.03, FLOOR - SLAB], [1.4, 1.5]); // ceiling light lines
  interior('glow', [1.8, 7.2], [FLOOR - SLAB - 0.03, FLOOR - SLAB], [3.6, 3.7]);
  interior('glow', [-4.6, -2.8], [3.02, 3.05], [1.3, 1.4]); // entrance soffit light

  // ── Landscape ─────────────────────────────────────────────────────────────────────────────────
  const land = (order: number, share = 0.3) => staggered(TIMELINE.landscape, order, 8, share);
  // Entrance steps with a warm light line under each nosing
  box('landscape', 'platform', [-6.8, -1.2], [0, 0.3], [PLATFORM.maxZ, 8.66], land(0), 'y+');
  box('landscape', 'platform', [-6.8, -1.2], [0, 0.15], [8.66, 9.12], land(0.6), 'y+');
  box('landscape', 'glow', [-6.7, -1.3], [0.305, 0.33], [8.665, 8.69], land(5), 'x+');
  box('landscape', 'glow', [-6.7, -1.3], [0.155, 0.18], [9.125, 9.15], land(5), 'x+');
  // Planters
  box('landscape', 'platform', [-12.2, -8.5], [GROUND, GROUND + 0.62], [4.5, 7.5], land(1), 'y+');
  box('landscape', 'platform', [1.3, 8.6], [GROUND, GROUND + 0.28], [6.25, 7.35], land(1.5), 'y+');
  // Bollard light by the steps
  box('landscape', 'bronze', [-7.5, -7.34], [GROUND, GROUND + 0.85], [7.62, 7.78], land(5), 'y+');
  box('landscape', 'glow', [-7.51, -7.33], [GROUND + 0.62, GROUND + 0.76], [7.61, 7.79], land(5.4), 'y+');

  // Olive tree in the left planter
  const tree: V3 = [-10.35, GROUND + 0.62, 6.0];
  const trunkWindow = land(2.4, 0.3);
  const trunkColor = '#6f6252';
  cylinders.push(
    { bottom: tree, top: [tree[0] + 0.15, tree[1] + 1.55, tree[2] - 0.05], radius: 0.24, from: trunkWindow[0], to: trunkWindow[1], color: trunkColor },
    { bottom: [tree[0] + 0.12, tree[1] + 1.3, tree[2] - 0.04], top: [tree[0] + 1.0, tree[1] + 2.75, tree[2] + 0.35], radius: 0.15, from: trunkWindow[0] + 0.015, to: trunkWindow[1] + 0.015, color: trunkColor },
    { bottom: [tree[0] + 0.12, tree[1] + 1.3, tree[2] - 0.04], top: [tree[0] - 0.85, tree[1] + 2.7, tree[2] - 0.45], radius: 0.14, from: trunkWindow[0] + 0.015, to: trunkWindow[1] + 0.015, color: trunkColor },
    { bottom: [tree[0] + 0.14, tree[1] + 1.4, tree[2] - 0.04], top: [tree[0] + 0.1, tree[1] + 3.0, tree[2] + 0.9], radius: 0.11, from: trunkWindow[0] + 0.02, to: trunkWindow[1] + 0.02, color: trunkColor }
  );
  // Canopy: overlapping soft volumes. A fixed pseudo-random sequence keeps the tree identical on every load.
  let seed = 7;
  const random = () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };
  const canopy: V3 = [tree[0] + 0.1, tree[1] + 3.35, tree[2] + 0.1];
  const canopyCount = 30;
  for (let i = 0; i < canopyCount; i++) {
    const angle = random() * Math.PI * 2;
    const reach = Math.sqrt(random());
    const height = (random() - 0.4) * 1.6;
    const size = 0.48 + random() * 0.42;
    const window = staggered(land(3.3, 0.5), i, canopyCount, 0.55);
    spheres.push({
      center: [canopy[0] + Math.cos(angle) * reach * 1.75, canopy[1] + height * (1 - reach * 0.45), canopy[2] + Math.sin(angle) * reach * 1.55],
      radius: [size, size * 0.74, size],
      from: window[0],
      to: window[1],
      tone: random()
    });
  }
  // Low planting in both planters
  const shrub = (x: number, y: number, z: number, size: number, order: number) => {
    const window = land(4.6 + order * 0.25, 0.25);
    spheres.push({ center: [x, y + size * 0.45, z], radius: [size, size * 0.62, size], from: window[0], to: window[1], tone: random() * 0.5 + 0.5 });
  };
  [-11.5, -10.9, -9.4, -8.95].forEach((x, i) => shrub(x, GROUND + 0.62, 6.9 - (i % 2) * 0.35, 0.42 + (i % 2) * 0.1, i));
  shrub(-11.6, GROUND + 0.62, 5.2, 0.4, 2);
  [1.9, 2.9, 4.0, 5.1, 6.2, 7.3].forEach((x, i) => shrub(x, GROUND + 0.28, 6.8 - (i % 2) * 0.2, 0.36 + (i % 3) * 0.07, i * 0.5));
  // Clay pot at the right corner (wider at the rim: the cylinder is drawn upside down)
  const potWindow = land(5.2, 0.25);
  cylinders.push({ bottom: [8.15, GROUND + 0.85, 7.75], top: [8.15, GROUND, 7.75], radius: 0.42, from: potWindow[0], to: potWindow[1], color: '#b98c6a' });
  spheres.push({ center: [8.15, GROUND + 1.15, 7.75], radius: [0.52, 0.42, 0.52], from: potWindow[1], to: potWindow[1] + 0.03, tone: 0.3 });

  return { boxes, spheres, cylinders };
}

export type Model = ReturnType<typeof createModel>;

/* ───────────────────────────────────────────────────────────────────────────────────────────────
   Drawn lines: the coordinate grid, the plan and the outlines of the masses.
   Ground lines are thin flat ribbons lying on the base (so line weights scale with perspective like ink on
   a model base); mass outlines are hairlines. Every segment has its own delay, so each set is "drafted"
   stroke by stroke from one progress value.
   ─────────────────────────────────────────────────────────────────────────────────────────────── */

export interface LineSegment {
  a: V3;
  b: V3;
  /** Start (0 → 1) inside the set's own progress, and the share of that progress the stroke takes. */
  delay: number;
  span: number;
  /** Ribbon width in metres. Ignored for hairlines. */
  width: number;
}

class Strokes {
  segments: LineSegment[] = [];

  line(a: V3, b: V3, delay: number, span: number, width: number) {
    this.segments.push({ a, b, delay, span, width });
  }

  /** A stroke on a horizontal plane, cut wherever it crosses the platform so it follows the surface. */
  ground(x0: number, z0: number, x1: number, z1: number, delay: number, span: number, width: number) {
    const lift = 0.02;
    const inside = (x: number, z: number) =>
      x > PLATFORM.minX && x < PLATFORM.maxX && z > PLATFORM.minZ && z < PLATFORM.maxZ;
    // Collect the parameters where the segment crosses a platform edge.
    const cuts = [0, 1];
    const dx = x1 - x0;
    const dz = z1 - z0;
    if (dx !== 0) for (const x of [PLATFORM.minX, PLATFORM.maxX]) cuts.push((x - x0) / dx);
    if (dz !== 0) for (const z of [PLATFORM.minZ, PLATFORM.maxZ]) cuts.push((z - z0) / dz);
    const stops = [...new Set(cuts.filter(t => t >= 0 && t <= 1))].sort((a, b) => a - b);
    for (let i = 0; i < stops.length - 1; i++) {
      const t0 = stops[i];
      const t1 = stops[i + 1];
      if (t1 - t0 < 1e-6) continue;
      const mid = (t0 + t1) / 2;
      const y = (inside(x0 + dx * mid, z0 + dz * mid) ? GROUND : 0) + lift;
      this.line(
        [x0 + dx * t0, y, z0 + dz * t0],
        [x0 + dx * t1, y, z0 + dz * t1],
        delay + span * t0,
        span * (t1 - t0),
        width
      );
    }
  }

  rect(x0: number, z0: number, x1: number, z1: number, delay: number, span: number, width: number) {
    const side = span / 4;
    this.ground(x0, z0, x1, z0, delay, side, width);
    this.ground(x1, z0, x1, z1, delay + side, side, width);
    this.ground(x1, z1, x0, z1, delay + side * 2, side, width);
    this.ground(x0, z1, x0, z0, delay + side * 3, side, width);
  }

  arc(cx: number, cz: number, radius: number, start: number, end: number, delay: number, span: number, width: number, steps = 10) {
    for (let i = 0; i < steps; i++) {
      const a0 = lerp(start, end, i / steps);
      const a1 = lerp(start, end, (i + 1) / steps);
      this.ground(
        cx + Math.cos(a0) * radius,
        cz + Math.sin(a0) * radius,
        cx + Math.cos(a1) * radius,
        cz + Math.sin(a1) * radius,
        delay + (span * i) / steps,
        span / steps,
        width
      );
    }
  }
}

export function createLines() {
  // ── Site: plot boundary and coordinate grid ────────────────────────────────────────────────────
  const parcel = new Strokes();
  parcel.rect(PARCEL.minX, PARCEL.minZ, PARCEL.maxX, PARCEL.maxZ, 0, 1, 0.055);

  // Grid lines run past the boundary and end in an axis bubble, as on a setting-out drawing.
  const grid = new Strokes();
  const gridCount = GRID_X.length + GRID_Z.length;
  const overshoot = 0.75;
  const bubble = 0.46;
  GRID_X.forEach((x, index) => {
    const delay = (index / gridCount) * 0.75;
    grid.ground(x, PARCEL.minZ + 0.7, x, PARCEL.maxZ + overshoot, delay, 0.25, 0.03);
    grid.arc(x, PARCEL.maxZ + overshoot + bubble, bubble, -Math.PI / 2, Math.PI * 1.5, delay + 0.2, 0.08, 0.03, 18);
  });
  GRID_Z.forEach((z, index) => {
    const delay = ((GRID_X.length + index) / gridCount) * 0.75;
    grid.ground(PARCEL.minX + 0.7, z, PARCEL.maxX + overshoot, z, delay, 0.25, 0.03);
    grid.arc(PARCEL.maxX + overshoot + bubble, z, bubble, Math.PI, Math.PI * 3, delay + 0.2, 0.08, 0.03, 18);
  });

  // ── Plan ───────────────────────────────────────────────────────────────────────────────────────
  const plan = new Strokes();
  const WALL = 0.075;
  const THIN = 0.04;
  const HAIR = 0.028;
  // Outer walls: double lines for the wall thickness
  plan.rect(-8.25, -6.25, 0.25, 2.25, 0.0, 0.2, WALL);
  plan.rect(-7.75, -5.75, -0.25, 1.75, 0.05, 0.2, WALL);
  plan.rect(-0.25, -2.25, 8.25, 5.75, 0.12, 0.2, WALL);
  plan.rect(0.25, -1.75, 7.75, 5.25, 0.17, 0.2, WALL);
  plan.rect(-12.2, -2.2, -8.25, 2.2, 0.26, 0.14, THIN);
  // Partitions
  plan.ground(-4, -5.75, -4, -2.6, 0.36, 0.06, THIN);
  plan.ground(-7.75, -2, -4.7, -2, 0.39, 0.06, THIN);
  plan.ground(4.7, -1.75, 4.7, 1.0, 0.42, 0.06, THIN);
  plan.ground(4.7, 1.0, 7.75, 1.0, 0.45, 0.06, THIN);
  // Stair
  plan.rect(-3.4, -5.5, -0.7, -3.1, 0.48, 0.08, THIN);
  for (let i = 1; i < 9; i++) plan.ground(-3.4 + i * 0.3, -5.5, -3.4 + i * 0.3, -3.1, 0.52 + i * 0.008, 0.03, HAIR);
  // Door swings
  plan.ground(-2.45, 1.75, -2.45, 0.6, 0.6, 0.03, HAIR);
  plan.arc(-2.45, 1.75, 1.15, -Math.PI / 2, -Math.PI, 0.62, 0.05, HAIR);
  plan.ground(-4.0, -2.6, -4.95, -2.6, 0.64, 0.03, HAIR);
  plan.arc(-4.0, -2.6, 0.95, Math.PI, Math.PI * 1.5, 0.66, 0.05, HAIR);
  // Columns
  const columnPoints: [number, number][] = [];
  for (const x of [-8, -4, 0]) for (const z of [-6, -2, 2]) columnPoints.push([x, z]);
  columnPoints.push([4, -2], [8, -2], [4, 2], [8, 2], [0, 5.5], [4, 5.5], [8, 5.5], [-12, -2], [-12, 2]);
  columnPoints.forEach(([x, z], index) => {
    plan.rect(x - 0.2, z - 0.2, x + 0.2, z + 0.2, 0.68 + (index / columnPoints.length) * 0.12, 0.04, THIN);
  });
  // Dimension strings with ticks on the grid lines
  const dimZ = PLATFORM.maxZ + 1.65;
  plan.ground(GRID_X[0], dimZ, GRID_X[GRID_X.length - 1], dimZ, 0.82, 0.1, HAIR);
  GRID_X.forEach((x, index) => plan.ground(x - 0.22, dimZ + 0.22, x + 0.22, dimZ - 0.22, 0.84 + index * 0.012, 0.03, HAIR));
  const dimX = PLATFORM.maxX + 1.2;
  plan.ground(dimX, GRID_Z[0], dimX, GRID_Z[GRID_Z.length - 1], 0.88, 0.1, HAIR);
  GRID_Z.forEach((z, index) => plan.ground(dimX - 0.22, z - 0.22, dimX + 0.22, z + 0.22, 0.9 + index * 0.012, 0.03, HAIR));

  // ── Outlines of the masses (hairlines): verticals rise first, then the top outline closes ───────
  const massing = new Strokes();
  const outline = (x0: number, x1: number, z0: number, z1: number, top: number, delay: number) => {
    const corners: [number, number][] = [
      [x0, z0],
      [x1, z0],
      [x1, z1],
      [x0, z1]
    ];
    corners.forEach(([x, z], index) => {
      massing.line([x, GROUND, z], [x, top, z], delay + index * 0.03, 0.35, 0);
      const [nx, nz] = corners[(index + 1) % 4];
      massing.line([x, top, z], [nx, top, nz], delay + 0.35 + index * 0.04, 0.2, 0);
      massing.line([x, GROUND + 0.01, z], [nx, GROUND + 0.01, nz], delay + index * 0.03, 0.2, 0);
    });
  };
  outline(-8.25, 0.25, -6.25, 2.25, PARAPET_A, 0);
  outline(-0.25, 8.25, -2.25, 5.75, PARAPET_B, 0.18);
  outline(-12.2, -8.25, -2.2, 2.2, ROOF, 0.3);

  return { parcel: parcel.segments, grid: grid.segments, plan: plan.segments, massing: massing.segments };
}
