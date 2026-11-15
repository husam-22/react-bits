'use client';

import { useState } from 'react';
import { chipClass } from '@/components/projects/chip';
import ProjectGrid from '@/components/projects/ProjectGrid';
import { Button, ButtonLink } from '@/components/ui/Button';
import Notice from '@/components/ui/Notice';
import Reveal from '@/components/ui/Reveal';
import SectionHeading from '@/components/ui/SectionHeading';
import { categories, hasDemoProjects, projects, projectsSection, type CategorySlug } from '@/content/projects';

type Filter = CategorySlug | 'all';

/** Section 6: a featured project, then an irregular grid, with a working category filter. */
export default function ProjectsSection() {
  const [filter, setFilter] = useState<Filter>('all');

  // "All" puts the featured project first; a category shows its own projects in their listed order.
  const visible =
    filter === 'all'
      ? [...projects].sort((a, b) => Number(Boolean(b.featured)) - Number(Boolean(a.featured)))
      : projects.filter(project => project.category === filter);

  return (
    <section aria-labelledby="projects-title" className="section border-t border-line">
      <div className="shell">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <SectionHeading eyebrow={projectsSection.eyebrow} lines={[projectsSection.title]} id="projects-title">
            <Reveal>
              <p className="lead">{projectsSection.text}</p>
            </Reveal>
          </SectionHeading>
          <Reveal className="flex-none">
            <ButtonLink href={projectsSection.cta.href} variant="outline" arrow>
              {projectsSection.cta.label}
            </ButtonLink>
          </Reveal>
        </div>

        <div role="group" aria-label="تصنيفات المعرض" className="mt-10 flex flex-wrap gap-2.5">
          <button type="button" aria-pressed={filter === 'all'} onClick={() => setFilter('all')} className={chipClass(filter === 'all')}>
            {projectsSection.allLabel}
          </button>
          {categories.map(category => (
            <button
              key={category.slug}
              type="button"
              aria-pressed={filter === category.slug}
              onClick={() => setFilter(category.slug)}
              className={chipClass(filter === category.slug)}
            >
              {category.label}
            </button>
          ))}
        </div>

        {/* Announce the result of filtering to screen readers. */}
        <p className="sr-only" role="status">
          {visible.length ? `عدد المشاريع المعروضة: ${visible.length}` : projectsSection.empty}
        </p>

        <div key={filter} className="swap-in mt-10 md:mt-12">
          {visible.length ? (
            <ProjectGrid projects={visible} />
          ) : (
            <div className="flex flex-col items-start gap-5 border-y border-line py-12">
              <p className="lead">{projectsSection.empty}</p>
              <Button variant="outline" onClick={() => setFilter('all')}>
                {projectsSection.emptyAction}
              </Button>
            </div>
          )}
        </div>

        {hasDemoProjects ? <Notice className="mt-12 max-w-3xl">{projectsSection.demoNotice}</Notice> : null}
      </div>
    </section>
  );
}
