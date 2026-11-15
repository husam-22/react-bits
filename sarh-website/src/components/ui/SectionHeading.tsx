import type { ElementType, ReactNode } from 'react';
import { cn } from '@/lib/cn';
import Reveal from './Reveal';

interface SectionHeadingProps {
  eyebrow?: string;
  /** Each entry is one authored line. Lines are revealed one after another; Arabic letters are never split. */
  lines: readonly string[];
  as?: ElementType;
  id?: string;
  className?: string;
  titleClassName?: string;
  children?: ReactNode;
}

/** Eyebrow + multi-line title (+ optional intro). The title is revealed line by line. */
export default function SectionHeading({
  eyebrow,
  lines,
  as: Tag = 'h2',
  id,
  className,
  titleClassName,
  children
}: SectionHeadingProps) {
  return (
    <div className={cn('flex flex-col items-start gap-5', className)}>
      {eyebrow ? (
        <Reveal>
          <p className="eyebrow">{eyebrow}</p>
        </Reveal>
      ) : null}
      <Tag id={id} className={cn('section-title', titleClassName)}>
        <Reveal as="span" stagger>
          {lines.map(line => (
            <span key={line} className="block">
              {line}
            </span>
          ))}
        </Reveal>
      </Tag>
      {children}
    </div>
  );
}
