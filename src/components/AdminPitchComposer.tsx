import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Store, 
  MapPin, 
  DollarSign, 
  Tag, 
  QrCode, 
  Layout, 
  ShieldCheck, 
  Share2, 
  Eye, 
  Copy, 
  Check, 
  Send, 
  Layers, 
  Palette, 
  Smartphone,
  Calendar,
  Award,
  ExternalLink
} from 'lucide-react';
import { PitchPackage, AcrylicStandConfig, DeliverableItem } from '../types';
import { generateQrDataUrl, getAcrylicMaterialStyles } from '../utils/mockupComposer';

interface AdminPitchComposerProps {
  pitch: PitchPackage;
  onUpdatePitch: (updated: PitchPackage) => void;
  onSwitchToClientPreview: () => void;
  onOpenWhatsAppModal: () => void;
  onOpenWatermarkSettings: () => void;
}

export const AdminPitchComposer: React.FC<AdminPitchComposerProps> = ({
  pitch,
  onUpdatePitch,
  onSwitchToClientPreview,
  onOpenWhatsAppModal,
  onOpenWatermarkSettings
}) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [standQrDataUrl, setStandQrDataUrl] = useState('');

  const biz = pitch.business;
  const bizName = biz.name_ar || biz.name_en || 'النشاط التجاري';

  useEffect(() => {
    generateQrDataUrl(pitch.visualAssets.acrylicStand.qrTargetUrl).then(url => {
      setStandQrDataUrl(url);
    });
  }, [pitch.visualAssets.acrylicStand.qrTargetUrl]);

  const update = (partial: Partial<PitchPackage>) => {
    onUpdatePitch({
      ...pitch,
      ...partial,
      updatedAt: new Date().toISOString()
    });
  };

  const updateVisuals = (partialAssets: Partial<PitchPackage['visualAssets']>) => {
    onUpdatePitch({
      ...pitch,
      visualAssets: {
        ...pitch.visualAssets,
        ...partialAssets
      },
      updatedAt: new Date().toISOString()
    });
  };

  const updateStand = (partialStand: Partial<AcrylicStandConfig>) => {
    updateVisuals({
      acrylicStand: {
        ...pitch.visualAssets.acrylicStand,
        ...partialStand
      }
    });
  };

  const handleCopyPitchLink = () => {
    const url = `${window.location.origin}/?pitch=${pitch.id}&token=${pitch.clientToken}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const standStyles = getAcrylicMaterialStyles(pitch.visualAssets.acrylicStand.material);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Top Banner: Quick Stats & Client Share Link */}
      <div className="bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 rounded-2xl p-5 shadow-sm text-slate-950 flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-slate-950 text-amber-400 text-xs font-black px-2.5 py-0.5 rounded-full">
              حزمة إبهار مخصصة
            </span>
            <span className="text-xs font-bold text-slate-900">
              كود العرض: <span className="font-mono font-black">DL-{pitch.clientToken}</span>
            </span>
          </div>
          <h1 className="text-lg sm:text-xl font-black text-slate-950">
            تجهيز صفحة الاستعراض والإغلاق لـ «{bizName}»
          </h1>
          <p className="text-xs text-slate-900 font-medium">
            تخصيص الباقة ومجسم ستاند الأكريليك وبراويز السوشيال ميديا ونصوص الإقناع النفسي
          </p>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <button
            onClick={handleCopyPitchLink}
            className="flex-1 md:flex-none flex items-center justify-center gap-1.5 bg-white text-slate-900 hover:bg-slate-50 font-black text-xs px-4 py-2.5 rounded-xl shadow-xs transition-all cursor-pointer"
          >
            {copiedLink ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            <span>{copiedLink ? 'تم نسخ الرابط' : 'نسخ رابط العميل'}</span>
          </button>

          <button
            onClick={onSwitchToClientPreview}
            className="flex-1 md:flex-none flex items-center justify-center gap-1.5 bg-slate-950 hover:bg-slate-800 text-amber-400 font-black text-xs px-5 py-2.5 rounded-xl shadow-xs transition-all cursor-pointer"
          >
            <Eye className="w-4 h-4" />
            <span>معاينة شاشة العميل</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column (8 cols): Package Configuration */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Section 1: Headline & Hook */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <h2 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>عنوان العرض والرسالة الترويجية الرئيسية</span>
            </h2>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  العنوان الجاذب لافتتاح الصفحة (Hook Headline):
                </label>
                <input
                  type="text"
                  value={pitch.headline}
                  onChange={(e) => update({ headline: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-amber-500 outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  الوصف الإقناعي والتحدي الميداني:
                </label>
                <textarea
                  value={pitch.subheadline}
                  onChange={(e) => update({ subheadline: e.target.value })}
                  rows={2}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 focus:bg-white focus:ring-2 focus:ring-amber-500 outline-hidden leading-relaxed"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Pricing & Package Details */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <h2 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <Tag className="w-4 h-4 text-amber-500" />
              <span>باقة التسعير ونسبة الخصم الاستثنائي</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">اسم الباقة:</label>
                <input
                  type="text"
                  value={pitch.packageName}
                  onChange={(e) => update({ packageName: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-amber-500 outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">السعر الأصلي (قبل الخصم):</label>
                <input
                  type="number"
                  value={pitch.originalPrice}
                  onChange={(e) => update({ originalPrice: Number(e.target.value) })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs font-mono font-bold text-slate-700 focus:bg-white focus:ring-2 focus:ring-amber-500 outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">السعر الحصري للعميل (جنيه):</label>
                <input
                  type="number"
                  value={pitch.discountedPrice}
                  onChange={(e) => update({ discountedPrice: Number(e.target.value) })}
                  className="w-full bg-amber-50 border border-amber-300 rounded-xl p-2 text-xs font-mono font-black text-amber-900 focus:bg-white focus:ring-2 focus:ring-amber-500 outline-hidden"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">نص الضمان وطمأنة العميل:</label>
              <input
                type="text"
                value={pitch.guaranteeText}
                onChange={(e) => update({ guaranteeText: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs text-slate-800 focus:bg-white focus:ring-2 focus:ring-amber-500 outline-hidden"
              />
            </div>
          </div>

          {/* Section 3: Deliverables List */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <h2 className="text-sm font-black text-slate-900 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-500" />
                <span>مخرجات الباقة المعروضة للعميل ({pitch.deliverables.length} عناصر أساسية)</span>
              </span>
              <span className="text-xs text-slate-400 font-normal">الأصول الحساسة مقفلة برمجياً</span>
            </h2>

            <div className="space-y-2.5">
              {pitch.deliverables.map((item, idx) => (
                <div
                  key={item.id}
                  className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-start justify-between gap-3 text-xs"
                >
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      <strong className="font-black text-slate-900">{idx + 1}. {item.title}</strong>
                      {item.badge && (
                        <span className="bg-amber-100 text-amber-800 font-bold px-2 py-0.2 rounded-md text-[10px]">
                          {item.badge}
                        </span>
                      )}
                      {item.isLockedHighRes && (
                        <span className="bg-slate-200 text-slate-700 font-mono text-[10px] px-1.5 py-0.2 rounded-md">
                          مغلق الدقة الأصلية 🔒
                        </span>
                      )}
                    </div>
                    <p className="text-slate-600 text-[11px] leading-relaxed">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right Column (4 cols): 3D Acrylic Stand & Quick Actions */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Acrylic Stand Studio Box */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                <QrCode className="w-4 h-4 text-amber-500" />
                <span>مجسم ستاند الأكريليك (3D Stand)</span>
              </h3>
              <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                العنصر الأكثر إبهاراً
              </span>
            </div>

            {/* Acrylic Material Selector */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold text-slate-600">خامة الستاند والمعدن:</label>
              <div className="grid grid-cols-3 gap-1.5">
                {(['gold', 'silver', 'crystal'] as const).map((mat) => (
                  <button
                    key={mat}
                    onClick={() => updateStand({ material: mat })}
                    className={`p-1.5 rounded-lg text-[11px] font-black transition-all cursor-pointer ${
                      pitch.visualAssets.acrylicStand.material === mat
                        ? 'bg-amber-500 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {mat === 'gold' && 'ذهبى VIP'}
                    {mat === 'silver' && 'فضي'}
                    {mat === 'crystal' && 'كريستال'}
                  </button>
                ))}
              </div>
            </div>

            {/* Stand Live 3D Miniature Preview */}
            <div className="p-4 bg-gradient-to-b from-slate-100 to-slate-200 rounded-xl border border-slate-300 relative flex flex-col items-center justify-center min-h-[220px] shadow-inner overflow-hidden">
              
              {/* Acrylic Stand Card */}
              <div className={`w-36 bg-white/90 backdrop-blur-md rounded-xl p-3 border-2 ${standStyles.borderColor} shadow-xl flex flex-col items-center text-center relative transition-all transform hover:scale-105 duration-300`}>
                
                {/* Header Tag */}
                <div className={`text-[8px] font-black px-2 py-0.5 rounded-full mb-1.5 ${standStyles.badgeBg}`}>
                  تقييم 5 نجوم Google
                </div>

                {/* Merchant Name */}
                <span className="text-[11px] font-black text-slate-900 truncate w-full mb-2">
                  {bizName}
                </span>

                {/* QR Code */}
                {standQrDataUrl ? (
                  <img
                    src={standQrDataUrl}
                    alt="QR Stand"
                    className="w-20 h-20 rounded-md border border-slate-200 mb-2 pointer-events-none"
                  />
                ) : (
                  <div className="w-20 h-20 bg-slate-200 animate-pulse rounded-md mb-2" />
                )}

                {/* Tagline */}
                <span className="text-[8px] text-slate-600 font-bold leading-tight">
                  {pitch.visualAssets.acrylicStand.tagline}
                </span>

                {/* NFC Touch badge */}
                <span className="mt-1 text-[7px] font-bold text-slate-400">
                  ⚡️ يدعم اللمس المباشر NFC
                </span>

              </div>

              {/* Heavy Base Stand */}
              <div className={`w-44 h-3.5 mt-1 rounded-t-sm bg-gradient-to-r ${standStyles.baseGradient} shadow-md border-t border-white/40`} />
              <div className="w-48 h-1 bg-slate-400/50 rounded-full blur-xs mt-0.5" />
            </div>

            {/* Stand Target URL */}
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">
                رابط خرائط Google المربوط بالـ QR:
              </label>
              <input
                type="text"
                value={pitch.visualAssets.acrylicStand.qrTargetUrl}
                onChange={(e) => updateStand({ qrTargetUrl: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-1.5 text-[11px] font-mono text-slate-700 focus:bg-white outline-hidden"
              />
            </div>
          </div>

          {/* Anti-theft Quick Overview Box */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-amber-600" />
                <span>درع الحماية ضد السرقة</span>
              </span>
              <button
                onClick={onOpenWatermarkSettings}
                className="text-[11px] font-bold text-amber-600 hover:underline cursor-pointer"
              >
                تخصيص
              </button>
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              يتم تطبيق علامة مائية شبكية متكررة على كامل صفحة العميل، مع تعطيل النقر الأيمن ومنع سحب الصور لمنع استخدام التصاميم قبل التعاقد.
            </p>
          </div>

          {/* WhatsApp Direct Pitch CTA */}
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-2.5">
            <h4 className="text-xs font-black text-emerald-950 flex items-center gap-1.5">
              <Send className="w-4 h-4 text-emerald-600" />
              <span>جاهز لإرسال الرابط للعميل؟</span>
            </h4>
            <p className="text-[11px] text-emerald-800 leading-relaxed">
              قم بفتح نافذة رسائل الواتساب للحصول على الصيغ الإقناعية المخصصة باسم {bizName} وإرسالها فوراً.
            </p>
            <button
              onClick={onOpenWhatsAppModal}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs py-2.5 rounded-xl shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5"
            >
              <span>فتح منشئ رسالة الواتساب 💬</span>
            </button>
          </div>

        </div>

      </div>

    </div>
  );
};
