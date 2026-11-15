import type { Metadata } from 'next';
import Notice from '@/components/ui/Notice';
import PageHero from '@/components/ui/PageHero';
import { privacy } from '@/content/privacy';

export const metadata: Metadata = {
  title: privacy.title,
  description: 'كيف يتعامل موقع مؤسسة صَرْح مع البيانات التي تقدمها عبر نموذج التواصل.'
};

export default function PrivacyPage() {
  return (
    <>
      <PageHero title={privacy.title} intro={privacy.intro}>
        <Notice title="مسودة" className="max-w-3xl">
          {privacy.draftNotice}
        </Notice>
      </PageHero>

      <section className="section">
        <div className="shell">
          <div className="max-w-[46rem]">
            {privacy.sections.map(section => (
              <section key={section.title} className="border-t border-line py-9 first:border-t-0 first:pt-0">
                <h2 className="text-[1.5rem] font-semibold lg:text-[1.75rem]">{section.title}</h2>
                {section.paragraphs.map(paragraph => (
                  <p key={paragraph.slice(0, 32)} className="mt-4 text-[1.0625rem] leading-[1.9] text-ink lg:text-[1.125rem]">
                    {paragraph}
                  </p>
                ))}
              </section>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
