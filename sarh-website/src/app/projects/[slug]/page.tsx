import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import CtaBand from '@/components/sections/CtaBand';
import Notice from '@/components/ui/Notice';
import Reveal from '@/components/ui/Reveal';
import { ArrowBack, ArrowForward, CheckIcon } from '@/components/ui/icons';
import { categoryLabel, projectBySlug, projects, projectsSection, scopeLabels } from '@/content/projects';

interface Props {
  params: Promise<{ slug: string }>;
}

export const dynamicParams = false;

export function generateStaticParams() {
  return projects.map(project => ({ slug: project.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const project = projectBySlug(slug);
  if (!project) return {};
  return {
    title: project.demo ? `${project.title} (${projectsSection.demoBadge})` : project.title,
    description: project.summary
  };
}

const { detail } = projectsSection;

/** Case-study template: overview, scope, challenge, approach, gallery and a call to action. */
export default async function ProjectPage({ params }: Props) {
  const { slug } = await params;
  const project = projectBySlug(slug);
  if (!project) notFound();

  const index = projects.findIndex(item => item.slug === project.slug);
  const next = projects[(index + 1) % projects.length];

  return (
    <>
      <section className="border-b border-line">
        <div className="shell pb-10 pt-[calc(var(--header-h)+2.5rem)] lg:pb-14 lg:pt-[calc(var(--header-h)+4rem)]">
          <Link
            href="/projects"
            className="hero-in inline-flex min-h-11 items-center gap-2 text-ink-soft underline decoration-line underline-offset-4 transition-colors hover:text-forest hover:decoration-brass"
          >
            <ArrowBack className="size-5" />
            {detail.back}
          </Link>
          <div className="mt-6 grid gap-8 lg:grid-cols-12 lg:items-end lg:gap-16">
            <div className="lg:col-span-7">
              <p className="hero-in flex flex-wrap items-center gap-x-4 gap-y-2 font-medium text-brass-deep" style={{ '--i': 1 } as React.CSSProperties}>
                <Link
                  href={`/projects?category=${project.category}`}
                  className="inline-flex min-h-11 items-center underline decoration-transparent underline-offset-4 hover:decoration-brass"
                >
                  {categoryLabel(project.category)}
                </Link>
                {project.demo ? (
                  <span className="rounded-[2px] border border-line px-2.5 py-0.5 text-[0.8125rem] text-forest">{projectsSection.demoBadge}</span>
                ) : null}
              </p>
              <h1
                className="hero-in mt-4 text-[clamp(2rem,1.3rem+3.2vw,4rem)] font-semibold leading-[1.22]"
                style={{ '--i': 2 } as React.CSSProperties}
              >
                {project.title}
              </h1>
            </div>
            <p className="lead hero-in lg:col-span-5" style={{ '--i': 3 } as React.CSSProperties}>
              {project.summary}
            </p>
          </div>
        </div>
      </section>

      <div className="shell pt-8 lg:pt-12">
        <Image
          src={project.cover.src}
          alt={project.cover.alt}
          sizes="(min-width: 1520px) 1440px, 92vw"
          placeholder="blur"
          preload
          className="hero-poster-in aspect-[4/3] w-full object-cover md:aspect-[16/9] xl:aspect-[2/1]"
        />
        {project.demo ? <Notice className="mt-6 max-w-3xl">{projectsSection.demoNotice}</Notice> : null}
      </div>

      <section aria-labelledby="overview-title" className="section">
        <div className="shell grid gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-7">
            <Reveal>
              <h2 id="overview-title" className="eyebrow">
                {detail.overview}
              </h2>
              <p className="mt-5 text-[1.1875rem] leading-[1.9] text-ink lg:text-[1.375rem]">{project.overview}</p>
            </Reveal>

            <Reveal stagger className="mt-12 grid gap-10 border-t border-line pt-10 sm:grid-cols-2">
              <div>
                <h2 className="text-[1.3125rem] font-semibold">{detail.challenge}</h2>
                <p className="mt-3 text-ink-soft">{project.challenge}</p>
              </div>
              <div>
                <h2 className="text-[1.3125rem] font-semibold">{detail.approach}</h2>
                <p className="mt-3 text-ink-soft">{project.approach}</p>
              </div>
            </Reveal>
          </div>

          <aside className="lg:col-span-4 lg:col-start-9" aria-labelledby="scope-title">
            <Reveal>
              <h2 id="scope-title" className="text-[1.3125rem] font-semibold">
                {detail.scope}
              </h2>
              <ul className="mt-4">
                {project.scopeItems.map(item => (
                  <li key={item} className="flex items-start gap-3 border-t border-line py-3.5 last:border-b">
                    <CheckIcon className="mt-1.5 size-4 flex-none text-brass-deep" />
                    {item}
                  </li>
                ))}
              </ul>
              <p className="mt-5 flex flex-wrap gap-2">
                {project.scopes.map(scope => (
                  <Link
                    key={scope}
                    href={`/projects?scope=${scope}`}
                    className="inline-flex min-h-11 items-center rounded-full border border-line px-4 text-[0.9375rem] text-ink-soft transition-colors hover:border-forest/50 hover:text-forest"
                  >
                    {scopeLabels[scope]}
                  </Link>
                ))}
              </p>
            </Reveal>
          </aside>
        </div>
      </section>

      {project.gallery.length ? (
        <section aria-labelledby="gallery-title" className="section border-t border-line bg-ivory-deep/45">
          <div className="shell">
            <h2 id="gallery-title" className="eyebrow">
              {detail.gallery}
            </h2>
            <div className="mt-8 grid gap-6 md:grid-cols-2 lg:gap-10">
              {project.gallery.map((image, position) => (
                <Reveal key={image.src.src} wipe="up" className={project.gallery.length % 2 === 1 && position === 0 ? 'md:col-span-2' : undefined}>
                  <figure>
                    <Image
                      src={image.src}
                      alt={image.alt}
                      sizes="(min-width: 768px) 46vw, 92vw"
                      placeholder="blur"
                      className="aspect-[4/3] w-full object-cover"
                    />
                    {project.demo ? <figcaption className="mt-3 text-sm text-ink-soft">{projectsSection.demoBadge}</figcaption> : null}
                  </figure>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <nav aria-label="المشروع التالي" className="border-t border-line">
        <div className="shell">
          <Link href={`/projects/${next.slug}`} className="group flex min-h-28 items-center justify-between gap-6 py-8">
            <span>
              <span className="block text-sm text-ink-soft">المشروع التالي</span>
              <span className="mt-1 block text-[1.5rem] font-semibold text-forest lg:text-[2rem]">{next.title}</span>
            </span>
            <ArrowForward className="size-8 flex-none text-brass-deep transition-transform duration-300 group-hover:-translate-x-2" />
          </Link>
        </div>
      </nav>

      <CtaBand title={detail.ctaTitle} text={detail.ctaText} primary={detail.cta} secondary={{ label: detail.back, href: '/projects' }} />
    </>
  );
}
