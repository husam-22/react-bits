'use client';

import { useGSAP } from '@gsap/react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useRef } from 'react';
import Reveal from '@/components/ui/Reveal';
import SectionHeading from '@/components/ui/SectionHeading';
import { process } from '@/content/home';
import { useReducedMotion } from '@/lib/motion-preference';

gsap.registerPlugin(ScrollTrigger, useGSAP);

/**
 * Section 7: four numbered steps joined by one thin line that advances as the section is scrolled.
 * Desktop: a horizontal line growing from the right (reading direction). Phones: a vertical list and line.
 * Without JavaScript or with reduced motion the line is simply complete.
 */
export default function ProcessSection() {
  const root = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();

  useGSAP(
    () => {
      if (reduced) return undefined;
      const media = gsap.matchMedia();
      media.add({ desktop: '(min-width: 1024px)', compact: '(max-width: 1023.98px)' }, context => {
        const desktop = Boolean(context.conditions?.desktop);
        const line = root.current?.querySelector<HTMLElement>('[data-line]');
        const list = root.current?.querySelector<HTMLElement>('[data-steps]');
        const dots = gsap.utils.toArray<HTMLElement>('[data-dot]', root.current);
        if (!line || !list) return;

        gsap.set(line, { scaleX: desktop ? 0 : 1, scaleY: desktop ? 1 : 0 });
        gsap.set(dots, { backgroundColor: '#f4f0e8' });
        const timeline = gsap.timeline({
          defaults: { ease: 'none' },
          scrollTrigger: { trigger: list, start: 'top 78%', end: desktop ? 'top 30%' : 'bottom 62%', scrub: 0.5 }
        });
        timeline.to(line, desktop ? { scaleX: 1, duration: 1 } : { scaleY: 1, duration: 1 }, 0);
        // Each marker fills as the line reaches it.
        dots.forEach((dot, index) => {
          timeline.to(dot, { backgroundColor: '#75603a', duration: 0.04 }, (index / Math.max(dots.length - 1, 1)) * 0.96);
        });
      });
      return () => media.revert();
    },
    { scope: root, dependencies: [reduced], revertOnUpdate: true }
  );

  return (
    <section ref={root} aria-labelledby="process-title" className="section border-t border-line bg-ivory-deep/45">
      <div className="shell">
        <SectionHeading eyebrow={process.eyebrow} lines={process.titleLines} id="process-title" />

        <div className="relative mt-12 lg:mt-20">
          {/* Track and progress line. */}
          <span
            aria-hidden="true"
            className="absolute inset-y-2 start-[0.4375rem] w-px bg-line lg:inset-x-0 lg:inset-y-auto lg:top-[0.4375rem] lg:h-px lg:w-auto"
          />
          <span
            data-line
            aria-hidden="true"
            className="absolute inset-y-2 start-[0.4375rem] w-px origin-top bg-brass-deep lg:inset-x-0 lg:inset-y-auto lg:top-[0.4375rem] lg:h-px lg:w-auto lg:origin-right"
          />

          <ol data-steps className="relative grid gap-10 lg:grid-cols-4 lg:gap-10">
            {process.steps.map(step => (
              <li key={step.number} className="relative ps-10 lg:ps-0 lg:pt-12">
                <span
                  data-dot
                  aria-hidden="true"
                  className="absolute start-0 top-2 size-[0.9375rem] rounded-full border border-brass-deep bg-brass-deep lg:top-0"
                />
                <Reveal>
                  <p className="ltr text-[2.5rem] font-medium leading-none text-brass-deep lg:text-[3.25rem]">{step.number}</p>
                  <h3 className="mt-4 text-[1.3125rem] font-semibold lg:text-[1.5rem]">{step.title}</h3>
                  <p className="mt-2.5 max-w-[40ch] text-ink-soft">{step.text}</p>
                </Reveal>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
