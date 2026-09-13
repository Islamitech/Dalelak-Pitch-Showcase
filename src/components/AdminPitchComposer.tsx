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
  ExternalLink,
  Link as LinkIcon,
  Image as ImageIcon,
  MessageSquare
} from 'lucide-react';
import { PitchPackage, AcrylicStandConfig, DeliverableItem } from '../types';
import { generateQrDataUrl, getAcrylicMaterialStyles } from '../utils/mockupComposer';

interface AdminPitchComposerProps {
  pitch: PitchPackage;
  onUpdatePitch: (updated: PitchPackage) => void;
  onSwitchToClientPreview: () => void;
  onSwitchToImagesOnlyPreview: () => void;
  onOpenWhatsAppModal: () => void;
  onOpenWatermarkSettings: () => void;
  onOpenAdvancedLinkSettings: () => void;
  onOpenPostGenerator: () => void;
}

export const AdminPitchComposer: React.FC<AdminPitchComposerProps> = ({
  pitch,
  onUpdatePitch,
  onSwitchToClientPreview,
  onSwitchToImagesOnlyPreview,
  onOpenWhatsAppModal,
  onOpenWatermarkSettings,
  onOpenAdvancedLinkSettings,
  onOpenPostGenerator
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
    const origin = window.location.origin;
    const viewParam = pitch.linkSettings?.viewMode && pitch.linkSettings.viewMode !== 'full' ? `&view=${pitch.linkSettings.viewMode}` : '';
    const url = `${origin}/?pitch=${pitch.id}&token=${pitch.clientToken}${viewParam}`;
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
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="bg-slate-950 text-amber-400 text-xs font-black px-2.5 py-0.5 rounded-full">
              حزمة إبهار مخصصة
            </span>
            <span className="text-xs font-bold text-slate-900">
              كود العرض: <span className="font-mono font-black">DL-{pitch.clientToken}</span>
            </span>
            {pitch.marketingData?.isSyncedFromPhase1 && (
              <span className="bg-emerald-700 text-white text-[10px] font-black px-2 py-0.5 rounded-full">
                متزامن مع المرحلة 1 ⚡️
              </span>
            )}
          </div>
          <h1 className="text-lg sm:text-xl font-black text-slate-950">
            تجهيز صفحة الاستعراض والإغلاق لـ «{bizName}»
          </h1>
          <p className="text-xs text-slate-900 font-medium">
            تخصيص الباقة ومجسم ستاند الأكريليك وبراويز السوشيال ميديا وتوليد المنشورات بالذكاء الاصطناعي
          </p>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto flex-wrap">
          <button
            onClick={onOpenAdvancedLinkSettings}
            className="flex items-center justify-center gap-1.5 bg-slate-950/20 hover:bg-slate-950/30 text-slate-950 font-black text-xs px-3.5 py-2.5 rounded-xl transition-all cursor-pointer"
            title="الإعدادات المتقدمة للرابط"
          >
            <LinkIcon className="w-4 h-4" />
            <span>إعدادات الرابط</span>
          </button>

          <button
            onClick={handleCopyPitchLink}
            className="flex-1 md:flex-none flex items-center justify-center gap-1.5 bg-white text-slate-900 hover:bg-slate-50 font-black text-xs px-4 py-2.5 rounded-xl shadow-xs transition-all cursor-pointer"
          >
            {copiedLink ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            <span>{copiedLink ? 'تم نسخ الرابط' : 'نسخ الرابط'}</span>
          </button>

          <button
            onClick={onSwitchToImagesOnlyPreview}
            className="flex-1 md:flex-none flex items-center justify-center gap-1.5 bg-amber-600 hover:bg-amber-700 text-white font-black text-xs px-4 py-2.5 rounded-xl shadow-xs transition-all cursor-pointer"
          >
            <ImageIcon className="w-4 h-4" />
            <span>معاينة الصور فقط 🖼️</span>
          </button>

          <button
            onClick={onSwitchToClientPreview}
            className="flex-1 md:flex-none flex items-center justify-center gap-1.5 bg-slate-950 hover:bg-slate-800 text-amber-400 font-black text-xs px-4 py-2.5 rounded-xl shadow-xs transition-all cursor-pointer"
          >
            <Eye className="w-4 h-4" />
            <span>العرض الشامل</span>
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

          {/* Section 2: AI Generated Posts from Phase 1 */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-amber-500" />
                <span>المنشورات وبراويز السوشيال ميديا المخصصة ({pitch.visualAssets.socialMockupPosts.length} منشورات)</span>
              </h2>

              <button
                onClick={onOpenPostGenerator}
                className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs px-3.5 py-1.5 rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>توليد منشور جديد بالذكاء الاصطناعي 🪄</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {pitch.visualAssets.socialMockupPosts.map((post, idx) => (
                <div key={post.id || idx} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold bg-amber-100 text-amber-900 px-2 py-0.5 rounded-md text-[10px]">
                      {post.tag || `منشور ${idx + 1}`}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">قالب برواز</span>
                  </div>
                  <strong className="text-slate-900 font-black block leading-tight">
                    {post.headline}
                  </strong>
                  <p className="text-slate-600 text-[11px] leading-relaxed line-clamp-3">
                    {post.caption}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Section 3: Pricing & Package Details */}
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

          {/* Section 4: Deliverables List */}
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

          {/* Direct Post Generator CTA Card */}
          <div className="p-4 bg-gradient-to-tr from-amber-500/15 to-yellow-500/10 border border-amber-300 rounded-2xl space-y-2.5">
            <h4 className="text-xs font-black text-amber-950 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span>محرك منشورات المرحلة 1 (AI)</span>
            </h4>
            <p className="text-[11px] text-amber-900 leading-relaxed">
              يمكنك توليد منشورات تسويقية حصرية لـ {bizName} بلهجة مصرية جذابة وإضافتها فوراً لبراويز العرض.
            </p>
            <button
              onClick={onOpenPostGenerator}
              className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs py-2.5 rounded-xl shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5"
            >
              <span>توليد منشورات تسويقية الآن 🪄</span>
            </button>
          </div>

          {/* Advanced Link Settings Card */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                <LinkIcon className="w-4 h-4 text-amber-600" />
                <span>إدارة الروابط والمعاينة</span>
              </span>
              <button
                onClick={onOpenAdvancedLinkSettings}
                className="text-[11px] font-bold text-amber-600 hover:underline cursor-pointer"
              >
                تخصيص
              </button>
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              التحكم في فتح الرابط كمعاينة لتصاميم الصور فقط أو العرض الكامل، وتعديل الرمز المخصص وصلاحية الرابط.
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
