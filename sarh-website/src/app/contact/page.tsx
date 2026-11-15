import type { Metadata } from 'next';
import ContactForm, { type ReturnStatus } from '@/components/contact/ContactForm';
import { ButtonLink } from '@/components/ui/Button';
import Notice from '@/components/ui/Notice';
import PageHero from '@/components/ui/PageHero';
import { contactPage, form, requestOptions, serviceOptions } from '@/content/contact';
import { contactCta } from '@/content/home';
import { isPreview, site, whatsappHref } from '@/content/site';
import { isContactConnected } from '@/lib/contact-delivery';

export const metadata: Metadata = {
  title: 'تواصل معنا',
  description: 'اطلب استشارة عقارية أو هندسية، أو زيارة لموقع أرضك أو مشروعك، عبر نموذج التواصل مع مؤسسة صَرْح.'
};

interface Props {
  searchParams: Promise<{ service?: string | string[]; request?: string | string[]; status?: string | string[] }>;
}

const first = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value);
const STATUSES: ReturnStatus[] = ['sent', 'invalid', 'rate', 'not-connected', 'failed'];

/**
 * Rendered per request: ?service= and ?request= pre-select the matching options on the server (so links from
 * service pages work on first paint and without JavaScript), and the connection state of the form is always
 * the live one.
 */
export default async function ContactPage({ searchParams }: Props) {
  const query = await searchParams;
  const service = serviceOptions.find(option => option.value === first(query.service))?.value;
  const request = requestOptions.find(option => option.value === first(query.request))?.value;
  const status = STATUSES.find(item => item === first(query.status));

  const { phone, email, address, hours } = site.contact;
  const whatsapp = whatsappHref(contactCta.whatsappMessage);
  const details = [
    phone ? { label: contactPage.labels.phone, value: phone, href: `tel:${phone.replace(/[^\d+]/g, '')}`, ltr: true } : null,
    whatsapp && site.contact.whatsapp
      ? { label: contactPage.labels.whatsapp, value: `+${site.contact.whatsapp}`, href: whatsapp, ltr: true }
      : null,
    email ? { label: contactPage.labels.email, value: email, href: `mailto:${email}`, ltr: true } : null,
    address ? { label: contactPage.labels.address, value: address, href: null, ltr: false } : null,
    hours ? { label: contactPage.labels.hours, value: hours, href: null, ltr: false } : null
  ].filter(item => item !== null);

  return (
    <>
      <PageHero eyebrow={contactPage.eyebrow} title={contactPage.title} intro={contactCta.text} />

      <section className="section">
        <div className="shell grid gap-14 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-7">
            <h2 className="mb-7 text-[1.5rem] font-semibold lg:text-[1.75rem]">{form.title}</h2>
            <ContactForm
              // Remount when the pre-selection in the address changes (client-side navigation between links).
              key={`${service ?? ''}-${request ?? ''}-${status ?? ''}`}
              connected={isContactConnected()}
              showConnectionNotice={isPreview}
              initialService={service}
              initialRequest={request}
              returnStatus={status}
            />
          </div>

          <aside className="lg:col-span-4 lg:col-start-9" aria-labelledby="details-title">
            <div className="lg:sticky lg:top-[calc(var(--header-h)+2.5rem)]">
              <h2 id="details-title" className="text-[1.5rem] font-semibold lg:text-[1.75rem]">
                {contactPage.detailsTitle}
              </h2>
              <p className="mt-3 font-medium text-forest">{site.legalName}</p>

              {details.length ? (
                <dl className="mt-6">
                  {details.map(item => (
                    <div key={item.label} className="border-t border-line py-4 last:border-b">
                      <dt className="text-sm text-ink-soft">{item.label}</dt>
                      <dd className="mt-1 text-[1.0625rem] font-medium text-forest">
                        {item.href ? (
                          <a
                            href={item.href}
                            className="inline-flex min-h-11 items-center underline decoration-line underline-offset-4 hover:decoration-brass"
                            {...(item.href.startsWith('http') ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                          >
                            <span className={item.ltr ? 'ltr' : undefined}>{item.value}</span>
                          </a>
                        ) : (
                          item.value
                        )}
                      </dd>
                    </div>
                  ))}
                </dl>
              ) : null}

              {site.social.length ? (
                <div className="mt-6">
                  <h3 className="text-sm text-ink-soft">{contactPage.labels.social}</h3>
                  <ul className="mt-2 flex flex-wrap gap-x-6">
                    {site.social.map(item => (
                      <li key={item.href}>
                        <a
                          href={item.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex min-h-11 items-center font-medium text-forest underline decoration-line underline-offset-4 hover:decoration-brass"
                        >
                          {item.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}

              {/* Missing official details are never replaced by invented ones. */}
              {isPreview && details.length < 5 ? <Notice className="mt-6">{contactPage.missingNotice}</Notice> : null}

              {whatsapp ? (
                <ButtonLink href={whatsapp} variant="outline" arrow className="mt-8">
                  {contactCta.whatsappLabel}
                </ButtonLink>
              ) : null}
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
