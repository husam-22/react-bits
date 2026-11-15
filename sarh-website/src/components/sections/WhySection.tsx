import type { CSSProperties } from 'react';
import SpotlightCard from '@/components/react-bits/SpotlightCard';
import Reveal from '@/components/ui/Reveal';
import SectionHeading from '@/components/ui/SectionHeading';
import { why } from '@/content/home';
import WhyBackdrop from './WhyBackdrop';

const cardSurface = {
  '--spotlight-card-surface': 'rgb(28 56 54 / 0.72)',
  '--spotlight-card-border': 'rgb(244 240 232 / 0.12)',
  '--spotlight-card-shadow': 'none'
} as CSSProperties;

/** Section 8: four reasons on the dark forest background. Ivory on forest has a contrast of about 13:1. */
export default function WhySection() {
  return (
    <section aria-labelledby="why-title" className="on-dark section relative isolate bg-forest text-ivory">
      <WhyBackdrop />
      <div className="shell relative grid gap-12 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-4">
          <SectionHeading eyebrow={why.eyebrow} lines={why.titleLines} id="why-title" />
        </div>

        <Reveal stagger className="grid gap-4 sm:grid-cols-2 lg:col-span-8 lg:gap-5">
          {why.items.map((item, index) => (
            <div key={item.title} className="h-full">
              {/* React Bits SpotlightCard: a soft brass light follows the pointer (or keyboard focus) across the card. */}
              <SpotlightCard
                theme="dark"
                spotlightColor="#d6c29a"
                intensity={0.13}
                spotlightSize={300}
                borderGlow={0.5}
                style={cardSurface}
                className="h-full rounded-[4px]! border border-ivory/12 p-7! backdrop-blur-[2px] lg:p-9!"
              >
                <p className="ltr text-sm font-medium text-brass-light">{String(index + 1).padStart(2, '0')}</p>
                <h3 className="mt-5 text-[1.3125rem] font-semibold leading-snug lg:text-[1.5rem]">{item.title}</h3>
                <p className="mt-3 text-ivory/80">{item.text}</p>
              </SpotlightCard>
            </div>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
