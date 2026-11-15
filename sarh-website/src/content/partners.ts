import type { StaticImageData } from 'next/image';

/**
 * Partners and client testimonials.
 *
 * Both lists are intentionally empty: the firm has not supplied verified logos (with permission to use them)
 * or documented testimonials yet. While a list is empty its block is not rendered at all, and when both are
 * empty the whole section disappears without leaving a gap. Add real entries here to switch it on.
 */

export interface Partner {
  name: string;
  logo: StaticImageData | string;
  href?: string;
}

export interface Testimonial {
  quote: string;
  author: string;
  role?: string;
}

export const partners: Partner[] = [];
export const testimonials: Testimonial[] = [];

export const partnersSection = {
  eyebrow: 'شركاؤنا وآراء العملاء',
  partnersTitle: 'جهات وموردون نثق بهم',
  partnersText: 'مؤسسات وموردون نعتمد عليهم في تأمين أفضل مواد البناء والحلول الهندسية.',
  testimonialsTitle: 'ماذا قالوا عن تجربة البناء معنا؟',
  testimonialsText: 'شهادات أصحاب الفلل والمستثمرين الذين وثقوا بـ "صَرْح" لتصميم وإدارة بناء مشاريعهم.'
};
