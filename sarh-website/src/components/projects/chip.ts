import { cn } from '@/lib/cn';

/** Filter chip look, shared by the home gallery (buttons) and the projects page (links). */
export const chipClass = (active: boolean) =>
  cn(
    'inline-flex min-h-11 items-center rounded-full border px-5 text-[0.9375rem] font-medium transition-colors duration-200',
    active ? 'border-forest bg-forest text-ivory' : 'border-line text-ink-soft hover:border-forest/50 hover:text-forest'
  );
