import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import CtaBand from '@/components/sections/CtaBand';
import { pillarIcons } from '@/components/services/pillar-icons';
import { ButtonLink } from '@/components/ui/Button';
import PageHero from '@/components/ui/PageHero';
import Reveal from '@/components/ui/Reveal';
import { ArrowBack, ArrowForward, CheckIcon } from '@/components/ui/icons';
import { contactCta, process } from '@/content/home';
import { offeringsOf, pillarBySlug, pillars, tabsSection } from '@/content/services';

interface Props {
  params: Promise<{ slug: string }>;
}

// Only the four known service pages exist; anything else is a 404.
export const dynamicParams = false;

export function generateStaticParams() {
  return pillars.map(pillar => ({ slug: pillar.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const pillar = pillarBySlug(slug);
  if (!pillar) return {};
  return { title: pillar.name, description: pillar.seoDescription };
}

export default async function ServicePage({ params }: Props) {
  const { slug } = await params;
  const pillar = pillarBySlug(slug);
  if (!pillar) notFound();

  const Icon = pillarIcons[pillar.icon];
  const items = offeringsOf(pillar.slug);
  const consultHref = `/contact?service=${pillar.formValue}`;
  const consultsDirectly = pillar.cta.href === consultHref;
  const index = pillars.findIndex(item => item.slug === pillar.slug);
  const previous = pillars[(index - 1 + pillars.length) % pillars.length];
  const next = pillars[(index + 1) % pillars.length];

  return (
    <>
      <PageHero eyebrow={pillar.name} title={pillar.title} intro={pillar.text}>
        <div className="flex flex-wrap items-center gap-x-7 gap-y-3">
          {/* The consultation button always opens the form with this service already selected. */}
          <ButtonLink href={consultHref} arrow>
            {consultsDirectly ? pillar.cta.label : 'ابدأ استشارتك الآن'}
          </ButtonLink>
          {consultsDirectly ? null : (
            <ButtonLink href={pillar.cta.href} variant="outline">
              {pillar.cta.label}
            </ButtonLink>
          )}
          <Link
            href="/services"
            className="inline-flex min-h-11 items-center gap-2 text-ink-soft underline decoration-line underline-offset-4 transition-colors hover:text-forest hover:decoration-brass"
          >
            <ArrowBack className="size-5" />
            كل الخدمات
          </Link>
        </div>
      </PageHero>

      <section aria-labelledby="scope-title" className="section">
        <div className="shell grid items-start gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-6">
            <Reveal wipe="up">
              <Image
                src={pillar.image}
                alt={pillar.imageAlt}
                sizes="(min-width: 1024px) 46vw, 100vw"
                placeholder="blur"
                preload
                className="aspect-[4/3] w-full object-cover"
              />
            </Reveal>
            <p className="mt-3 text-sm text-ink-soft">تصور توضيحي</p>
          </div>
          <div className="lg:col-span-6">
            <Reveal>
              <p className="flex items-center gap-3 font-medium text-brass-deep">
                <Icon className="size-9" />
                {tabsSection.includesLabel}
              </p>
              <h2 id="scope-title" className="section-title mt-4 text-[clamp(1.5rem,1.1rem+1.6vw,2.375rem)]">
                ما يشمله محور {pillar.name}
              </h2>
            </Reveal>
            <Reveal stagger className="mt-7">
              {pillar.includes.map(item => (
                <p key={item} className="flex items-start gap-3 border-t border-line py-4 text-[1.0625rem] last:border-b">
                  <CheckIcon className="mt-1.5 size-4 flex-none text-brass-deep" />
                  {item}
                </p>
              ))}
            </Reveal>
          </div>
        </div>
      </section>

      <section aria-labelledby="sub-services-title" className="section border-y border-line bg-ivory-deep/45">
        <div className="shell grid gap-10 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-4">
            <Reveal>
              <p className="eyebrow">خدمات هذا المحور</p>
              <h2 id="sub-services-title" className="section-title mt-5 text-[clamp(1.5rem,1.1rem+1.6vw,2.375rem)]">
                الخدمات التي نقدمها ضمن {pillar.name}
              </h2>
            </Reveal>
          </div>
          <ul className="lg:col-span-8">
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
        </div>
      </section>

      <section aria-labelledby="method-title" className="section">
        <div className="shell">
          <Reveal>
            <p className="eyebrow">{process.eyebrow}</p>
            <h2 id="method-title" className="section-title mt-5 text-[clamp(1.5rem,1.1rem+1.6vw,2.375rem)]">
              {process.titleLines.join(' ')}
            </h2>
          </Reveal>
          <Reveal stagger className="mt-10 grid gap-x-10 gap-y-8 sm:grid-cols-2 lg:grid-cols-4">
            {process.steps.map(step => (
              <div key={step.number} className="border-t border-brass pt-5">
                <p className="ltr text-2xl font-medium text-brass-deep">{step.number}</p>
                <h3 className="mt-3 text-[1.1875rem] font-semibold">{step.title}</h3>
                <p className="mt-2 text-ink-soft">{step.text}</p>
              </div>
            ))}
          </Reveal>
        </div>
      </section>

      <nav aria-label="محاور الخدمة الأخرى" className="border-t border-line">
        <div className="shell grid sm:grid-cols-2">
          <Link href={`/services/${previous.slug}`} className="group flex min-h-24 flex-col justify-center gap-1 py-6 sm:pe-8">
            <span className="flex items-center gap-2 text-sm text-ink-soft">
              <ArrowBack className="size-5 transition-transform duration-300 group-hover:translate-x-1" />
              المحور السابق
            </span>
            <span className="text-[1.25rem] font-semibold text-forest">{previous.name}</span>
          </Link>
          <Link
            href={`/services/${next.slug}`}
            className="group flex min-h-24 flex-col items-end justify-center gap-1 border-t border-line py-6 sm:border-s sm:border-t-0 sm:ps-8"
          >
            <span className="flex items-center gap-2 text-sm text-ink-soft">
              المحور التالي
              <ArrowForward className="size-5 transition-transform duration-300 group-hover:-translate-x-1" />
            </span>
            <span className="text-[1.25rem] font-semibold text-forest">{next.name}</span>
          </Link>
        </div>
      </nav>

      <CtaBand
        title={contactCta.title}
        text="حدّثنا عن التفاصيل، ودع مهندسينا يضعون لك الخطة المناسبة."
        primary={{ label: 'ابدأ استشارتك الآن', href: consultHref }}
        secondary={{ label: 'تصفح المشاريع', href: '/projects' }}
      />
    </>
  );
}
