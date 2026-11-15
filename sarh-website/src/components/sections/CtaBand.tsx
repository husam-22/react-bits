import { ButtonLink } from '@/components/ui/Button';
import Reveal from '@/components/ui/Reveal';

interface CtaBandProps {
  title: string;
  text?: string;
  primary: { label: string; href: string };
  secondary?: { label: string; href: string };
}

/** Dark closing band used at the end of inner pages. */
export default function CtaBand({ title, text, primary, secondary }: CtaBandProps) {
  return (
    <section className="on-dark bg-forest text-ivory">
      <div className="shell flex flex-col gap-8 py-16 lg:flex-row lg:items-center lg:justify-between lg:py-24">
        <Reveal className="max-w-2xl">
          <h2 className="text-[clamp(1.75rem,1.2rem+2.2vw,3rem)] font-semibold leading-[1.25]">{title}</h2>
          {text ? <p className="lead mt-4">{text}</p> : null}
        </Reveal>
        <Reveal className="flex flex-none flex-wrap gap-3">
          <ButtonLink href={primary.href} arrow>
            {primary.label}
          </ButtonLink>
          {secondary ? (
            <ButtonLink href={secondary.href} variant="outline-light">
              {secondary.label}
            </ButtonLink>
          ) : null}
        </Reveal>
      </div>
    </section>
  );
}
