/**
 * Central site settings.
 *
 * Every contact detail lives here (or in the matching NEXT_PUBLIC_* environment variable) and nowhere else.
 * A value that is not set yet stays `null`: the interface then hides that item instead of showing an invented
 * number, address or link. See docs/MISSING-DATA.md for what has to be supplied before launch.
 */

const value = (input: string | undefined): string | null => {
  const trimmed = input?.trim();
  return trimmed ? trimmed : null;
};

export type SiteMode = 'preview' | 'production';

export const site = {
  /** Temporary text wordmark, used until the official logo is supplied. */
  name: 'صَرْح',
  fullName: 'صَرْح للاستشارات العقارية والهندسية وإدارة البناء',
  legalName: 'مؤسسة صَرْح للاستشارات العقارية والهندسية وإدارة البناء',
  description: 'نحوّل المساحات والأراضي إلى مشاريع استثمارية ومبانٍ معمارية تنبض بالحياة والجودة.',

  /** Absolute origin of the published site (https://…). Unknown until the domain is chosen. */
  url: value(process.env.NEXT_PUBLIC_SITE_URL),

  /**
   * `preview` keeps the demo notices visible and asks search engines not to index the site.
   * Switch to `production` only when the launch data in docs/MISSING-DATA.md is complete.
   */
  mode: (process.env.NEXT_PUBLIC_SITE_MODE === 'production' ? 'production' : 'preview') as SiteMode,

  contact: {
    /** Display phone number in international format (starts with + and the country code). */
    phone: value(process.env.NEXT_PUBLIC_CONTACT_PHONE),
    /** WhatsApp number: digits only, country code first, no + and no spaces. */
    whatsapp: value(process.env.NEXT_PUBLIC_WHATSAPP_NUMBER)?.replace(/\D/g, '') || null,
    email: value(process.env.NEXT_PUBLIC_CONTACT_EMAIL),
    address: value(process.env.NEXT_PUBLIC_CONTACT_ADDRESS),
    hours: value(process.env.NEXT_PUBLIC_CONTACT_HOURS)
  },

  /** Official social accounts. Add `{ label, href }` items once the accounts are confirmed. */
  social: [] as { label: string; href: string }[]
};

export const isPreview = site.mode === 'preview';

/** Builds a WhatsApp deep link with a drafted message, or `null` while no official number is configured. */
export function whatsappHref(message?: string): string | null {
  if (!site.contact.whatsapp) return null;
  const query = message ? `?text=${encodeURIComponent(message)}` : '';
  return `https://wa.me/${site.contact.whatsapp}${query}`;
}

export const mainNav = [
  { label: 'الرئيسية', href: '/' },
  { label: 'خدماتنا', href: '/services' },
  { label: 'مشاريعنا', href: '/projects' },
  { label: 'من نحن', href: '/about' },
  { label: 'تواصل معنا', href: '/contact' }
] as const;

export const headerCta = { label: 'استشر مهندسنا العقاري', href: '/contact?service=consulting' } as const;
