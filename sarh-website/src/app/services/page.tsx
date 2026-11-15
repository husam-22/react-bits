import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import CtaBand from '@/components/sections/CtaBand';
import { pillarIcons } from '@/components/services/pillar-icons';
import { ButtonLink } from '@/components/ui/Button';
import PageHero from '@/components/ui/PageHero';
import Reveal from '@/components/ui/Reveal';
import { contactCta } from '@/content/home';
import { offerings, offeringsOf, offeringsSection, pillars, servicesPage } from '@/content/services';

export const metadata: Metadata = {
  title: 'خدماتنا',
  description:
    'عشر خدمات تحت أربعة محاور: الاستشارات العقارية، الهندسة والتصميم، إدارة التنفيذ والإشراف، وفحص وتقييم العقار.'
};

export default function ServicesPage() {
  return (
    <>
      <PageHero eyebrow={servicesPage.eyebrow} title={servicesPage.title} intro={servicesPage.intro} />

      {/* Quick index of the ten services. */}
      <section aria-labelledby="services-index-title" className="border-b border-line bg-ivory-deep/45">
        <div className="shell py-10 lg:py-14">
          <h2 id="services-index-title" className="text-[1.25rem] font-semibold">
            الخدمات العشر باختصار
          </h2>
          <ol className="mt-6 grid gap-x-10 sm:grid-cols-2">
            {offerings.map(item => (
              <li key={item.id} className="border-t border-line">
                <Link
                  href={`#${item.id}`}
                  className="group flex min-h-12 items-baseline gap-4 py-3 text-forest transition-colors hover:text-brass-deep"
                >
                  <span className="ltr w-7 flex-none text-sm font-medium text-brass-deep">{item.number}</span>
                  <span className="font-medium underline decoration-transparent underline-offset-4 transition-colors group-hover:decoration-brass">
                    {item.title}
                  </span>
                </Link>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {pillars.map((pillar, index) => {
        const Icon = pillarIcons[pillar.icon];
        const items = offeringsOf(pillar.slug);
        return (
          <section key={pillar.slug} aria-labelledby={`pillar-${pillar.slug}`} className="section border-b border-line">
            <div className="shell grid gap-12 lg:grid-cols-12 lg:gap-16">
              <div className={index % 2 ? 'lg:order-2 lg:col-span-5' : 'lg:col-span-5'}>
                <div className="lg:sticky lg:top-[calc(var(--header-h)+2.5rem)]">
                  <Reveal>
                    <p className="flex items-center gap-3 font-medium text-brass-deep">
                      <Icon className="size-9" />
                      <span className="ltr text-sm">{String(index + 1).padStart(2, '0')}</span>
                      {pillar.name}
                    </p>
                    <h2 id={`pillar-${pillar.slug}`} className="section-title mt-5 text-[clamp(1.625rem,1.2rem+1.8vw,2.625rem)]">
                      {pillar.title}
                    </h2>
                    <p className="lead mt-5">{pillar.text}</p>
                    <div className="mt-8 flex flex-wrap items-center gap-x-7 gap-y-3">
                      <ButtonLink href={pillar.cta.href} arrow>
                        {pillar.cta.label}
                      </ButtonLink>
                      <ButtonLink href={`/services/${pillar.slug}`} variant="ghost">
                        {servicesPage.pillarLink}
                      </ButtonLink>
                    </div>
                  </Reveal>
                  <Reveal wipe="up" className="mt-10 hidden lg:block">
                    <Image
                      src={pillar.image}
                      alt={pillar.imageAlt}
                      sizes="(min-width: 1024px) 38vw, 100vw"
                      placeholder="blur"
                      className="aspect-[4/3] w-full object-cover"
                    />
                  </Reveal>
                </div>
              </div>

              <div className="lg:col-span-7">
                <ul>
                  {items.map(item => (
                    <li key={item.id} id={item.id} className="scroll-mt-[calc(var(--header-h)+1.5rem)] border-t border-line last:border-b">
                      <Reveal distance={16} className="grid grid-cols-[2.75rem_1fr] gap-x-4 py-7 sm:grid-cols-[4.5rem_1fr] sm:gap-x-6 lg:py-9">
                        <span className="ltr text-xl font-medium text-brass-deep">{item.number}</span>
                        <div>
                          <h3 className="text-[1.25rem] font-semibold lg:text-[1.5rem]">{item.title}</h3>
                          <p className="mt-2.5 max-w-[60ch] text-ink-soft">{item.text}</p>
                        </div>
                      </Reveal>
                    </li>
                  ))}
                </ul>
                <Reveal className="mt-10">
                  <h3 className="text-[0.9375rem] font-medium text-brass-deep">يشمل هذا المحور</h3>
                  <ul className="mt-3 flex flex-wrap gap-2">
                    {pillar.includes.map(item => (
                      <li key={item} className="rounded-full border border-line px-4 py-1.5 text-[0.9375rem] text-ink-soft">
                        {item}
                      </li>
                    ))}
                  </ul>
                </Reveal>
              </div>
            </div>
          </section>
        );
      })}

      <CtaBand title={contactCta.title} text={contactCta.text} primary={offeringsSection.cta} secondary={{ label: 'تصفح المشاريع', href: '/projects' }} />
    </>
  );
}
