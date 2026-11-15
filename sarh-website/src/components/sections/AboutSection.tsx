import Image from 'next/image';
import aboutImage from '@/assets/images/about-facade.jpg';
import ScrollReveal from '@/components/react-bits/ScrollReveal';
import { ButtonLink } from '@/components/ui/Button';
import Reveal from '@/components/ui/Reveal';
import SectionHeading from '@/components/ui/SectionHeading';
import { about } from '@/content/home';

/** Section 3: who we are. Text beside one large architectural image. */
export default function AboutSection() {
  return (
    <section aria-labelledby="about-title" className="section">
      <div className="shell grid items-center gap-12 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-6 xl:col-span-5">
          <SectionHeading eyebrow={about.eyebrow} lines={about.titleLines} id="about-title" />

          {/* React Bits ScrollReveal: the paragraph gains its ink word by word as it is read.
              It splits on spaces only, so every Arabic word keeps its joined letter shapes. */}
          <ScrollReveal
            as="p"
            splitBy="words"
            enableBlur={false}
            baseOpacity={0.28}
            baseRotation={0}
            containerClassName="mt-7"
            textClassName="text-[1.125rem] leading-[1.9] text-ink lg:text-[1.25rem]"
            wordAnimationEnd="center center"
          >
            {about.paragraphs[0]}
          </ScrollReveal>

          <Reveal className="mt-5">
            <p className="lead">{about.paragraphs[1]}</p>
          </Reveal>

          {/* Guiding phrases instead of achievement figures: no numbers are invented. */}
          <Reveal stagger className="mt-9 grid gap-x-6 gap-y-3 border-t border-line pt-7 sm:grid-cols-3">
            {about.principles.map(item => (
              <p key={item} className="flex items-center gap-3 font-medium text-forest">
                <span aria-hidden="true" className="h-px w-6 flex-none bg-brass" />
                {item}
              </p>
            ))}
          </Reveal>

          <Reveal className="mt-9">
            <ButtonLink href={about.cta.href} variant="outline" arrow>
              {about.cta.label}
            </ButtonLink>
          </Reveal>
        </div>

        <div className="lg:col-span-6 xl:col-span-7">
          {/* Mask reveal + 24px rise for the large image. */}
          <Reveal wipe="up" className="relative">
            <Image
              src={aboutImage}
              alt={about.imageAlt}
              sizes="(min-width: 1024px) 54vw, 100vw"
              placeholder="blur"
              className="aspect-[4/5] w-full object-cover sm:aspect-[5/4] lg:aspect-[6/5]"
            />
          </Reveal>
          <p className="mt-3 text-sm text-ink-soft">تصور معماري توضيحي</p>
        </div>
      </div>
    </section>
  );
}
