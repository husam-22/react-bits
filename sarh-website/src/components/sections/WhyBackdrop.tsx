'use client';

import dynamic from 'next/dynamic';
import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { useMediaQuery, useReducedMotion } from '@/lib/motion-preference';

// React Bits Topography (WebGL contour lines). Loaded only when it is going to be shown.
const Topography = dynamic(() => import('@/components/react-bits/Topography'), { ssr: false });

/**
 * Faint engineering detail behind the dark section.
 *
 * Everyone gets a static survey grid drawn with CSS. On desktop-class devices with a mouse, and only once the
 * section is near the viewport, the React Bits Topography background is added on top: still contour lines
 * (no drift, no camera movement) that light up softly under the pointer. It is skipped with reduced motion
 * and on phones, so it never competes with the main 3D scene for the GPU.
 */
const subscribeNever = () => () => {};
/** Testing aid shared with the hero: `?3d=force` shows the WebGL layers in browsers without a mouse. */
const isForced = () => new URLSearchParams(window.location.search).get('3d') === 'force';

export default function WhyBackdrop() {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const forced = useSyncExternalStore(subscribeNever, isForced, () => false);
  const desktopClass = useMediaQuery('(min-width: 1024px) and (hover: hover) and (pointer: fine)');
  const capable = desktopClass || forced;
  const [near, setNear] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element || near) return undefined;
    const observer = new IntersectionObserver(
      entries => {
        if (entries.some(entry => entry.isIntersecting)) setNear(true);
      },
      { rootMargin: '500px 0px' }
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [near]);

  return (
    <div ref={ref} aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <div
        className="absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            'linear-gradient(to right, #d6c29a 1px, transparent 1px), linear-gradient(to bottom, #d6c29a 1px, transparent 1px)',
          backgroundSize: '96px 96px',
          maskImage: 'linear-gradient(to bottom, transparent, #000 25%, #000 75%, transparent)'
        }}
      />
      {near && capable && !reduced ? (
        <Topography
          className="pointer-events-auto absolute inset-0"
          color="#b69a65"
          lineCount={16}
          lineWidth={1}
          elevation={0.8}
          tilt={38}
          speed={0}
          morph={0}
          glow={0.15}
          fog={0.6}
          depthOfField={0.2}
          brightness={0.8}
          opacity={0.42}
          hoverEffect="light"
          mouseStrength={0.4}
          parallax={0}
          trail={0.2}
          clickEffect="none"
          markers="none"
          dpr={1}
        />
      ) : null}
    </div>
  );
}
