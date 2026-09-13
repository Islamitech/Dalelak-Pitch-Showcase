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
  Image as ImageIcon
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
  onSwitchToImagesOnly?: () => void;
}

export const ClientTeaserPreview: React.FC<ClientTeaserPreviewProps> = ({
  pitch,
  isStandalone = false,
  onSwitchToImagesOnly
}) => {
  const [sessionId, setSessionId] = useState<string>('');
  const [qrUrl, setQrUrl] = useState<string>('');
  const [activeContentDay, setActiveContentDay] = useState<number>(1);
  const [timeLeft, setTimeLeft] = useState<{ hours: number; minutes: number; seconds: number }>({
    hours: pitch.discountExpiresHours || 47,
    minutes: 58,
    seconds: 40
  });

  const biz = pitch.business;
  const bizName = biz.name_ar || biz.name_en || 'النشاط التجاري';
  const growth = calculateProjectedGrowth(biz.category);
  const standStyles = getAcrylicMaterialStyles(pitch.visualAssets.acrylicStand.material);
  const sectionsVisible = pitch.linkSettings?.sectionsVisible || {
    acrylicStand: true,
    logoTransformation: true,
    socialFrames: true,
    contentPlan: true,
    pricingDeal: true,
    countdownTimer: true,
    whatsappCta: true,
    growthMetrics: true,
  };

  // 1. Initialize Tracking & Anti-Theft Defense
  useEffect(() => {
    const sid = startClientTrackingSession(
      pitch.id,
      bizName,
      biz.phone || ''
    );
    setSessionId(sid);

    const pingTimer = setInterval(() => {
      pingClientSession(sid);
    }, 5000);

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
      <div className="bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 text-slate-950 px-4 py-2.5 text-center text-xs font-black shadow-xs flex items-center justify-between gap-2 max-w-4xl mx-auto">
        <div className="flex items-center gap-1.5 mx-auto">
          <span className="animate-pulse">💎</span>
          <span>معاينة حصرية خاصة بنشاط: <strong>«{bizName}»</strong> • عرض محدود لمدة 48 ساعة</span>
        </div>

        {onSwitchToImagesOnly && (
          <button
            onClick={onSwitchToImagesOnly}
            className="shrink-0 flex items-center gap-1 px-3 py-1 bg-slate-950 text-amber-400 hover:text-white rounded-lg text-[11px] font-bold transition-colors cursor-pointer"
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>معاينة الصور فقط 🖼️</span>
          </button>
        )}
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

        {/* 🌟 CENTERPIECE 1: 3D ACRYLIC TABLE STAND SHOWCASE */}
        {sectionsVisible.acrylicStand && (
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
              
              <div 
                className="absolute w-64 h-64 rounded-full blur-3xl opacity-60 pointer-events-none"
                style={{ backgroundColor: standStyles.glowColor }}
              />

              {/* Stand Main Crystal Plate */}
              <div className={`w-56 sm:w-64 bg-white/90 backdrop-blur-md rounded-2xl p-5 border-2 ${standStyles.borderColor} shadow-2xl flex flex-col items-center text-center relative transition-transform duration-300 hover:scale-102`}>
                
                <div className="absolute top-2 left-4 right-4 h-0.5 bg-gradient-to-r from-transparent via-white to-transparent opacity-80" />

                <div className={`text-[10px] font-black px-3 py-1 rounded-full mb-3 shadow-xs flex items-center gap-1.5 ${standStyles.badgeBg}`}>
                  <div className="flex text-amber-300">
                    {'★★★★★'}
                  </div>
                  <span>تقييم 5 نجوم Google</span>
                </div>

                <h3 className="text-sm font-black text-slate-900 mb-1 truncate max-w-full">
                  {bizName}
                </h3>
                <span className="text-[10px] text-slate-500 mb-3 font-medium">
                  {biz.category || 'دليلك المعتمد'}
                </span>

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

                <p className="text-[10px] font-black text-slate-700 leading-tight mb-2">
                  {pitch.visualAssets.acrylicStand.tagline}
                </p>

                <div className="pt-2 border-t border-slate-200/80 w-full flex items-center justify-between text-[8px] font-bold text-slate-400">
                  <span className="flex items-center gap-1 text-slate-600">
                    <Radio className="w-2.5 h-2.5 text-amber-500 animate-pulse" />
                    لمس NFC مباشر
                  </span>
                  <span>دليلك 🇪🇬</span>
                </div>

              </div>

              {/* Heavy Metallic Base */}
              <div className={`w-72 sm:w-80 h-5 mt-2 rounded-t-sm bg-gradient-to-r ${standStyles.baseGradient} shadow-xl border-t border-white/50 relative z-10 flex items-center justify-center`}>
                <div className="w-32 h-1 bg-white/40 rounded-full" />
              </div>

              <div className="w-76 sm:w-84 h-2 bg-slate-500/40 rounded-full blur-xs mt-1" />

            </div>

            <div className="mt-4 text-center text-xs text-slate-500 font-medium">
              يصلك المجسم مصنعاً من أجود خامات الأكريليك مع شهادة توثيق رسمية
            </div>
          </section>
        )}

        {/* 📈 CENTERPIECE 2: PROJECTED GROWTH ON GOOGLE MAPS */}
        {sectionsVisible.growthMetrics && (
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
        )}

        {/* 📱 CENTERPIECE 3: BRANDED SOCIAL POST MOCKUP */}
        {sectionsVisible.socialFrames && (
          <section 
            className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6"
            onMouseEnter={() => sessionId && recordSectionView(sessionId, 'social_frames')}
          >
            <div className="text-center max-w-lg mx-auto space-y-1 mb-6">
              <span className="text-xs font-bold text-amber-600 bg-amber-50 px-3 py-1 rounded-full border border-amber-200 inline-block">
                هوية رقمية تليق باسمك
              </span>
              <h3 className="text-xl font-black text-slate-900">
                قوالب ومنشورات سوشيال ميديا موحدة لـ «{bizName}»
              </h3>
              <p className="text-xs text-slate-500">
                صور منتجاتك بتصميم احترافي يرفع ثقة العميل ويشجع على الطلب الفوري
              </p>
            </div>

            {/* Smartphone Mockup */}
            <div className="max-w-xs mx-auto bg-slate-900 p-3 rounded-[36px] shadow-2xl border-4 border-slate-800">
              <div className="w-20 h-4 bg-slate-950 rounded-full mx-auto mb-2" />

              <div className="bg-white rounded-[24px] overflow-hidden text-xs text-slate-900">
                
                <div className="p-3 border-b border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-amber-500 flex items-center justify-center font-bold text-white text-[10px]">
                      د
                    </div>
                    <div>
                      <span className="font-black block text-[11px] leading-tight">{bizName}</span>
                      <span className="text-[9px] text-slate-400 font-medium">{biz.city || 'مصر'}</span>
                    </div>
                  </div>
                  <span className="text-[10px] font-black text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-sm">
                    رسمي ✓
                  </span>
                </div>

                <div className="h-52 bg-gradient-to-tr from-amber-50 via-slate-100 to-amber-100 flex flex-col items-center justify-center p-4 text-center relative overflow-hidden border-y border-slate-200">
                  <div className="w-14 h-14 rounded-2xl bg-white shadow-md flex items-center justify-center mb-2">
                    <Store className="w-7 h-7 text-amber-600" />
                  </div>
                  <strong className="text-xs font-black text-slate-900 block mb-1">
                    {pitch.visualAssets.socialMockupPosts[0]?.headline || 'أعلى جودة تلبي طلبك!'}
                  </strong>
                  <span className="text-[10px] text-slate-500 font-medium">
                    {bizName} • الطعم والجودة الأصلية
                  </span>

                  <div className="absolute bottom-2 left-2 bg-slate-900/80 backdrop-blur-xs text-white text-[8px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Lock className="w-2.5 h-2.5" />
                    <span>دقة عالية مقفلة</span>
                  </div>
                </div>

                <div className="p-3 space-y-1">
                  <p className="text-[10px] text-slate-700 leading-relaxed font-medium">
                    {pitch.visualAssets.socialMockupPosts[0]?.caption}
                  </p>
                  <div className="text-[9px] font-bold text-amber-600 flex gap-1">
                    <span>#دليلك</span>
                    <span>#{bizName.replace(/\s+/g, '_')}</span>
                    <span>#{biz.city}</span>
                  </div>
                </div>

              </div>
            </div>
          </section>
        )}

        {/* 🗓️ CENTERPIECE 4: 30-DAY CONTENT PLAN HIGHLIGHTS */}
        {sectionsVisible.contentPlan && (
          <section 
            className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6"
            onMouseEnter={() => sessionId && recordSectionView(sessionId, 'content_plan')}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-500" />
                  <span>عينة من خطة المحتوى التسويقي (30 يوماً)</span>
                </h3>
                <p className="text-xs text-slate-500">نصوص مكتوبة خصيصاً لجذب الزبائن باللهجة المصرية المحببة</p>
              </div>
              <span className="text-xs font-bold text-slate-400">
                تسليم الخطة كاملة كملف PDF
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {pitch.visualAssets.contentPlanSnippet.map((plan) => (
                <div
                  key={plan.day}
                  className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="bg-amber-500 text-slate-950 font-black px-2 py-0.5 rounded-lg text-[10px]">
                      اليوم {plan.day}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400">
                      ركيزة: {plan.pillar}
                    </span>
                  </div>
                  <strong className="block text-slate-900 font-black text-xs">
                    {plan.title}
                  </strong>
                  <p className="text-slate-600 text-[11px] leading-relaxed">
                    «{plan.hook}»
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 💰 CENTERPIECE 5: LIMITED-TIME DEAL & PRICING PACKAGES */}
        {sectionsVisible.pricingDeal && (
          <section 
            className="bg-gradient-to-b from-amber-500 to-amber-600 rounded-3xl p-6 sm:p-10 text-slate-950 shadow-xl space-y-8 relative overflow-hidden"
            onMouseEnter={() => sessionId && recordSectionView(sessionId, 'pricing_deal')}
          >
            <div className="absolute top-0 right-0 -mt-10 -mr-10 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />

            {/* Countdown timer */}
            {sectionsVisible.countdownTimer && (
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
            )}

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
                شاملة الستاند الأكريليكي + التوثيق الرسمي + خطة الـ 30 يوماً + التصاميم
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
            {sectionsVisible.whatsappCta && (
              <div className="text-center pt-2">
                <a
                  href={`https://wa.me/201556221141?text=${encodeURIComponent(`السلام عليكم، أنا صاحب نشاط «${bizName}» وفتحت المعاينة التفاعلية وحابب أحجز الباقة الذهبية واستلم ستاند الأكريليك!`)}`}
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
            )}

          </section>
        )}

      </div>

      {/* 📌 STICKY BOTTOM MOBILE CTA BAR */}
      {sectionsVisible.whatsappCta && (
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 p-3 sm:p-4 shadow-lg flex items-center justify-between max-w-4xl mx-auto rounded-t-2xl">
          <div>
            <span className="text-xs text-slate-400 block font-bold">السعر بعد الخصم:</span>
            <strong className="text-base font-black font-mono text-amber-600">
              {pitch.discountedPrice} {pitch.currency}
            </strong>
          </div>

          <a
            href={`https://wa.me/201556221141?text=${encodeURIComponent(`السلام عليكم، أنا صاحب نشاط «${bizName}» وأريد تأكيد حجز الباقة واستلام ستاند الأكريليك.`)}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleCtaClick}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs sm:text-sm px-5 py-2.5 rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            <Send className="w-4 h-4" />
            <span>تأكيد الحجز عبر واتساب</span>
          </a>
        </div>
      )}

    </div>
  );
};
