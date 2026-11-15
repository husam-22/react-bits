'use client';

import { useSyncExternalStore } from 'react';
import { MOTION_STORAGE_KEY as STORAGE_KEY } from './motion-boot';

/**
 * Motion preference = the operating system setting, unless the visitor used the «تقليل الحركة» switch.
 *
 * The inline boot script in app/layout.tsx applies it to <html data-motion data-story> before the first
 * paint, so layout that depends on it (the pinned scroll story) never shifts after load.
 */

export type MotionSetting = 'full' | 'reduced';

const EVENT = 'sarh:motionchange';

const stored = (): MotionSetting | null => {
  try {
    const item = window.localStorage.getItem(STORAGE_KEY);
    return item === 'reduced' || item === 'full' ? item : null;
  } catch {
    return null;
  }
};

const apply = (setting: MotionSetting) => {
  const root = document.documentElement;
  if (root.dataset.motion === setting) return;
  root.dataset.motion = setting;
  root.dataset.story = setting === 'full' ? 'on' : 'off';
  window.dispatchEvent(new Event(EVENT));
};

export function getMotionSetting(): MotionSetting {
  if (typeof document === 'undefined') return 'full';
  return document.documentElement.dataset.motion === 'reduced' ? 'reduced' : 'full';
}

export function isMotionReduced(): boolean {
  return getMotionSetting() === 'reduced';
}

export function setMotionSetting(setting: MotionSetting) {
  try {
    window.localStorage.setItem(STORAGE_KEY, setting);
  } catch {
    // Private mode: the choice still applies for this page view.
  }
  apply(setting);
}

function subscribe(onChange: () => void) {
  const query = window.matchMedia('(prefers-reduced-motion: reduce)');
  const onSystemChange = () => {
    if (!stored()) apply(query.matches ? 'reduced' : 'full');
  };
  window.addEventListener(EVENT, onChange);
  query.addEventListener('change', onSystemChange);
  return () => {
    window.removeEventListener(EVENT, onChange);
    query.removeEventListener('change', onSystemChange);
  };
}

/** `true` when animations should be skipped. Always `false` during server rendering. */
export function useReducedMotion(): boolean {
  return useSyncExternalStore(subscribe, isMotionReduced, () => false);
}

/** Subscribes to a CSS media query. `false` during server rendering and the first client render. */
export function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    onChange => {
      const list = window.matchMedia(query);
      list.addEventListener('change', onChange);
      return () => list.removeEventListener('change', onChange);
    },
    () => window.matchMedia(query).matches,
    () => false
  );
}
