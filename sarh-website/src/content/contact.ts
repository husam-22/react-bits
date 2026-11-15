import type { ServiceValue } from './services';

/** Contact form copy and options. Field list and labels come from the content appendix of the brief. */

export type RequestValue = 'consultation' | 'site-visit';
export type PropertyValue = 'residential' | 'commercial' | 'administrative' | 'land';

export const serviceOptions: { value: ServiceValue; label: string }[] = [
  { value: 'consulting', label: 'استشارة عقارية' },
  { value: 'design', label: 'تصميم هندسي' },
  { value: 'supervision', label: 'إشراف وإدارة بناء' },
  { value: 'inspection', label: 'فحص عقار' }
];

export const propertyOptions: { value: PropertyValue; label: string }[] = [
  { value: 'residential', label: 'سكني' },
  { value: 'commercial', label: 'تجاري' },
  { value: 'administrative', label: 'إداري' },
  { value: 'land', label: 'أرض خالية' }
];

export const requestOptions: { value: RequestValue; label: string }[] = [
  { value: 'consultation', label: 'طلب استشارة' },
  { value: 'site-visit', label: 'طلب زيارة لموقع الأرض/المشروع' }
];

export const form = {
  title: 'نموذج طلب الاستشارة',
  requiredNote: 'الحقول المعلّمة بعلامة * مطلوبة.',
  fields: {
    request: { label: 'نوع الطلب' },
    name: { label: 'الاسم الكامل', placeholder: '' },
    phone: {
      label: 'رقم الهاتف أو واتساب',
      hint: 'اكتب الرقم مع مفتاح الدولة إن أمكن.'
    },
    service: { label: 'نوع الخدمة المطلوب', placeholder: 'اختر الخدمة' },
    property: { label: 'نوع العقار', placeholder: 'اختر نوع العقار (اختياري)' },
    area: {
      label: 'مساحة المشروع / الأرض',
      unit: 'م²',
      unknown: 'المساحة غير محددة بعد'
    },
    city: { label: 'المدينة والحي' },
    details: { label: 'تفاصيل إضافية عن المشروع' },
    consent: {
      before: 'أوافق على أن تتواصل معي مؤسسة صَرْح بخصوص هذا الطلب، وفق ',
      link: 'سياسة الخصوصية',
      after: '.'
    }
  },
  submit: 'أرسل طلب الاستشارة',
  submitting: 'جارٍ إرسال الطلب…',
  visitNote:
    'طلب الزيارة ليس حجزاً مؤكداً. يتواصل معك الفريق لتحديد موعد مناسب بعد مراجعة الطلب.',
  whatsapp: {
    button: 'أرسل التفاصيل عبر واتساب',
    note: 'يفتح واتساب بمسودة رسالة تحمل بياناتك. يكتمل الإرسال فقط بعد ضغطك على زر الإرسال داخل واتساب.'
  },
  success: {
    title: 'تم استلام طلبك.',
    text: 'شكراً لك. سيتواصل معك أحد مهندسينا على الرقم الذي أدخلته.',
    again: 'إرسال طلب آخر'
  },
  notConnected: {
    title: 'النموذج غير موصول بجهة استقبال بعد',
    text: 'هذه نسخة معاينة: يمكنك تجربة الحقول والتحقق منها، لكن الطلبات لا تُرسل ولا تُحفظ إلى أن تُربط جهة الاستقبال الرسمية.',
    onSubmit: 'لم يُرسل طلبك: النموذج غير موصول بجهة استقبال في نسخة المعاينة هذه، ولم تُحفظ أي بيانات.'
  },
  errors: {
    summary: 'تعذّر إرسال الطلب. راجع الحقول المشار إليها.',
    nameRequired: 'اكتب اسمك الكامل.',
    nameShort: 'الاسم قصير جداً.',
    phoneRequired: 'اكتب رقم الهاتف أو واتساب.',
    phoneInvalid: 'رقم الهاتف غير صحيح. استخدم الأرقام فقط مع مفتاح الدولة إن وجد.',
    serviceRequired: 'اختر نوع الخدمة المطلوب.',
    cityRequired: 'اكتب المدينة والحي.',
    areaInvalid: 'اكتب المساحة رقماً موجباً بالمتر المربع، أو اختر «المساحة غير محددة بعد».',
    detailsLong: 'التفاصيل طويلة جداً. اختصرها إلى 2000 حرف.',
    consentRequired: 'يلزم الموافقة على التواصل لإرسال الطلب.',
    tooFast: 'تعذّر قبول الطلب. أعد المحاولة بعد لحظات.',
    rateLimited: 'أرسلت عدة طلبات خلال وقت قصير. حاول مرة أخرى بعد قليل.',
    delivery: 'تعذّر تسليم الطلب إلى جهة الاستقبال. لم يُرسل طلبك، حاول مرة أخرى أو استخدم وسيلة تواصل أخرى.',
    network: 'تعذّر الاتصال بالخادم. تحقق من اتصالك بالإنترنت ثم أعد المحاولة.'
  }
};

export const contactPage = {
  eyebrow: 'تواصل معنا',
  title: 'حدّثنا عن مشروعك.',
  detailsTitle: 'بيانات المؤسسة',
  labels: {
    phone: 'الهاتف',
    whatsapp: 'واتساب',
    email: 'البريد الإلكتروني',
    address: 'العنوان',
    hours: 'ساعات العمل',
    social: 'حسابات التواصل'
  },
  missingNotice:
    'بيانات التواصل الرسمية (الهاتف، البريد، العنوان، ساعات العمل) تُضاف قبل النشر. لا تُعرض هنا أي بيانات غير مؤكدة.'
};
