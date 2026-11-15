import Link from 'next/link';
import { pillarIcons } from '@/components/services/pillar-icons';
import Reveal from '@/components/ui/Reveal';
import { ArrowForward } from '@/components/ui/icons';
import { pillars } from '@/content/services';

/** Section 2: three quick entry cards under the hero. Each one leads to its service page. */
export default function ServicesOverview() {
  const cards = pillars.filter(pillar => pillar.card);

  return (
    <section id="services" aria-labelledby="services-overview-title" className="border-b border-line">
      <div className="shell py-4 md:py-0">
        <h2 id="services-overview-title" className="sr-only">
          خدماتنا الرئيسية
        </h2>
        {/* React Bits AnimatedContent (through Reveal): the three cards rise one after another, 90ms apart. */}
        <Reveal stagger className="grid md:grid-cols-3">
          {cards.map((pillar, index) => {
            const Icon = pillarIcons[pillar.icon];
            return (
              <div
                key={pillar.slug}
                className={
                  index === 0 ? '' : 'border-t border-line md:border-s md:border-t-0'
                }
              >
                <article className="group relative flex h-full flex-col px-1 py-9 transition-transform duration-300 ease-out hover:-translate-y-1 md:px-8 md:py-14 lg:px-12">
                  <Icon className="size-11 text-brass-deep" />
                  <h3 className="mt-6 text-[1.375rem] font-semibold leading-snug lg:text-[1.625rem]">
                    <Link
                      href={`/services/${pillar.slug}`}
                      className="outline-none after:absolute after:inset-0 after:content-[''] focus-visible:after:outline focus-visible:after:outline-2 focus-visible:after:outline-offset-[-2px] focus-visible:after:outline-brass-deep"
                    >
                      {pillar.card?.title}
                    </Link>
                  </h3>
                  <p className="mt-3 max-w-[38ch] text-ink-soft">{pillar.card?.text}</p>
                  <p className="mt-auto flex items-center gap-2 pt-7 font-medium text-forest" aria-hidden="true">
                    <span className="underline decoration-brass decoration-1 underline-offset-8 transition-colors group-hover:decoration-forest">
                      {pillar.card?.link}
                    </span>
                    <ArrowForward className="size-5 transition-transform duration-300 ease-out group-hover:-translate-x-1" />
                  </p>
                </article>
              </div>
            );
          })}
        </Reveal>
      </div>
    </section>
  );
}
