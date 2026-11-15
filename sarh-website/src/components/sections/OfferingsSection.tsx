import Link from 'next/link';
import { ButtonLink } from '@/components/ui/Button';
import Reveal from '@/components/ui/Reveal';
import SectionHeading from '@/components/ui/SectionHeading';
import { ArrowForward } from '@/components/ui/icons';
import { offerings, offeringsSection, pillarBySlug } from '@/content/services';

/** Section 4: the ten services as one numbered editorial list (a short map; details live on the service pages). */
export default function OfferingsSection() {
  return (
    <section aria-labelledby="offerings-title" className="section border-y border-line bg-ivory-deep/45">
      <div className="shell grid gap-12 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-4">
          <div className="lg:sticky lg:top-[calc(var(--header-h)+2.5rem)]">
            <SectionHeading
              eyebrow={offeringsSection.eyebrow}
              lines={offeringsSection.titleLines}
              id="offerings-title"
              titleClassName="text-[clamp(1.625rem,1.2rem+1.7vw,2.5rem)]"
            />
            <Reveal className="mt-6">
              <p className="lead">{offeringsSection.intro}</p>
            </Reveal>
            <Reveal className="mt-8">
              <ButtonLink href={offeringsSection.cta.href} arrow>
                {offeringsSection.cta.label}
              </ButtonLink>
            </Reveal>
          </div>
        </div>

        <ol className="lg:col-span-8">
          {offerings.map(item => {
            const pillar = pillarBySlug(item.pillar);
            return (
              <li key={item.id} className="border-t border-line last:border-b">
                <Reveal distance={16}>
                  <Link
                    href={`/services/${item.pillar}#${item.id}`}
                    className="group grid grid-cols-[2.75rem_1fr] items-baseline gap-x-4 py-6 transition-colors hover:bg-ivory/70 sm:grid-cols-[4.5rem_1fr_auto] sm:gap-x-6 sm:px-3 lg:py-7"
                  >
                    <span className="ltr text-[1.0625rem] font-medium text-brass-deep sm:text-xl">{item.number}</span>
                    <span>
                      <span className="block text-[1.1875rem] font-semibold leading-snug text-forest lg:text-[1.375rem]">
                        {item.title}
                      </span>
                      <span className="mt-1.5 block max-w-[58ch] text-ink-soft">{item.text}</span>
                      {pillar ? (
                        <span className="mt-2 block text-sm text-ink-soft sm:hidden">{pillar.name}</span>
                      ) : null}
                    </span>
                    <span className="hidden items-center gap-2 self-center text-sm text-ink-soft sm:flex">
                      {pillar?.name}
                      <ArrowForward className="size-5 text-brass-deep transition-transform duration-300 ease-out group-hover:-translate-x-1" />
                    </span>
                  </Link>
                </Reveal>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
