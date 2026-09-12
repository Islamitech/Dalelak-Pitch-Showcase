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
  Eye,
  AlertTriangle,
  Gift,
  HelpCircle,
  BarChart3,
  BadgeCheck
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
  generateSubtlePageWatermarkSvg,
  generateStrongWatermarkPatternSvg,
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

  // Full 30-Day Content Plan VIP Lock Modal State
  const [showLockedCalendarModal, setShowLockedCalendarModal] = useState<boolean>(false);
  const [selectedLockedDay, setSelectedLockedDay] = useState<number | null>(null);

  const biz = pitch.business;
  const bizName = biz.name_ar || biz.name_en || 'النشاط التجاري';
  const bizLocation = biz.city ? biz.city + (biz.governorate ? ' - ' + biz.governorate : '') : 'مصر';
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

  // Subtle, weak watermark pattern for the entire page background
  const pageWatermarkSvgUrl = pitch.watermarkSettings.enabled
    ? generateSubtlePageWatermarkSvg(pitch.watermarkSettings)
    : '';

  // Strong, high-contrast watermark pattern exclusively for image previews and lightbox
  const strongWatermarkSvgUrl = pitch.watermarkSettings.enabled
    ? generateStrongWatermarkPatternSvg(pitch.watermarkSettings)
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
        description: `شعار رقمي أيقوني فخم ومتناسق صُمم خصيصاً لـ «${bizName}»، مضبوط الأبعاد والألوان ليناسب الواجهات، المطبوعات، ومواقع التواصل بدقة فائقة.`,
        specs: 'دقة طباعة فائقة 300DPI • تسليم بصيغ PNG شفافة و Vector مفتوح',
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
        description: `لوحة خدمات وقائمة أسعار منظمة تبرز أهم عروض ومنتجات «${bizName}» بالجنيه المصري، مصممة بطريقة نفسية ترفع ثقة الزبون في قرار الشراء وتسهل اختياره.`,
        specs: 'تصميم عمودي A4/A3 جاهز للطباعة وللنشر الرقمي كـ PDF عالي الدقة',
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
        description: `قالب إعلاني سينمائي جذاب مدمج بهوية النشاط وشعار رسمي، مخصص لجذب التفاعل وزيادة طلبات الشراء المباشرة عبر فيسبوك وإنستغرام.`,
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
            description: `لقطة حقيقية موثقة لمقر «${bizName}» ضمن ملف التوثيق الميداني المعتمد في خرائط Google.`,
            specs: 'صورة موقع حقيقية موثقة رسمياً',
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

  // 5. Sample 3 Teaser Posts + 27 Locked Days
  const sampleLivePosts = React.useMemo(() => {
    if (Array.isArray(pitch.marketingData?.calendar) && pitch.marketingData.calendar.length >= 3) {
      return pitch.marketingData.calendar.slice(0, 3).map((c: any, idx: number) => ({
        day: c.day || idx + 1,
        pillar: c.pillarTitle || c.pillar || 'قيمة وتوعية',
        title: c.headline || c.title || `منشور اليوم ${idx + 1}`,
        hook: c.hookText || c.hook || 'أعلى جودة تلبي طلبك في منطقتك!',
        format: c.suggestedFormat || (idx === 0 ? 'ريل / فيديو قصير' : idx === 1 ? 'ألبوم صور كاروسيل' : 'صورة ترويجية')
      }));
    }

    return [
      {
        day: 1,
        pillar: 'توعية وقيمة متخصصة',
        title: `الجو برد والبرد مش عايز يسيبنا؟`,
        hook: `يا أهل ${biz.city || 'المنطقة'} الكرام، الجو الأيام دي متقلب وكل شوية نلاقي دور برد جديد داخل على البيت.. تفتكروا إيه أحسن مشروب دافي بيظبط معاكم مع الدواء؟ شاركونا في التعليقات!`,
        format: 'ريل / فيديو قصير'
      },
      {
        day: 2,
        pillar: 'إبراز الجودة وحل المشاكل',
        title: `نواقص الأدوية؟ فكك من اللف والتعب!`,
        hook: `تعبت من كتر اللف عشان تلاقي دوام معين؟ في «${bizName}» بنوفر لك نواقص الأدوية والمستلزمات الطبية وبنوصلها لباب بيتك بأسرع خدمة دليفري بالمنطقة.`,
        format: 'ألبوم صور كاروسيل'
      },
      {
        day: 3,
        pillar: 'عروض وخصومات حصرية',
        title: `عرض الويك إند لست الكل وعائلتها!`,
        hook: `عشان عيون جيراننا الغاليين في ${biz.city || 'المنطقة'}، الدلع كله والعناية الصحية والشخصية عندنا عليها خصم خاص لليومين دول بس!`,
        format: 'صورة عرض ترويجية'
      }
    ];
  }, [pitch.marketingData?.calendar, bizName, biz.city]);

  // Generate locked days 4 to 30
  const lockedDaysList = React.useMemo(() => {
    const lockedPillars = ['عروض مبيعات مباشرة', 'كواليس وثقة وجودة', 'مسابقة وتفاعل زبائن', 'نصيحة واستشارة موثوقة', 'تذكير بالخدمة السريعة'];
    return Array.from({ length: 27 }, (_, i) => {
      const dayNum = i + 4;
      const pillar = lockedPillars[i % lockedPillars.length];
      return {
        day: dayNum,
        pillar,
        status: 'locked'
      };
    });
  }, []);

  // 6. WhatsApp Campaigns (No text copying; lead directly to WhatsApp confirmation)
  const whatsappCampaignsList = React.useMemo(() => {
    if (Array.isArray(pitch.marketingData?.whatsappCampaigns) && pitch.marketingData.whatsappCampaigns.length > 0) {
      return pitch.marketingData.whatsappCampaigns;
    }
    return [
      {
        id: 'camp_welcome',
        title: '1. رسالة الترحيب والعرض الافتتاحي للزبائن الجدد',
        audience: 'الزبائن الجدد وأهالي المنطقة',
        teaserSnippet: `يا مرحب بيك في «${bizName}» جيرانك الغاليين في ${biz.city || 'المنطقة'}... بنهديك خصم استثنائي وترحيب خاص على أول طلب!`
      },
      {
        id: 'camp_review',
        title: '2. رسالة طلب تقييم 5 نجوم على Google Maps بعد المعاملة',
        audience: 'الزبائن بعد الشراء لرفع ترتيبك',
        teaserSnippet: `أهلاً بجارنا العزيز! نتمنى تكون خدمتنا نالت إعجابك.. رأيك بيشجعنا نفضل دايماً الأفضل، شاركنا تقييمك 5 نجوم على Google Maps بلمسة واحدة!`
      },
      {
        id: 'camp_fomo',
        title: '3. رسالة متابعة ورعاية الزبائن الدورية وتجديد الطلب',
        audience: 'الزبائن السابقين لضمان ولائهم',
        teaserSnippet: `مساء الخير والرضا من «${bizName}».. حبينا نطمن على صحتك وصحة أسرتك الكريمة، وتحت أمركم في أي وقت لخدمتكم وتوفير احتياجاتكم!`
      }
    ];
  }, [pitch.marketingData?.whatsappCampaigns, bizName, biz.city]);

  const personaSlogan = pitch.marketingData?.persona?.slogan;
  const activeAsset = selectedAssetIndex !== null ? visualAssetItems[selectedAssetIndex] : null;

  return (
    <div className="relative min-h-screen bg-slate-50 text-slate-900 selection:bg-amber-500 selection:text-white anti-theft-shield pb-28">
      
      {/* 🛡️ LAYER 1: Subtle Page Ambient Watermark (Weak, Delicate Slate, Non-Intrusive) */}
      {pitch.watermarkSettings.enabled && (
        <div
          className="fixed inset-0 pointer-events-none z-0 opacity-40"
          style={{
            backgroundImage: `url("${pageWatermarkSvgUrl}")`,
            backgroundRepeat: 'repeat'
          }}
        />
      )}

      {/* Top Client VIP Notification Bar */}
      <div className="relative z-10 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 text-white px-4 py-2.5 text-center text-xs font-bold shadow-md flex items-center justify-center gap-2 border-b border-amber-500/40">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
        <span className="text-amber-400 font-black">تقرير واعتماد حصري:</span>
        <span>خاص بنشاط <strong>«{bizName}»</strong> • متاح للحجز المعتمد لمدة 48 ساعة فقط</span>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
        
        {/* HERO SECTION: Tailored Agency Pitch */}
        <section 
          className="text-center space-y-4 pt-4"
          onMouseEnter={() => sessionId && recordSectionView(sessionId, 'hero')}
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-100 border border-amber-300 text-amber-950 text-xs font-black shadow-xs">
            <Sparkles className="w-4 h-4 text-amber-600" />
            <span>خطة التحول والتصدر الميداني الحصري • {bizLocation}</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black text-slate-950 tracking-tight leading-snug">
            {pitch.headline}
          </h1>

          {personaSlogan && (
            <div className="inline-block bg-gradient-to-r from-amber-500/10 via-amber-500/20 to-yellow-500/10 border border-amber-300 px-5 py-2 rounded-2xl text-xs sm:text-sm font-black text-amber-950 shadow-xs">
              ✨ الشعار اللفظي المقترح: «{personaSlogan}»
            </div>
          )}

          <p className="text-sm sm:text-base text-slate-700 max-w-2xl mx-auto leading-relaxed font-medium">
            دراسة ميدانية مخصصة لنشاط «{bizName}» لتحويل زوار ومستخدمي خرائط Google في منطقة {bizLocation} إلى زبائن دائمين، مع بناء هوية تجارية فاخرة ترفع قيمتك وثقة العملاء في خدماتك.
          </p>

          <div className="flex items-center justify-center gap-4 text-xs text-slate-600 flex-wrap font-bold">
            <span className="flex items-center gap-1.5 text-slate-900">
              <Store className="w-4 h-4 text-amber-600" />
              <span>{bizName}</span>
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <MapPin className="w-4 h-4 text-amber-600" />
              <span>{bizLocation}</span>
            </span>
            <span>•</span>
            <span className="inline-flex items-center gap-1 text-emerald-800 bg-emerald-100 px-3 py-0.5 rounded-full border border-emerald-300 font-black">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
              <span>جاهز للاعتماد الميداني الفوري</span>
            </span>
          </div>

          {/* ⚡ SCARCITY & EXCLUSIVITY NOTICE */}
          <div className="p-4 bg-gradient-to-r from-amber-500/15 via-yellow-500/20 to-amber-500/15 border border-amber-300 rounded-2xl max-w-2xl mx-auto flex items-start gap-3 text-right">
            <div className="p-2 bg-amber-500 text-slate-950 rounded-xl font-black shrink-0 mt-0.5 shadow-xs">
              ⚡
            </div>
            <div className="text-xs text-amber-950 space-y-1">
              <strong className="block font-black text-sm text-slate-900">
                حصرية المنطقة (Territory Exclusivity):
              </strong>
              <p className="leading-relaxed font-medium">
                لحماية أسبقية عملائنا، يتم قبول وتوثيق <strong>نشاط واحد فقط معتمد</strong> في قطاع «{biz.city || 'المنطقة'}» لضمان انفراده بالصدارة التامة لنتائج خرائط Google واستحواذه على طلبات أهالي الحي بدون منافسة.
              </p>
            </div>
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
                <span className="text-xs font-black text-amber-800 bg-amber-100 px-3 py-0.5 rounded-full border border-amber-300">
                  نماذج بصرية حصرية 300DPI 🎨
                </span>
                <span className="text-xs text-slate-500 font-bold">
                  ({visualAssetItems.length} تصاميم جاهزة للمعاينة)
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-black text-slate-950 flex items-center gap-2">
                <Layers className="w-5 h-5 text-amber-500" />
                <span>معرض تصاميم الهوية البصرية لـ «{bizName}»</span>
              </h2>
              <p className="text-xs text-slate-600 mt-1 font-medium">
                اضغط على أي تصميم للاطلاع الكامل والتكبير بدقة عالية لفحص جودة الطباعة والتفاصيل 🔍
              </p>
            </div>
            <span className="text-xs font-black text-rose-800 bg-rose-50 px-3 py-1.5 rounded-xl border border-rose-200 self-start sm:self-center flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-rose-600" />
              <span>عينة مؤمنة بالعلامة المائية المشددة</span>
            </span>
          </div>

          {/* Grid of visual asset cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {visualAssetItems.map((item, idx) => (
              <div
                key={item.id}
                onClick={() => {
                  setSelectedAssetIndex(idx);
                  setZoomLevel(1);
                }}
                className="group bg-slate-900 rounded-2xl border-2 border-slate-700 hover:border-amber-400 p-4 shadow-sm hover:shadow-xl transition-all cursor-pointer flex flex-col justify-between space-y-3 relative overflow-hidden text-white"
              >
                {/* Header info */}
                <div className="flex items-center justify-between gap-2">
                  <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full border ${item.badgeColor}`}>
                    {item.badge}
                  </span>
                  <span className="text-[10px] font-bold text-amber-400 flex items-center gap-1 group-hover:text-amber-300 transition-colors">
                    <Maximize2 className="w-3 h-3" />
                    <span>تكبير بالحجم الكامل</span>
                  </span>
                </div>

                <strong className="text-xs sm:text-sm font-black text-white line-clamp-1 group-hover:text-amber-300 transition-colors">
                  {item.title}
                </strong>

                {/* Thumbnail Stage with High-Contrast Watermark & Ribbon */}
                <div className="h-48 sm:h-56 bg-slate-950 rounded-xl overflow-hidden relative border border-slate-800 flex items-center justify-center">
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="w-full h-full object-contain p-2 transition-transform duration-300 group-hover:scale-105 pointer-events-none"
                  />

                  {/* 1. Repeating Strong Diagonal Watermark Pattern */}
                  {pitch.watermarkSettings.enabled && (
                    <div
                      className="absolute inset-0 pointer-events-none opacity-85 z-10"
                      style={{
                        backgroundImage: `url("${strongWatermarkSvgUrl}")`,
                        backgroundRepeat: 'repeat'
                      }}
                    />
                  )}

                  {/* 2. Bold Diagonal Security Ribbon (Guarantees visibility on both light & dark) */}
                  <div className="absolute inset-0 pointer-events-none z-15 flex items-center justify-center overflow-hidden">
                    <div className="transform -rotate-25 bg-red-600/40 border-y-2 border-red-500/70 backdrop-blur-[1px] py-1.5 px-8 text-center shadow-2xl w-[140%]">
                      <span className="text-white font-black text-[10px] tracking-wide drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] flex items-center justify-center gap-1.5">
                        <span>🔒 عينة مؤمنة</span>
                        <span>•</span>
                        <span>دليلك 🇪🇬</span>
                        <span>•</span>
                        <span>غير مصرح بالنشر قبل التعاقد</span>
                      </span>
                    </div>
                  </div>

                  {/* Hover Overlay Badge */}
                  <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-xs z-20">
                    <span className="bg-amber-500 text-slate-950 px-4 py-2 rounded-xl text-xs font-black shadow-xl flex items-center gap-1.5 transform translate-y-2 group-hover:translate-y-0 transition-transform">
                      <ZoomIn className="w-4 h-4" />
                      <span>عرض الصورة بالحجم الكامل والتكبير</span>
                    </span>
                  </div>
                </div>

                {/* Description & Specs */}
                <div className="space-y-1.5 text-xs text-slate-300">
                  <p className="text-[11px] leading-relaxed line-clamp-2 font-medium">
                    {item.description}
                  </p>
                  <div className="flex items-center justify-between text-[10px] text-slate-400 pt-2 border-t border-slate-800 font-bold">
                    <span>{item.specs}</span>
                    <span className="text-amber-400 flex items-center gap-1 font-black">
                      <span>عرض العينة</span>
                      <span>←</span>
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="p-3.5 bg-amber-50 rounded-2xl text-center text-xs text-amber-950 font-bold border border-amber-200">
            💡 <span className="text-slate-950 font-black">تنويه هام:</span> يتم تسليم كافة ملفات التصاميم الأصلية (الملفات المفتوحة والطباعية 300DPI وبدون أي علامة مائية) فور تفعيل الاشتراك في الباقة.
          </div>
        </section>

        {/* 🌟 CENTERPIECE 2: 3D ACRYLIC TABLE STAND SHOWCASE */}
        <section 
          className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-md relative overflow-hidden"
          onMouseEnter={() => sessionId && recordSectionView(sessionId, 'acrylic_stand')}
        >
          <div className="text-center max-w-xl mx-auto mb-8 space-y-2">
            <span className="text-xs font-black text-amber-700 bg-amber-100 px-3.5 py-1 rounded-full border border-amber-300 inline-block">
              الهدية الميدانية الملموسة مع الباقة 🎁
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-slate-950">
              ستاند الطاولة الأكريليكي الفاخر بـ QR كود ذكي
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 font-medium">
              مجسم كريستالي راقٍ يُصنع خصيصاً ويطبع باسم نشاطك، يوضع على طاولات وكاونتر الاستقبال لجذب مئات التقييمات الحقيقية 5 نجوم على Google Maps
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
            <div className={`w-56 sm:w-64 bg-white/95 backdrop-blur-md rounded-2xl p-5 border-2 ${standStyles.borderColor} shadow-2xl flex flex-col items-center text-center relative transition-transform duration-300 hover:scale-102`}>
              
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
                <span className="flex items-center gap-1 text-slate-600 font-black">
                  <Radio className="w-2.5 h-2.5 text-amber-500 animate-pulse" />
                  لمس NFC ذكي
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

          <div className="mt-4 text-center text-xs text-slate-600 font-bold">
            🛡️ يصلك المجسم مصنعاً من أجود خامات الأكريليك مع شهادة توثيق رسمية باليد لمعاينته قبل الدفع
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
              <p className="text-xs text-slate-500">مبني على دراسة معدلات نمو الأنشطة المشابهة في {bizLocation}</p>
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

        {/* 🗓️ CENTERPIECE 4: 30-DAY CONTENT PLAN TEASER (3 Live Samples + Locked Days & Renewal System) */}
        <section 
          className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6"
          onMouseEnter={() => sessionId && recordSectionView(sessionId, 'content_plan')}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-black px-3 py-0.5 rounded-full">
                  خطة شهرية متجددة تلقائياً 🗓️
                </span>
                <span className="text-xs text-slate-500 font-bold">
                  (عينة تجريبية: 3 منشورات معتمدة)
                </span>
              </div>
              <h3 className="text-lg font-black text-slate-950 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-500" />
                <span>عينة من خطة المحتوى التسويقي لـ «{bizName}»</span>
              </h3>
              <p className="text-xs text-slate-600 font-medium">
                نصوص مكتوبة خصيصاً لجذب الزبائن باللهجة المصرية المحببة ومقسمة لـ 4 ركائز استراتيجية
              </p>
            </div>
            
            <button
              type="button"
              onClick={() => setShowLockedCalendarModal(true)}
              className="inline-flex items-center gap-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs px-4 py-2.5 rounded-xl shadow-xs transition cursor-pointer self-start sm:self-center"
            >
              <Lock className="w-4 h-4" />
              <span>نظام الـ 30 يوماً وتفاصيل التجديد ←</span>
            </button>
          </div>

          {/* 3 Live Sample Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {sampleLivePosts.map((plan) => (
              <div
                key={plan.day}
                className="p-4 bg-slate-50 rounded-2xl border-2 border-amber-200/80 space-y-2.5 text-xs relative"
              >
                <div className="flex items-center justify-between">
                  <span className="bg-amber-500 text-slate-950 font-black px-2 py-0.5 rounded-lg text-[10px]">
                    عينة اليوم {plan.day}
                  </span>
                  <span className="text-[10px] font-bold text-slate-600 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                    {plan.pillar}
                  </span>
                </div>
                <strong className="block text-slate-900 font-black text-xs">
                  {plan.title}
                </strong>
                <p className="text-slate-700 text-[11px] leading-relaxed font-medium">
                  «{plan.hook}»
                </p>
                <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-200/60 font-bold">
                  <span>الصيغة: {plan.format}</span>
                  <span className="text-emerald-700 flex items-center gap-0.5">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    <span>جاهز للنشر</span>
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Locked Days Teaser Bar (Days 4 to 30) */}
          <div 
            onClick={() => setShowLockedCalendarModal(true)}
            className="p-5 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-2xl text-white border border-slate-700 shadow-md cursor-pointer hover:border-amber-400 transition-all flex flex-col sm:flex-row items-center justify-between gap-4"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
                <Lock className="w-6 h-6" />
              </div>
              <div className="space-y-1 text-right">
                <div className="flex items-center gap-2">
                  <strong className="text-sm font-black text-white">
                    باقي أيام الشهر (المنشورات من اليوم 4 حتى اليوم 30)
                  </strong>
                  <span className="bg-amber-400 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-full">
                    27 منشوراً مقفلاً
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed font-medium">
                  يتم تسليم الخطة كاملة مع جدول الأوقات المناسبة للنشر وملف PDF مطبوع فور تفعيل الباقة، وتتجدد تلقائياً كل شهر مع تجديد الاشتراك.
                </p>
              </div>
            </div>

            <button
              type="button"
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs px-5 py-3 rounded-xl shadow-lg transition cursor-pointer shrink-0"
            >
              فتح الخطة الشهرية بالكامل ←
            </button>
          </div>

          {/* Monthly Renewal Assurance Banner */}
          <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-2.5 text-xs text-emerald-950 font-bold">
            <span className="text-base">🔄</span>
            <span>
              <strong>ميزة التجديد الشهري التلقائي:</strong> تتجدد المنشورات الـ 30 كل شهر مع تجديد الاشتراك لضمان بقاء نشاطك التجاري نشطاً ومتصدراً باستمرار دون الحاجة لتوظيف فريق تسويق مكلف.
            </span>
          </div>
        </section>

        {/* 💬 CENTERPIECE 5: READY WHATSAPP MARKETING CAMPAIGNS (حملات الواتساب التسويقية) */}
        <section 
          className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6"
          onMouseEnter={() => sessionId && recordSectionView(sessionId, 'whatsapp_campaigns')}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="bg-emerald-100 text-emerald-900 border border-emerald-300 text-[10px] font-black px-3 py-0.5 rounded-full">
                  حملات الواتساب الميدانية المباشرة 💬
                </span>
              </div>
              <h3 className="text-lg font-black text-slate-950 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-emerald-600" />
                <span>حملات ورسائل واتساب مصممة لزيادة مبيعاتك</span>
              </h3>
              <p className="text-xs text-slate-600 font-medium">
                رسائل مكتوبة باحترافية لرفع معدل الرد والطلبات وإعادة تشغيل الزبائن السابقين
              </p>
            </div>
            <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 self-start sm:self-center">
              مجهزة ومربوطة بنشاطك
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {whatsappCampaignsList.map((camp) => (
              <div
                key={camp.id || camp.title}
                className="bg-emerald-50/50 border-2 border-emerald-200/80 rounded-2xl p-4 flex flex-col justify-between space-y-3"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="bg-emerald-600 text-white text-[10px] font-black px-2 py-0.5 rounded-md">
                      واتساب رسمي
                    </span>
                    <span className="text-[10px] text-slate-500 font-bold">
                      {camp.audience || 'الزبائن'}
                    </span>
                  </div>
                  <strong className="text-xs font-black text-slate-900 block">
                    {camp.title}
                  </strong>
                  
                  {/* WhatsApp Speech Bubble Teaser */}
                  <div className="bg-white rounded-xl p-3 border border-emerald-100 text-[11px] text-slate-700 leading-relaxed font-sans shadow-xs relative">
                    <p className="italic font-medium">«{camp.teaserSnippet}»</p>
                  </div>
                </div>

                <a
                  href={`https://wa.me/201556221141?text=${encodeURIComponent(`السلام عليكم، أنا صاحب نشاط «${bizName}» وأريد تفعيل حملة الواتساب «${camp.title}» ضمن الباقة المعتمدة!`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={handleCtaClick}
                  className="w-full flex items-center justify-center gap-1.5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black transition shadow-xs cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>تفعيل هذه الحملة في باقتي</span>
                </a>
              </div>
            ))}
          </div>

          <p className="text-[11px] text-slate-500 text-center font-bold">
            💡 يتم ربط هذه الحملات برقم واتساب نشاطك الرسمي وتدريب فريقك على تشغيلها عند استلام الباقة
          </p>
        </section>

        {/* 📊 CENTERPIECE 6: AGENCY INVESTMENT COMPARISON (لماذا دليلك هي الخيار الأذكى والأوفر؟) */}
        <section 
          className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-md space-y-6"
          onMouseEnter={() => sessionId && recordSectionView(sessionId, 'roi_comparison')}
        >
          <div className="text-center max-w-xl mx-auto space-y-1">
            <span className="text-xs font-black text-amber-700 bg-amber-100 px-3 py-1 rounded-full border border-amber-300 inline-block">
              مقارنة واقعية للاستثمار والتكاليف 💰
            </span>
            <h3 className="text-xl sm:text-2xl font-black text-slate-950">
              لماذا باقة دليلك هي الاستثمار الأذكى لنشاطك؟
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              مقارنة بين تكلفة التعاقد مع مصممين ووكالات تسويق منفصلة وبين باقة دليلك الشاملة
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Traditional Agencies Box */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <strong className="text-sm font-black text-slate-800">التكاليف في السوق التقليدي:</strong>
                <span className="text-xs text-rose-600 font-bold bg-rose-50 px-2 py-0.5 rounded-md">تكاليف متفرقة</span>
              </div>
              <ul className="space-y-2 text-xs text-slate-600 font-medium">
                <li className="flex items-center justify-between">
                  <span>تصميم شعار وهوية بصرية منفصلة:</span>
                  <strong className="text-slate-800 font-mono">3,500 جنيه</strong>
                </li>
                <li className="flex items-center justify-between">
                  <span>كاتب محتوى تسويقي شهري (30 يوماً):</span>
                  <strong className="text-slate-800 font-mono">2,500 جنيه</strong>
                </li>
                <li className="flex items-center justify-between">
                  <span>تصنيع ستاند أكريليك ذكي بـ QR:</span>
                  <strong className="text-slate-800 font-mono">650 جنيه</strong>
                </li>
                <li className="flex items-center justify-between">
                  <span>توثيق وتثبيت خرائط Google رسمياً:</span>
                  <strong className="text-slate-800 font-mono">1,500 جنيه</strong>
                </li>
              </ul>
              <div className="pt-2 border-t border-slate-200 flex items-center justify-between font-black text-sm">
                <span>الإجمالي المتوقع:</span>
                <span className="text-rose-600 line-through font-mono">8,150 جنيه</span>
              </div>
            </div>

            {/* Dalilak Integrated Offer Box */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-500/10 via-amber-500/20 to-yellow-500/15 border-2 border-amber-400 space-y-3 relative overflow-hidden">
              <div className="flex items-center justify-between border-b border-amber-300 pb-2">
                <strong className="text-sm font-black text-amber-950 flex items-center gap-1.5">
                  <BadgeCheck className="w-4 h-4 text-amber-600" />
                  <span>باقة دليلك الذهبية المتكاملة:</span>
                </strong>
                <span className="text-xs text-emerald-800 font-black bg-emerald-100 px-2.5 py-0.5 rounded-full border border-emerald-300">
                  وفر أكثر من 70%
                </span>
              </div>
              <ul className="space-y-2 text-xs text-slate-800 font-bold">
                <li className="flex items-center justify-between">
                  <span>✓ الشعار الأيقوني + الكتالوج + البانر + البوست:</span>
                  <span className="text-emerald-700">شامل ومجاني</span>
                </li>
                <li className="flex items-center justify-between">
                  <span>✓ ستاند أكريليك كريستالي ذكي بـ QR كود:</span>
                  <span className="text-emerald-700">هدية مجانية 🎁</span>
                </li>
                <li className="flex items-center justify-between">
                  <span>✓ خطة المحتوى التسويقي (30 يوماً متجددة):</span>
                  <span className="text-emerald-700">شاملة بالكامل</span>
                </li>
                <li className="flex items-center justify-between">
                  <span>✓ التوثيق الميداني والاعتماد الرسمي:</span>
                  <span className="text-emerald-700">معتمد 100%</span>
                </li>
              </ul>
              <div className="pt-2 border-t border-amber-300 flex items-center justify-between font-black text-base text-slate-950">
                <span>الاستثمار المطلوب:</span>
                <span className="text-2xl font-mono text-amber-600 font-black">
                  {pitch.discountedPrice} {pitch.currency}
                </span>
              </div>
            </div>

          </div>
        </section>

        {/* 💰 CENTERPIECE 7: LIMITED-TIME DEAL & PRICING PACKAGES */}
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
              <span>ينتهي الخصم وحجز مقعد المنطقة الحصري خلال:</span>
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
              شاملة الستاند الأكريليكي الكريستالي الفاخر + التوثيق الرسمي + خطة الـ 30 يوماً المتجددة + التصاميم الـ 4 كاملة
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
          <div className="text-center text-xs font-black text-slate-950 bg-white/40 max-w-md mx-auto py-2 px-4 rounded-xl border border-white/60">
            🛡️ {pitch.guaranteeText} (معاينة الستاند باليد قبل الدفع)
          </div>

          {/* Main Action Button */}
          <div className="text-center pt-2">
            <a
              href={`https://wa.me/201556221141?text=${encodeURIComponent(`السلام عليكم، أنا صاحب نشاط «${bizName}» وعاينت الخطة التفاعلية وحابب أحجز الباقة الذهبية واستلم ستاند الأكريليك والتصاميم الأصلية!`)}`}
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
        <div 
          className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-md flex flex-col justify-between p-3 sm:p-6 animate-in fade-in duration-200 overflow-hidden"
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedAssetIndex(null);
          }}
        >
          
          {/* Lightbox Top Control Bar */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 z-30 gap-2 sm:gap-3">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1 overflow-hidden">
              <span className={`text-[10px] sm:text-xs font-black px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full border shrink-0 ${activeAsset.badgeColor}`}>
                {activeAsset.badge}
              </span>
              <div className="min-w-0 flex-1 overflow-hidden">
                <h3 className="text-white font-black text-xs sm:text-base truncate">
                  {activeAsset.title}
                </h3>
                <span className="text-[10px] sm:text-xs text-slate-400 block truncate">
                  التصميم {selectedAssetIndex + 1} من {visualAssetItems.length} • نشاط «{bizName}»
                </span>
              </div>
            </div>

            {/* Zoom & Close Controls */}
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
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

              {/* High-Visibility Top Close Button */}
              <button
                type="button"
                onClick={() => setSelectedAssetIndex(null)}
                className="p-2 sm:p-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white border border-red-500/60 shadow-lg transition-transform active:scale-90 cursor-pointer shrink-0 flex items-center gap-1 font-bold text-xs"
                title="إغلاق المعاينة (Esc)"
              >
                <X className="w-5 h-5" />
                <span className="hidden sm:inline">إغلاق</span>
              </button>
            </div>
          </div>

          {/* Lightbox Center Viewport */}
          <div 
            className="flex-1 flex items-center justify-center relative overflow-hidden my-2 sm:my-4"
            onClick={(e) => {
              if (e.target === e.currentTarget) setSelectedAssetIndex(null);
            }}
          >
            
            {/* Previous Image Button */}
            {visualAssetItems.length > 1 && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handlePrevImage();
                }}
                title="الصورة السابقة"
                className="absolute right-2 sm:right-6 z-30 p-2.5 sm:p-3 rounded-full bg-slate-900/85 hover:bg-slate-800 text-white border border-slate-700 shadow-xl transition cursor-pointer"
              >
                <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            )}

            {/* Next Image Button */}
            {visualAssetItems.length > 1 && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleNextImage();
                }}
                title="الصورة التالية"
                className="absolute left-2 sm:left-6 z-30 p-2.5 sm:p-3 rounded-full bg-slate-900/85 hover:bg-slate-800 text-white border border-slate-700 shadow-xl transition cursor-pointer"
              >
                <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            )}

            {/* Image Container with Zoom & Strict Watermark */}
            <div 
              className="relative max-w-4xl max-h-[60vh] sm:max-h-[70vh] flex items-center justify-center overflow-auto p-2 sm:p-4"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={activeAsset.imageUrl}
                alt={activeAsset.title}
                style={{
                  transform: `scale(${zoomLevel})`,
                  transition: 'transform 0.2s ease-out'
                }}
                className="max-h-[55vh] sm:max-h-[65vh] max-w-full object-contain rounded-xl shadow-2xl pointer-events-none select-none"
              />

              {/* 1. High-Visibility Diagonal Watermark Pattern (Strong on Fullscreen Image Preview) */}
              {pitch.watermarkSettings.enabled && (
                <div
                  className="absolute inset-0 pointer-events-none opacity-90 z-10"
                  style={{
                    backgroundImage: `url("${strongWatermarkSvgUrl}")`,
                    backgroundRepeat: 'repeat'
                  }}
                />
              )}

              {/* 2. Bold Central Diagonal Security Ribbon (Cross-cutting) */}
              <div className="absolute inset-0 pointer-events-none z-15 flex items-center justify-center overflow-hidden">
                <div className="transform -rotate-25 bg-red-600/40 border-y-2 border-red-500/80 backdrop-blur-[1px] py-2 px-12 text-center shadow-2xl w-[140%]">
                  <span className="text-white font-black text-xs sm:text-sm tracking-wide drop-shadow-[0_2px_4px_rgba(0,0,0,0.95)] flex items-center justify-center gap-2">
                    <span>🔒 عينة تجريبية مؤمنة</span>
                    <span>•</span>
                    <span>دليلك 🇪🇬</span>
                    <span>•</span>
                    <span>غير مصرح بالنشر أو الطباعة قبل التعاقد الرسمي</span>
                  </span>
                </div>
              </div>
            </div>

          </div>

          {/* Lightbox Bottom Info & Action Bar */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 z-20">
            <div className="space-y-1 w-full md:w-auto">
              <p className="text-xs sm:text-sm text-slate-200 font-medium leading-relaxed max-w-2xl line-clamp-2 sm:line-clamp-none">
                {activeAsset.description}
              </p>
              <div className="flex items-center gap-2 sm:gap-3 text-[11px] sm:text-xs text-slate-400 font-bold flex-wrap">
                <span>{activeAsset.specs}</span>
                <span>•</span>
                <span className="text-amber-400">يتم التسليم بالدقة الأصلية بدون علامة مائية فور التعاقد</span>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto shrink-0">
              <button
                type="button"
                onClick={() => setSelectedAssetIndex(null)}
                className="flex-1 md:flex-none flex items-center justify-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs sm:text-sm px-4 py-3 rounded-xl border border-slate-700 transition cursor-pointer"
              >
                <X className="w-4 h-4 text-red-400" />
                <span>إغلاق العارض</span>
              </button>

              <a
                href={`https://wa.me/201556221141?text=${encodeURIComponent(`السلام عليكم، أنا صاحب نشاط «${bizName}» وعاينت التصميم «${activeAsset.title}» وحابب أطلبه بالجودة الأصلية بدون علامة مائية!`)}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={handleCtaClick}
                className="flex-2 md:flex-none inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs sm:text-sm px-5 py-3 rounded-xl shadow-lg transition cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>طلب استلام التصميم</span>
              </a>
            </div>
          </div>

        </div>
      )}

      {/* 🔒 LOCKED 30-DAY MARKETING CONTENT PLAN VIP MODAL (حجز الباقة لفتح الخطة كاملة) */}
      {showLockedCalendarModal && (
        <div 
          className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowLockedCalendarModal(false);
          }}
        >
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden text-right">
            
            {/* Modal Header */}
            <div className="p-5 sm:p-6 border-b border-slate-200 bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 text-slate-950 flex items-center justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="bg-slate-950 text-amber-400 text-[10px] font-black px-2.5 py-0.5 rounded-full shrink-0">
                    باقة المحتوى الشهري المعتمد
                  </span>
                  <span className="text-xs font-bold text-slate-900 truncate">30 يوماً متجددة تلقائياً</span>
                </div>
                <h3 className="text-base sm:text-xl font-black truncate">
                  نظام خطة الـ 30 يوماً لنشاط «{bizName}»
                </h3>
              </div>

              <button
                type="button"
                onClick={() => setShowLockedCalendarModal(false)}
                className="p-2 rounded-xl bg-slate-950/10 hover:bg-slate-950/20 text-slate-950 transition cursor-pointer shrink-0"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-4 text-xs sm:text-sm">
              <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 text-amber-950 space-y-2">
                <strong className="text-sm font-black block text-slate-900">
                  🔒 ما الذي ستحصل عليه فور تفعيل اشتراكك في الباقة؟
                </strong>
                <ul className="space-y-1.5 text-xs text-slate-700 font-medium">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span><strong>30 منشوراً تسويقياً كاملاً</strong> مكتوباً باللهجة المصرية الجذابة مخصصاً لنشاطك.</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span><strong>جدول زمني دقيق للنشر</strong> يوضح أفضل ساعات الذروة لنشر كل منشور أسبوعياً.</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span><strong>صيغ متنوعة للخوارزميات</strong> (أفكار ريلز وفيديوهات قصيرة + بوستات صور + ستوريز).</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span><strong>استلام ملف PDF مطبوع ومجدول</strong> تسليماً رسمياً باليد مع مندوب التوثيق.</span>
                  </li>
                </ul>
              </div>

              {/* Monthly Renewal Highlight */}
              <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-emerald-950 space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-base">🔄</span>
                  <strong className="text-xs sm:text-sm font-black text-slate-900">
                    ميزة التجديد التلقائي المستمر:
                  </strong>
                </div>
                <p className="text-xs text-emerald-900 leading-relaxed font-medium">
                  لا تقلق بشأن ما ستنشره الشهر القادم! بمجرد استمرار وتجديد اشتراكك، يتم إعداد وتجهيز <strong>30 منشوراً جديداً بالكامل شهرياً</strong> لمواكبة المواسم والعروض وضمان صدارة نشاطك المستمرة.
                </p>
              </div>
            </div>

            {/* Modal Footer Actions */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
              <span className="text-xs text-slate-500 font-bold">
                حجز فوري مباشر ومؤمن عبر واتساب
              </span>
              <a
                href={`https://wa.me/201556221141?text=${encodeURIComponent(`السلام عليكم، أنا صاحب نشاط «${bizName}» وأريد تفعيل الباقة وحجز خطة الـ 30 يوماً التسويقية واستلام ملف الـ PDF والستاند الأكريليك!`)}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={handleCtaClick}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs sm:text-sm px-6 py-3 rounded-xl shadow-md transition cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>حجز الباقة وفتح الخطة كاملة عبر واتساب</span>
              </a>
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
