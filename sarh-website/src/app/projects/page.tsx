import type { Metadata } from 'next';
import Link from 'next/link';
import { chipClass } from '@/components/projects/chip';
import ProjectGrid from '@/components/projects/ProjectGrid';
import CtaBand from '@/components/sections/CtaBand';
import { ButtonLink } from '@/components/ui/Button';
import Notice from '@/components/ui/Notice';
import PageHero from '@/components/ui/PageHero';
import { CloseIcon } from '@/components/ui/icons';
import { categories, hasDemoProjects, projects, projectsSection, scopeLabels, type CategorySlug, type ProjectScope } from '@/content/projects';

export const metadata: Metadata = {
  title: 'مشاريعنا',
  description: 'معرض المشاريع مصنفاً: فلل حديثة، مجمعات تجارية، تصميم داخلي، مبانٍ سكنية، ومشاريع تحت الإشراف.'
};

interface Props {
  searchParams: Promise<{ category?: string | string[]; scope?: string | string[] }>;
}

const first = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value);

/**
 * The gallery is filtered on the server from the address (?category=…&scope=…), so every filter state is a
 * real link: it can be shared, refreshed, opened in a new tab, and it works without JavaScript.
 */
export default async function ProjectsPage({ searchParams }: Props) {
  const query = await searchParams;
  const category = categories.find(item => item.slug === first(query.category))?.slug as CategorySlug | undefined;
  const scopeParam = first(query.scope);
  const scope = scopeParam && scopeParam in scopeLabels ? (scopeParam as ProjectScope) : undefined;

  const visible = projects
    .filter(project => (category ? project.category === category : true))
    .filter(project => (scope ? project.scopes.includes(scope) : true))
    .sort((a, b) => Number(Boolean(b.featured)) - Number(Boolean(a.featured)));

  const href = (next: { category?: CategorySlug; scope?: ProjectScope }) => {
    const params = new URLSearchParams();
    if (next.category) params.set('category', next.category);
    if (next.scope) params.set('scope', next.scope);
    const search = params.toString();
    return search ? `/projects?${search}` : '/projects';
  };

  return (
    <>
      <PageHero eyebrow={projectsSection.eyebrow} title={projectsSection.title} intro={projectsSection.text} />

      <section aria-labelledby="gallery-title" className="section">
        <div className="shell">
          <h2 id="gallery-title" className="sr-only">
            معرض المشاريع
          </h2>

          <nav aria-label="تصنيفات المعرض" className="flex flex-wrap gap-2.5">
            <Link href={href({ scope })} scroll={false} aria-current={category ? undefined : 'true'} className={chipClass(!category)}>
              {projectsSection.allLabel}
            </Link>
            {categories.map(item => (
              <Link
                key={item.slug}
                href={href({ category: item.slug, scope })}
                scroll={false}
                aria-current={category === item.slug ? 'true' : undefined}
                className={chipClass(category === item.slug)}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {scope ? (
            <p className="mt-5 flex flex-wrap items-center gap-3 text-ink-soft">
              <span>
                معروض حسب النطاق: <strong className="font-medium text-forest">{scopeLabels[scope]}</strong>
              </span>
              <Link
                href={href({ category })}
                scroll={false}
                className="inline-flex min-h-11 items-center gap-1.5 underline decoration-line underline-offset-4 transition-colors hover:text-forest hover:decoration-brass"
              >
                <CloseIcon className="size-4" />
                إزالة هذا التحديد
              </Link>
            </p>
          ) : null}

          <p className="sr-only" role="status">
            {visible.length ? `عدد المشاريع المعروضة: ${visible.length}` : projectsSection.empty}
          </p>

          <div key={`${category ?? 'all'}-${scope ?? 'any'}`} className="swap-in mt-10 md:mt-14">
            {visible.length ? (
              <ProjectGrid projects={visible} headingLevel="h3" />
            ) : (
              <div className="flex flex-col items-start gap-5 border-y border-line py-12">
                <p className="lead">{projectsSection.empty}</p>
                <ButtonLink href="/projects" variant="outline" scroll={false}>
                  {projectsSection.emptyAction}
                </ButtonLink>
              </div>
            )}
          </div>

          {hasDemoProjects ? <Notice className="mt-14 max-w-3xl">{projectsSection.demoNotice}</Notice> : null}
        </div>
      </section>

      <CtaBand title={projectsSection.detail.ctaTitle} text={projectsSection.detail.ctaText} primary={projectsSection.detail.cta} />
    </>
  );
}
