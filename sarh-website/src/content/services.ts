import type { StaticImageData } from 'next/image';
import consultingImage from '@/assets/images/service-consulting.jpg';
import designImage from '@/assets/images/service-design.jpg';
import supervisionImage from '@/assets/images/service-supervision.jpg';
import inspectionImage from '@/assets/images/service-inspection.jpg';

/**
 * Service content. Source: the content appendix of the brief, with the edits it asks for:
 *  - structural design is separated from MEP ("التصميم الإنشائي والكهروميكانيكي");
 *  - code compliance is tied to the code in force in the project's country (no specific country is assumed).
 * Phrases marked REVIEW must be confirmed by the firm before public launch (see docs/MISSING-DATA.md).
 */

export type PillarSlug =
  | 'real-estate-consulting'
  | 'engineering-design'
  | 'construction-management'
  | 'property-inspection';

/** Values of the "service type" field in the contact form. */
export type ServiceValue = 'consulting' | 'design' | 'supervision' | 'inspection';

export type PillarIcon = 'tower' | 'compass' | 'helmet' | 'lens';

export interface Pillar {
  slug: PillarSlug;
  formValue: ServiceValue;
  icon: PillarIcon;
  /** Tab label and page name. */
  name: string;
  /** Statement shown in the tab and as the page heading. */
  title: string;
  text: string;
  includes: string[];
  cta: { label: string; href: string };
  /** Short card under the hero. Only the first three pillars have one. */
  card?: { title: string; text: string; link: string };
  image: StaticImageData;
  imageAlt: string;
  seoDescription: string;
}

export const pillars: Pillar[] = [
  {
    slug: 'real-estate-consulting',
    formValue: 'consulting',
    icon: 'tower',
    name: 'الاستشارات العقارية',
    title: 'قرار استثماري محكوم بالدراسة والأرقام.',
    text: 'قبل أن تشتري الأرض أو تبدأ البناء، نساعدك في تحليل السوق العقاري واختيار الموقع، وحساب العائد المتوقع للتأكد من أن مشروعك يحقق أفضل استغلال مالي ومكاني.',
    includes: [
      'دراسات الجدوى العقارية',
      'تحليل الموقع والأرض',
      'الاستشارات الاستثمارية',
      'تحديد الاستخدام الأفضل',
      'تقييم المخاطر العقارية'
    ],
    cta: { label: 'احجز جلسة استشارة عقارية', href: '/contact?service=consulting' },
    card: {
      title: 'استشارات وتقييم عقاري',
      text: 'تحليل الفرص الاستثمارية، دراسات الجدوى للأراضي، واختيار الموقع الأنسب لمشروعك السكني أو التجاري.',
      link: 'استكشف الاستشارات العقارية'
    },
    image: consultingImage,
    imageAlt: 'مخطط موقع لقطعة أرض مع مجسم كنتوري ومسطرة نحاسية وعينات مواد على مكتب',
    seoDescription:
      'دراسات الجدوى العقارية وتحليل الموقع والأرض والاستشارات الاستثمارية وتقييم المخاطر قبل شراء الأرض أو بدء البناء.'
  },
  {
    slug: 'engineering-design',
    formValue: 'design',
    icon: 'compass',
    name: 'الهندسة والتصميم',
    title: 'تصاميم مبتكرة تُترجم أفكارك إلى واقع.',
    text: 'نصمم المباني برؤية معمارية حديثة توازن بين الجمال والتكلفة، مع الاهتمام بالإضاءة الطبيعية، التهوية، واستغلال كل المساحات دون إهدار.',
    includes: [
      'المخططات المعمارية',
      'التصميم الإنشائي والكهروميكانيكي',
      'المخططات ثلاثية الأبعاد (3D)',
      'التصميم الداخلي',
      'تراخيص البناء الرسمية'
    ],
    cta: { label: 'تصفح نماذج التصاميم', href: '/projects?scope=design' },
    card: {
      title: 'تصميم معماري وهندسي',
      text: 'مخططات معمارية وإنشائية مبتكرة تجمع بين الجمال، كفاءة المساحات، ومراعاة كود البناء المعمول به في بلد المشروع وأعلى معايير الجودة.',
      link: 'تعرّف على الحلول الهندسية'
    },
    image: designImage,
    imageAlt: 'مجسم معماري من الحجر الجيري فوق مخططات هندسية على مكتب استوديو',
    seoDescription:
      'المخططات المعمارية والتصميم الإنشائي والكهروميكانيكي والنماذج ثلاثية الأبعاد والتصميم الداخلي وتراخيص البناء.'
  },
  {
    slug: 'construction-management',
    formValue: 'supervision',
    icon: 'helmet',
    name: 'إدارة التنفيذ',
    title: 'إشراف هندسي صارم يضمن دقة البناء.',
    text: 'نتولى الإشراف الميداني على تنفيذ البناء خطوة بخطوة، ونطبق أعلى معايير الجودة لضمان مطابقة المواد والمواصفات للخرائط المعتمدة.',
    includes: [
      'إدارة عقود المقاولين',
      'الإشراف الميداني المستمر',
      'استلام المراحل الإنشائية',
      'ضبط الميزانية والجدول الزمني',
      'استلام أعمال التشطيبات'
    ],
    cta: { label: 'طلب خدمة الإشراف والتنفيذ', href: '/contact?service=supervision' },
    card: {
      title: 'إدارة البناء والإشراف',
      text: 'إدارة المقاولات، الإشراف الهندسي المباشر، ضبط الجودة، ومتابعة الجدول الزمني والميزانية حتى تسليم المبنى.',
      link: 'اكتشف خدمات التنفيذ'
    },
    image: supervisionImage,
    imageAlt: 'مهندس بخوذة وسترة عاكسة يراجع جهازاً لوحياً أمام هيكل خرساني منظم',
    seoDescription:
      'إدارة عقود المقاولين والإشراف الميداني واستلام المراحل الإنشائية وضبط الميزانية والجدول الزمني حتى التسليم.'
  },
  {
    slug: 'property-inspection',
    formValue: 'inspection',
    icon: 'lens',
    name: 'فحص وتقييم العقار',
    title: 'عين هندسية خبيرة تفحص أدق التفاصيل.',
    // REVIEW: «تقارير هندسية معتمدة» — the accreditation behind these reports must be confirmed before launch.
    text: 'نقدم تقارير هندسية معتمدة تدل على سلامة العقار قبل الشراء أو الاستثمار، مع تشخيص العيوب الهيكلية أو عيوب العزل والسباكة والكهرباء.',
    includes: [
      'فحص السلامة الإنشائية',
      'فحص السباكة والكهرباء',
      'فحص العزل والرطوبة',
      'تقارير جودة التشطيبات',
      'تقييم التكلفة التقديرية للإصلاح'
    ],
    cta: { label: 'طلب خدمة فحص عقار', href: '/contact?service=inspection' },
    image: inspectionImage,
    imageAlt: 'يدا فاحص مبانٍ تستخدمان جهاز قياس الرطوبة على جدار داخلي',
    seoDescription:
      'فحص السلامة الإنشائية والسباكة والكهرباء والعزل والرطوبة وجودة التشطيبات قبل الشراء أو الاستثمار.'
  }
];

export const pillarBySlug = (slug: string) => pillars.find(pillar => pillar.slug === slug);

export interface Offering {
  number: string;
  /** Anchor id on the pillar page. */
  id: string;
  title: string;
  text: string;
  pillar: PillarSlug;
}

/**
 * The ten services. Grouping them under the four pillars is an editorial decision made for navigation;
 * the firm should confirm it (docs/MISSING-DATA.md).
 */
export const offerings: Offering[] = [
  {
    number: '01',
    id: 'real-estate-valuation',
    title: 'الاستشارات والتقييم العقاري',
    text: 'دراسة واستكشاف الأراضي والمباني، وتقييم الجدوى الاستثمارية قبل الشراء أو التطوير.',
    pillar: 'real-estate-consulting'
  },
  {
    number: '02',
    id: 'architectural-design',
    title: 'التصميم المعماري والتخطيط',
    text: 'ابتكار الواجهات والمخططات المعمارية السكنية والتجارية بصورة تجمع الجمال والوظيفة.',
    pillar: 'engineering-design'
  },
  {
    number: '03',
    id: 'structural-mep',
    title: 'التصميم الإنشائي والكهروميكانيكي',
    text: 'إعداد المخططات التنفيذية التفصيلية للأعمال الإنشائية والكهروميكانيكية وفق أعلى معايير السلامة والكود المعمول به في بلد المشروع.',
    pillar: 'engineering-design'
  },
  {
    number: '04',
    id: 'interior-design',
    title: 'التصميم الداخلي والديكور',
    text: 'استغلال المساحات الداخلية باحترافية، وتنسيق الأثاث والإضاءة والمواد باختيارات مودرن وكلاسيك.',
    pillar: 'engineering-design'
  },
  {
    number: '05',
    id: 'site-supervision',
    title: 'إدارة البناء والإشراف الهندسي',
    text: 'متابعة موقع البناء يومياً، والإشراف على المقاولين، وتدقيق استلام مراحل الخرسانة والعظم والتشطيب.',
    pillar: 'construction-management'
  },
  {
    number: '06',
    id: 'cost-management',
    title: 'إدارة التكلفة وحساب الكميات',
    text: 'إعداد جداول الكميات والدراسات المالية لحماية المشروع من تجاوز الميزانية المقدرة.',
    pillar: 'construction-management'
  },
  {
    number: '07',
    id: 'rehabilitation',
    title: 'تطوير المباني وإعادة التأهيل',
    text: 'تحديث المباني القائمة وتطوير الواجهات لزيادة قيمتها السوقية وكفاءتها التشغيلية.',
    pillar: 'construction-management'
  },
  {
    number: '08',
    id: 'permits',
    title: 'استخراج التراخيص والموافقات',
    // REVIEW: the licensing scope depends on the country and the firm's actual authorisations.
    text: 'متابعة وإصدار رخص البناء، واستخراج المعاملات الرسمية والمخططات المعتمدة.',
    pillar: 'engineering-design'
  },
  {
    number: '09',
    id: 'building-inspection',
    title: 'فحص المباني الجاهزة',
    text: 'خدمة الفحص الفني والهندسي الشامل للعقارات قبل الشراء للكشف عن العيوب الخفية والسلامة الإنشائية.',
    pillar: 'property-inspection'
  },
  {
    number: '10',
    id: 'commercial-development',
    title: 'إدارة وتطوير المشاريع التجارية',
    text: 'إعداد مخططات المراكز التجارية والمجمعات بما يحقق أعلى استغلال للمساحات التأجيرية.',
    pillar: 'real-estate-consulting'
  }
];

export const offeringsOf = (slug: PillarSlug) => offerings.filter(item => item.pillar === slug);

export const offeringsSection = {
  eyebrow: 'ما الذي نقدّمه؟',
  titleLines: ['منظومة متكاملة تُرافق عقارك', 'من الأرض الخالية إلى المبنى المكتمل.'],
  intro:
    'سواء كنت تبحث عن فكرة واستثمار لأرضك، أو تريد تصميم وتنفيذ مجمع أو فيلا خاصة، نرتّب خدماتنا الشاملة لخدمة مشروعك تحت سقف واحد.',
  cta: { label: 'ناقش مشروعك العقاري معنا', href: '/contact' }
};

export const tabsSection = {
  eyebrow: 'محاور الخدمة',
  titleLines: ['من الفكرة الاستثمارية…', 'إلى مبنى مكتمل الأركان.'],
  includesLabel: 'يشمل'
};

export const servicesPage = {
  eyebrow: 'خدماتنا',
  title: 'عشر خدمات تحت أربعة محاور، من دراسة الأرض إلى تسليم المفتاح.',
  intro: offeringsSection.intro,
  pillarLink: 'تفاصيل المحور'
};
