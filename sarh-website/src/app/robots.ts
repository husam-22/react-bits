import type { MetadataRoute } from 'next';
import { isPreview, site } from '@/content/site';

/** Preview builds, and builds without a known domain, ask crawlers to stay out. */
export default function robots(): MetadataRoute.Robots {
  if (isPreview || !site.url) return { rules: { userAgent: '*', disallow: '/' } };
  const origin = site.url.replace(/\/$/, '');
  return {
    rules: { userAgent: '*', allow: '/', disallow: '/api/' },
    sitemap: `${origin}/sitemap.xml`
  };
}
