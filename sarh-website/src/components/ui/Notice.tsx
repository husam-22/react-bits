import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { InfoIcon } from './icons';

interface NoticeProps {
  title?: string;
  children: ReactNode;
  className?: string;
  /** `dark` for use on the forest background. */
  tone?: 'light' | 'dark';
}

/** A quiet information box: preview notices, demo-content labels, draft markers. */
export default function Notice({ title, children, className, tone = 'light' }: NoticeProps) {
  return (
    <div
      role="note"
      className={cn(
        'flex gap-3 rounded-[3px] border px-4 py-3.5 text-[0.9375rem] leading-relaxed',
        tone === 'light' ? 'border-line bg-ivory-deep/60 text-ink-soft' : 'border-ivory/20 bg-ivory/5 text-ivory/85',
        className
      )}
    >
      <InfoIcon className={cn('mt-1 size-5 flex-none', tone === 'light' ? 'text-brass-deep' : 'text-brass-light')} />
      <div>
        {title ? <p className={cn('font-medium', tone === 'light' ? 'text-forest' : 'text-ivory')}>{title}</p> : null}
        <div>{children}</div>
      </div>
    </div>
  );
}
