import { PitchPackage } from '../types';

export type PitchMessageTone = 'authority' | 'gift' | 'urgent';

export interface GeneratedPitchMessage {
  id: PitchMessageTone;
  titleAr: string;
  badge: string;
  text: string;
  waUrl: string;
}

export function buildPitchMessages(
  pkg: PitchPackage,
  repName: string = 'أحمد كمال (مستشار التوثيق والتسويق)'
): GeneratedPitchMessage[] {
  const bizName = pkg.business.name_ar || pkg.business.name_en || 'النشاط التجاري';
  const city = pkg.business.city || pkg.business.governorate || 'المنطقة';
  const ownerName = pkg.business.owner_name ? `أ/ ${pkg.business.owner_name}` : 'يا فندم';
  const clientPhone = cleanEgyptianPhone(pkg.business.owner_phone || pkg.business.phone);
  
  // Construct pitch link
  const currentOrigin = typeof window !== 'undefined' ? window.location.origin : 'https://dalilaak.com';
  const pitchUrl = `${currentOrigin}/?pitch=${pkg.id}&token=${pkg.clientToken}`;

  // Tone 1: Authority & Opportunity
  const textAuthority = `
مساء الخير ${ownerName} 🌸
مع حضرتك ${repName} من فريق التوثيق والتسويق الرقمي بـ منصة دليلك 🇪🇬.

أثناء دراستنا للأنشطة الواعدة في منطقة *${city}*، لفت نظرنا الاسم والمستوى المحترم لـ *«${bizName}»*. 

ولأن المنافسة في منطقتك بتكبر كل يوم على Google وخرايط الموبايل، فريقنا جهز لحضرتك *عرضاً حصرياً ومعاينة بصرية خاصة* بتوضح:
1. إزاي نشاطك يتصدر المرتبة الأولى في بحث Google Maps وتكسب زبائن جديدة يومياً.
2. ستاند أكريليك كريستالي فاخر لطاولات المحل بـ QR كود وتقييم 5 نجوم بلمسة واحدة.
3. قوالب سوشيال ميديا موحدة وخطة محتوى كاملة لمدة شهر.

تقدر تفتح المعاينة التفاعلية المخصصة باسم نشاطك على هاتفك مباشرة من هنا:
👇
${pitchUrl}

يسعدني أسمع رأي حضرتك بعد ما تشوف المعاينة! ✨
`.trim();

  // Tone 2: Gift & Value-first
  const textGift = `
السلام عليكم ورحمة الله ${ownerName} 💎
أهلاً بحضرتك.. أنا ${repName} من منصة دليلك.

حابب أهديك *عينة عمل مجانية جاهزة للمعاينة الآن* خاصة بـ *«${bizName}»*.
فريق التصميم والتسويق عندنا اشتغل على نموذج مصغر لهوية محلك:
⭐️ حولنا لافتة الشارع الحالية لشعار رقمي نقي.
⭐️ جهزنا تصميم ستاند الأكريليك الـ VIP المخصص للاستقبال والطاولات.
⭐️ جهزنا نموذج لبراويز منشورات السوشيال ميديا.

اضغط على الرابط التفاعلي ده للمعاينة المجانية من موبايلك:
👇
${pitchUrl}

العينة مؤمنة خصيصاً لحضرتك وباسم نشاطك. شرفنا برأيك الجميل! 🤝
`.trim();

  // Tone 3: Urgent FOMO & Exclusive Discount
  const textUrgent = `
فرصة خاصة ومحدودة لـ *«${bizName}»* في ${city} 🔥

عرض استثنائي بمناسبة تدشين المنظومة الذكية:
*خصم أكثر من 45% على الباقة الذهبية للتوثيق والتصدر الميداني!*

✅ توثيق وتثبيت رسمي لخرائط Google.
✅ ستاند أكريليك كريستالي ذكي بـ QR كود (هدية مجانية).
✅ خطة تسويق وبراويز سوشيال ميديا لمدة 30 يوماً.
✅ ضمان استرجاع كامل 14 يوماً.

افتتح صفحة العرض المخصصة لنشاطك وتفقد الخصم المتاح قبل انتهاء العداد:
👇
${pitchUrl}

للحجز الفوري وتأكيد استلام الستاند، تقدر ترد عليا مباشرة هنا. تحياتي لحضرتك! 🌟
`.trim();

  return [
    {
      id: 'authority',
      titleAr: 'رسالة الصدارة والفرصة الاستراتيجية',
      badge: 'الأعلى تحويلاً 🎯',
      text: textAuthority,
      waUrl: createWhatsAppLink(clientPhone, textAuthority)
    },
    {
      id: 'gift',
      titleAr: 'رسالة الهدية والعينة الترويجية الجاهزة',
      badge: 'ودودة وجذابة 🎁',
      text: textGift,
      waUrl: createWhatsAppLink(clientPhone, textGift)
    },
    {
      id: 'urgent',
      titleAr: 'رسالة العرض الحصري والخصم المؤقت',
      badge: 'تحفيز فوري 🔥',
      text: textUrgent,
      waUrl: createWhatsAppLink(clientPhone, textUrgent)
    }
  ];
}

function cleanEgyptianPhone(phone?: string): string {
  if (!phone) return '';
  let clean = phone.replace(/[^0-9]/g, '');
  if (clean.startsWith('01')) {
    clean = '20' + clean.substring(1);
  } else if (!clean.startsWith('20') && clean.length === 10 && clean.startsWith('1')) {
    clean = '20' + clean;
  }
  return clean;
}

function createWhatsAppLink(phone: string, message: string): string {
  const encoded = encodeURIComponent(message);
  if (phone && phone.length >= 11) {
    return `https://wa.me/${phone}?text=${encoded}`;
  }
  return `https://wa.me/?text=${encoded}`;
}
