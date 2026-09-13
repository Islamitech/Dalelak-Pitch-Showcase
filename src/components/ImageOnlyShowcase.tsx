import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Store, 
  MapPin, 
  Lock, 
  ShieldCheck, 
  Send, 
  ExternalLink, 
  Image as ImageIcon, 
  QrCode, 
  Radio, 
  Layers, 
  Eye, 
  Maximize2,
  CheckCircle2
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { PitchPackage } from '../types';
import { 
  generateWatermarkPatternSvg, 
  attachAntiTheftDefense 
} from '../utils/watermarkEngine';
import { 
  generateQrDataUrl, 
  getAcrylicMaterialStyles 
} from '../utils/mockupComposer';
import { 
  startClientTrackingSession, 
  pingClientSession, 
  recordSectionView, 
  recordClientWhatsAppCta 
} from '../services/leadTrackingService';

interface ImageOnlyShowcaseProps {
  pitch: PitchPackage;
  onSwitchToFullView?: () => void;
}

export const ImageOnlyShowcase: React.FC<ImageOnlyShowcaseProps> = ({
  pitch,
  onSwitchToFullView
}) => {
  const [activeFilter, setActiveFilter] = useState<'all' | 'stand' | 'logo' | 'frames' | 'posts'>('all');
  const [qrUrl, setQrUrl] = useState<string>('');
  const [sessionId, setSessionId] = useState<string>('');

  const biz = pitch.business;
  const bizName = biz.name_ar || biz.name_en || 'النشاط التجاري';
  const standStyles = getAcrylicMaterialStyles(pitch.visualAssets.acrylicStand.material);

  useEffect(() => {
    const sid = startClientTrackingSession(pitch.id, bizName, biz.phone || '');
    setSessionId(sid);

    const pingTimer = setInterval(() => {
      pingClientSession(sid, 'image_only_showcase');
    }, 5000);

    const cleanupDefense = attachAntiTheftDefense(pitch.watermarkSettings);

    return () => {
      clearInterval(pingTimer);
      cleanupDefense();
    };
  }, [pitch.id, bizName, pitch.watermarkSettings]);

  useEffect(() => {
    generateQrDataUrl(pitch.visualAssets.acrylicStand.qrTargetUrl).then(url => {
      setQrUrl(url);
    });
  }, [pitch.visualAssets.acrylicStand.qrTargetUrl]);

  const handleCtaClick = () => {
    if (sessionId) {
      recordClientWhatsAppCta(sessionId);
    }
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.7 }
    });
  };

  const watermarkSvgUrl = pitch.watermarkSettings.enabled
    ? generateWatermarkPatternSvg(pitch.watermarkSettings)
    : '';

  return (
    <div className="relative min-h-screen bg-slate-50 text-slate-900 selection:bg-amber-500 selection:text-white anti-theft-shield pb-28">
      
      {/* 🛡️ LAYER 1: Continuous Repeating Diagonal Mesh Watermark */}
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
      <div className="bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 text-slate-950 px-4 py-2 text-center text-xs font-black shadow-xs flex items-center justify-center gap-2">
        <span className="animate-pulse">🖼️</span>
        <span>معاينة حصرية لتصاميم الصور والبراويز لـ: <strong>«{bizName}»</strong> • عينة محمية ضد السرقة</span>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
        
        {/* Header & Controls */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-amber-100 text-amber-900 text-xs font-black px-2.5 py-0.5 rounded-full border border-amber-200">
                معرض تصاميم الصور فقط (Visual Gallery)
              </span>
              <span className="text-xs text-slate-400 font-bold">
                {biz.city || 'الفرع الرئيسي'}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900">
              تصاميم الهوية والبراويز المقترحة لـ «{bizName}»
            </h1>
            <p className="text-xs text-slate-500">
              استعرض نماذج التصاميم البصرية والستاند ثلاثي الأبعاد قبل الاعتماد والطباعة
            </p>
          </div>

          {onSwitchToFullView && (
            <button
              onClick={onSwitchToFullView}
              className="self-start sm:self-center flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-black transition-colors cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5 text-amber-600" />
              <span>عرض الخطة التسويقية الكاملة ←</span>
            </button>
          )}
        </div>

        {/* Gallery Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
              activeFilter === 'all'
                ? 'bg-amber-500 text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            جميع التصاميم (الكل)
          </button>
          <button
            onClick={() => setActiveFilter('stand')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
              activeFilter === 'stand'
                ? 'bg-amber-500 text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            ستاند الأكريليك 3D 💎
          </button>
          <button
            onClick={() => setActiveFilter('frames')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
              activeFilter === 'frames'
                ? 'bg-amber-500 text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            قوالب وبراويز السوشيال ميديا 📱
          </button>
          <button
            onClick={() => setActiveFilter('logo')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
              activeFilter === 'logo'
                ? 'bg-amber-500 text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            الشعار الرقمي واللافتة 🎨
          </button>
        </div>

        {/* Designs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* DESIGN 1: 3D ACRYLIC STAND */}
          {(activeFilter === 'all' || activeFilter === 'stand') && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
              <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  <strong className="text-xs font-black text-slate-900">مجسم ستاند الأكريليك الفاخر (VIP Table Stand)</strong>
                </div>
                <span className="bg-slate-900/80 text-white text-[9px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Lock className="w-2.5 h-2.5 text-amber-400" />
                  <span>دقة أصلية مقفولة</span>
                </span>
              </div>

              {/* Stand 3D Mockup Visual */}
              <div className="p-6 bg-gradient-to-b from-slate-100 via-slate-50 to-slate-200 flex flex-col items-center justify-center relative min-h-[300px] select-none">
                <div 
                  className="absolute w-48 h-48 rounded-full blur-3xl opacity-50 pointer-events-none"
                  style={{ backgroundColor: standStyles.glowColor }}
                />

                {/* Stand Plate */}
                <div className={`w-52 bg-white/95 backdrop-blur-md rounded-2xl p-4 border-2 ${standStyles.borderColor} shadow-xl flex flex-col items-center text-center relative transition-transform hover:scale-102`}>
                  <div className={`text-[9px] font-black px-2.5 py-0.5 rounded-full mb-2 ${standStyles.badgeBg}`}>
                    ★★★★★ تقييم Google
                  </div>

                  <strong className="text-xs font-black text-slate-900 truncate w-full mb-1">
                    {bizName}
                  </strong>
                  <span className="text-[9px] text-slate-500 mb-2">{biz.category || 'دليلك المعتمد'}</span>

                  {qrUrl && (
                    <img
                      src={qrUrl}
                      alt="QR"
                      className="w-24 h-24 rounded-lg shadow-sm border border-slate-100 mb-2 pointer-events-none"
                    />
                  )}

                  <span className="text-[9px] font-black text-slate-700 leading-tight mb-1">
                    {pitch.visualAssets.acrylicStand.tagline}
                  </span>

                  <div className="w-full pt-1.5 border-t border-slate-200 flex items-center justify-between text-[7px] text-slate-400 font-bold">
                    <span className="flex items-center gap-0.5 text-slate-600">
                      <Radio className="w-2 h-2 text-amber-500" />
                      لمس NFC مباشر
                    </span>
                    <span>دليلك 🇪🇬</span>
                  </div>
                </div>

                {/* Heavy Base */}
                <div className={`w-64 h-4 mt-1.5 rounded-t-sm bg-gradient-to-r ${standStyles.baseGradient} shadow-md border-t border-white/50`} />
                <div className="w-68 h-1.5 bg-slate-400/40 rounded-full blur-xs mt-0.5" />
              </div>

              <div className="p-4 bg-white text-xs text-slate-600 space-y-1">
                <span className="font-bold text-slate-800 block">المواصفات الطباعية:</span>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  أكريليك سمك 4 مم مع قاعدة معدنية مطلية، طباعة UV حرارية غير قابلة للمسح تدوم لسنوات، مع شريحة NFC مدمجة.
                </p>
              </div>
            </div>
          )}

          {/* DESIGN 2: SOCIAL MEDIA FRAME TEMPLATES */}
          {(activeFilter === 'all' || activeFilter === 'frames') && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
              <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-500" />
                  <strong className="text-xs font-black text-slate-900">قالب برواز السوشيال ميديا للمنتجات (Product Frame)</strong>
                </div>
                <span className="bg-slate-900/80 text-white text-[9px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Lock className="w-2.5 h-2.5 text-amber-400" />
                  <span>دقة أصلية مقفولة</span>
                </span>
              </div>

              {/* Frame Mockup Visual */}
              <div className="p-6 bg-slate-100 flex items-center justify-center min-h-[300px] select-none">
                <div className="w-64 aspect-square bg-white rounded-2xl shadow-xl border-4 border-amber-500/80 p-4 flex flex-col justify-between relative overflow-hidden">
                  
                  {/* Top Frame Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <div className="w-6 h-6 rounded-full bg-amber-500 text-white flex items-center justify-center font-black text-[10px]">
                        د
                      </div>
                      <span className="text-[11px] font-black text-slate-900">{bizName}</span>
                    </div>
                    <span className="text-[8px] bg-slate-900 text-white px-1.5 py-0.5 rounded-sm font-bold">
                      {biz.city}
                    </span>
                  </div>

                  {/* Center Product Image Placeholder */}
                  <div className="my-auto py-6 text-center space-y-2">
                    <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 mx-auto flex items-center justify-center shadow-inner">
                      <Store className="w-8 h-8" />
                    </div>
                    <strong className="text-xs font-black text-slate-900 block">
                      {pitch.visualAssets.socialMockupPosts[0]?.headline || 'أعلى جودة تلبي طلبك!'}
                    </strong>
                    <span className="text-[9px] text-slate-400 block font-medium">
                      [يتم وضع صورة منتجك أو واجهة المحل هنا بضغطة زر واحدة]
                    </span>
                  </div>

                  {/* Bottom Contact Footer */}
                  <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-[8px] text-slate-600 font-bold">
                    <span dir="ltr">📞 {biz.phone}</span>
                    <span>📍 {biz.street || biz.city}</span>
                  </div>

                </div>
              </div>

              <div className="p-4 bg-white text-xs text-slate-600 space-y-1">
                <span className="font-bold text-slate-800 block">المواصفات الطباعية والرقمية:</span>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  مقاس مربع 1:1 مخصص لمنشورات إنستغرام وفيسبوك بدقة 2048x2048 بكسل، مع تفريغ داخلي شفاف لإسقاط صور الهاتف.
                </p>
              </div>
            </div>
          )}

          {/* DESIGN 3: SIGNBOARD TO LOGO TRANSFORMATION */}
          {(activeFilter === 'all' || activeFilter === 'logo') && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
              <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <strong className="text-xs font-black text-slate-900">تحويل لافتة الشارع إلى شعار فيكتور (Logo Vector)</strong>
                </div>
                <span className="bg-slate-900/80 text-white text-[9px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Lock className="w-2.5 h-2.5 text-amber-400" />
                  <span>دقة أصلية مقفولة</span>
                </span>
              </div>

              {/* Before / After Transformation Visual */}
              <div className="p-6 bg-slate-100 flex flex-col items-center justify-center min-h-[300px] space-y-4 select-none">
                <div className="grid grid-cols-2 gap-3 w-full max-w-sm">
                  
                  {/* Signboard Before */}
                  <div className="p-3 bg-white rounded-xl border border-slate-200 text-center space-y-2">
                    <span className="text-[9px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full block">
                      اللافتة الميدانية الحالية
                    </span>
                    <div className="w-full h-24 bg-slate-200 rounded-lg flex items-center justify-center text-slate-400">
                      <Store className="w-8 h-8" />
                    </div>
                    <span className="text-[9px] text-slate-400 block font-mono truncate">{bizName}</span>
                  </div>

                  {/* Vector Logo After */}
                  <div className="p-3 bg-amber-50 rounded-xl border-2 border-amber-400 text-center space-y-2 shadow-xs">
                    <span className="text-[9px] font-bold bg-amber-500 text-slate-950 px-2 py-0.5 rounded-full block">
                      الشعار الرقمي بعد التجديد ✨
                    </span>
                    <div className="w-full h-24 bg-white rounded-lg flex flex-col items-center justify-center shadow-xs border border-amber-200">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-600 to-amber-400 text-white flex items-center justify-center font-black text-base shadow-sm mb-1">
                        د
                      </div>
                      <strong className="text-[10px] font-black text-slate-900 truncate max-w-[100px]">{bizName}</strong>
                    </div>
                    <span className="text-[8px] font-bold text-amber-700 block">فيكتور نقي عالي الجودة</span>
                  </div>

                </div>
              </div>

              <div className="p-4 bg-white text-xs text-slate-600 space-y-1">
                <span className="font-bold text-slate-800 block">صيغ التسليم المعتمدة:</span>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  ملف فيكتور مفتوح المصدر (SVG / AI / PDF Vector) مع نسخ خلفية شفافة PNG 300DPI صالحة لكافة أغراض الطباعة الكبرى.
                </p>
              </div>
            </div>
          )}

          {/* DESIGN 4: READY SOCIAL MEDIA POSTS */}
          {(activeFilter === 'all' || activeFilter === 'posts') && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
              <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-purple-500" />
                  <strong className="text-xs font-black text-slate-900">نماذج المنشورات الترويجية الجاهزة للنشر</strong>
                </div>
                <span className="bg-slate-900/80 text-white text-[9px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Lock className="w-2.5 h-2.5 text-amber-400" />
                  <span>دقة أصلية مقفولة</span>
                </span>
              </div>

              <div className="p-5 bg-slate-50 space-y-3 min-h-[300px] overflow-y-auto max-h-[320px]">
                {pitch.visualAssets.socialMockupPosts.map((post, idx) => (
                  <div key={post.id || idx} className="p-3.5 bg-white rounded-xl border border-slate-200 space-y-1.5 shadow-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black bg-amber-100 text-amber-800 px-2 py-0.5 rounded-md">
                        {post.tag || `تصميم ${idx + 1}`}
                      </span>
                      <span className="text-[9px] text-slate-400 font-mono">دليلك سوشيال</span>
                    </div>
                    <strong className="text-xs font-black text-slate-900 block leading-tight">
                      {post.headline}
                    </strong>
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      {post.caption}
                    </p>
                  </div>
                ))}
              </div>

              <div className="p-4 bg-white text-xs text-slate-600 space-y-1">
                <span className="font-bold text-slate-800 block">نصوص مكتوبة جاهزة:</span>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  منشورات مصاغة باللهجة المصرية مع الهاشتاجات المخصصة لكل منصة ومواعيد النشر المثالية.
                </p>
              </div>
            </div>
          )}

        </div>

      </div>

      {/* 📌 STICKY BOTTOM ACTION BAR */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 p-3 sm:p-4 shadow-xl flex items-center justify-between max-w-4xl mx-auto rounded-t-2xl">
        <div>
          <span className="text-xs text-slate-400 block font-bold">تسليم الأصول الأصلية الفائقة:</span>
          <strong className="text-sm font-black text-slate-900 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>تسليم كامل بدون علامة مائية بعد التعاقد</span>
          </strong>
        </div>

        <a
          href={`https://wa.me/201556221141?text=${encodeURIComponent(`السلام عليكم، أنا صاحب نشاط «${bizName}» وعاينت تصاميم الصور والستاند وأريد تأكيد التعاقد واستلام الملفات الأصلية.`)}`}
          target="_blank"
          rel="noopener noreferrer"
          onClick={handleCtaClick}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs sm:text-sm px-6 py-3 rounded-xl shadow-md transition-all transform hover:-translate-y-0.5 cursor-pointer"
        >
          <Send className="w-4 h-4" />
          <span>طلب تسليم التصاميم الأصلية عبر واتساب</span>
        </a>
      </div>

    </div>
  );
};
