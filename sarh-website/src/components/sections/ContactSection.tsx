import ContactForm from '@/components/contact/ContactForm';
import { ButtonLink } from '@/components/ui/Button';
import Reveal from '@/components/ui/Reveal';
import SectionHeading from '@/components/ui/SectionHeading';
import { form } from '@/content/contact';
import { contactCta } from '@/content/home';
import { isPreview, whatsappHref } from '@/content/site';
import { isContactConnected } from '@/lib/contact-delivery';

/** Section 10: the closing call to action with the consultation form itself. Motion is kept minimal here. */
export default function ContactSection() {
  const whatsapp = whatsappHref(contactCta.whatsappMessage);

  return (
    <section id="contact" aria-labelledby="contact-title" className="section border-t border-line">
      <div className="shell grid gap-12 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-5">
          <div className="lg:sticky lg:top-[calc(var(--header-h)+2.5rem)]">
            <SectionHeading
              eyebrow={contactCta.eyebrow}
              lines={[contactCta.title]}
              id="contact-title"
              titleClassName="text-[clamp(2rem,1.3rem+3vw,3.75rem)] leading-[1.22]"
            />
            <Reveal className="mt-6">
              <p className="lead">{contactCta.text}</p>
            </Reveal>
            <Reveal className="mt-8 flex flex-col items-start gap-2">
              {/* Shown only once the official WhatsApp number is configured. */}
              {whatsapp ? (
                <ButtonLink href={whatsapp} variant="outline" arrow>
                  {contactCta.whatsappLabel}
                </ButtonLink>
              ) : null}
              <ButtonLink href="/contact?request=site-visit#contact-form" variant="ghost">
                {contactCta.visitLabel}
              </ButtonLink>
            </Reveal>
          </div>
        </div>

        <div className="lg:col-span-7">
          <h3 className="mb-6 text-[1.375rem] font-semibold">{form.title}</h3>
          <ContactForm connected={isContactConnected()} showConnectionNotice={isPreview} readQuery />
        </div>
      </div>
    </section>
  );
}
