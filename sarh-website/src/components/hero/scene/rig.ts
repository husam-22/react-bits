import * as THREE from 'three';
import { BUILDING_BOUNDS, FOCUS, SITE_BOUNDS, type V3 } from './model';

/**
 * Camera rig. A moderate-perspective three-quarter view whose whole journey is a function of the single
 * story progress value: it opens wide and high over the plot, then comes down and closer as the building
 * rises. The view direction turns about 19° in total. Nothing rotates on its own.
 *
 * The model is framed inside the same part of the stage that the poster's building occupies, so swapping
 * the poster for the live scene does not make the picture jump. The numbers in `frame()` mirror the poster
 * rules in app/globals.css (.story__poster).
 */

export const CAMERA_FOV = 28;

const DEG = Math.PI / 180;
const DESKTOP_MIN_WIDTH = 1024;
const HEADER_DESKTOP = 84;

interface Path {
  /** Horizontal orbit angle at the start and at the end of the story, in degrees (0 = straight on). */
  azimuth: [number, number];
  /** Height angle above the horizon, in degrees. */
  elevation: [number, number];
}

const DESKTOP_PATH: Path = { azimuth: [40, 28], elevation: [26, 11] };
const COMPACT_PATH: Path = { azimuth: [39, 28], elevation: [26, 12] };
/** The finished building may come closer than a strict fit of its platform (closer still on phones). */
const PUSH_IN = { desktop: 0.9, compact: 0.84 };

/** The rectangle of the stage, in pixels from the top-left corner, that the model may fill. */
function frame(width: number, height: number) {
  if (width >= DESKTOP_MIN_WIDTH) {
    // Poster: `--poster-w` wide, 1672 × 941, bottom-left, shifted left by 5% of its width.
    const posterWidth = Math.min(0.9 * width, (height - HEADER_DESKTOP) * 1.95);
    const posterHeight = (posterWidth * 941) / 1672;
    return {
      left: 0.022 * width,
      right: posterWidth * (0.668 - 0.05),
      top: height - posterHeight * 0.9,
      bottom: height - posterHeight * 0.1
    };
  }
  // Cropped poster: 945 × 870, fitted inside the stage and centred.
  const posterWidth = Math.min(width, (height * 945) / 870);
  const posterHeight = (posterWidth * 870) / 945;
  const x = (width - posterWidth) / 2;
  const y = (height - posterHeight) / 2;
  return {
    left: x + posterWidth * 0.02,
    right: x + posterWidth * 0.98,
    top: y + posterHeight * 0.1,
    bottom: y + posterHeight * 0.93
  };
}

const cornersOf = (bounds: { min: V3; max: V3 }) => {
  const corners: THREE.Vector3[] = [];
  for (const x of [bounds.min[0], bounds.max[0]])
    for (const y of [bounds.min[1], bounds.max[1]])
      for (const z of [bounds.min[2], bounds.max[2]]) corners.push(new THREE.Vector3(x, y, z));
  return corners;
};
const SITE = cornersOf(SITE_BOUNDS);
const BUILDING = cornersOf(BUILDING_BOUNDS);

const direction = new THREE.Vector3();
const right = new THREE.Vector3();
const up = new THREE.Vector3();
const target = new THREE.Vector3();
const offset = new THREE.Vector3();
const WORLD_UP = new THREE.Vector3(0, 1, 0);

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const smoother = (t: number) => t * t * t * (t * (t * 6 - 15) + 10);

export function updateCamera(camera: THREE.PerspectiveCamera, progress: number, width: number, height: number) {
  const path = width >= DESKTOP_MIN_WIDTH ? DESKTOP_PATH : COMPACT_PATH;
  const box = frame(width, height);
  const travel = smoother(Math.min(Math.max((progress - 0.05) / 0.9, 0), 1));

  const azimuth = lerp(path.azimuth[0], path.azimuth[1], travel) * DEG;
  const elevation = lerp(path.elevation[0], path.elevation[1], travel) * DEG;

  // Unit vector from the focus point towards the camera, and the camera's own right/up axes.
  direction.set(Math.sin(azimuth) * Math.cos(elevation), Math.sin(elevation), Math.cos(azimuth) * Math.cos(elevation));
  right.crossVectors(WORLD_UP, direction).normalize();
  up.crossVectors(direction, right).normalize();
  target.set(FOCUS[0], lerp(0.3, 3.2, travel), FOCUS[2]);

  // Half-size of the frame as a share of the half-view.
  const fillX = Math.max((box.right - box.left) / width, 0.1);
  const fillY = Math.max((box.bottom - box.top) / height, 0.1);
  const tanV = Math.tan((CAMERA_FOV * DEG) / 2);
  const tanH = tanV * (width / height);

  /** Smallest distance at which every corner stays inside the frame. */
  const fit = (corners: THREE.Vector3[]) => {
    let distance = 0;
    for (const corner of corners) {
      offset.subVectors(corner, target);
      const depth = offset.dot(direction);
      distance = Math.max(
        distance,
        depth + Math.abs(offset.dot(right)) / (tanH * fillX),
        depth + Math.abs(offset.dot(up)) / (tanV * fillY)
      );
    }
    return distance;
  };
  const near = fit(BUILDING);
  const pushIn = width >= DESKTOP_MIN_WIDTH ? PUSH_IN.desktop : PUSH_IN.compact;
  const distance = lerp(Math.max(fit(SITE), near), near * pushIn, travel);

  camera.position.copy(target).addScaledVector(direction, distance);
  camera.up.copy(WORLD_UP);
  camera.lookAt(target);
  camera.aspect = width / height;
  // Shift the principal point (like a shift lens) so the model sits in the frame without turning the camera.
  const centreX = (box.left + box.right) / 2;
  const centreY = (box.top + box.bottom) / 2;
  camera.setViewOffset(width, height, width / 2 - centreX, height / 2 - centreY, width, height);
}
