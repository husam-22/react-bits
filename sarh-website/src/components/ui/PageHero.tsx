import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

interface PageHeroProps {
  eyebrow?: string;
  title: string;
  intro?: string;
  children?: ReactNode;
  className?: string;
}

/** Opening block of an inner page: clears the fixed header and carries the page's single H1. */
export default function PageHero({ eyebrow, title, intro, children, className }: PageHeroProps) {
  return (
    <section className={cn('border-b border-line', className)}>
      <div className="shell pb-12 pt-[calc(var(--header-h)+3rem)] lg:pb-20 lg:pt-[calc(var(--header-h)+5.5rem)]">
        {eyebrow ? <p className="eyebrow hero-in">{eyebrow}</p> : null}
        <h1
          className="hero-in mt-5 max-w-[22ch] text-[clamp(2rem,1.3rem+3.2vw,4rem)] font-semibold leading-[1.22]"
          style={{ '--i': 1 } as React.CSSProperties}
        >
          {title}
        </h1>
        {intro ? (
          <p className="lead hero-in mt-6" style={{ '--i': 2 } as React.CSSProperties}>
            {intro}
          </p>
        ) : null}
        {children ? (
          <div className="hero-in mt-8" style={{ '--i': 3 } as React.CSSProperties}>
            {children}
          </div>
        ) : null}
      </div>
    </section>
  );
}
