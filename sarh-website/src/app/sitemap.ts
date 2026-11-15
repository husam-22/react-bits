import type { MetadataRoute } from 'next';
import { projects } from '@/content/projects';
import { pillars } from '@/content/services';
import { site } from '@/content/site';

/**
 * The sitemap needs absolute addresses, so it stays empty until the real domain is set in
 * NEXT_PUBLIC_SITE_URL. No address is invented. Demo projects are left out: they are not the firm's work.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  if (!site.url) return [];
  const origin = site.url.replace(/\/$/, '');
  const paths = [
    '/',
    '/services',
    ...pillars.map(pillar => `/services/${pillar.slug}`),
    '/projects',
    ...projects.filter(project => !project.demo).map(project => `/projects/${project.slug}`),
    '/about',
    '/contact',
    '/privacy'
  ];
  return paths.map(path => ({ url: `${origin}${path}`, changeFrequency: 'monthly', priority: path === '/' ? 1 : 0.7 }));
}
