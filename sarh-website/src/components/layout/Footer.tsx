import Link from 'next/link';
import { contactPage } from '@/content/contact';
import { footer } from '@/content/home';
import { isPreview, site, whatsappHref } from '@/content/site';
import ShinyText from '@/components/react-bits/ShinyText';
import MotionToggle from './MotionToggle';

const linkClass =
  'inline-flex min-h-11 items-center text-ivory/80 underline-offset-4 transition-colors hover:text-ivory hover:underline';

export default function Footer() {
  const { phone, email, address, hours } = site.contact;
  const whatsapp = whatsappHref();
  const hasContact = Boolean(phone || email || address || hours || whatsapp || site.social.length);
  const year = new Date().getFullYear();

  return (
    <footer className="on-dark bg-forest text-ivory">
      <div className="shell grid gap-12 py-16 md:grid-cols-2 lg:grid-cols-[1.4fr_0.8fr_1fr_1fr] lg:gap-10 lg:py-20">
        <div className="max-w-md">
          <p className="text-[2.75rem] font-semibold leading-none">
            {/* React Bits ShinyText: a brass sheen that crosses the wordmark on hover. Text is never split. */}
            <ShinyText text={site.name} color="#b69a65" shineColor="#f4f0e8" trigger="hover" speed={1.6} shineWidth={45} />
          </p>
          <p className="mt-5 text-[1.0625rem] font-medium leading-relaxed">{site.legalName}</p>
          <p className="mt-3 text-ivory/75">{footer.description}</p>
        </div>

        <nav aria-label={footer.quickLinksTitle}>
          <h2 className="text-base font-medium text-brass-light">{footer.quickLinksTitle}</h2>
          <ul className="mt-3">
            {footer.quickLinks.map(item => (
              <li key={item.href}>
                <Link href={item.href} className={linkClass}>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label={footer.servicesTitle}>
          <h2 className="text-base font-medium text-brass-light">{footer.servicesTitle}</h2>
          <ul className="mt-3">
            {footer.services.map(item => (
              <li key={item.href}>
                <Link href={item.href} className={linkClass}>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <h2 className="text-base font-medium text-brass-light">{footer.contactTitle}</h2>
          {hasContact ? (
            <ul className="mt-3 space-y-1">
              {phone ? (
                <li>
                  <span className="sr-only">{contactPage.labels.phone}: </span>
                  <a href={`tel:${phone.replace(/[^\d+]/g, '')}`} className={linkClass}>
                    <span className="ltr">{phone}</span>
                  </a>
                </li>
              ) : null}
              {whatsapp ? (
                <li>
                  <a href={whatsapp} target="_blank" rel="noopener noreferrer" className={linkClass}>
                    {contactPage.labels.whatsapp}
                  </a>
                </li>
              ) : null}
              {email ? (
                <li>
                  <span className="sr-only">{contactPage.labels.email}: </span>
                  <a href={`mailto:${email}`} className={linkClass}>
                    <span className="ltr">{email}</span>
                  </a>
                </li>
              ) : null}
              {address ? <li className="py-2 text-ivory/80">{address}</li> : null}
              {hours ? <li className="py-2 text-ivory/80">{hours}</li> : null}
              {site.social.map(item => (
                <li key={item.href}>
                  <a href={item.href} target="_blank" rel="noopener noreferrer" className={linkClass}>
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          ) : isPreview ? (
            <p className="mt-4 text-[0.9375rem] leading-relaxed text-ivory/70">{contactPage.missingNotice}</p>
          ) : null}
          <Link href="/contact" className={`${linkClass} mt-2 text-ivory underline`}>
            نموذج طلب الاستشارة
          </Link>
        </div>
      </div>

      <div className="border-t border-line-dark">
        <div className="shell flex flex-col gap-x-8 gap-y-2 py-5 text-[0.9375rem] text-ivory/75 md:flex-row md:items-center md:justify-between">
          <p>
            © {year} {footer.rights}
          </p>
          <div className="flex flex-wrap items-center gap-x-8 gap-y-1">
            <Link href="/privacy" className={linkClass}>
              سياسة الخصوصية
            </Link>
            <MotionToggle />
          </div>
        </div>
      </div>
    </footer>
  );
}
