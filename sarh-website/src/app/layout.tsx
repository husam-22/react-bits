import type { Metadata, Viewport } from 'next';
import localFont from 'next/font/local';
import type { ReactNode } from 'react';
import Footer from '@/components/layout/Footer';
import Header from '@/components/layout/Header';
import { isPreview, site } from '@/content/site';
import { motionBootScript } from '@/lib/motion-boot';
import './globals.css';

// IBM Plex Sans Arabic (SIL Open Font License 1.1, see src/fonts/OFL.txt), self-hosted: no request to a font CDN.
const plexArabic = localFont({
  src: [
    { path: '../fonts/IBMPlexSansArabic-Regular.woff2', weight: '400', style: 'normal' },
    { path: '../fonts/IBMPlexSansArabic-Medium.woff2', weight: '500', style: 'normal' },
    { path: '../fonts/IBMPlexSansArabic-SemiBold.woff2', weight: '600', style: 'normal' }
  ],
  variable: '--font-plex-arabic',
  display: 'swap',
  fallback: ['Segoe UI', 'Tahoma', 'Arial', 'sans-serif']
});

const defaultTitle = `${site.fullName}`;

export const metadata: Metadata = {
  // No canonical/base URL is invented: it is only set once the real domain is configured.
  ...(site.url ? { metadataBase: new URL(site.url) } : {}),
  title: {
    default: defaultTitle,
    template: `%s | ${site.name}`
  },
  description:
    'استشارات عقارية، تصميم معماري وهندسي، وإدارة بناء وإشراف تحت سقف واحد: نرافقك من الفكرة الأولى وحتى تسليم المفتاح.',
  applicationName: site.name,
  openGraph: {
    type: 'website',
    locale: 'ar',
    siteName: site.fullName,
    title: defaultTitle,
    description: site.description
  },
  // Preview builds must not be indexed.
  robots: isPreview ? { index: false, follow: false } : { index: true, follow: true },
  formatDetection: { telephone: false, address: false, email: false }
};

export const viewport: Viewport = {
  themeColor: '#f4f0e8',
  colorScheme: 'light'
};

// Structured data is limited to facts that are documented today: the name and description (and the URL once known).
const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: site.legalName,
  alternateName: site.name,
  description: site.description,
  ...(site.url ? { url: site.url } : {})
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ar" dir="rtl" className={plexArabic.variable} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: motionBootScript }} />
      </head>
      <body>
        <a href="#main" className="skip-link">
          تخطَّ إلى المحتوى الرئيسي
        </a>
        <Header />
        <main id="main" tabIndex={-1} className="outline-none">
          {children}
        </main>
        <Footer />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }} />
      </body>
    </html>
  );
}
