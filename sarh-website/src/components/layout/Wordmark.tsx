import Link from 'next/link';
import { cn } from '@/lib/cn';
import { site } from '@/content/site';

interface WordmarkProps {
  className?: string;
  onNavigate?: () => void;
}

/**
 * Temporary text wordmark «صَرْح». It is real, selectable text and will be replaced by the official logo
 * when the firm supplies one (docs/MISSING-DATA.md).
 */
export default function Wordmark({ className, onNavigate }: WordmarkProps) {
  return (
    <Link
      href="/"
      onClick={onNavigate}
      aria-label={`${site.name} — الصفحة الرئيسية`}
      className={cn(
        'relative inline-flex min-h-11 items-center text-[1.875rem] font-semibold leading-none text-forest lg:text-[2.125rem]',
        className
      )}
    >
      <span className="relative pb-2">
        {site.name}
        <span aria-hidden="true" className="absolute bottom-0 start-0 h-px w-7 bg-brass" />
      </span>
    </Link>
  );
}
