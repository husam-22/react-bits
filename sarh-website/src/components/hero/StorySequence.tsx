'use client';

import { useEffect, useRef } from 'react';
import { storyStore } from '@/lib/story-store';

/**
 * The same construction story as an image sequence, for browsers that cannot run the 3D scene (no WebGL,
 * a lost context, a failed download, or rendering that is measurably too slow).
 *
 * The frames in public/story/ are pictures of the real procedural model, captured from the 3D scene itself
 * (scripts/capture-story-frames.mjs). They are drawn on a plain 2D canvas from the same single progress value
 * that drives the 3D scene, so scrolling forwards and backwards behaves identically.
 */

export const STORY_FRAMES = { count: 41, from: 0.04, to: 1 } as const;

interface StorySequenceProps {
  /** `desktop` frames match the wide stage, `compact` frames the phone and tablet stage. */
  variant: 'desktop' | 'compact';
  /** Called once, when the first frame has been drawn. */
  onReady: () => void;
}

const CONCURRENCY = 4;

/** Coarse to fine: every 8th frame first, then every 4th, 2nd and the rest, so scrubbing works early. */
function loadOrder(count: number) {
  const order: number[] = [];
  const seen = new Set<number>();
  for (const step of [8, 4, 2, 1]) {
    for (let index = 0; index < count; index += step) {
      if (!seen.has(index)) {
        seen.add(index);
        order.push(index);
      }
    }
  }
  if (!seen.has(count - 1)) order.push(count - 1);
  return order;
}

export default function StorySequence({ variant, onReady }: StorySequenceProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ready = useRef(onReady);

  useEffect(() => {
    ready.current = onReady;
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');
    if (!canvas || !context) return undefined;

    const { count, from, to } = STORY_FRAMES;
    const images: (HTMLImageElement | undefined)[] = new Array(count);
    let cancelled = false;
    let drawn = -1;
    let announced = false;

    const draw = () => {
      const position = (storyStore.progress - from) / (to - from);
      const wanted = Math.min(Math.max(Math.round(position * (count - 1)), 0), count - 1);
      // The nearest frame that has arrived so far.
      let best = -1;
      for (let distance = 0; distance < count && best < 0; distance++) {
        if (images[wanted - distance]) best = wanted - distance;
        else if (images[wanted + distance]) best = wanted + distance;
      }
      if (best < 0 || best === drawn) return;
      const image = images[best] as HTMLImageElement;
      if (canvas.width !== image.naturalWidth || canvas.height !== image.naturalHeight) {
        canvas.width = image.naturalWidth;
        canvas.height = image.naturalHeight;
      }
      context.drawImage(image, 0, 0);
      drawn = best;
      if (!announced) {
        announced = true;
        ready.current();
      }
    };

    storyStore.invalidate = draw;

    const queue = loadOrder(count);
    const next = async (): Promise<void> => {
      const index = queue.shift();
      if (index === undefined || cancelled) return;
      const image = new Image();
      image.decoding = 'async';
      image.src = `/story/${variant}/${String(index).padStart(2, '0')}.webp`;
      try {
        await image.decode();
        if (!cancelled) {
          images[index] = image;
          draw();
        }
      } catch {
        // A missing frame is simply skipped: the nearest loaded one is shown instead.
      }
      return next();
    };
    for (let worker = 0; worker < CONCURRENCY; worker++) void next();

    return () => {
      cancelled = true;
      if (storyStore.invalidate === draw) storyStore.invalidate = null;
    };
  }, [variant]);

  return <canvas ref={canvasRef} className="story__frames" aria-hidden="true" />;
}
