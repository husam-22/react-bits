'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { headerCta, mainNav } from '@/content/site';
import { cn } from '@/lib/cn';
import { ButtonLink } from '@/components/ui/Button';
import { CloseIcon, MenuIcon } from '@/components/ui/icons';
import Wordmark from './Wordmark';

const isActive = (pathname: string, href: string) => (href === '/' ? pathname === '/' : pathname.startsWith(href));

export default function Header() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      setScrolled(window.scrollY > 12);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(frame);
    };
  }, []);

  // The native <dialog> gives the mobile menu a focus trap, Escape to close, and returns focus to this button.
  const openMenu = () => {
    dialogRef.current?.showModal();
    setOpen(true);
  };
  const closeMenu = () => dialogRef.current?.close();

  return (
    <header
      data-scrolled={scrolled || undefined}
      className="fixed inset-x-0 top-0 z-50 h-[var(--header-h)] border-b border-transparent transition-[background-color,border-color] duration-300 data-[scrolled]:border-line data-[scrolled]:bg-ivory/90 data-[scrolled]:backdrop-blur-md"
    >
      <div className="shell flex h-full items-center justify-between gap-6">
        <Wordmark />

        <nav aria-label="القائمة الرئيسية" className="hidden lg:block">
          <ul className="flex items-center gap-1 xl:gap-3">
            {mainNav.map(item => {
              const active = isActive(pathname, item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={active ? 'page' : undefined}
                    className="group relative inline-flex min-h-11 items-center px-3.5 text-[1.0625rem] font-medium text-forest/80 transition-colors duration-200 hover:text-forest aria-[current=page]:text-forest"
                  >
                    {item.label}
                    <span
                      aria-hidden="true"
                      className="absolute inset-x-3.5 bottom-1 h-px origin-right scale-x-0 bg-brass transition-transform duration-300 ease-out group-hover:scale-x-100 group-aria-[current=page]:scale-x-100"
                    />
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="flex items-center gap-3">
          <ButtonLink href={headerCta.href} className="hidden min-h-11 px-5 text-[0.9375rem] sm:inline-flex">
            {headerCta.label}
          </ButtonLink>
          <button
            type="button"
            onClick={openMenu}
            aria-label="فتح القائمة"
            aria-haspopup="dialog"
            aria-expanded={open}
            aria-controls="mobile-menu"
            className="inline-flex size-12 items-center justify-center rounded-[3px] text-forest transition-colors hover:bg-forest/5 lg:hidden"
          >
            <MenuIcon className="size-6" />
          </button>
        </div>
      </div>

      <dialog
        id="mobile-menu"
        ref={dialogRef}
        aria-label="القائمة الرئيسية"
        onClose={() => setOpen(false)}
        className="mobile-menu fixed inset-0 m-0 h-dvh max-h-none w-full max-w-none overflow-y-auto bg-ivory p-0 text-ink lg:hidden"
      >
        <div className="shell flex min-h-full flex-col pb-10">
          <div className="flex h-[var(--header-h)] flex-none items-center justify-between">
            <Wordmark onNavigate={closeMenu} />
            <button
              type="button"
              onClick={closeMenu}
              aria-label="إغلاق القائمة"
              autoFocus
              className="inline-flex size-12 items-center justify-center rounded-[3px] text-forest transition-colors hover:bg-forest/5"
            >
              <CloseIcon className="size-6" />
            </button>
          </div>

          <nav aria-label="القائمة الرئيسية" className="mt-6">
            <ul className="border-t border-line">
              {mainNav.map(item => (
                <li key={item.href} className="border-b border-line">
                  <Link
                    href={item.href}
                    onClick={closeMenu}
                    aria-current={isActive(pathname, item.href) ? 'page' : undefined}
                    className={cn(
                      'flex min-h-16 items-center justify-between text-2xl font-medium text-forest',
                      'aria-[current=page]:text-brass-deep'
                    )}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <ButtonLink href={headerCta.href} onClick={closeMenu} className="mt-8 w-full">
            {headerCta.label}
          </ButtonLink>
        </div>
      </dialog>
    </header>
  );
}
