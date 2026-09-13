import React, { useState, useEffect } from 'react';
import { 
  X, 
  Link as LinkIcon, 
  Sliders, 
  Copy, 
  Check, 
  ExternalLink, 
  QrCode, 
  Clock, 
  ShieldCheck, 
  Eye, 
  Sparkles, 
  Layers, 
  Send,
  Lock,
  Tag
} from 'lucide-react';
import QRCode from 'qrcode';
import { PitchPackage, LinkSettings, LinkSectionVisibility } from '../types';

interface AdvancedLinkSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  pitch: PitchPackage;
  onUpdatePitch: (updated: PitchPackage) => void;
}

export const AdvancedLinkSettingsModal: React.FC<AdvancedLinkSettingsModalProps> = ({
  isOpen,
  onClose,
  pitch,
  onUpdatePitch
}) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState('');
  
  // Local state initialized from pitch.linkSettings
  const [viewMode, setViewMode] = useState<LinkSettings['viewMode']>(pitch.linkSettings?.viewMode || 'full');
  const [customSlug, setCustomSlug] = useState<string>(pitch.linkSettings?.customSlug || `pitch-${pitch.clientToken}`);
  const [expiresHours, setExpiresHours] = useState<number>(pitch.linkSettings?.expiresHours || 48);
  const [sections, setSections] = useState<LinkSectionVisibility>(pitch.linkSettings?.sectionsVisible || {
    acrylicStand: true,
    logoTransformation: true,
    socialFrames: true,
    contentPlan: true,
    pricingDeal: true,
    countdownTimer: true,
    whatsappCta: true,
    growthMetrics: true,
  });

  const bizName = pitch.business.name_ar || pitch.business.name_en || 'النشاط التجاري';
  const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3004';
  
  // Build dynamic final URL
  const generateUrl = () => {
    const params = new URLSearchParams();
    params.set('pitch', pitch.id);
    params.set('token', pitch.clientToken);
    if (viewMode !== 'full') {
      params.set('view', viewMode);
    }
    if (customSlug && customSlug !== `pitch-${pitch.clientToken}`) {
      params.set('slug', customSlug);
    }
    return `${origin}/?${params.toString()}`;
  };

  const finalUrl = generateUrl();

  useEffect(() => {
    if (isOpen) {
      QRCode.toDataURL(finalUrl, {
        errorCorrectionLevel: 'M',
        margin: 1,
        width: 240,
        color: { dark: '#0f172a', light: '#ffffff' }
      }).then(setQrCodeDataUrl);
    }
  }, [isOpen, finalUrl]);

  if (!isOpen) return null;

  const handleSaveAndApply = () => {
    const updatedLinkSettings: LinkSettings = {
      viewMode,
      customSlug,
      expiresHours,
      sectionsVisible: sections
    };

    onUpdatePitch({
      ...pitch,
      linkSettings: updatedLinkSettings,
      updatedAt: new Date().toISOString()
    });

    onClose();
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(finalUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const toggleSection = (key: keyof LinkSectionVisibility) => {
    setSections(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const getWhatsAppShareText = () => {
    if (viewMode === 'images_only') {
      return `السلام عليكم أ/ صاحب نشاط «${bizName}».. جهزنا لحضرتك عينة بصرية مجانية جاهزة للمعاينة الآن لتصاميم الصور وبراويز السوشيال ميديا وستاند الأكريليك لمشاهدتها من هاتفك:\n${finalUrl}`;
    }
    return `السلام عليكم أ/ صاحب نشاط «${bizName}».. تفضل الرابط التفاعلي المخصص لاستعراض خطة التوثيق وستاند الأكريليك الذكي على خرائط Google:\n${finalUrl}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-black">
              <LinkIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                <span>الإعدادات المتقدمة وإدارة الرابط التفاعلي ⚙️</span>
              </h2>
              <p className="text-xs text-slate-500">التحكم الدقيق في محتوى الرابط، نمط المعاينة، والأقسام المسموح للعميل برؤيتها</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-6 overflow-y-auto max-h-[75vh]">
          
          {/* 1. Target View Mode */}
          <div className="space-y-2">
            <label className="block text-xs font-black text-slate-900">
              1. نمط المعاينة المطلوب للرابط (Target View Mode):
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              
              <button
                type="button"
                onClick={() => setViewMode('images_only')}
                className={`p-3 rounded-xl border text-right transition-all cursor-pointer ${
                  viewMode === 'images_only'
                    ? 'bg-amber-50 border-amber-400 ring-2 ring-amber-500/20 shadow-xs'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-black text-slate-900">تصاميم الصور فقط 🖼️</span>
                  {viewMode === 'images_only' && <Check className="w-4 h-4 text-amber-600" />}
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  معرض بصري مخصص فقط للصور، البراويز، والستاند، بدون باقي أقسام الصفحة.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setViewMode('full')}
                className={`p-3 rounded-xl border text-right transition-all cursor-pointer ${
                  viewMode === 'full'
                    ? 'bg-amber-50 border-amber-400 ring-2 ring-amber-500/20 shadow-xs'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-black text-slate-900">العرض الشامل الكامل 🌟</span>
                  {viewMode === 'full' && <Check className="w-4 h-4 text-amber-600" />}
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  صفحة الاستعراض المتكاملة (الستاند + الخطة + الأسعار + العداد).
                </p>
              </button>

              <button
                type="button"
                onClick={() => setViewMode('stand_only')}
                className={`p-3 rounded-xl border text-right transition-all cursor-pointer ${
                  viewMode === 'stand_only'
                    ? 'bg-amber-50 border-amber-400 ring-2 ring-amber-500/20 shadow-xs'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-black text-slate-900">ستاند الأكريليك فقط 💎</span>
                  {viewMode === 'stand_only' && <Check className="w-4 h-4 text-amber-600" />}
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  تركيز حصري على مجسم الستاند ثلاثي الأبعاد وتقييمات خرائط Google.
                </p>
              </button>

            </div>
          </div>

          {/* 2. Granular Section Visibility (for full view) */}
          <div className="space-y-2.5 pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-black text-slate-900">
                2. التحكم في إظهار / إخفاء أقسام العرض:
              </label>
              <span className="text-[11px] text-slate-400">تخصيص ما يراه العميل بدقة</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <label className={`p-2.5 rounded-xl border flex items-center gap-2 cursor-pointer transition-colors ${
                sections.acrylicStand ? 'bg-amber-50/70 border-amber-200 text-slate-900' : 'bg-slate-50 border-slate-200 text-slate-400'
              }`}>
                <input
                  type="checkbox"
                  checked={sections.acrylicStand}
                  onChange={() => toggleSection('acrylicStand')}
                  className="w-3.5 h-3.5 text-amber-600 rounded"
                />
                <span className="font-bold">ستاند الأكريليك</span>
              </label>

              <label className={`p-2.5 rounded-xl border flex items-center gap-2 cursor-pointer transition-colors ${
                sections.logoTransformation ? 'bg-amber-50/70 border-amber-200 text-slate-900' : 'bg-slate-50 border-slate-200 text-slate-400'
              }`}>
                <input
                  type="checkbox"
                  checked={sections.logoTransformation}
                  onChange={() => toggleSection('logoTransformation')}
                  className="w-3.5 h-3.5 text-amber-600 rounded"
                />
                <span className="font-bold">تحويل اللوجو</span>
              </label>

              <label className={`p-2.5 rounded-xl border flex items-center gap-2 cursor-pointer transition-colors ${
                sections.socialFrames ? 'bg-amber-50/70 border-amber-200 text-slate-900' : 'bg-slate-50 border-slate-200 text-slate-400'
              }`}>
                <input
                  type="checkbox"
                  checked={sections.socialFrames}
                  onChange={() => toggleSection('socialFrames')}
                  className="w-3.5 h-3.5 text-amber-600 rounded"
                />
                <span className="font-bold">براويز السوشيال</span>
              </label>

              <label className={`p-2.5 rounded-xl border flex items-center gap-2 cursor-pointer transition-colors ${
                sections.growthMetrics ? 'bg-amber-50/70 border-amber-200 text-slate-900' : 'bg-slate-50 border-slate-200 text-slate-400'
              }`}>
                <input
                  type="checkbox"
                  checked={sections.growthMetrics}
                  onChange={() => toggleSection('growthMetrics')}
                  className="w-3.5 h-3.5 text-amber-600 rounded"
                />
                <span className="font-bold">توقعات Google</span>
              </label>

              <label className={`p-2.5 rounded-xl border flex items-center gap-2 cursor-pointer transition-colors ${
                sections.contentPlan ? 'bg-amber-50/70 border-amber-200 text-slate-900' : 'bg-slate-50 border-slate-200 text-slate-400'
              }`}>
                <input
                  type="checkbox"
                  checked={sections.contentPlan}
                  onChange={() => toggleSection('contentPlan')}
                  className="w-3.5 h-3.5 text-amber-600 rounded"
                />
                <span className="font-bold">خطة الـ 30 يوماً</span>
              </label>

              <label className={`p-2.5 rounded-xl border flex items-center gap-2 cursor-pointer transition-colors ${
                sections.pricingDeal ? 'bg-amber-50/70 border-amber-200 text-slate-900' : 'bg-slate-50 border-slate-200 text-slate-400'
              }`}>
                <input
                  type="checkbox"
                  checked={sections.pricingDeal}
                  onChange={() => toggleSection('pricingDeal')}
                  className="w-3.5 h-3.5 text-amber-600 rounded"
                />
                <span className="font-bold">باقة الأسعار</span>
              </label>

              <label className={`p-2.5 rounded-xl border flex items-center gap-2 cursor-pointer transition-colors ${
                sections.countdownTimer ? 'bg-amber-50/70 border-amber-200 text-slate-900' : 'bg-slate-50 border-slate-200 text-slate-400'
              }`}>
                <input
                  type="checkbox"
                  checked={sections.countdownTimer}
                  onChange={() => toggleSection('countdownTimer')}
                  className="w-3.5 h-3.5 text-amber-600 rounded"
                />
                <span className="font-bold">العداد التنازلي</span>
              </label>

              <label className={`p-2.5 rounded-xl border flex items-center gap-2 cursor-pointer transition-colors ${
                sections.whatsappCta ? 'bg-amber-50/70 border-amber-200 text-slate-900' : 'bg-slate-50 border-slate-200 text-slate-400'
              }`}>
                <input
                  type="checkbox"
                  checked={sections.whatsappCta}
                  onChange={() => toggleSection('whatsappCta')}
                  className="w-3.5 h-3.5 text-amber-600 rounded"
                />
                <span className="font-bold">زر حجز واتساب</span>
              </label>
            </div>
          </div>

          {/* 3. Link Custom Slug & Expiry */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
            <div>
              <label className="block text-xs font-black text-slate-900 mb-1">
                الرمز المخصص للرابط (Slug / Token):
              </label>
              <input
                type="text"
                value={customSlug}
                onChange={(e) => setCustomSlug(e.target.value)}
                placeholder="مثلاً: sultan-vip"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-amber-500 outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-black text-slate-900 mb-1">
                مدة صلاحية الرابط:
              </label>
              <select
                value={expiresHours}
                onChange={(e) => setExpiresHours(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-amber-500 outline-hidden"
              >
                <option value={24}>24 ساعة (يوم واحد - استعجال عالي)</option>
                <option value={48}>48 ساعة (يومان - موصى به)</option>
                <option value={72}>72 ساعة (3 أيام)</option>
                <option value={168}>أسبوع كامل (7 أيام)</option>
                <option value={0}>دائم (بدون انتهاء)</option>
              </select>
            </div>
          </div>

          {/* 4. Live URL Generator & Share Card */}
          <div className="p-4 bg-slate-900 text-white rounded-2xl space-y-3 shadow-inner">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-amber-400 flex items-center gap-1.5">
                <LinkIcon className="w-4 h-4" />
                <span>الرابط النهائي المولد للعميل:</span>
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                {viewMode === 'images_only' ? 'معاينة صور فقط' : 'عرض شامل'}
              </span>
            </div>

            {/* URL Display */}
            <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 text-xs font-mono text-emerald-400 break-all select-all flex items-center justify-between gap-2">
              <span className="truncate">{finalUrl}</span>
              <button
                onClick={handleCopyLink}
                className="shrink-0 p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white transition-colors cursor-pointer"
                title="نسخ الرابط"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>

            {/* Quick Actions Bar */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs transition-colors cursor-pointer"
                >
                  {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedLink ? 'تم النسخ!' : 'نسخ الرابط'}</span>
                </button>

                <a
                  href={finalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-colors cursor-pointer"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>فتح للتجربة</span>
                </a>
              </div>

              {/* Direct WhatsApp Share */}
              <a
                href={`https://wa.me/${pitch.business.phone?.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(getWhatsAppShareText())}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>إرسال الرابط عبر واتساب</span>
              </a>
            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <span className="text-[11px] text-slate-500">
            يتم حفظ الإعدادات تلقائياً وتطبيقها على جلسة العرض
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-300 bg-white text-slate-700 text-xs font-bold hover:bg-slate-50 cursor-pointer"
            >
              إلغاء
            </button>
            <button
              onClick={handleSaveAndApply}
              className="bg-amber-600 hover:bg-amber-700 text-white font-black text-xs px-5 py-2 rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              حفظ وتطبيق التغييرات
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
