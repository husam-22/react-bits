/**
 * Home page copy. Source: the content appendix of the brief.
 * Phrases marked REVIEW must be confirmed by the firm before public launch (see docs/MISSING-DATA.md).
 */

export const hero = {
  eyebrow: 'صَرْح للاستشارات العقارية والهندسية وإدارة البناء',
  titleLines: ['لرؤيتك أرض.', 'ولاستثمارك صَرْح.'],
  text: 'نرافقك من الفكرة الأولى وحتى تسليم المفتاح. ندمج بين الخبرة العقارية الاستثمارية، والتصميم الهندسي الابتكاري، والإشراف الفني الدقيق على البناء لنضمن لك استثماراً آمناً ومبنياً يعكس تطلعاتك ويصنع قيمته المستدامة.',
  primary: { label: 'ابدأ استشارتك الآن', href: '/contact' },
  secondary: { label: 'استكشف مشاريعنا', href: '/projects' },
  posterAlt:
    'تصور معماري لمسكن معاصر من طابقين بواجهات من الحجر الجيري وإطارات برونزية، يتحول من مخطط خطي إلى مبنى مكتمل',
  scrollHint: 'مرّر لتتابع رحلة البناء'
};

/**
 * The scroll story: "من الأرض إلى الصرح". `from`/`to` are fractions of the pinned section's own progress.
 * The 3D scene, the captions and the indicator all read the same single progress value.
 */
export const story = {
  label: 'من الأرض إلى الصرح',
  stages: [
    { id: 'site', name: 'الأرض', from: 0, to: 0.2, caption: null },
    { id: 'plan', name: 'المخطط', from: 0.2, to: 0.45, caption: 'نبدأ بقرار مدروس' },
    { id: 'structure', name: 'الهيكل', from: 0.45, to: 0.7, caption: 'نحوّل الرؤية إلى تصميم' },
    { id: 'envelope', name: 'الواجهات', from: 0.7, to: 0.9, caption: 'ونتابع التفاصيل حتى التنفيذ' },
    { id: 'complete', name: 'الصرح', from: 0.9, to: 1, caption: null }
  ],
  /** Shown as plain text when the story cannot run (reduced motion, no JavaScript). */
  staticSteps: [
    { name: 'الأرض والمخطط', text: 'نبدأ بقرار مدروس' },
    { name: 'الهيكل', text: 'نحوّل الرؤية إلى تصميم' },
    { name: 'الواجهات والتسليم', text: 'ونتابع التفاصيل حتى التنفيذ' }
  ]
} as const;

export const about = {
  eyebrow: 'من نحن؟',
  titleLines: ['نفهم قيمة استثمارك…', 'لنصنع صرحاً يدوم.'],
  paragraphs: [
    'نحن مؤسسة "صَرْح"، كيان متخصص يجمع بين المستشار العقاري والمهندس المعماري وخبير التنفيذ. نؤمن أن المبنى الناجح ليس مجرد جدران، بل هو استثمار رابح يبدأ باختيار الأرض الصحيحة، وتصميم ذكي يستغل كل متر، وتنفيذ دقيق يضمن أعلى مستويات الجودة والسلامة.',
    'نحن نعمل معك كشريك استراتيجي يختصر عليك الوقت والجهد والمال، ويحميك من مخاطر السوق وأخطاء التنفيذ.'
  ],
  /** Side phrases used instead of achievement numbers (no figures are invented). */
  principles: ['رؤية استثمارية', 'تصميم مستدام', 'تنفيذ بمقاييس عالمية'],
  cta: { label: 'تعرّف على رؤيتنا وفلسفتنا', href: '/about' },
  imageAlt: 'نافذة غائرة بإطار برونزي ومشربية هندسية في واجهة من الحجر الجيري مع غصن زيتون',
  vision: {
    title: 'رؤيتنا',
    text: 'أن نكون المرجع الأول في تقديم الحلول المتكاملة التي تجمع بين الذكاء العقاري والتميز الهندسي في تطوير المباني.'
  },
  mission: {
    title: 'رسالتنا',
    text: 'تقديم استشارات هندسية وعقارية وحلول بناء شفافة ومبتكرة، تحقق لأصحاب العقارات والمستثمرين أعلى عائد وأفضل جودة معمارية.'
  }
};

export const process = {
  eyebrow: 'كيف نعمل؟',
  titleLines: ['منهجية واضحة،', 'تضمن سلامة البناء وراحة بالك.'],
  steps: [
    {
      number: '01',
      title: 'الاستماع والدراسة',
      text: 'نتعرف على ميزانيتك، تطلعاتك، ورؤيتك للمشروع ونحلل قطعة الأرض أو موقع العقار.'
    },
    {
      number: '02',
      title: 'التصميم والتخطيط',
      text: 'نبتكر المخططات المعمارية والإنشائية مع تقديم نماذج ثلاثية الأبعاد لرؤية المبنى قبل بنائه.'
    },
    {
      number: '03',
      title: 'التخصيص والميزانية',
      // REVIEW: «مقاولي التنفيذ المعتمدين» — confirm what "approved" refers to before launch.
      text: 'نحدد جدول الكميات الدقيق والمواصفات الفنية ونساعدك في اختيار مقاولي التنفيذ المعتمدين.'
    },
    {
      number: '04',
      title: 'الإشراف والتسليم',
      text: 'نتابع مراحل البناء يومياً بالتقارير الدورية والهندسية حتى استلام مفتاح المبنى جاهزاً للاستخدام.'
    }
  ]
};

export const why = {
  eyebrow: 'لماذا صَرْح؟',
  titleLines: ['نبني بثقة…', 'ونصمم بحرفية تضمن استثمارك.'],
  items: [
    {
      title: 'حل شامل تحت سقف واحد',
      text: 'نوفر عليك عناء التعامل مع عدة أطراف، فنحن مستشارك العقاري، مهندسك المعماري، والمشرف على بناء مشروعك.'
    },
    {
      title: 'دقة التكلفة والميزانية',
      text: 'نلتزم بحساب التكاليف بوضوح ومنع الهدر المالي أثناء مرحلتي التصميم والتنفيذ.'
    },
    {
      title: 'التزام مطلق بالكود والمعايير',
      text: 'نضمن تطبيق الاشتراطات الكودية المعمول بها في بلد المشروع وأعلى المواصفات الفنية لضمان سلامة المبنى وطول عمره.'
    },
    {
      title: 'شفافية وتقارير دورية',
      text: 'نضعك في قلب الحدث عبر تقارير هندسية مصورة ومحدثة دورياً عن سير الأعمال في الموقع.'
    }
  ]
};

export const contactCta = {
  eyebrow: 'مشروع العمر يستحق البداية الصحيحة.',
  title: 'جاهز لبدء بناء صرحك الخاص؟',
  text: 'هل تملك أرضاً وتريد تصميمها؟ تبحث عن استشارة قبل شراء عقار؟ أم تحتاج لإشراف هندسي على بنائك؟ حدّثنا عن التفاصيل، ودع مهندسينا يضعون لك الخطة المناسبة.',
  whatsappLabel: 'تواصل مع مهندس عبر واتساب',
  whatsappMessage: 'السلام عليكم، أرغب في استشارة بخصوص مشروعي.',
  visitLabel: 'اطلب زيارة لموقع الأرض/المشروع'
};

export const footer = {
  description: 'نحوّل المساحات والأراضي إلى مشاريع استثمارية ومبانٍ معمارية تنبض بالحياة والجودة.',
  quickLinksTitle: 'روابط سريعة',
  quickLinks: [
    { label: 'من نحن', href: '/about' },
    { label: 'خدماتنا', href: '/services' },
    { label: 'مشاريعنا', href: '/projects' },
    { label: 'تواصل معنا', href: '/contact' }
  ],
  servicesTitle: 'خدماتنا',
  services: [
    { label: 'الاستشارات العقارية', href: '/services/real-estate-consulting' },
    { label: 'التصميم المعماري والإنشائي', href: '/services/engineering-design' },
    { label: 'التصميم الداخلي', href: '/services/engineering-design#interior-design' },
    { label: 'إدارة البناء والإشراف', href: '/services/construction-management' },
    { label: 'فحص المباني', href: '/services/property-inspection' },
    { label: 'استخراج التراخيص', href: '/services/engineering-design#permits' }
  ],
  contactTitle: 'تواصل معنا',
  rights: 'جميع الحقوق محفوظة لمؤسسة صَرْح للاستشارات العقارية والهندسية.'
};
