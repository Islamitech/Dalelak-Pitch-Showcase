import { DalilakBusiness, PitchPackage } from '../types';

export interface AssetPitchMessage {
  assetType: 'logo' | 'catalog' | 'social_post' | 'promo_offer' | 'bundle';
  titleAr: string;
  badge: string;
  text: string;
}

/**
 * Builds personalized WhatsApp messages tailored to each individual asset in Egyptian dialect
 */
export function buildAssetPitchMessages(params: {
  business: DalilakBusiness;
  repName?: string;
  discountedPrice?: number;
  currency?: string;
  customDetails?: {
    logoIdea?: string;
    catalogHighlights?: string;
    promoHeadline?: string;
  };
}): Record<'logo' | 'catalog' | 'social_post' | 'promo_offer' | 'bundle', AssetPitchMessage> {
  const { business, repName = 'فريق التوثيق والتسويق بدليلك', discountedPrice = 2490, currency = 'ج.م' } = params;
  
  const bizName = business.name_ar || business.name_en || 'النشاط التجاري';
  const ownerGreeting = business.owner_name ? 'أ/ ' + business.owner_name : 'يا فندم';
  const locationText = business.city ? business.city + (business.governorate ? ' - ' + business.governorate : '') : 'منطقتكم';

  // 1. Logo Specific Message
  const logoText = 
`السلام عليكم ورحمة الله وبركاته ${ownerGreeting}،
معاك ${repName} من منصة «دليلك».

فريق التصميم عندنا جهّز لحضرتك مقترح مبدئي لشعار فاخر وهوية بصرية جديدة ومميزة تليق باسم ومكانة نشاط:
✨ «${bizName}» في ${locationText} ✨

💡 فكرة الشعار:
صممنا لحضرتك أيقونة متناظرة عصرية تعكس جودة الخدمة وتثبت في ذهن الزبون بمجرد ما يشوف اليافطة أو الكارت.

📸 مرفق لحضرتك صورة الشعار (نسخة معاينة أولية مؤمنة بالعلامة المائية لحين التعاقد الرسمي وفك الحماية واستلام الملفات الأصلية للطباعة).

رأي حضرتك يهمنا جداً، حابب نعتمد هذا الشعار ونجهزه للطباعة واليافطة؟ 🤝`;

  // 2. Catalog / Price Menu Specific Message
  const catalogText = 
`السلام عليكم ${ownerGreeting}،
من واقع دراستنا للزبائن في ${locationText}، تنظيم قائمة الأسعار والخدمات بشكل شيك بيرفع مبيعات المحل بنسبة تتعدى 40% وبيزود ثقة الزبون في المكان.

صممنا لحضرتك لوحة خدمات وقائمة أسعار (Menu Board / Service Catalog) فخمة جداً لنشاط «${bizName}»:
📋 تقسيم واضح للباقات والأسعار.
🎨 ألوان وهوية رسمية راقية.
🏢 جاهزة لوضعها على الكاونتر كمنيو مطبوع أو إرسالها لزبائن الواتساب.

📸 مرفق عينة توضيحية من تصميم الكتالوج (مؤمنة بالعلامة المائية كنسخة معاينة).

إيه رأي حضرتك في تنسيق الباقات دي للمحل؟ 💬`;

  // 3. Social Media Branded Post Message
  const socialPostText = 
`مساء الخير ${ownerGreeting}،
النهارده الزبون قبل ما يزور أي مكان في ${locationText}، بيدور عليه على فيسبوك وإنستجرام. لو لقى الصفحة شكلها احترافي وصورها فخمة بيثق فيك ويطلب فوراً!

فريق الميديا صمم لحضرتك النموذج الإعلاني المرفق لنشاط «${bizName}»:
📱 بوست إعلاني سينمائي يبرز جودة الخدمة الحقيقية.
🎯 هوية وإطار موحد يخلي أي زبون يعرف صفحتك من النظرة الأولى.
✍️ صياغة تسويقية تجبر العميل على التفاعل والتواصل.

📸 مرفق عينة البوست الترويجي (نسخة معاينة مؤمنة بالعلامة المائية).

جاهزين ننشر ونبدأ حملة جذب الزبائن لصفحة النشاط؟ 🚀`;

  // 4. Promo Offer & Discount Banner Message
  const promoOfferText = 
`عرض ترويجي خاص لـ «${bizName}» 🎁✨

السلام عليكم ${ownerGreeting}،
علشان ننشط حركة الزبائن في ${locationText} ونعمل ضجة في المنطقة، جهزنا لحضرتك فكرة «حملة ترويجية بخصم مميز» لزبائن دليلك وسكان المنطقة:

🎯 بانر إعلاني ناري يشد العين.
🔥 شارة عرض واضحة مع زر اتصال وحجز مباشر.
📍 توثيق موقعكم بدقة على خرائط جوجل لسهولة وصول الزبون.

📸 مرفق تصميم إعلان العرض الترويجي (نسخة معاينة مؤمنة لحين إطلاق الحملة).

حابب نحدد موعد لبدء الحملة ونربطها مع ستاند الأكريليك في المحل؟ 🤝`;

  // 5. Full Package Deal Message
  const bundleText = 
`عرض استثنائي ومحدود لنشاط «${bizName}» 💎

السلام عليكم ورحمة الله ${ownerGreeting}،
تقديراً لتسجيلكم في منصة «دليلك»، مجهز لحضرتك باقة الاعتماد والتصدر الميداني الشاملة:
1️⃣ ستاند الطاولة الأكريليكي الكريستالي الفاخر بـ QR كود وتقنية NFC (هدية مجانية).
2️⃣ الشعار الفاخر وهوية السوشيال ميديا الكاملة بدون أي علامات مائية.
3️⃣ كتالوج الخدمات وقوائم الأسعار المجهزة للطباعة.
4️⃣ خطة تسويقية متكاملة لـ 30 يوماً وتوثيق خرائط Google الرسمي.

💰 الباقة بالكامل متاحة لحضرتك بخصم خاص لمدة 48 ساعة: ${discountedPrice} ${currency} فقط بدلاً من 4500 ${currency}!

لو حابب تستلم الستاند في محلك وتستلم أصول التصاميم كاملة اليوم، ابعتلي تم ونبدأ فوراً! 🤝`;

  return {
    logo: {
      assetType: 'logo',
      titleAr: 'رسالة مقترح الشعار والهوية',
      badge: 'الشعار والرمز',
      text: logoText
    },
    catalog: {
      assetType: 'catalog',
      titleAr: 'رسالة كتالوج وقائمة الأسعار',
      badge: 'المنيو والأسعار',
      text: catalogText
    },
    social_post: {
      assetType: 'social_post',
      titleAr: 'رسالة بوست السوشيال ميديا',
      badge: 'المنشور الاحترافي',
      text: socialPostText
    },
    promo_offer: {
      assetType: 'promo_offer',
      titleAr: 'رسالة العرض الترويجي والخصم',
      badge: 'حملة العروض',
      text: promoOfferText
    },
    bundle: {
      assetType: 'bundle',
      titleAr: 'رسالة الباقة الشاملة واستلام الستاند',
      badge: 'العرض المتكامل',
      text: bundleText
    }
  };
}

/**
 * Creates direct WhatsApp share link with prefilled text and target phone
 */
export function createWhatsAppDirectUrl(phone: string, text: string): string {
  let cleanPhone = phone.replace(/[^0-9]/g, '');
  if (cleanPhone.startsWith('01')) {
    cleanPhone = '2' + cleanPhone; // Convert Egyptian local 01xxxx to 201xxxx
  } else if (!cleanPhone.startsWith('20') && cleanPhone.length === 10) {
    cleanPhone = '20' + cleanPhone;
  }
  return 'https://wa.me/' + cleanPhone + '?text=' + encodeURIComponent(text);
}
