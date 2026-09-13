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
  CheckCircle2,
  Copy,
  Check,
  X,
  FileText,
  Tag,
  Share2,
  Smartphone
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { PitchPackage, SocialMockupItem } from '../types';
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
import { buildAssetPitchMessages } from '../utils/assetPitchMessageBuilder';

interface ImageOnlyShowcaseProps {
  pitch: PitchPackage;
  onSwitchToFullView?: () => void;
}

interface LightboxState {
  isOpen: boolean;
  title: string;
  badge: string;
  imageUrl: string;
  accompanyingText: string;
}

export const ImageOnlyShowcase: React.FC<ImageOnlyShowcaseProps> = ({
  pitch,
  onSwitchToFullView
}) => {
  const [activeFilter, setActiveFilter] = useState<'all' | 'logo' | 'catalog' | 'posts' | 'promo' | 'stand'>('all');
  const [qrUrl, setQrUrl] = useState<string>('');
  const [sessionId, setSessionId] = useState<string>('');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  
  // Lightbox modal state
  const [lightbox, setLightbox] = useState<LightboxState>({
    isOpen: false,
    title: '',
    badge: '',
    imageUrl: '',
    accompanyingText: ''
  });

  const biz = pitch.business;
  const bizName = biz.name_ar || biz.name_en || 'النشاط التجاري';
  const standStyles = getAcrylicMaterialStyles(pitch.visualAssets.acrylicStand.material);

  const messages = buildAssetPitchMessages({
    business: biz,
    discountedPrice: pitch.discountedPrice,
    currency: pitch.currency
  });

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

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const openLightbox = (title: string, badge: string, imageUrl: string, accompanyingText: string) => {
    setLightbox({
      isOpen: true,
      title,
      badge,
      imageUrl,
      accompanyingText
    });
  };

  const watermarkSvgUrl = pitch.watermarkSettings.enabled
    ? generateWatermarkPatternSvg(pitch.watermarkSettings)
    : '';

  const visualAssets = pitch.visualAssets;
  const logoImg = visualAssets.logoDataUrl;
  const catalogImg = visualAssets.catalogDataUrl;
  const promoImg = visualAssets.promoOfferDataUrl;
  const signboardImg = visualAssets.signboardPhotoUrl;
  const socialPosts = visualAssets.socialMockupPosts || [];
  const primarySocialPost = socialPosts[0];
  const primarySocialImg = primarySocialPost?.imageUrl;

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
        <span>معاينة حصرية لتصاميم الصور والمنشورات المصاحبة لـ: <strong>«{bizName}»</strong> • عينات مؤمنة</span>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
        
        {/* Header & Controls */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-amber-100 text-amber-900 text-xs font-black px-2.5 py-0.5 rounded-full border border-amber-200">
                معرض تصاميم الصور والمنشورات (Visual Gallery)
              </span>
              <span className="text-xs text-slate-400 font-bold">
                {biz.city || 'الفرع الرئيسي'}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900">
              تصاميم الهوية والمنشورات المصاحبة لـ «{bizName}»
            </h1>
            <p className="text-xs text-slate-500">
              استعرض نماذج الصور المرفوعة والمنشورات التسويقية المعدة لكل تصميم مع خيارات الفحص والتكبير
            </p>
          </div>

          {onSwitchToFullView && (
            <button
              onClick={onSwitchToFullView}
              className="self-start sm:self-center flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-black transition-colors cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5 text-amber-600" />
              <span>عرض الخطة الشاملة وباقة الأسعار ←</span>
            </button>
          )}
        </div>

        {/* Gallery Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-black">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-4 py-2 rounded-xl transition-all cursor-pointer shrink-0 ${
              activeFilter === 'all'
                ? 'bg-amber-500 text-slate-950 shadow-xs font-black'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            جميع التصاميم والمنشورات ({[logoImg, catalogImg, primarySocialImg, promoImg].filter(Boolean).length || 4})
          </button>
          <button
            onClick={() => setActiveFilter('logo')}
            className={`px-4 py-2 rounded-xl transition-all cursor-pointer shrink-0 ${
              activeFilter === 'logo'
                ? 'bg-amber-500 text-slate-950 shadow-xs font-black'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            الشعار والهوية 🎨
          </button>
          <button
            onClick={() => setActiveFilter('catalog')}
            className={`px-4 py-2 rounded-xl transition-all cursor-pointer shrink-0 ${
              activeFilter === 'catalog'
                ? 'bg-amber-500 text-slate-950 shadow-xs font-black'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            الكتالوج وقائمة الأسعار 📋
          </button>
          <button
            onClick={() => setActiveFilter('posts')}
            className={`px-4 py-2 rounded-xl transition-all cursor-pointer shrink-0 ${
              activeFilter === 'posts'
                ? 'bg-amber-500 text-slate-950 shadow-xs font-black'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            بوستات السوشيال ميديا 📱
          </button>
          <button
            onClick={() => setActiveFilter('promo')}
            className={`px-4 py-2 rounded-xl transition-all cursor-pointer shrink-0 ${
              activeFilter === 'promo'
                ? 'bg-amber-500 text-slate-950 shadow-xs font-black'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            العروض والخصومات 🔥
          </button>
          <button
            onClick={() => setActiveFilter('stand')}
            className={`px-4 py-2 rounded-xl transition-all cursor-pointer shrink-0 ${
              activeFilter === 'stand'
                ? 'bg-amber-500 text-slate-950 shadow-xs font-black'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            ستاند الأكريليك 3D 💎
          </button>
        </div>

        {/* Designs & Accompanying Posts Grid */}
        <div className="space-y-8">
          
          {/* ASSET 1: LOGO & IDENTITY DESIGN */}
          {(activeFilter === 'all' || activeFilter === 'logo') && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
              <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  <strong className="text-sm font-black text-slate-900">
                    1. تصميم الشعار الأيقوني الفاخر (Emblem Logo)
                  </strong>
                  <span className="bg-amber-100 text-amber-900 text-[10px] font-black px-2 py-0.5 rounded-md">
                    الهوية والشعار
                  </span>
                </div>
                <span className="bg-slate-900/80 text-white text-[9px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Lock className="w-2.5 h-2.5 text-amber-400" />
                  <span>معاينة مؤمنة</span>
                </span>
              </div>

              <div className="p-5 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                {/* Visual Side (5 cols) */}
                <div className="md:col-span-5 flex flex-col items-center">
                  <div 
                    onClick={() => logoImg && openLightbox('الشعار الأيقوني الفاخر', 'الهوية والشعار', logoImg, messages.logo.text)}
                    className="w-full h-64 bg-slate-100 rounded-xl border border-slate-200 relative overflow-hidden flex items-center justify-center group shadow-inner cursor-pointer"
                  >
                    {logoImg ? (
                      <>
                        <img
                          src={logoImg}
                          alt="الشعار"
                          className="w-full h-full object-contain p-3 transition-transform duration-300 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-slate-950/0 group-hover:bg-slate-950/20 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                          <span className="bg-slate-950/80 backdrop-blur-xs text-white text-xs font-black px-3 py-1.5 rounded-xl flex items-center gap-1.5 shadow-md">
                            <Maximize2 className="w-3.5 h-3.5" />
                            <span>تكبير وفحص الشعار</span>
                          </span>
                        </div>
                      </>
                    ) : signboardImg ? (
                      <div className="text-center p-4 space-y-2">
                        <img src={signboardImg} alt="صورة الواجهة" className="max-h-44 object-contain rounded-lg mx-auto" />
                        <span className="text-[10px] text-slate-500 block font-bold">صورة الواجهة الميدانية الحالية المعتمدة</span>
                      </div>
                    ) : (
                      <div className="text-center p-6 text-slate-400">
                        <ImageIcon className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                        <span className="text-xs font-bold block text-slate-600">الشعار قيد التجهيز الرقمي</span>
                        <span className="text-[10px] text-slate-400">نموذج فيكتور رقمي بدقة فائقة</span>
                      </div>
                    )}

                    <div className="absolute top-2 left-2 bg-slate-950/80 backdrop-blur-xs text-amber-400 text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" />
                      <span>مؤمنة بالعلامة المائية</span>
                    </div>
                  </div>

                  <span className="text-[10px] text-slate-400 mt-2 font-medium text-center">
                    اضغط على الصورة لتكبيرها وفحص تفاصيل الألوان والخطوط
                  </span>
                </div>

                {/* Accompanying Post / Message Side (7 cols) */}
                <div className="md:col-span-7 bg-amber-50/50 p-4 sm:p-5 rounded-2xl border border-amber-200/80 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-amber-950 flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-amber-600" />
                      <span>{messages.logo.titleAr}</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(messages.logo.text, 'logo')}
                      className="text-[11px] font-bold text-amber-800 bg-white hover:bg-amber-100 px-2.5 py-1 rounded-lg border border-amber-200 flex items-center gap-1 transition cursor-pointer"
                    >
                      {copiedKey === 'logo' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedKey === 'logo' ? 'تم النسخ ✓' : 'نسخ نص المنشور'}</span>
                    </button>
                  </div>

                  <div className="bg-white p-3.5 rounded-xl border border-amber-200/70 text-xs text-slate-800 leading-relaxed font-medium whitespace-pre-line max-h-56 overflow-y-auto">
                    {messages.logo.text}
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-amber-900 font-bold pt-1">
                    <span>💡 الشعار مصمم كأيقونة متناظرة صالحة للطباعة واليافطة والكروت</span>
                    <span className="text-amber-700 font-mono">SVG • AI • PNG</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ASSET 2: CATALOG / PRICE MENU BOARD */}
          {(activeFilter === 'all' || activeFilter === 'catalog') && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
              <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                  <strong className="text-sm font-black text-slate-900">
                    2. كتالوج وقائمة الأسعار والخدمات (Price Menu Board)
                  </strong>
                  <span className="bg-blue-100 text-blue-900 text-[10px] font-black px-2 py-0.5 rounded-md">
                    المنيو والأسعار
                  </span>
                </div>
                <span className="bg-slate-900/80 text-white text-[9px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Lock className="w-2.5 h-2.5 text-amber-400" />
                  <span>معاينة مؤمنة</span>
                </span>
              </div>

              <div className="p-5 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                {/* Visual Side (5 cols) */}
                <div className="md:col-span-5 flex flex-col items-center">
                  <div 
                    onClick={() => catalogImg && openLightbox('كتالوج وقائمة الأسعار والخدمات', 'المنيو والأسعار', catalogImg, messages.catalog.text)}
                    className="w-full h-64 bg-slate-100 rounded-xl border border-slate-200 relative overflow-hidden flex items-center justify-center group shadow-inner cursor-pointer"
                  >
                    {catalogImg ? (
                      <>
                        <img
                          src={catalogImg}
                          alt="الكتالوج"
                          className="w-full h-full object-contain p-3 transition-transform duration-300 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-slate-950/0 group-hover:bg-slate-950/20 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                          <span className="bg-slate-950/80 backdrop-blur-xs text-white text-xs font-black px-3 py-1.5 rounded-xl flex items-center gap-1.5 shadow-md">
                            <Maximize2 className="w-3.5 h-3.5" />
                            <span>تكبير وفحص الكتالوج</span>
                          </span>
                        </div>
                      </>
                    ) : (
                      <div className="text-center p-6 text-slate-400">
                        <ImageIcon className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                        <span className="text-xs font-bold block text-slate-600">لوحة الأسعار والخدمات</span>
                        <span className="text-[10px] text-slate-400">تصميم منيو فاخر مجهز للطباعة</span>
                      </div>
                    )}

                    <div className="absolute top-2 left-2 bg-slate-950/80 backdrop-blur-xs text-amber-400 text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" />
                      <span>مؤمنة بالعلامة المائية</span>
                    </div>
                  </div>

                  <span className="text-[10px] text-slate-400 mt-2 font-medium text-center">
                    لوحة الأسعار منظمة بالجنيه المصري وجاهزة للوضع على كاونتر الاستقبال
                  </span>
                </div>

                {/* Accompanying Post / Message Side (7 cols) */}
                <div className="md:col-span-7 bg-blue-50/50 p-4 sm:p-5 rounded-2xl border border-blue-200/80 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-blue-950 flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-blue-600" />
                      <span>{messages.catalog.titleAr}</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(messages.catalog.text, 'catalog')}
                      className="text-[11px] font-bold text-blue-800 bg-white hover:bg-blue-100 px-2.5 py-1 rounded-lg border border-blue-200 flex items-center gap-1 transition cursor-pointer"
                    >
                      {copiedKey === 'catalog' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedKey === 'catalog' ? 'تم النسخ ✓' : 'نسخ نص المنشور'}</span>
                    </button>
                  </div>

                  <div className="bg-white p-3.5 rounded-xl border border-blue-200/70 text-xs text-slate-800 leading-relaxed font-medium whitespace-pre-line max-h-56 overflow-y-auto">
                    {messages.catalog.text}
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-blue-900 font-bold pt-1">
                    <span>📋 رفع المبيعات وثقة الزبائن عبر تنظيم أسعار الخدمات</span>
                    <span className="text-blue-700 font-mono">طباعة كاونتر + PDF</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ASSET 3: BRANDED SOCIAL POST & FRAMES */}
          {(activeFilter === 'all' || activeFilter === 'posts') && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
              <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
                  <strong className="text-sm font-black text-slate-900">
                    3. بوست السوشيال ميديا الإعلاني وقالب البرواز (Branded Post)
                  </strong>
                  <span className="bg-purple-100 text-purple-900 text-[10px] font-black px-2 py-0.5 rounded-md">
                    سوشيال ميديا
                  </span>
                </div>
                <span className="bg-slate-900/80 text-white text-[9px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Lock className="w-2.5 h-2.5 text-amber-400" />
                  <span>معاينة مؤمنة</span>
                </span>
              </div>

              <div className="p-5 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                {/* Visual Side (5 cols) */}
                <div className="md:col-span-5 flex flex-col items-center">
                  <div 
                    onClick={() => primarySocialImg && openLightbox('بوست السوشيال ميديا الإعلاني', 'بوست احترافي', primarySocialImg, primarySocialPost?.caption || messages.social_post.text)}
                    className="w-full h-64 bg-slate-100 rounded-xl border border-slate-200 relative overflow-hidden flex items-center justify-center group shadow-inner cursor-pointer"
                  >
                    {primarySocialImg ? (
                      <>
                        <img
                          src={primarySocialImg}
                          alt="بوست السوشيال"
                          className="w-full h-full object-contain p-3 transition-transform duration-300 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-slate-950/0 group-hover:bg-slate-950/20 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                          <span className="bg-slate-950/80 backdrop-blur-xs text-white text-xs font-black px-3 py-1.5 rounded-xl flex items-center gap-1.5 shadow-md">
                            <Maximize2 className="w-3.5 h-3.5" />
                            <span>تكبير وفحص البوست</span>
                          </span>
                        </div>
                      </>
                    ) : (
                      /* Fallback Branded Frame Mockup */
                      <div className="w-48 aspect-square bg-white rounded-xl shadow-lg border-2 border-amber-400 p-3 flex flex-col justify-between text-center">
                        <div className="flex items-center justify-between text-[9px] font-black text-slate-800">
                          <span>{bizName}</span>
                          <span className="text-amber-600">دليلك</span>
                        </div>
                        <div className="my-auto py-2">
                          <Store className="w-8 h-8 text-amber-500 mx-auto mb-1" />
                          <strong className="text-[10px] font-black text-slate-900 block truncate">
                            {primarySocialPost?.headline || 'أعلى جودة تلبي طلبك!'}
                          </strong>
                        </div>
                        <span className="text-[8px] text-slate-400 font-mono">قالب برواز المنتجات 1:1</span>
                      </div>
                    )}

                    <div className="absolute top-2 left-2 bg-slate-950/80 backdrop-blur-xs text-amber-400 text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" />
                      <span>مؤمنة بالعلامة المائية</span>
                    </div>
                  </div>

                  <span className="text-[10px] text-slate-400 mt-2 font-medium text-center">
                    قالب برواز موحد يمكنك وضع صور منتجاتك داخله لتظهر كإعلان عالمي
                  </span>
                </div>

                {/* Accompanying Post / Message Side (7 cols) */}
                <div className="md:col-span-7 bg-purple-50/50 p-4 sm:p-5 rounded-2xl border border-purple-200/80 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-purple-950 flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-purple-600" />
                      <span>{primarySocialPost?.headline || messages.social_post.titleAr}</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(primarySocialPost?.caption || messages.social_post.text, 'social_post')}
                      className="text-[11px] font-bold text-purple-800 bg-white hover:bg-purple-100 px-2.5 py-1 rounded-lg border border-purple-200 flex items-center gap-1 transition cursor-pointer"
                    >
                      {copiedKey === 'social_post' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedKey === 'social_post' ? 'تم النسخ ✓' : 'نسخ نص المنشور'}</span>
                    </button>
                  </div>

                  <div className="bg-white p-3.5 rounded-xl border border-purple-200/70 text-xs text-slate-800 leading-relaxed font-medium whitespace-pre-line max-h-56 overflow-y-auto">
                    {primarySocialPost?.caption || messages.social_post.text}
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-purple-900 font-bold pt-1">
                    <span>📱 صياغة احترافية تجبر الزبون على التفاعل والزيارة</span>
                    <span className="text-purple-700 font-mono">فيسبوك • إنستغرام</span>
                  </div>
                </div>
              </div>

              {/* Subgrid of Additional Social Mockups */}
              {socialPosts.length > 1 && (
                <div className="p-4 bg-slate-50 border-t border-slate-200 space-y-3">
                  <strong className="text-xs font-black text-slate-800 block">
                    باقي المنشورات الترويجية المخصصة ({socialPosts.length} منشورات):
                  </strong>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {socialPosts.slice(1).map((post, idx) => (
                      <div key={post.id || idx} className="p-3 bg-white rounded-xl border border-slate-200 space-y-1.5 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-bold bg-amber-100 text-amber-900 px-2 py-0.5 rounded-md text-[10px]">
                            {post.tag || `منشور ${idx + 2}`}
                          </span>
                          {post.imageUrl && (
                            <span className="text-[10px] text-emerald-700 font-bold flex items-center gap-0.5">
                              <CheckCircle2 className="w-2.5 h-2.5" />
                              <span>تصميم مرفق</span>
                            </span>
                          )}
                        </div>
                        <strong className="text-slate-900 font-black block leading-tight text-[11px]">
                          {post.headline}
                        </strong>
                        <p className="text-slate-600 text-[10px] leading-relaxed line-clamp-3">
                          {post.caption}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ASSET 4: PROMO OFFER & DISCOUNT BANNER */}
          {(activeFilter === 'all' || activeFilter === 'promo') && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
              <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                  <strong className="text-sm font-black text-slate-900">
                    4. إعلان العرض الترويجي وبطاقة الخصم (Promo Offer Banner)
                  </strong>
                  <span className="bg-rose-100 text-rose-900 text-[10px] font-black px-2 py-0.5 rounded-md">
                    حملة العروض
                  </span>
                </div>
                <span className="bg-slate-900/80 text-white text-[9px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Lock className="w-2.5 h-2.5 text-amber-400" />
                  <span>معاينة مؤمنة</span>
                </span>
              </div>

              <div className="p-5 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                {/* Visual Side (5 cols) */}
                <div className="md:col-span-5 flex flex-col items-center">
                  <div 
                    onClick={() => promoImg && openLightbox('إعلان العرض الترويجي وبطاقة الخصم', 'حملة العروض', promoImg, messages.promo_offer.text)}
                    className="w-full h-64 bg-slate-100 rounded-xl border border-slate-200 relative overflow-hidden flex items-center justify-center group shadow-inner cursor-pointer"
                  >
                    {promoImg ? (
                      <>
                        <img
                          src={promoImg}
                          alt="إعلان العرض"
                          className="w-full h-full object-contain p-3 transition-transform duration-300 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-slate-950/0 group-hover:bg-slate-950/20 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                          <span className="bg-slate-950/80 backdrop-blur-xs text-white text-xs font-black px-3 py-1.5 rounded-xl flex items-center gap-1.5 shadow-md">
                            <Maximize2 className="w-3.5 h-3.5" />
                            <span>تكبير وفحص إعلان العرض</span>
                          </span>
                        </div>
                      </>
                    ) : (
                      <div className="text-center p-6 text-slate-400">
                        <ImageIcon className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                        <span className="text-xs font-bold block text-slate-600">بانر العرض الترويجي والخصم</span>
                        <span className="text-[10px] text-slate-400">تصميم ناري مخصص لجذب زبائن المنطقة</span>
                      </div>
                    )}

                    <div className="absolute top-2 left-2 bg-slate-950/80 backdrop-blur-xs text-amber-400 text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" />
                      <span>مؤمنة بالعلامة المائية</span>
                    </div>
                  </div>

                  <span className="text-[10px] text-slate-400 mt-2 font-medium text-center">
                    شارة خصم وزر اتصال مباشر لزيادة الإقبال الفوري على المحل
                  </span>
                </div>

                {/* Accompanying Post / Message Side (7 cols) */}
                <div className="md:col-span-7 bg-rose-50/50 p-4 sm:p-5 rounded-2xl border border-rose-200/80 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-rose-950 flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-rose-600" />
                      <span>{messages.promo_offer.titleAr}</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(messages.promo_offer.text, 'promo_offer')}
                      className="text-[11px] font-bold text-rose-800 bg-white hover:bg-rose-100 px-2.5 py-1 rounded-lg border border-rose-200 flex items-center gap-1 transition cursor-pointer"
                    >
                      {copiedKey === 'promo_offer' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedKey === 'promo_offer' ? 'تم النسخ ✓' : 'نسخ نص المنشور'}</span>
                    </button>
                  </div>

                  <div className="bg-white p-3.5 rounded-xl border border-rose-200/70 text-xs text-slate-800 leading-relaxed font-medium whitespace-pre-line max-h-56 overflow-y-auto">
                    {messages.promo_offer.text}
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-rose-900 font-bold pt-1">
                    <span>🔥 تنشيط حركة الزبائن في المنطقة بخصم زمني محدد</span>
                    <span className="text-rose-700 font-mono">حملة إعلانية ممولة</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ASSET 5: 3D ACRYLIC STAND */}
          {(activeFilter === 'all' || activeFilter === 'stand') && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
              <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  <strong className="text-sm font-black text-slate-900">
                    5. مجسم ستاند الطاولة الأكريليكي الفاخر (VIP Table Stand 3D)
                  </strong>
                  <span className="bg-amber-100 text-amber-900 text-[10px] font-black px-2 py-0.5 rounded-md">
                    المجسم الميداني
                  </span>
                </div>
                <span className="bg-slate-900/80 text-white text-[9px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Lock className="w-2.5 h-2.5 text-amber-400" />
                  <span>معاينة حية</span>
                </span>
              </div>

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
                <span className="font-bold text-slate-800 block">المواصفات وتأثير الستاند على الزبائن:</span>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  يصنع من أكريليك كريستالي سمك 4 مم مع قاعدة معدنية مطلية، طباعة UV حرارية، وشريحة NFC لتقييم الزبائن بمجرد ملامسة الهاتف دون فتح الكاميرا.
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
            <span>تسليم كافة التصاميم بدون علامة مائية بعد التعاقد</span>
          </strong>
        </div>

        <a
          href={`https://wa.me/201556221141?text=${encodeURIComponent(`السلام عليكم، أنا صاحب نشاط «${bizName}» وعاينت تصاميم الصور والمنشورات والستاند، وحابب أعتمد الباقة واستلم الأصول الأصلية.`)}`}
          target="_blank"
          rel="noopener noreferrer"
          onClick={handleCtaClick}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs sm:text-sm px-6 py-3 rounded-xl shadow-md transition-all transform hover:-translate-y-0.5 cursor-pointer"
        >
          <Send className="w-4 h-4" />
          <span>طلب تسليم التصاميم الأصلية عبر واتساب</span>
        </a>
      </div>

      {/* 🔍 LIGHTBOX MODAL FOR IMAGE INSPECTION & POST READING */}
      {lightbox.isOpen && (
        <div 
          className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setLightbox(prev => ({ ...prev, isOpen: false }))}
        >
          <div 
            className="bg-white rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl border border-slate-700 relative flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="bg-amber-400 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-md">
                  {lightbox.badge}
                </span>
                <strong className="text-sm font-black">{lightbox.title}</strong>
              </div>
              <button
                type="button"
                onClick={() => setLightbox(prev => ({ ...prev, isOpen: false }))}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 overflow-y-auto space-y-4">
              {/* Image Box */}
              <div className="w-full bg-slate-100 rounded-2xl border border-slate-200 overflow-hidden flex items-center justify-center p-3 relative shadow-inner min-h-[220px]">
                <img
                  src={lightbox.imageUrl}
                  alt={lightbox.title}
                  className="max-h-80 w-auto object-contain rounded-xl"
                />
                <div className="absolute top-3 left-3 bg-slate-950/80 backdrop-blur-xs text-amber-400 text-[10px] font-black px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>عينة مؤمنة بدقة العرض</span>
                </div>
              </div>

              {/* Accompanying Post */}
              {lightbox.accompanyingText && (
                <div className="bg-amber-50/70 p-4 rounded-2xl border border-amber-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <strong className="text-xs font-black text-amber-950 flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-amber-600" />
                      <span>المنشور الترويجي المصاحب للتصميم:</span>
                    </strong>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(lightbox.accompanyingText, 'modal')}
                      className="text-[11px] font-bold text-amber-900 bg-white hover:bg-amber-100 px-2 py-0.5 rounded-md border border-amber-300 flex items-center gap-1 transition cursor-pointer"
                    >
                      {copiedKey === 'modal' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedKey === 'modal' ? 'تم النسخ ✓' : 'نسخ النص'}</span>
                    </button>
                  </div>
                  <p className="text-xs text-slate-800 leading-relaxed font-medium whitespace-pre-line bg-white p-3 rounded-xl border border-amber-200/60">
                    {lightbox.accompanyingText}
                  </p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3">
              <span className="text-[11px] text-slate-500 font-medium">
                يتم تسليم الملفات الأصلية فائقة الدقة فور التعاقد.
              </span>
              <a
                href={`https://wa.me/201556221141?text=${encodeURIComponent(`السلام عليكم، أريد اعتماد تصميم «${lightbox.title}» لنشاط «${bizName}» واستلام النسخة الأصلية.`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black flex items-center gap-1.5 transition cursor-pointer shadow-xs"
              >
                <Send className="w-3.5 h-3.5" />
                <span>اعتماد التصميم عبر واتساب</span>
              </a>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
