import type { Project } from '@/content/projects';
import { cn } from '@/lib/cn';
import ProjectCard from './ProjectCard';

interface ProjectGridProps {
  projects: Project[];
  /** Show the first project as a large lead card above the grid. */
  lead?: boolean;
  headingLevel?: 'h2' | 'h3';
}

/** Column spans that repeat every four cards: 7/5 then 5/7, so rows never look like a uniform table. */
const SPANS = ['md:col-span-7', 'md:col-span-5', 'md:col-span-5', 'md:col-span-7'] as const;
const SHAPES = ['wide', 'tall', 'tall', 'wide'] as const;

/** A lead project followed by an irregular grid. Purely presentational: filtering happens in the caller. */
export default function ProjectGrid({ projects, lead = true, headingLevel = 'h3' }: ProjectGridProps) {
  const [first, ...rest] = projects;
  const gridItems = lead ? rest : projects;

  return (
    <div className="grid gap-y-12 md:gap-y-16">
      {lead && first ? (
        <ProjectCard project={first} shape="featured" sizes="(min-width: 1520px) 1440px, 92vw" headingLevel={headingLevel} />
      ) : null}
      {gridItems.length ? (
        <div className="grid gap-x-8 gap-y-12 md:grid-cols-12 md:items-end md:gap-y-16 lg:gap-x-12">
          {gridItems.map((project, index) => {
            // A single trailing card takes the full row instead of leaving a hole.
            const alone = gridItems.length % 2 === 1 && index === gridItems.length - 1;
            return (
              <ProjectCard
                key={project.slug}
                project={project}
                shape={alone ? 'featured' : SHAPES[index % 4]}
                sizes={alone ? '(min-width: 1520px) 1440px, 92vw' : '(min-width: 768px) 55vw, 92vw'}
                headingLevel={headingLevel}
                className={cn(alone ? 'md:col-span-12' : SPANS[index % 4])}
              />
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
