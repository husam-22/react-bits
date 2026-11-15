import type { Metadata } from 'next';
import Link from 'next/link';
import { ButtonLink } from '@/components/ui/Button';
import { mainNav } from '@/content/site';

export const metadata: Metadata = { title: 'الصفحة غير موجودة' };

export default function NotFound() {
  return (
    <section className="shell flex min-h-[80vh] min-h-[80svh] flex-col items-start justify-center pb-20 pt-[calc(var(--header-h)+3rem)]">
      <p className="eyebrow">
        <span className="ltr">404</span>
      </p>
      <h1 className="mt-5 text-[clamp(2rem,1.3rem+3.2vw,4rem)] font-semibold leading-[1.22]">هذه الصفحة غير موجودة.</h1>
      <p className="lead mt-5">ربما تغيّر عنوانها أو كُتب الرابط بطريقة غير صحيحة. يمكنك العودة إلى الرئيسية أو متابعة التصفح من الروابط التالية.</p>
      <div className="mt-8 flex flex-wrap gap-3">
        <ButtonLink href="/" arrow>
          العودة إلى الرئيسية
        </ButtonLink>
        <ButtonLink href="/contact" variant="outline">
          تواصل معنا
        </ButtonLink>
      </div>
      <nav aria-label="روابط الموقع" className="mt-12 border-t border-line pt-6">
        <ul className="flex flex-wrap gap-x-8">
          {mainNav
            .filter(item => item.href !== '/' && item.href !== '/contact')
            .map(item => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="inline-flex min-h-11 items-center font-medium text-forest underline decoration-brass underline-offset-8 hover:decoration-forest"
                >
                  {item.label}
                </Link>
              </li>
            ))}
        </ul>
      </nav>
    </section>
  );
}
