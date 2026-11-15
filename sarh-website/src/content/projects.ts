import type { StaticImageData } from 'next/image';
import heroPoster from '@/assets/images/hero-poster.jpg';
import facadeDetail from '@/assets/images/about-facade.jpg';
import courtyardVilla from '@/assets/images/project-courtyard-villa.jpg';
import terraceVilla from '@/assets/images/project-terrace-villa.jpg';
import commercial from '@/assets/images/project-commercial.jpg';
import residential from '@/assets/images/project-residential.jpg';
import interior from '@/assets/images/interior-concept.jpg';

/**
 * Projects.
 *
 * IMPORTANT: no real project of the firm has been supplied yet. Every entry below is a demo
 * (`demo: true`): an illustrative architectural concept with generated imagery. The interface labels
 * each one «تصور معماري توضيحي» and never presents it as executed work. No client, location, area,
 * date or figure is stated, because none exists.
 *
 * To publish real work: add entries with `demo: false`, real photographs the firm may publish, and the
 * firm's actual role. Then remove the demo entries.
 */

export type CategorySlug = 'modern-villas' | 'commercial' | 'interior' | 'residential' | 'supervised';

export const categories: { slug: CategorySlug; label: string }[] = [
  { slug: 'modern-villas', label: 'فلل مودرن' },
  { slug: 'commercial', label: 'مجمعات تجارية' },
  { slug: 'interior', label: 'تصميم داخلي' },
  { slug: 'residential', label: 'مباني سكنية' },
  { slug: 'supervised', label: 'مشاريع تحت الإشراف' }
];

export const categoryLabel = (slug: CategorySlug) => categories.find(item => item.slug === slug)?.label ?? '';

/** `design` marks design samples; `supervision` marks work under site supervision. */
export type ProjectScope = 'design' | 'supervision';

export const scopeLabels: Record<ProjectScope, string> = {
  design: 'نماذج التصاميم',
  supervision: 'الإشراف والتنفيذ'
};

export interface ProjectImage {
  src: StaticImageData;
  alt: string;
}

export interface Project {
  slug: string;
  title: string;
  category: CategorySlug;
  scopes: ProjectScope[];
  demo: boolean;
  featured?: boolean;
  summary: string;
  cover: ProjectImage;
  overview: string;
  scopeItems: string[];
  challenge: string;
  approach: string;
  gallery: ProjectImage[];
}

export const projects: Project[] = [
  {
    slug: 'courtyard-villa',
    title: 'فيلا الفناء الحجري',
    category: 'modern-villas',
    scopes: ['design'],
    demo: true,
    featured: true,
    summary: 'مسكن من طابقين تلتف كتله الحجرية حول فناء مفتوح وحوض ماء عاكس.',
    cover: {
      src: courtyardVilla,
      alt: 'فيلا معاصرة من طابقين بواجهات من الحجر الجيري وزجاج بإطارات برونزية حول فناء فيه حوض ماء وشجرة زيتون عند الغروب'
    },
    overview:
      'تصور لمسكن معاصر من طابقين، تتداخل كتله المكسوّة بالحجر الجيري حول فناء مفتوح يتوسطه حوض ماء عاكس وشجرة زيتون، وتنفتح فراغات المعيشة عليه بواجهات زجاجية غائرة.',
    scopeItems: [
      'توزيع الكتل والمخطط المعماري',
      'معالجة الواجهات واختيار الخامات',
      'تنسيق الفناء والمسطحات الخارجية',
      'الإضاءة الخارجية'
    ],
    challenge: 'تحقيق خصوصية فراغات المعيشة مع إبقائها مفتوحة على الضوء الطبيعي والحديقة.',
    approach:
      'توجيه الفراغات الرئيسية نحو الفناء الداخلي بدل الشارع، واستخدام فتحات زجاجية غائرة بإطارات برونزية تمنح الواجهة عمقاً وظلالاً وتخفف التعرض المباشر للشمس.',
    gallery: [
      {
        src: heroPoster,
        alt: 'تصور للمسكن يتحول من مخطط خطي إلى مبنى مكتمل بواجهات حجرية'
      },
      {
        src: facadeDetail,
        alt: 'تفصيل نافذة غائرة بإطار برونزي ومشربية هندسية في واجهة من الحجر الجيري'
      }
    ]
  },
  {
    slug: 'courtyard-living-room',
    title: 'صالة معيشة مطلة على الفناء',
    category: 'interior',
    scopes: ['design'],
    demo: true,
    summary: 'فراغ معيشة من الحجر والبلوط ينفتح بكامل عرضه على فناء مزروع.',
    cover: {
      src: interior,
      alt: 'صالة معيشة معاصرة بجدران من الحجر الجيري وسقف خشبي وأثاث نحتي تطل عبر زجاج كامل الارتفاع على فناء مزروع'
    },
    overview:
      'تصور لصالة معيشة تجمع الحجر الجيري وخشب البلوط وتفاصيل برونزية هادئة، وتتصل بالفناء عبر زجاج كامل الارتفاع يدخل الضوء الطبيعي إلى عمق الفراغ.',
    scopeItems: ['توزيع الأثاث وحركة الفراغ', 'اختيار الخامات والألوان', 'الإضاءة الطبيعية والصناعية', 'تفاصيل النجارة'],
    challenge: 'الحفاظ على دفء الفراغ وهدوئه مع استخدام خامات حجرية على مساحات واسعة.',
    approach:
      'موازنة الحجر بأسقف وأثاث من الخشب والأقمشة الطبيعية، والاكتفاء بلوحة ألوان محدودة تترك للحديقة دور الخلفية الحية.',
    gallery: []
  },
  {
    slug: 'limestone-arcade',
    title: 'مجمع الرواق التجاري',
    category: 'commercial',
    scopes: ['design'],
    demo: true,
    summary: 'واجهات محلات خلف رواق حجري مظلل يطل على ساحة مشاة.',
    cover: {
      src: commercial,
      alt: 'مجمع تجاري منخفض الارتفاع برواق من أعمدة الحجر الجيري وواجهات زجاجية بإطارات برونزية أمام ساحة مشاة فيها أشجار زيتون وممر مائي'
    },
    overview:
      'تصور لمجمع تجاري ومكتبي منخفض الارتفاع، تصطف واجهات محلاته خلف رواق من الأعمدة الحجرية يظلل حركة المشاة ويطل على ساحة مرصوفة تتخللها أشجار الزيتون.',
    scopeItems: ['تخطيط الموقع وحركة المشاة', 'توزيع الوحدات التأجيرية', 'معالجة الواجهات والرواق', 'تنسيق الساحة الخارجية'],
    challenge: 'تحقيق أعلى استغلال للمساحات التأجيرية دون التفريط في ساحة عامة مريحة.',
    approach:
      'تدريج الكتل على مستويات متراجعة تمنح كل وحدة واجهة مرئية، وجمع الحركة في رواق واحد مظلل يربط الوحدات بالساحة.',
    gallery: []
  },
  {
    slug: 'recessed-balconies-residence',
    title: 'عمارة الشرفات الغائرة',
    category: 'residential',
    scopes: ['design'],
    demo: true,
    summary: 'مبنى سكني من أربعة طوابق بشرفات غائرة وسواتر برونزية رأسية.',
    cover: {
      src: residential,
      alt: 'مبنى سكني من أربعة طوابق بكسوة من الحجر الجيري وشرفات غائرة بدرابزين وسواتر برونزية ومدخل مزروع بأشجار الزيتون'
    },
    overview:
      'تصور لمبنى سكني من أربعة طوابق بكسوة حجرية فاتحة، تتراجع شرفاته داخل الكتلة وتحميها سواتر برونزية رأسية، ويتقدمه مدخل مزروع يفصل المبنى عن الشارع.',
    scopeItems: ['المخططات المعمارية للطوابق', 'معالجة الواجهات والشرفات', 'مدخل المبنى وتنسيق الموقع', 'دراسة الخصوصية والتظليل'],
    challenge: 'توفير شرفات واسعة قابلة للاستخدام مع حماية الخصوصية من الشارع والمباني المقابلة.',
    approach:
      'إدخال الشرفات إلى داخل حدود الكتلة وإضافة سواتر برونزية رأسية تحجب الرؤية الجانبية وتسمح بمرور الهواء والضوء.',
    gallery: []
  },
  {
    slug: 'horizontal-terrace-villa',
    title: 'فيلا الشرفة الأفقية',
    category: 'modern-villas',
    scopes: ['design'],
    demo: true,
    summary: 'مسكن من طابق واحد بجدران حجرية ممتدة وسقف خشبي بارز يظلل الشرفة.',
    cover: {
      src: terraceVilla,
      alt: 'فيلا معاصرة من طابق واحد بجدران أفقية من الحجر الجيري وسقف خشبي بارز وأبواب زجاجية منزلقة تفتح على شرفة حجرية وحديقة حصوية'
    },
    overview:
      'تصور لمسكن من طابق واحد يمتد أفقياً مع الأرض، بجدران من الحجر الجيري وسقف بارز مكسو بالخشب يظلل شرفة حجرية تنفتح عليها غرف المعيشة بأبواب زجاجية منزلقة.',
    scopeItems: ['المخطط المعماري', 'تصميم السقف والتظليل', 'الشرفة والمسطحات الخارجية', 'تنسيق الحديقة بنباتات محلية'],
    challenge: 'ربط الداخل بالخارج في مناخ مشمس دون تعريض الواجهات الزجاجية للحرارة المباشرة.',
    approach:
      'مدّ بروز السقف فوق الشرفة ليظلل الزجاج معظم ساعات النهار، وترتيب الغرف على محور واحد يفتح كل منها مباشرة على الحديقة.',
    gallery: []
  }
];

export const projectBySlug = (slug: string) => projects.find(project => project.slug === slug);
export const hasDemoProjects = projects.some(project => project.demo);

export const projectsSection = {
  eyebrow: 'أعمالنا ومشاريعنا',
  title: 'صُروحٌ شَهِدت على خبرتنا.',
  text: 'استكشف معرض مشاريعنا المتنوعة بين الفلل السكنية الحديثة، المجمعات التجارية، والمباني الإدارية التي صممناها وأشرفنا على تنفيذها.',
  cta: { label: 'تصفح كافة المشاريع', href: '/projects' },
  allLabel: 'جميع المشاريع',
  demoBadge: 'تصور معماري توضيحي',
  demoNotice:
    'المعروض حالياً تصورات معمارية توضيحية لأغراض المعاينة، وليست مشاريع منفذة للمؤسسة. تُستبدل بمشاريع المؤسسة الفعلية بعد توفير بياناتها وصورها.',
  empty: 'لا توجد مشاريع معروضة ضمن هذا التصنيف حالياً.',
  emptyAction: 'عرض جميع المشاريع',
  viewProject: 'عرض المشروع',
  detail: {
    overview: 'نبذة',
    scope: 'النطاق',
    challenge: 'التحدي',
    approach: 'المعالجة',
    gallery: 'معرض الصور',
    back: 'العودة إلى المشاريع',
    ctaTitle: 'لديك مشروع مشابه؟',
    ctaText: 'حدّثنا عن أرضك أو فكرتك، ونضع معك الخطوة التالية.',
    cta: { label: 'ابدأ استشارتك الآن', href: '/contact' }
  }
};
