import Image from 'next/image';
import Link from 'next/link';
import { ArrowForward } from '@/components/ui/icons';
import { categoryLabel, projectsSection, type Project } from '@/content/projects';
import { cn } from '@/lib/cn';

interface ProjectCardProps {
  project: Project;
  /** `featured` is the large lead card; `wide` and `tall` vary the rhythm of the grid. */
  shape?: 'featured' | 'wide' | 'tall';
  sizes: string;
  headingLevel?: 'h2' | 'h3';
  className?: string;
}

const RATIO = {
  featured: 'aspect-[4/3] md:aspect-[16/9] xl:aspect-[2/1]',
  wide: 'aspect-[4/3]',
  tall: 'aspect-[4/3] md:aspect-[4/4.6]'
} as const;

export default function ProjectCard({ project, shape = 'wide', sizes, headingLevel: Heading = 'h3', className }: ProjectCardProps) {
  const featured = shape === 'featured';
  return (
    <article className={cn('group relative', className)}>
      <div className={cn('zoom-frame relative bg-ivory-deep', RATIO[shape])}>
        <Image
          src={project.cover.src}
          alt={project.cover.alt}
          fill
          sizes={sizes}
          placeholder="blur"
          className="object-cover"
        />
        {project.demo ? (
          <p className="absolute start-3 top-3 rounded-[2px] bg-ivory/92 px-2.5 py-1 text-[0.8125rem] font-medium text-forest">
            {projectsSection.demoBadge}
          </p>
        ) : null}
      </div>
      <div className={cn('mt-4 flex items-start justify-between gap-6', featured && 'md:mt-6')}>
        <div>
          <p className="text-sm font-medium text-brass-deep">{categoryLabel(project.category)}</p>
          <Heading
            className={cn(
              'mt-1 font-semibold leading-snug',
              featured ? 'text-[1.5rem] md:text-[2rem]' : 'text-[1.25rem] md:text-[1.4375rem]'
            )}
          >
            <Link
              href={`/projects/${project.slug}`}
              className="outline-none after:absolute after:inset-0 after:content-[''] focus-visible:after:outline focus-visible:after:outline-2 focus-visible:after:outline-offset-2 focus-visible:after:outline-brass-deep"
            >
              {project.title}
            </Link>
          </Heading>
          <p className={cn('mt-2 text-ink-soft', featured ? 'max-w-[60ch]' : 'max-w-[46ch]')}>{project.summary}</p>
        </div>
        <ArrowForward
          aria-hidden="true"
          className="mt-7 size-6 flex-none text-brass-deep transition-transform duration-300 ease-out group-hover:-translate-x-1"
        />
      </div>
    </article>
  );
}
