'use client';

import Image from 'next/image';
import { useId, useRef, useState, type KeyboardEvent } from 'react';
import { ButtonLink } from '@/components/ui/Button';
import SectionHeading from '@/components/ui/SectionHeading';
import { CheckIcon } from '@/components/ui/icons';
import { pillars, tabsSection } from '@/content/services';
import { cn } from '@/lib/cn';

/**
 * Section 5: the four service pillars as real tabs (WAI-ARIA tabs pattern).
 * Arrow keys move between tabs (right = previous in RTL), Home/End jump to the ends.
 * All four panels sit in the same grid cell, so the section is always as tall as the tallest panel and
 * switching never makes the page jump. Without JavaScript the first panel stays visible and the others are
 * reachable from the "all services" page.
 */
export default function ServiceTabs() {
  const [active, setActive] = useState(0);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const baseId = useId();

  const select = (index: number, focus = false) => {
    const next = (index + pillars.length) % pillars.length;
    setActive(next);
    if (focus) tabs.current[next]?.focus();
  };

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    // In a right-to-left tab list the next tab is to the left.
    const moves: Record<string, number | undefined> = { ArrowLeft: active + 1, ArrowRight: active - 1, Home: 0, End: pillars.length - 1 };
    const next = moves[event.key];
    if (next === undefined) return;
    event.preventDefault();
    select(next, true);
  };

  return (
    <section aria-labelledby="tabs-title" className="section">
      <div className="shell">
        <SectionHeading eyebrow={tabsSection.eyebrow} lines={tabsSection.titleLines} id="tabs-title" />

        <div
          role="tablist"
          aria-labelledby="tabs-title"
          aria-orientation="horizontal"
          onKeyDown={onKeyDown}
          className="mt-10 grid grid-cols-2 border-b border-line md:mt-14 md:flex"
        >
          {pillars.map((pillar, index) => {
            const selected = index === active;
            return (
              <button
                key={pillar.slug}
                ref={element => {
                  tabs.current[index] = element;
                }}
                type="button"
                role="tab"
                id={`${baseId}-tab-${index}`}
                aria-selected={selected}
                aria-controls={`${baseId}-panel-${index}`}
                tabIndex={selected ? 0 : -1}
                onClick={() => select(index)}
                className={cn(
                  'relative min-h-14 px-3 py-3 text-start text-[1.0625rem] font-medium transition-colors duration-200 md:px-7 md:text-lg',
                  'after:absolute after:inset-x-0 after:-bottom-px after:h-0.5 after:origin-right after:bg-brass-deep after:transition-transform after:duration-300 after:ease-out',
                  selected ? 'text-forest after:scale-x-100' : 'text-ink-soft after:scale-x-0 hover:text-forest'
                )}
              >
                <span className="ltr me-2 text-sm text-brass-deep">{String(index + 1).padStart(2, '0')}</span>
                {pillar.name}
              </button>
            );
          })}
        </div>

        <div className="mt-10 grid md:mt-14">
          {pillars.map((pillar, index) => {
            const selected = index === active;
            return (
              <div
                key={pillar.slug}
                role="tabpanel"
                id={`${baseId}-panel-${index}`}
                aria-labelledby={`${baseId}-tab-${index}`}
                tabIndex={selected ? 0 : -1}
                // Hidden panels keep their place in the grid (so the height never changes) but are removed
                // from the tab order and from assistive technology.
                inert={!selected}
                className={cn(
                  'grid items-start gap-10 [grid-area:1/1] lg:grid-cols-12 lg:gap-16',
                  'transition-[opacity,transform,visibility] duration-[250ms] ease-out',
                  selected ? 'visible translate-y-0 opacity-100 delay-75' : 'invisible translate-y-3 opacity-0'
                )}
              >
                <div className="lg:col-span-6">
                  <h3 className="text-[clamp(1.5rem,1.1rem+1.6vw,2.375rem)] font-semibold leading-snug">{pillar.title}</h3>
                  <p className="lead mt-5">{pillar.text}</p>
                  <p className="mt-8 text-[0.9375rem] font-medium text-brass-deep">{tabsSection.includesLabel}</p>
                  <ul className="mt-3 grid gap-x-8 sm:grid-cols-2">
                    {pillar.includes.map(item => (
                      <li key={item} className="flex items-start gap-3 border-t border-line py-3">
                        <CheckIcon className="mt-1.5 size-4 flex-none text-brass-deep" />
                        {item}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-8 flex flex-wrap items-center gap-x-7 gap-y-3">
                    <ButtonLink href={pillar.cta.href} arrow>
                      {pillar.cta.label}
                    </ButtonLink>
                    <ButtonLink href={`/services/${pillar.slug}`} variant="ghost">
                      تفاصيل {pillar.name}
                    </ButtonLink>
                  </div>
                </div>
                <div className="lg:col-span-6">
                  <Image
                    src={pillar.image}
                    alt={pillar.imageAlt}
                    sizes="(min-width: 1024px) 46vw, 100vw"
                    placeholder="blur"
                    className="aspect-[4/3] w-full object-cover"
                  />
                  <p className="mt-3 text-sm text-ink-soft">تصور توضيحي</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
