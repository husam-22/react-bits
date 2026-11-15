import Hero from '@/components/hero/Hero';
import AboutSection from '@/components/sections/AboutSection';
import ContactSection from '@/components/sections/ContactSection';
import OfferingsSection from '@/components/sections/OfferingsSection';
import PartnersSection from '@/components/sections/PartnersSection';
import ProcessSection from '@/components/sections/ProcessSection';
import ProjectsSection from '@/components/sections/ProjectsSection';
import ServiceTabs from '@/components/sections/ServiceTabs';
import ServicesOverview from '@/components/sections/ServicesOverview';
import WhySection from '@/components/sections/WhySection';

/** Home: the ten sections of the content appendix, in order. */
export default function HomePage() {
  return (
    <>
      <Hero />
      <ServicesOverview />
      <AboutSection />
      <OfferingsSection />
      <ServiceTabs />
      <ProjectsSection />
      <ProcessSection />
      <WhySection />
      <PartnersSection />
      <ContactSection />
    </>
  );
}
