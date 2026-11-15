import Link from 'next/link';
import type { ComponentProps, ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { ArrowForward } from './icons';

type Variant = 'primary' | 'outline' | 'outline-light' | 'ghost';

const BASE =
  'group/btn inline-flex min-h-12 items-center justify-center gap-3 rounded-[3px] px-6 py-2.5 text-center text-base font-medium leading-snug transition-[background-color,border-color,color,transform] duration-200 ease-out active:translate-y-px disabled:pointer-events-none disabled:opacity-60';

const VARIANTS: Record<Variant, string> = {
  // Dark text on brass: white on brass does not reach AA contrast.
  primary: 'bg-brass text-forest hover:bg-brass-light',
  outline: 'border border-forest/35 text-forest hover:border-forest hover:bg-forest hover:text-ivory',
  'outline-light': 'border border-ivory/40 text-ivory hover:border-ivory hover:bg-ivory hover:text-forest',
  ghost: 'min-h-11 px-0 text-forest underline decoration-brass decoration-1 underline-offset-8 hover:decoration-forest'
};

interface SharedProps {
  variant?: Variant;
  arrow?: boolean;
  className?: string;
  children: ReactNode;
}

const Arrow = () => (
  <ArrowForward className="size-5 flex-none transition-transform duration-200 ease-out group-hover/btn:-translate-x-1" />
);

type ButtonLinkProps = SharedProps & Omit<ComponentProps<typeof Link>, 'className' | 'children'>;

/** A link that looks like a button. External `href`s open in a new tab. */
export function ButtonLink({ variant = 'primary', arrow = false, className, children, href, ...rest }: ButtonLinkProps) {
  const classes = cn(BASE, VARIANTS[variant], className);
  if (typeof href === 'string' && /^https?:\/\//.test(href)) {
    return (
      <a href={href} className={classes} target="_blank" rel="noopener noreferrer">
        {children}
        {arrow ? <Arrow /> : null}
      </a>
    );
  }
  return (
    <Link href={href} className={classes} {...rest}>
      {children}
      {arrow ? <Arrow /> : null}
    </Link>
  );
}

type ButtonProps = SharedProps & Omit<ComponentProps<'button'>, 'className' | 'children'>;

export function Button({ variant = 'primary', arrow = false, className, children, type = 'button', ...rest }: ButtonProps) {
  return (
    <button type={type} className={cn(BASE, VARIANTS[variant], className)} {...rest}>
      {children}
      {arrow ? <Arrow /> : null}
    </button>
  );
}
