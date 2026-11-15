import LogoLoop from '@/components/react-bits/LogoLoop';
import Reveal from '@/components/ui/Reveal';
import { partners, partnersSection, testimonials } from '@/content/partners';

/**
 * Section 9: partners and client testimonials.
 *
 * Only verified material is shown. While both lists in content/partners.ts are empty this component renders
 * nothing at all, so the page keeps no reserved gap. Each block appears on its own as soon as its list has
 * real entries.
 */
export default function PartnersSection() {
  if (!partners.length && !testimonials.length) return null;

  return (
    <section aria-labelledby="partners-title" className="section border-t border-line">
      <div className="shell">
        <p className="eyebrow">{partnersSection.eyebrow}</p>

        {partners.length ? (
          <div className="mt-6">
            <h2 id="partners-title" className="section-title">
              {partnersSection.partnersTitle}
            </h2>
            <p className="lead mt-4">{partnersSection.partnersText}</p>
            <div className="mt-10" dir="ltr">
              {/* React Bits LogoLoop: a slow marquee of partner logos that pauses on hover. */}
              <LogoLoop
                logos={partners.map(partner => ({
                  src: typeof partner.logo === 'string' ? partner.logo : partner.logo.src,
                  alt: partner.name,
                  href: partner.href
                }))}
                speed={40}
                logoHeight={44}
                gap={72}
                pauseOnHover
                fadeOut
                fadeOutColor="#f4f0e8"
                ariaLabel={partnersSection.partnersTitle}
              />
            </div>
          </div>
        ) : null}

        {testimonials.length ? (
          <div className={partners.length ? 'mt-20' : 'mt-6'}>
            <h2 id={partners.length ? undefined : 'partners-title'} className="section-title">
              {partnersSection.testimonialsTitle}
            </h2>
            <p className="lead mt-4">{partnersSection.testimonialsText}</p>
            <Reveal stagger className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {testimonials.map(item => (
                <figure key={`${item.author}-${item.quote.slice(0, 24)}`} className="border-t border-brass pt-6">
                  <blockquote className="text-[1.125rem] leading-[1.9] text-ink">{item.quote}</blockquote>
                  <figcaption className="mt-5 font-medium text-forest">
                    {item.author}
                    {item.role ? <span className="block text-sm font-normal text-ink-soft">{item.role}</span> : null}
                  </figcaption>
                </figure>
              ))}
            </Reveal>
          </div>
        ) : null}
      </div>
    </section>
  );
}
