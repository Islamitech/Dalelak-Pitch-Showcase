import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, 
  Store, 
  MapPin, 
  Star, 
  ShieldCheck, 
  QrCode, 
  Smartphone, 
  TrendingUp, 
  CheckCircle2, 
  Clock, 
  Send, 
  ExternalLink, 
  Lock, 
  Layers, 
  Flame, 
  Award, 
  Radio,
  ArrowDown,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  X,
  Maximize2,
  Calendar,
  MessageSquare,
  Copy,
  Check,
  Image as ImageIcon,
  CheckCheck,
  Eye
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { PitchPackage } from '../types';
import { 
  startClientTrackingSession, 
  pingClientSession, 
  recordSectionView, 
  recordClientWhatsAppCta 
} from '../services/leadTrackingService';
import { 
  generateWatermarkPatternSvg, 
  attachAntiTheftDefense 
} from '../utils/watermarkEngine';
import { 
  generateQrDataUrl, 
  getAcrylicMaterialStyles, 
  calculateProjectedGrowth 
} from '../utils/mockupComposer';

interface ClientTeaserPreviewProps {
  pitch: PitchPackage;
  isStandalone?: boolean;
}

export const ClientTeaserPreview: React.FC<ClientTeaserPreviewProps> = ({
  pitch,
  isStandalone = false
}) => {
  const [sessionId, setSessionId] = useState<string>('');
  const [qrUrl, setQrUrl] = useState<string>('');
  const [timeLeft, setTimeLeft] = useState<{ hours: number; minutes: number; seconds: number }>({
    hours: pitch.discountExpiresHours || 47,
    minutes: 58,
    seconds: 40
  });

  // Lightbox & Asset Viewer State
  const [selectedAssetIndex, setSelectedAssetIndex] = useState<number | null>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(1);

  // Full 30-Day Content Plan Modal State
  const [showFullCalendarModal, setShowFullCalendarModal] = useState<boolean>(false);
  const [calendarFilter, setCalendarFilter] = useState<'all' | 'w1' | 'w2' | 'w3' | 'w4'>('all');

  // Copy Feedback State
  const [copiedCampaignId, setCopiedCampaignId] = useState<string | null>(null);

  const biz = pitch.business;
  const bizName = biz.name_ar || biz.name_en || 'النشاط التجاري';
  const growth = calculateProjectedGrowth(biz.category);
  const standStyles = getAcrylicMaterialStyles(pitch.visualAssets.acrylicStand.material);

  // 1. Initialize Tracking & Anti-Theft Defense
  useEffect(() => {
    const sid = startClientTrackingSession(
      pitch.id,
      bizName,
      biz.phone || ''
    );
    setSessionId(sid);

    // Heartbeat ping every 5 seconds
    const pingTimer = setInterval(() => {
      pingClientSession(sid);
    }, 5000);

    // Attach Anti-Theft listener (blocks right click & save shortcuts)
    const cleanupDefense = attachAntiTheftDefense(pitch.watermarkSettings);

    return () => {
      clearInterval(pingTimer);
      cleanupDefense();
    };
  }, [pitch.id, bizName, pitch.watermarkSettings]);

  // 2. Load QR code
  useEffect(() => {
    generateQrDataUrl(pitch.visualAssets.acrylicStand.qrTargetUrl).then(url => {
      setQrUrl(url);
    });
  }, [pitch.visualAssets.acrylicStand.qrTargetUrl]);

  // 3. Countdown timer tick
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleCtaClick = () => {
    if (sessionId) {
      recordClientWhatsAppCta(sessionId);
    }
    confetti({
      particleCount: 120,
      spread: 80,
      origin: { y: 0.7 }
    });
  };

  const watermarkSvgUrl = pitch.watermarkSettings.enabled
    ? generateWatermarkPatternSvg(pitch.watermarkSettings)
    : '';

  // 4. Construct Protected Visual Assets Catalog
  const visualAssetItems = React.useMemo(() => {
    const items: Array<{
      id: string;
      title: string;
      badge: string;
      badgeColor: string;
      imageUrl: string;
      description: string;
      specs: string;
      type: 'logo' | 'catalog' | 'social_post' | 'promo_offer' | 'photo';
    }> = [];

    // 1. Logo
    const logoUrl = pitch.visualAssets.logoDataUrl || pitch.visualAssets.signboardPhotoUrl;
    if (logoUrl) {
      items.push({
        id: 'logo',
        title: 'شعار الهوية الرقمية المعتمد (Brand Emblem Logo)',
        badge: 'الهوية والشعار 👑',
        badgeColor: 'bg-amber-100 text-amber-900 border-amber-300',
        imageUrl: logoUrl,
        description: `شعار رقمي أيقوني فخم ومتناسق مصمم خصيصاً لـ «${bizName}»، مضبوط الأبعاد والألوان ليناسب الواجهات، المطبوعات، ومواقع التواصل بدقة فائقة.`,
        specs: 'دقة طباعة فائقة 300DPI • خلفية نقية متناسقة',
        type: 'logo'
      });
    }

    // 2. Catalog / Price Menu
    if (pitch.visualAssets.catalogDataUrl) {
      items.push({
        id: 'catalog',
        title: 'كتالوج وقائمة الأسعار والخدمات (Price Menu Board)',
        badge: 'المنيو والأسعار 📋',
        badgeColor: 'bg-blue-100 text-blue-900 border-blue-300',
        imageUrl: pitch.visualAssets.catalogDataUrl,
        description: `لوحة خدمات وأسعار منظمة تبرز أهم منتجات وعروض «${bizName}» بالجنيه المصري، مصممة بطريقة نفسية ترفع ثقة الزبون في قرار الشراء وتسهل اختياره.`,
        specs: 'تصميم عمودي A4/A3 جاهز للطباعة وللنشر الرقمي كـ PDF',
        type: 'catalog'
      });
    }

    // 3. Branded Social Post
    const postUrl = pitch.visualAssets.socialMockupPosts && pitch.visualAssets.socialMockupPosts.length > 0 
      ? pitch.visualAssets.socialMockupPosts[0]?.imageUrl 
      : undefined;
    if (postUrl) {
      items.push({
        id: 'social_post',
        title: 'بوست السوشيال ميديا الإعلاني (Branded Social Post)',
        badge: 'سوشيال ميديا 📱',
        badgeColor: 'bg-purple-100 text-purple-900 border-purple-300',
        imageUrl: postUrl,
        description: `قالب إعلاني سينمائي جذاب مدمج بهوية النشاط وشعار رسمي، مخصص لجذب التفاعل وزيادة طلبات الشراء عبر فيسبوك وإنستغرام.`,
        specs: 'أبعاد 1080×1080 مربع موحد لـ Instagram و Facebook',
        type: 'social_post'
      });
    }

    // 4. Promo Offer Banner
    if (pitch.visualAssets.promoOfferDataUrl) {
      items.push({
        id: 'promo_offer',
        title: 'بانر العرض الترويجي وبطاقة الخصم (Promo Offer Banner)',
        badge: 'حملة العروض 🔥',
        badgeColor: 'bg-rose-100 text-rose-900 border-rose-300',
        imageUrl: pitch.visualAssets.promoOfferDataUrl,
        description: `بانر إعلاني ناري لإطلاق عروض الخصم الترويجية لجذب الزبائن الجدد وأهالي المنطقة للشراء المباشر.`,
        specs: 'أبعاد 1920×1080 عريضة للشاشات والإعلانات الممولة',
        type: 'promo_offer'
      });
    }

    // 5. Business Photos from Google / Core
    if (Array.isArray(pitch.business.photos)) {
      pitch.business.photos.forEach((ph, idx) => {
        const url = typeof ph === 'string' ? ph : (ph as any)?.url;
        if (url && !items.some(it => it.imageUrl === url)) {
          items.push({
            id: `photo_${idx}`,
            title: `صورة المقر الميداني الموثقة (${idx + 1})`,
            badge: 'توثيق ميداني 📍',
            badgeColor: 'bg-emerald-100 text-emerald-900 border-emerald-300',
            imageUrl: url,
            description: `لقطة حقيقية موثقة لمقر «${bizName}» ضمن ملف التوثيق الميداني المعتمد.`,
            specs: 'صورة موقع حقيقية موثقة',
            type: 'photo'
          });
        }
      });
    }

    return items;
  }, [pitch.visualAssets, pitch.business, bizName]);

  // Lightbox Zoom & Navigation handlers
  const handleZoomIn = () => setZoomLevel(prev => Math.min(Number((prev + 0.25).toFixed(2)), 2.5));
  const handleZoomOut = () => setZoomLevel(prev => Math.max(Number((prev - 0.25).toFixed(2)), 0.75));
  const handleZoomReset = () => setZoomLevel(1);

  const handleNextImage = () => {
    if (selectedAssetIndex === null || visualAssetItems.length === 0) return;
    setZoomLevel(1);
    setSelectedAssetIndex((selectedAssetIndex + 1) % visualAssetItems.length);
  };

  const handlePrevImage = () => {
    if (selectedAssetIndex === null || visualAssetItems.length === 0) return;
    setZoomLevel(1);
    setSelectedAssetIndex((selectedAssetIndex - 1 + visualAssetItems.length) % visualAssetItems.length);
  };

  // Keyboard navigation for Lightbox
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedAssetIndex === null) return;
      if (e.key === 'Escape') setSelectedAssetIndex(null);
      if (e.key === 'ArrowLeft') handleNextImage();
      if (e.key === 'ArrowRight') handlePrevImage();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedAssetIndex, visualAssetItems.length]);

  // 5. Full 30-Day Marketing Plan
  const fullCalendarDays = React.useMemo(() => {
    if (Array.isArray(pitch.marketingData?.calendar) && pitch.marketingData.calendar.length >= 20) {
      return pitch.marketingData.calendar.map((c: any, idx: number) => ({
        day: c.day || idx + 1,
        pillar: c.pillarTitle || c.pillar || 'محتوى تسويقي',
        title: c.headline || c.title || `منشور اليوم ${idx + 1}`,
        hook: c.hookText || c.hook || 'عرض حصري لا يفوتك!',
        callToAction: c.callToAction || 'تواصل معنا الآن عبر واتساب أو زر مقرنا.',
        format: c.suggestedFormat || (idx % 3 === 0 ? 'ريل / فيديو قصير' : idx % 3 === 1 ? 'ألبوم صور كاروسيل' : 'صورة فردية'),
        hashtags: c.hashtags || `#دليلك #${bizName.replace(/\s+/g, '_')}`
      }));
    }

    // Default robust 30 days
    const pillars = [
      { name: 'قيمة وتوعية', format: 'ريل / فيديو قصير' },
      { name: 'جودة ومصداقية', format: 'ألبوم صور كاروسيل' },
      { name: 'عرض ترويجي وخصم', format: 'صورة عرض فردية' },
      { name: 'تفاعل وسؤال للزبائن', format: 'منشور سؤال وستوري' }
    ];

    const hooks = [
      `ليه كل أهالي ${biz.city || 'المنطقة'} بيختاروا «${bizName}» أول ما يحتاجوا الجودة؟`,
      `سر بسيط هيغير تجربتك تماماً لما تزورنا في «${bizName}»!`,
      `عرض خاص جداً ومحدود لكل زبائننا الكرام بمناسبة الأسبوع الجديد ✨`,
      `سؤال اليوم: إيه أكتر حاجة بتدور عليها لما تشتري؟ شاركنا رأيك في التعليقات 👇`,
      `كواليس من داخل «${bizName}».. إزاي بنضمن لك أعلى مستوى في كل طلب؟`,
      `لو بتدور على الأمانة والسرعة وراحة البال، مكانك الصح هو «${bizName}» 🤝`,
      `خصم استثنائي لليوم فقط! اطلب دلوقتي واستفيد من العرض قبل النفاذ 🔥`
    ];

    return Array.from({ length: 30 }, (_, i) => {
      const dayNum = i + 1;
      const p = pillars[i % pillars.length];
      const hook = hooks[i % hooks.length];
      return {
        day: dayNum,
        pillar: p.name,
        title: `خطة اليوم ${dayNum}: ${p.name}`,
        hook: hook,
        callToAction: 'زور مقرنا اليوم أو راسلنا على واتساب للاستفادة من العرض!',
        format: p.format,
        hashtags: `#دليلك #${bizName.replace(/\s+/g, '_')} #${biz.city || 'مصر'}`
      };
    });
  }, [pitch.marketingData?.calendar, bizName, biz.city]);

  const filteredCalendarDays = React.useMemo(() => {
    if (calendarFilter === 'w1') return fullCalendarDays.filter(d => d.day >= 1 && d.day <= 7);
    if (calendarFilter === 'w2') return fullCalendarDays.filter(d => d.day >= 8 && d.day <= 14);
    if (calendarFilter === 'w3') return fullCalendarDays.filter(d => d.day >= 15 && d.day <= 21);
    if (calendarFilter === 'w4') return fullCalendarDays.filter(d => d.day >= 22 && d.day <= 30);
    return fullCalendarDays;
  }, [fullCalendarDays, calendarFilter]);

  // 6. WhatsApp Campaigns
  const whatsappCampaignsList = React.useMemo(() => {
    if (Array.isArray(pitch.marketingData?.whatsappCampaigns) && pitch.marketingData.whatsappCampaigns.length > 0) {
      return pitch.marketingData.whatsappCampaigns;
    }
    return [
      {
        id: 'camp_welcome',
        title: '1. رسالة الترحيب والخصم للزبائن الجدد',
        audience: 'الزبائن الجدد وأهالي المنطقة',
        messageText: `أهلاً بحضرتك في «${bizName}» 🌸\nسعداء جداً بتواصلك معانا! حبينا نهديك كود خصم 10% على أول زيارة أو طلب ليك.\n📍 عنواننا: ${biz.city || 'مصر'}\nلطلب الخدمة أو الاستفسار، رد علينا هنا مباشرة وهنخدمك بعيونا! ✨`
      },
      {
        id: 'camp_review',
        title: '2. رسالة طلب تقييم 5 نجوم على Google Maps بعد المعاملة',
        audience: 'الزبائن بعد إتمام الشراء',
        messageText: `مساء الخير يا فندم 🌟\nنتمنى تكون تجربتك مع «${bizName}» كانت على أعلى مستوى!\nرأيك يهمنا جداً وبيساعدنا نطور خدماتنا.. لو تكرمت بثواني معدودة تترك لنا تقييمك الجميل 5 نجوم على Google Maps من هنا:\n${pitch.visualAssets.acrylicStand.qrTargetUrl || 'https://maps.google.com'}\nشاكرين جداً لثقتك ودعمك! 🤝`
      },
      {
        id: 'camp_fomo',
        title: '3. رسالة العرض الأسبوعي الخاص وإعادة تنشيط الزبائن',
        audience: 'الزبائن السابقين لإعادة الطلب',
        messageText: `عرض خاص لزبائن «${bizName}» الأوفياء 🔥\nجاهزين لخدمتك طوال الأسبوع بعروض مميزة جداً وتخفيضات خاصة لحاملي هذه الرسالة.\nشرفنا بزيارتك أو اطلب دليفري دلوقتي واستمتع بأفضل جودة وخدمة في ${biz.city || 'منطقتك'}!`
      }
    ];
  }, [pitch.marketingData?.whatsappCampaigns, bizName, biz.city, pitch.visualAssets.acrylicStand.qrTargetUrl]);

  const personaSlogan = pitch.marketingData?.persona?.slogan;
  const activeAsset = selectedAssetIndex !== null ? visualAssetItems[selectedAssetIndex] : null;

  return (
    <div className="relative min-h-screen bg-slate-50 text-slate-900 selection:bg-amber-500 selection:text-white anti-theft-shield pb-24">
      
      {/* 🛡️ LAYER 1: Continuous Repeating Diagonal Watermark */}
      {pitch.watermarkSettings.enabled && (
        <div
          className="fixed inset-0 pointer-events-none z-30"
          style={{
            backgroundImage: `url("${watermarkSvgUrl}")`,
            backgroundRepeat: 'repeat'
          }}
        />
      )}

      {/* Top Client Notification Bar */}
      <div className="bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 text-slate-950 px-4 py-2.5 text-center text-xs font-black shadow-xs flex items-center justify-center gap-2">
        <span className="animate-pulse">💎</span>
        <span>معاينة حصرية خاصة بنشاط: <strong>«{bizName}»</strong> • عرض محدود لمدة 48 ساعة فقط</span>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
        
        {/* HERO SECTION */}
        <section 
          className="text-center space-y-4 pt-4"
          onMouseEnter={() => sessionId && recordSectionView(sessionId, 'hero')}
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-100 border border-amber-300 text-amber-900 text-xs font-black shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>خطة التوثيق والتصدر الميداني المعتمدة</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight leading-snug">
            {pitch.headline}
          </h1>

          {personaSlogan && (
            <div className="inline-block bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 px-4 py-1.5 rounded-2xl text-xs sm:text-sm font-black text-amber-900 shadow-xs">
              ✨ شعار الهوية: «{personaSlogan}»
            </div>
          )}

          <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed font-medium">
            {pitch.subheadline}
          </p>

          <div className="flex items-center justify-center gap-4 text-xs text-slate-500 flex-wrap">
            <span className="flex items-center gap-1 font-bold text-slate-700">
              <Store className="w-4 h-4 text-amber-500" />
              <span>{bizName}</span>
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <MapPin className="w-4 h-4 text-amber-500" />
              <span>{biz.city || 'المدينة'} - {biz.governorate || 'مصر'}</span>
            </span>
            <span>•</span>
            <span className="inline-flex items-center gap-1 text-emerald-700 font-bold bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>مؤهل للاعتماد المباشر</span>
            </span>
          </div>
        </section>

        {/* 🎨 CENTERPIECE 1: PROTECTED HIGH-RES VISUAL ASSETS GALLERY (الاطلاع الكامل على الصور) */}
        <section 
          className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-md space-y-6 relative overflow-hidden"
          onMouseEnter={() => sessionId && recordSectionView(sessionId, 'visual_assets_gallery')}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-black text-amber-700 bg-amber-100 px-2.5 py-0.5 rounded-full border border-amber-300">
                  نماذج بصرية حصرية 300DPI 🎨
                </span>
                <span className="text-xs text-slate-400 font-bold">
                  ({visualAssetItems.length} نماذج وتصاميم جاهزة)
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-black text-slate-900 flex items-center gap-2">
                <Layers className="w-5 h-5 text-amber-500" />
                <span>معرض تصاميم الهوية البصرية لـ «{bizName}»</span>
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                جميع التصاميم أنتجت خصيصاً لنشاطك، اضغط على أي تصميم للاطلاع الكامل والتكبير بدقة عالية 🔍
              </p>
            </div>
            <span className="text-xs font-bold text-amber-700 bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-200 self-start sm:self-center flex items-center gap-1">
              <Lock className="w-3.5 h-3.5" />
              <span>عينة مؤمنة بالعلامة المائية</span>
            </span>
          </div>

          {/* Grid of visual asset cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {visualAssetItems.map((item, idx) => (
              <div
                key={item.id}
                onClick={() => {
                  setSelectedAssetIndex(idx);
                  setZoomLevel(1);
                }}
                className="group bg-slate-50 hover:bg-white rounded-2xl border border-slate-200 hover:border-amber-400 p-4 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between space-y-3 relative overflow-hidden"
              >
                {/* Header info */}
                <div className="flex items-center justify-between gap-2">
                  <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full border ${item.badgeColor}`}>
                    {item.badge}
                  </span>
                  <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1 group-hover:text-amber-600 transition-colors">
                    <Maximize2 className="w-3 h-3" />
                    <span>تكبير بالحجم الكامل</span>
                  </span>
                </div>

                <strong className="text-xs sm:text-sm font-black text-slate-900 line-clamp-1 group-hover:text-amber-600 transition-colors">
                  {item.title}
                </strong>

                {/* Thumbnail Stage with Watermark Protection */}
                <div className="h-48 sm:h-56 bg-slate-900 rounded-xl overflow-hidden relative border border-slate-200 flex items-center justify-center">
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="w-full h-full object-contain p-2 transition-transform duration-300 group-hover:scale-105 pointer-events-none"
                  />

                  {/* Watermark Pattern on top */}
                  {pitch.watermarkSettings.enabled && (
                    <div
                      className="absolute inset-0 pointer-events-none opacity-40"
                      style={{
                        backgroundImage: `url("${watermarkSvgUrl}")`,
                        backgroundRepeat: 'repeat'
                      }}
                    />
                  )}

                  {/* Hover Overlay Badge */}
                  <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-xs">
                    <span className="bg-amber-500 text-slate-950 px-3.5 py-1.5 rounded-xl text-xs font-black shadow-lg flex items-center gap-1.5 transform translate-y-2 group-hover:translate-y-0 transition-transform">
                      <ZoomIn className="w-4 h-4" />
                      <span>عرض الصورة بالحجم الكامل</span>
                    </span>
                  </div>
                </div>

                {/* Description & Specs */}
                <div className="space-y-1 text-xs">
                  <p className="text-slate-600 text-[11px] leading-relaxed line-clamp-2 font-medium">
                    {item.description}
                  </p>
                  <div className="flex items-center justify-between text-[10px] text-slate-400 pt-2 border-t border-slate-100 font-bold">
                    <span>{item.specs}</span>
                    <span className="text-amber-600 flex items-center gap-1">
                      <span>فتح العارض</span>
                      <span>←</span>
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="p-3 bg-slate-100 rounded-2xl text-center text-xs text-slate-600 font-bold">
            💡 <span className="text-slate-900">ملاحظة:</span> يتم تسليم جميع التصاميم الأصلية بدقة الطباعة الكاملة (بدون أي علامة مائية) فور تفعيل الاشتراك في الباقة.
          </div>
        </section>

        {/* 🌟 CENTERPIECE 2: 3D ACRYLIC TABLE STAND SHOWCASE */}
        <section 
          className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-md relative overflow-hidden"
          onMouseEnter={() => sessionId && recordSectionView(sessionId, 'acrylic_stand')}
        >
          <div className="text-center max-w-xl mx-auto mb-8 space-y-2">
            <span className="text-xs font-black text-amber-600 bg-amber-50 px-3 py-1 rounded-full border border-amber-200 inline-block">
              الهدية المجانية الحصرية مع الباقة 🎁
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900">
              ستاند الطاولة الأكريليكي الفاخر بـ QR كود ذكي
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              مجسم كريستالي راقٍ يوضع على طاولات وكاونتر الاستقبال لجذب مئات التقييمات الحقيقية 5 نجوم على Google Maps
            </p>
          </div>

          {/* 3D Realistic Stand Stage */}
          <div className="p-6 sm:p-12 bg-gradient-to-b from-slate-50 via-slate-100 to-slate-200 rounded-2xl border border-slate-300 flex flex-col items-center justify-center relative shadow-inner">
            
            {/* Ambient Lighting Glow */}
            <div 
              className="absolute w-64 h-64 rounded-full blur-3xl opacity-60 pointer-events-none"
              style={{ backgroundColor: standStyles.glowColor }}
            />

            {/* Stand Main Crystal Plate */}
            <div className={`w-56 sm:w-64 bg-white/90 backdrop-blur-md rounded-2xl p-5 border-2 ${standStyles.borderColor} shadow-2xl flex flex-col items-center text-center relative transition-transform duration-300 hover:scale-102`}>
              
              {/* Beveled Top Reflection Line */}
              <div className="absolute top-2 left-4 right-4 h-0.5 bg-gradient-to-r from-transparent via-white to-transparent opacity-80" />

              {/* Google 5-Star Header Badge */}
              <div className={`text-[10px] font-black px-3 py-1 rounded-full mb-3 shadow-xs flex items-center gap-1.5 ${standStyles.badgeBg}`}>
                <div className="flex text-amber-300">
                  {'★★★★★'}
                </div>
                <span>تقييم 5 نجوم Google</span>
              </div>

              {/* Business Name */}
              <h3 className="text-sm font-black text-slate-900 mb-1 truncate max-w-full">
                {bizName}
              </h3>
              <span className="text-[10px] text-slate-500 mb-3 font-medium">
                {biz.category || 'دليلك المعتمد'}
              </span>

              {/* Central High-Contrast QR Code */}
              <div className="relative p-2.5 bg-white rounded-xl shadow-md border border-slate-100 mb-3">
                {qrUrl ? (
                  <img
                    src={qrUrl}
                    alt="QR Code"
                    className="w-32 h-32 rounded-lg pointer-events-none"
                  />
                ) : (
                  <div className="w-32 h-32 bg-slate-100 animate-pulse rounded-lg" />
                )}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-7 h-7 bg-white rounded-full p-0.5 shadow-md border border-amber-300 flex items-center justify-center font-black text-amber-600 text-[10px]">
                    د
                  </div>
                </div>
              </div>

              {/* Tagline */}
              <p className="text-[10px] font-black text-slate-700 leading-tight mb-2">
                {pitch.visualAssets.acrylicStand.tagline}
              </p>

              {/* NFC & Official Badge */}
              <div className="pt-2 border-t border-slate-200/80 w-full flex items-center justify-between text-[8px] font-bold text-slate-400">
                <span className="flex items-center gap-1 text-slate-600">
                  <Radio className="w-2.5 h-2.5 text-amber-500 animate-pulse" />
                  لمس NFC مباشر
                </span>
                <span>دليلك 🇪🇬</span>
              </div>

            </div>

            {/* Stand Heavy Metallic Base */}
            <div className={`w-72 sm:w-80 h-5 mt-2 rounded-t-sm bg-gradient-to-r ${standStyles.baseGradient} shadow-xl border-t border-white/50 relative z-10 flex items-center justify-center`}>
              <div className="w-32 h-1 bg-white/40 rounded-full" />
            </div>

            {/* Ground Shadow */}
            <div className="w-76 sm:w-84 h-2 bg-slate-500/40 rounded-full blur-xs mt-1" />

          </div>

          <div className="mt-4 text-center text-xs text-slate-500 font-medium">
            يصلك المجسم مصنعاً من أجود خامات الأكريليك مع شهادة توثيق رسمية
          </div>
        </section>

        {/* 📈 CENTERPIECE 3: PROJECTED GROWTH ON GOOGLE MAPS */}
        <section 
          className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6"
          onMouseEnter={() => sessionId && recordSectionView(sessionId, 'google_growth')}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-emerald-500" />
                <span>العائد المتوقع على نشاط «{bizName}» بعد التوثيق</span>
              </h3>
              <p className="text-xs text-slate-500">مبني على دراسة معدلات نمو الأنشطة المشابهة في {biz.city || 'المنطقة'}</p>
            </div>
            <span className="bg-emerald-100 text-emerald-800 text-xs font-black px-3 py-1 rounded-full self-start sm:self-center">
              نتائج مضمونة 100%
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-center space-y-1">
              <span className="text-2xl sm:text-3xl font-black text-amber-500 font-mono block">
                {growth.googleViewsJump.split(' ')[0]}
              </span>
              <strong className="text-xs font-black text-slate-900 block">ظهور خرائط Google</strong>
              <p className="text-[11px] text-slate-500">{growth.googleViewsJump}</p>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-center space-y-1">
              <span className="text-2xl sm:text-3xl font-black text-emerald-600 font-mono block">
                {growth.reviewsPerMonth.split(' ')[0]}
              </span>
              <strong className="text-xs font-black text-slate-900 block">تقييمات موثقة 5 نجوم</strong>
              <p className="text-[11px] text-slate-500">{growth.reviewsPerMonth}</p>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-center space-y-1">
              <span className="text-2xl sm:text-3xl font-black text-blue-600 font-mono block">
                {growth.walkinCustomers.split(' ')[0]}
              </span>
              <strong className="text-xs font-black text-slate-900 block">زبائن جدد للمحل</strong>
              <p className="text-[11px] text-slate-500">{growth.walkinCustomers}</p>
            </div>
          </div>
        </section>

        {/* 🗓️ CENTERPIECE 4: 30-DAY CONTENT PLAN HIGHLIGHTS + MODAL ACCESS */}
        <section 
          className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6"
          onMouseEnter={() => sessionId && recordSectionView(sessionId, 'content_plan')}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-black px-2.5 py-0.5 rounded-full">
                  30 منشور مكتوب ومجدول 🗓️
                </span>
              </div>
              <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-500" />
                <span>خطة المحتوى التسويقي لـ «{bizName}» (30 يوماً)</span>
              </h3>
              <p className="text-xs text-slate-500">نصوص مكتوبة خصيصاً لجذب الزبائن باللهجة المصرية المحببة ومقسمة لـ 4 ركائز استراتيجية</p>
            </div>
            
            <button
              type="button"
              onClick={() => setShowFullCalendarModal(true)}
              className="inline-flex items-center gap-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs px-4 py-2.5 rounded-xl shadow-xs transition cursor-pointer self-start sm:self-center"
            >
              <Calendar className="w-4 h-4" />
              <span>استعراض الـ 30 يوماً بالكامل ←</span>
            </button>
          </div>

          {/* Sample Snippet Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {fullCalendarDays.slice(0, 4).map((plan) => (
              <div
                key={plan.day}
                className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 text-xs hover:border-amber-300 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="bg-amber-500 text-slate-950 font-black px-2 py-0.5 rounded-lg text-[10px]">
                    اليوم {plan.day}
                  </span>
                  <span className="text-[10px] font-bold text-slate-500 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                    {plan.pillar}
                  </span>
                </div>
                <strong className="block text-slate-900 font-black text-xs">
                  {plan.title}
                </strong>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  «{plan.hook}»
                </p>
                <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
                  <span>النوع: {plan.format}</span>
                  <span className="text-amber-600 font-bold">جاهز للنشر ✓</span>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center pt-1">
            <button
              type="button"
              onClick={() => setShowFullCalendarModal(true)}
              className="text-xs font-black text-amber-600 hover:text-amber-700 underline inline-flex items-center gap-1 cursor-pointer"
            >
              <span>عرض باقي أيام الخطة (من اليوم 5 حتى اليوم 30)</span>
              <span>←</span>
            </button>
          </div>
        </section>

        {/* 💬 CENTERPIECE 5: READY WHATSAPP CAMPAIGN MESSAGES (حملات الواتساب الجاهزة) */}
        <section 
          className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6"
          onMouseEnter={() => sessionId && recordSectionView(sessionId, 'whatsapp_campaigns')}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="bg-emerald-100 text-emerald-900 border border-emerald-300 text-[10px] font-black px-2.5 py-0.5 rounded-full">
                  حملات الواتساب الميدانية 💬
                </span>
              </div>
              <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-emerald-600" />
                <span>رسائل واتساب تسويقية جاهزة لإرسالها لزبائنك</span>
              </h3>
              <p className="text-xs text-slate-500">قوالب رسائل مصممة لزيادة المبيعات وإعادة تنشيط الزبائن وطلب تقييمات خرائط Google</p>
            </div>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 self-start sm:self-center">
              جاهزة للإرسال فوراً
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {whatsappCampaignsList.map((camp) => (
              <div
                key={camp.id || camp.title}
                className="bg-emerald-50/50 border border-emerald-200 rounded-2xl p-4 flex flex-col justify-between space-y-3"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="bg-emerald-600 text-white text-[10px] font-black px-2 py-0.5 rounded-md">
                      واتساب رسمي
                    </span>
                    <span className="text-[10px] text-slate-400 font-bold">
                      {camp.audience || 'الزبائن'}
                    </span>
                  </div>
                  <strong className="text-xs font-black text-slate-900 block">
                    {camp.title}
                  </strong>
                  
                  {/* WhatsApp Speech Bubble */}
                  <div className="bg-white rounded-xl p-3 border border-emerald-100 text-[11px] text-slate-700 leading-relaxed font-sans whitespace-pre-line shadow-xs">
                    {camp.messageText}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(camp.messageText);
                    setCopiedCampaignId(camp.id || camp.title);
                    setTimeout(() => setCopiedCampaignId(null), 2500);
                  }}
                  className="w-full flex items-center justify-center gap-1.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
                >
                  {copiedCampaignId === (camp.id || camp.title) ? (
                    <>
                      <CheckCheck className="w-3.5 h-3.5 text-white" />
                      <span>تم نسخ الرسالة!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>نسخ نص الرسالة</span>
                    </>
                  )}
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* 💰 CENTERPIECE 6: LIMITED-TIME DEAL & PRICING PACKAGES */}
        <section 
          className="bg-gradient-to-b from-amber-500 to-amber-600 rounded-3xl p-6 sm:p-10 text-slate-950 shadow-xl space-y-8 relative overflow-hidden"
          onMouseEnter={() => sessionId && recordSectionView(sessionId, 'pricing_deal')}
        >
          {/* Subtle background decoration */}
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />

          {/* Countdown timer */}
          <div className="max-w-md mx-auto bg-slate-950 text-white p-4 rounded-2xl text-center space-y-2 shadow-lg">
            <span className="text-[11px] font-black text-amber-400 flex items-center justify-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              <span>ينتهي الخصم الاستثنائي خلال:</span>
            </span>
            <div className="flex items-center justify-center gap-3 font-mono font-black text-xl sm:text-2xl">
              <div className="bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800">
                <span>{String(timeLeft.hours).padStart(2, '0')}</span>
                <span className="text-[9px] block text-slate-400 font-sans">ساعة</span>
              </div>
              <span>:</span>
              <div className="bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800">
                <span>{String(timeLeft.minutes).padStart(2, '0')}</span>
                <span className="text-[9px] block text-slate-400 font-sans">دقيقة</span>
              </div>
              <span>:</span>
              <div className="bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800 text-amber-400">
                <span>{String(timeLeft.seconds).padStart(2, '0')}</span>
                <span className="text-[9px] block text-slate-400 font-sans">ثانية</span>
              </div>
            </div>
          </div>

          {/* Price Box */}
          <div className="text-center space-y-3">
            <span className="bg-slate-950 text-amber-400 text-xs font-black px-4 py-1 rounded-full inline-block shadow-xs">
              {pitch.packageName}
            </span>

            <div className="flex items-center justify-center gap-4">
              <span className="text-base sm:text-xl line-through text-slate-900/60 font-mono font-bold">
                {pitch.originalPrice} {pitch.currency}
              </span>
              <span className="text-3xl sm:text-5xl font-black text-slate-950 font-mono tracking-tight">
                {pitch.discountedPrice} {pitch.currency}
              </span>
            </div>

            <p className="text-xs sm:text-sm font-bold text-slate-950/90 max-w-md mx-auto">
              شاملة الستاند الأكريليكي الكريستالي + التوثيق الرسمي + خطة الـ 30 يوماً + التصاميم الـ 4 كاملة
            </p>
          </div>

          {/* Deliverables Checklist */}
          <div className="bg-white/90 backdrop-blur-md rounded-2xl p-5 max-w-xl mx-auto space-y-2.5 shadow-sm text-xs">
            {pitch.deliverables.map((del) => (
              <div key={del.id} className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span className="text-slate-800 font-bold">{del.title}</span>
              </div>
            ))}
          </div>

          {/* Guarantee Pill */}
          <div className="text-center text-xs font-bold text-slate-950/80 max-w-md mx-auto">
            🛡️ {pitch.guaranteeText}
          </div>

          {/* Main Action Button */}
          <div className="text-center pt-2">
            <a
              href={`https://wa.me/201556221141?text=${encodeURIComponent(`السلام عليكم، أنا صاحب نشاط «${bizName}» وفتحت المعاينة التفاعلية وحابب أحجز الباقة الذهبية واستلم ستاند الأكريليك والتصاميم الأصلية!`)}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleCtaClick}
              className="inline-flex items-center gap-2 bg-slate-950 hover:bg-slate-900 text-amber-400 font-black text-sm sm:text-base px-8 py-4 rounded-2xl shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-0.5 cursor-pointer"
            >
              <Send className="w-5 h-5" />
              <span>تأكيد الاشتراك وتفعيل الباقة عبر واتساب دليلك</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>

        </section>

      </div>

      {/* 🔍 FULLSCREEN HIGH-RESOLUTION LIGHTBOX MODAL (الاطلاع الكامل على الصور مع التكبير) */}
      {selectedAssetIndex !== null && activeAsset && (
        <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-md flex flex-col justify-between p-4 sm:p-6 animate-in fade-in duration-200">
          
          {/* Lightbox Top Control Bar */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 z-20">
            <div className="flex items-center gap-3">
              <span className={`text-xs font-black px-3 py-1 rounded-full border ${activeAsset.badgeColor}`}>
                {activeAsset.badge}
              </span>
              <div>
                <h3 className="text-white font-black text-sm sm:text-base truncate max-w-xs sm:max-w-md">
                  {activeAsset.title}
                </h3>
                <span className="text-xs text-slate-400">
                  النموذج {selectedAssetIndex + 1} من {visualAssetItems.length} • نشاط «{bizName}»
                </span>
              </div>
            </div>

            {/* Zoom & Close Controls */}
            <div className="flex items-center gap-2">
              <div className="hidden sm:flex items-center bg-slate-900 border border-slate-700 rounded-xl p-1 gap-1 text-slate-300">
                <button
                  type="button"
                  onClick={handleZoomOut}
                  title="تصغير"
                  className="p-1.5 hover:bg-slate-800 rounded-lg hover:text-white transition cursor-pointer"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <span className="text-xs font-mono font-bold px-2 text-amber-400">
                  {Math.round(zoomLevel * 100)}%
                </span>
                <button
                  type="button"
                  onClick={handleZoomIn}
                  title="تكبير"
                  className="p-1.5 hover:bg-slate-800 rounded-lg hover:text-white transition cursor-pointer"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={handleZoomReset}
                  title="إعادة ضبط (100%)"
                  className="p-1.5 hover:bg-slate-800 rounded-lg hover:text-white transition text-[11px] font-bold px-2 cursor-pointer"
                >
                  100%
                </button>
              </div>

              <button
                type="button"
                onClick={() => setSelectedAssetIndex(null)}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 transition cursor-pointer"
                title="إغلاق المعاينة المكبرة (Esc)"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Lightbox Center Viewport */}
          <div className="flex-1 flex items-center justify-center relative overflow-hidden my-4">
            
            {/* Previous Image Button */}
            {visualAssetItems.length > 1 && (
              <button
                type="button"
                onClick={handlePrevImage}
                title="الصورة السابقة"
                className="absolute right-2 sm:right-6 z-30 p-3 rounded-full bg-slate-900/80 hover:bg-slate-800 text-white border border-slate-700 shadow-xl transition cursor-pointer"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            )}

            {/* Next Image Button */}
            {visualAssetItems.length > 1 && (
              <button
                type="button"
                onClick={handleNextImage}
                title="الصورة التالية"
                className="absolute left-2 sm:left-6 z-30 p-3 rounded-full bg-slate-900/80 hover:bg-slate-800 text-white border border-slate-700 shadow-xl transition cursor-pointer"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
            )}

            {/* Image Container with Zoom & Watermark */}
            <div className="relative max-w-4xl max-h-[70vh] flex items-center justify-center overflow-auto p-4">
              <img
                src={activeAsset.imageUrl}
                alt={activeAsset.title}
                style={{
                  transform: `scale(${zoomLevel})`,
                  transition: 'transform 0.2s ease-out'
                }}
                className="max-h-[65vh] max-w-full object-contain rounded-xl shadow-2xl pointer-events-none select-none"
              />

              {/* Anti-Theft Watermark Overlay */}
              {pitch.watermarkSettings.enabled && (
                <div
                  className="absolute inset-0 pointer-events-none opacity-50"
                  style={{
                    backgroundImage: `url("${watermarkSvgUrl}")`,
                    backgroundRepeat: 'repeat'
                  }}
                />
              )}
            </div>

          </div>

          {/* Lightbox Bottom Info & Action Bar */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 z-20">
            <div className="space-y-1">
              <p className="text-xs sm:text-sm text-slate-200 font-medium leading-relaxed max-w-2xl">
                {activeAsset.description}
              </p>
              <div className="flex items-center gap-3 text-xs text-slate-400 font-bold flex-wrap">
                <span>{activeAsset.specs}</span>
                <span>•</span>
                <span className="text-amber-400">جاهز للتسليم الفوري بدون علامة مائية عند التعاقد</span>
              </div>
            </div>

            <a
              href={`https://wa.me/201556221141?text=${encodeURIComponent(`السلام عليكم، أنا صاحب نشاط «${bizName}» وعاينت التصميم «${activeAsset.title}» وحابب أطلبه بالجودة الأصلية بدون علامة مائية!`)}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleCtaClick}
              className="w-full md:w-auto inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs sm:text-sm px-6 py-3 rounded-xl shadow-lg transition cursor-pointer shrink-0"
            >
              <Send className="w-4 h-4" />
              <span>طلب استلام التصميم الأصلي عبر واتساب</span>
            </a>
          </div>

        </div>
      )}

      {/* 🗓️ FULL 30-DAY MARKETING CONTENT PLAN MODAL */}
      {showFullCalendarModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-3xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden text-right">
            
            {/* Modal Header */}
            <div className="p-5 sm:p-6 border-b border-slate-200 bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 text-slate-950 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="bg-slate-950 text-amber-400 text-[10px] font-black px-2.5 py-0.5 rounded-full">
                    جدول شهري معتمد
                  </span>
                  <span className="text-xs font-bold text-slate-900">30 منشور مكتوب ومجدول</span>
                </div>
                <h3 className="text-lg sm:text-xl font-black">
                  خطة المحتوى التسويقي الكاملة لـ «{bizName}» (30 يوماً)
                </h3>
              </div>

              <button
                type="button"
                onClick={() => setShowFullCalendarModal(false)}
                className="p-2 rounded-xl bg-slate-950/10 hover:bg-slate-950/20 text-slate-950 transition cursor-pointer"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Filter Tabs by Week */}
            <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center gap-2 overflow-x-auto text-xs font-bold">
              <button
                type="button"
                onClick={() => setCalendarFilter('all')}
                className={`px-3.5 py-2 rounded-xl transition cursor-pointer shrink-0 ${calendarFilter === 'all' ? 'bg-amber-500 text-slate-950 font-black shadow-xs' : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'}`}
              >
                جميع الأيام (30 يوماً)
              </button>
              <button
                type="button"
                onClick={() => setCalendarFilter('w1')}
                className={`px-3.5 py-2 rounded-xl transition cursor-pointer shrink-0 ${calendarFilter === 'w1' ? 'bg-amber-500 text-slate-950 font-black shadow-xs' : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'}`}
              >
                الأسبوع 1 (أيام 1-7): التوعية وبناء الثقة
              </button>
              <button
                type="button"
                onClick={() => setCalendarFilter('w2')}
                className={`px-3.5 py-2 rounded-xl transition cursor-pointer shrink-0 ${calendarFilter === 'w2' ? 'bg-amber-500 text-slate-950 font-black shadow-xs' : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'}`}
              >
                الأسبوع 2 (أيام 8-14): إبراز الجودة والشهادات
              </button>
              <button
                type="button"
                onClick={() => setCalendarFilter('w3')}
                className={`px-3.5 py-2 rounded-xl transition cursor-pointer shrink-0 ${calendarFilter === 'w3' ? 'bg-amber-500 text-slate-950 font-black shadow-xs' : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'}`}
              >
                الأسبوع 3 (أيام 15-21): عروض حصرية وتفاعل
              </button>
              <button
                type="button"
                onClick={() => setCalendarFilter('w4')}
                className={`px-3.5 py-2 rounded-xl transition cursor-pointer shrink-0 ${calendarFilter === 'w4' ? 'bg-amber-500 text-slate-950 font-black shadow-xs' : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'}`}
              >
                الأسبوع 4 (أيام 22-30): حسم المبيعات وإغلاق الشهر
              </button>
            </div>

            {/* Scrollable Calendar List */}
            <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-3">
              {filteredCalendarDays.map((plan) => (
                <div
                  key={plan.day}
                  className="p-4 bg-slate-50 hover:bg-amber-50/40 rounded-2xl border border-slate-200 transition space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <span className="bg-amber-500 text-slate-950 font-black px-2.5 py-0.5 rounded-lg text-xs">
                        اليوم {plan.day}
                      </span>
                      <strong className="text-slate-900 font-black text-sm">
                        {plan.title}
                      </strong>
                    </div>
                    <span className="text-[11px] font-bold text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-full border border-amber-200">
                      ركيزة: {plan.pillar}
                    </span>
                  </div>

                  <div className="bg-white rounded-xl p-3 border border-slate-200 space-y-1.5">
                    <span className="text-[10px] font-bold text-slate-400 block">
                      الجملة الافتتاحية الخاطفة (Hook):
                    </span>
                    <p className="text-slate-800 font-bold text-xs sm:text-sm leading-relaxed">
                      «{plan.hook}»
                    </p>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 flex-wrap gap-2 pt-1 font-medium">
                    <span className="flex items-center gap-1 text-slate-700 font-bold">
                      <span>صيغة المنشور المقترحة:</span>
                      <span className="text-amber-700">{plan.format}</span>
                    </span>
                    <span className="text-slate-400 font-mono text-[10px]">
                      {plan.hashtags}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
              <span className="text-xs text-slate-600 font-bold">
                تسليم ملف PDF مطبوع بكامل المنشورات مع الباقة المعتمدة
              </span>
              <button
                type="button"
                onClick={() => setShowFullCalendarModal(false)}
                className="w-full sm:w-auto px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition cursor-pointer"
              >
                إغلاق الجدول
              </button>
            </div>

          </div>
        </div>
      )}

      {/* 📌 STICKY BOTTOM MOBILE CTA BAR */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 p-3 sm:p-4 shadow-lg flex items-center justify-between max-w-4xl mx-auto rounded-t-2xl">
        <div>
          <span className="text-xs text-slate-400 block font-bold">السعر بعد الخصم:</span>
          <strong className="text-base font-black font-mono text-amber-600">
            {pitch.discountedPrice} {pitch.currency}
          </strong>
        </div>

        <a
          href={`https://wa.me/201556221141?text=${encodeURIComponent(`السلام عليكم، أنا صاحب نشاط «${bizName}» وأريد تأكيد حجز الباقة واستلام ستاند الأكريليك والتصاميم الأصلية.`)}`}
          target="_blank"
          rel="noopener noreferrer"
          onClick={handleCtaClick}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs sm:text-sm px-5 py-2.5 rounded-xl shadow-xs transition-colors cursor-pointer"
        >
          <Send className="w-4 h-4" />
          <span>تأكيد الحجز عبر واتساب</span>
        </a>
      </div>

    </div>
  );
};
