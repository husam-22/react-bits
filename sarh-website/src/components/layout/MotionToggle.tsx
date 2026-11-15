'use client';

import { setMotionSetting, useReducedMotion } from '@/lib/motion-preference';

/**
 * «تقليل الحركة»: lets the visitor switch the scroll story and the entrance animations off (or back on),
 * whatever the operating-system setting is. The choice is remembered on this device only.
 */
export default function MotionToggle() {
  const reduced = useReducedMotion();

  return (
    <button
      type="button"
      role="switch"
      aria-checked={reduced}
      onClick={() => setMotionSetting(reduced ? 'full' : 'reduced')}
      className="group inline-flex min-h-11 items-center gap-3 text-[0.9375rem] text-ivory/80 transition-colors hover:text-ivory"
    >
      <span
        aria-hidden="true"
        className="relative inline-block h-6 w-11 flex-none rounded-full border border-ivory/40 transition-colors duration-200 group-aria-checked:border-brass group-aria-checked:bg-brass"
      >
        <span className="absolute top-1/2 start-[3px] size-4 -translate-y-1/2 rounded-full bg-ivory transition-transform duration-200 ease-out group-aria-checked:-translate-x-5 group-aria-checked:bg-forest" />
      </span>
      تقليل الحركة
    </button>
  );
}
