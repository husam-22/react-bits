import type { Metadata } from 'next';
import Image from 'next/image';
import interiorImage from '@/assets/images/interior-concept.jpg';
import aboutImage from '@/assets/images/about-facade.jpg';
import CtaBand from '@/components/sections/CtaBand';
import PageHero from '@/components/ui/PageHero';
import Reveal from '@/components/ui/Reveal';
import SectionHeading from '@/components/ui/SectionHeading';
import { about, contactCta, process, why } from '@/content/home';

export const metadata: Metadata = {
  title: 'من نحن',
  description:
    'مؤسسة صَرْح: كيان متخصص يجمع المستشار العقاري والمهندس المعماري وخبير التنفيذ. تعرّف على رؤيتنا ورسالتنا ومنهجية عملنا.'
};

export default function AboutPage() {
  return (
    <>
      <PageHero eyebrow="من نحن" title={about.titleLines.join(' ')} intro={about.paragraphs[0]} />

      <section aria-labelledby="partner-title" className="section">
        <div className="shell grid items-center gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-7">
            <Reveal wipe="up">
              <Image
                src={aboutImage}
                alt={about.imageAlt}
                sizes="(min-width: 1024px) 54vw, 100vw"
                placeholder="blur"
                preload
                className="aspect-[5/4] w-full object-cover"
              />
            </Reveal>
            <p className="mt-3 text-sm text-ink-soft">تصور معماري توضيحي</p>
          </div>
          <div className="lg:col-span-5">
            <Reveal>
              <h2 id="partner-title" className="section-title text-[clamp(1.5rem,1.1rem+1.6vw,2.375rem)]">
                شريك استراتيجي من الأرض إلى المفتاح
              </h2>
              <p className="lead mt-5">{about.paragraphs[1]}</p>
            </Reveal>
            <Reveal stagger className="mt-8">
              {about.principles.map(item => (
                <p key={item} className="flex items-center gap-3 border-t border-line py-4 font-medium text-forest last:border-b">
                  <span aria-hidden="true" className="h-px w-6 flex-none bg-brass" />
                  {item}
                </p>
              ))}
            </Reveal>
          </div>
        </div>
      </section>

      <section aria-label="الرؤية والرسالة" className="on-dark bg-forest text-ivory">
        <Reveal stagger className="shell grid py-6 md:grid-cols-2 md:py-0">
          {[about.vision, about.mission].map((item, index) => (
            <div key={item.title} className={index ? 'border-t border-ivory/15 py-12 md:border-s md:border-t-0 md:py-24 md:ps-14' : 'py-12 md:py-24 md:pe-14'}>
              <h2 className="eyebrow text-base">{item.title}</h2>
              <p className="mt-6 text-[1.375rem] font-medium leading-[1.7] lg:text-[1.75rem] lg:leading-[1.6]">{item.text}</p>
            </div>
          ))}
        </Reveal>
      </section>

      <section aria-labelledby="method-title" className="section">
        <div className="shell">
          <SectionHeading eyebrow={process.eyebrow} lines={process.titleLines} id="method-title" />
          <Reveal stagger className="mt-12 grid gap-x-10 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
            {process.steps.map(step => (
              <div key={step.number} className="border-t border-brass pt-6">
                <p className="ltr text-[2.5rem] font-medium leading-none text-brass-deep">{step.number}</p>
                <h3 className="mt-4 text-[1.3125rem] font-semibold">{step.title}</h3>
                <p className="mt-2.5 text-ink-soft">{step.text}</p>
              </div>
            ))}
          </Reveal>
        </div>
      </section>

      <section aria-labelledby="values-title" className="section border-t border-line bg-ivory-deep/45">
        <div className="shell grid gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-5">
            <SectionHeading eyebrow={why.eyebrow} lines={why.titleLines} id="values-title" />
            <Reveal wipe="up" className="mt-10 hidden lg:block">
              <Image
                src={interiorImage}
                alt="تصور لفراغ معيشة داخلي بإضاءة طبيعية وخامات حجرية وخشبية هادئة"
                sizes="38vw"
                placeholder="blur"
                className="aspect-[4/3] w-full object-cover"
              />
            </Reveal>
          </div>
          <Reveal stagger className="lg:col-span-7">
            {why.items.map((item, index) => (
              <div key={item.title} className="grid grid-cols-[2.75rem_1fr] gap-x-4 border-t border-line py-7 last:border-b sm:grid-cols-[4.5rem_1fr] sm:gap-x-6">
                <span className="ltr text-xl font-medium text-brass-deep">{String(index + 1).padStart(2, '0')}</span>
                <div>
                  <h3 className="text-[1.25rem] font-semibold lg:text-[1.4375rem]">{item.title}</h3>
                  <p className="mt-2.5 max-w-[58ch] text-ink-soft">{item.text}</p>
                </div>
              </div>
            ))}
          </Reveal>
        </div>
      </section>

      <CtaBand
        title={contactCta.title}
        text={contactCta.text}
        primary={{ label: 'ابدأ استشارتك الآن', href: '/contact' }}
        secondary={{ label: 'استعرض خدماتنا', href: '/services' }}
      />
    </>
  );
}
