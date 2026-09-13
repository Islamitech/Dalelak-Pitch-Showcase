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
  MessageSquare,
  Database,
  RefreshCw,
  Sliders,
  CheckCircle2,
  Phone,
  Upload
} from 'lucide-react';
import { PitchPackage, AcrylicStandConfig, DeliverableItem } from '../types';
import { AssetPitchCard } from './AssetPitchCard';
import { ServerTextPostsPanel } from './ServerTextPostsPanel';
import { buildAssetPitchMessages } from '../utils/assetPitchMessageBuilder';
import { generateQrDataUrl, getAcrylicMaterialStyles } from '../utils/mockupComposer';
import { enrichPitchPackageWithEcosystemData, getShareablePreviewUrl } from '../services/dalilakService';

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
  const [activeTab, setActiveTab] = useState<'visual_assets' | 'acrylic_stand' | 'ai_posts' | 'package_deal' | 'all'>('visual_assets');
  const [copiedLink, setCopiedLink] = useState(false);
  const [standQrDataUrl, setStandQrDataUrl] = useState('');
  const [isSyncingEcosystem, setIsSyncingEcosystem] = useState(false);
  const [ecosystemSyncStatus, setEcosystemSyncStatus] = useState<{
    synced: boolean;
    marketingFound: boolean;
    visualFound: boolean;
  }>({ synced: false, marketingFound: false, visualFound: false });

  const biz = pitch.business;
  const bizName = biz.name_ar || biz.name_en || 'النشاط التجاري';
  const bizPhone = biz.phone || '';
  const bizLocation = biz.city ? biz.city + (biz.governorate ? ' - ' + biz.governorate : '') : 'المقر الميداني';

  const messages = buildAssetPitchMessages({
    business: biz,
    discountedPrice: pitch.discountedPrice,
    currency: pitch.currency
  });

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

  const updateVisualAsset = (key: 'logoDataUrl' | 'catalogDataUrl' | 'promoOfferDataUrl', url: string) => {
    onUpdatePitch({
      ...pitch,
      visualAssets: {
        ...pitch.visualAssets,
        [key]: url
      },
      updatedAt: new Date().toISOString()
    });
  };

  const updateSocialPostImage = (url: string) => {
    const existingPosts = [...(pitch.visualAssets.socialMockupPosts || [])];
    if (existingPosts.length > 0) {
      existingPosts[0] = { ...existingPosts[0], imageUrl: url };
    } else {
      existingPosts.push({
        id: 'post_main',
        headline: 'أعلى جودة تلبي طلبك!',
        caption: 'الجودة والخدمة المعتمدة في منطقتكم.',
        accent: 'amber',
        tag: 'رسمي',
        imageUrl: url
      });
    }

    onUpdatePitch({
      ...pitch,
      visualAssets: {
        ...pitch.visualAssets,
        socialMockupPosts: existingPosts
      },
      updatedAt: new Date().toISOString()
    });
  };

  const updateStand = (partialStand: Partial<AcrylicStandConfig>) => {
    onUpdatePitch({
      ...pitch,
      visualAssets: {
        ...pitch.visualAssets,
        acrylicStand: {
          ...pitch.visualAssets.acrylicStand,
          ...partialStand
        }
      },
      updatedAt: new Date().toISOString()
    });
  };

  const triggerEcosystemSync = async () => {
    setIsSyncingEcosystem(true);
    try {
      const result = await enrichPitchPackageWithEcosystemData(pitch);
      onUpdatePitch(result.enrichedPitch);
      setEcosystemSyncStatus({
        synced: true,
        marketingFound: result.marketingFound,
        visualFound: result.visualFound
      });
    } catch (e) {
      console.warn('Sync failed:', e);
    } finally {
      setIsSyncingEcosystem(false);
    }
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
  const shareableUrl = getShareablePreviewUrl(pitch);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* 1. Top Command Bar: Business Info, Quick Stats & Action Buttons */}
      <div className="bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 rounded-2xl p-5 shadow-sm text-slate-950 flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span className="bg-slate-950 text-amber-400 text-xs font-black px-2.5 py-0.5 rounded-full">
              محطة إنتاج العينات المحمية وإرسال الواتساب
            </span>
            <span className="bg-white/80 text-slate-900 text-xs font-bold px-2.5 py-0.5 rounded-full border border-slate-300/60">
              كود النشاط: <strong className="font-mono font-black">{biz.id || 'BIZ-CORE'}</strong>
            </span>
            {pitch.marketingData?.isSyncedFromPhase1 && (
              <span className="bg-emerald-800 text-white text-[10px] font-black px-2 py-0.5 rounded-full">
                متزامن مع المرحلة 1 ⚡️
              </span>
            )}
          </div>

          <h1 className="text-xl sm:text-2xl font-black text-slate-950 flex items-center gap-2">
            <span>«{bizName}»</span>
          </h1>

          <div className="flex items-center gap-3 text-xs font-bold text-slate-900 mt-1 flex-wrap">
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-slate-950" />
              <span>{bizLocation}</span>
            </span>
            <span>•</span>
            <span className="flex items-center gap-1 font-mono">
              <Phone className="w-3.5 h-3.5 text-slate-950" />
              <span dir="ltr">{bizPhone}</span>
            </span>
            <span>•</span>
            <span className="text-slate-800 font-medium">
              التصنيف: {biz.category || 'عام'}
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 w-full md:w-auto flex-wrap">
          <button
            type="button"
            onClick={onOpenAdvancedLinkSettings}
            className="flex-1 md:flex-none flex items-center justify-center gap-1.5 bg-slate-950/20 hover:bg-slate-950/30 text-slate-950 font-black text-xs px-3.5 py-2.5 rounded-xl transition-all cursor-pointer"
            title="الإعدادات المتقدمة للرابط"
          >
            <LinkIcon className="w-4 h-4" />
            <span>إعدادات الرابط</span>
          </button>

          <button
            type="button"
            onClick={onOpenWatermarkSettings}
            className="flex-1 md:flex-none flex items-center justify-center gap-1.5 bg-white/90 hover:bg-white text-slate-900 font-bold text-xs px-3 py-2.5 rounded-xl shadow-xs transition cursor-pointer border border-slate-300"
          >
            <Sliders className="w-4 h-4 text-amber-600" />
            <span>العلامة المائية</span>
          </button>

          <button
            type="button"
            onClick={handleCopyPitchLink}
            className="flex-1 md:flex-none flex items-center justify-center gap-1.5 bg-white text-slate-900 hover:bg-slate-50 font-black text-xs px-3.5 py-2.5 rounded-xl shadow-xs transition-all cursor-pointer"
          >
            {copiedLink ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            <span>{copiedLink ? 'تم نسخ الرابط' : 'نسخ الرابط'}</span>
          </button>

          <button
            type="button"
            onClick={onSwitchToImagesOnlyPreview}
            className="flex-1 md:flex-none flex items-center justify-center gap-1.5 bg-amber-600 hover:bg-amber-700 text-white font-black text-xs px-4 py-2.5 rounded-xl shadow-xs transition-all cursor-pointer"
          >
            <ImageIcon className="w-4 h-4" />
            <span>معاينة الصور فقط 🖼️</span>
          </button>

          <button
            type="button"
            onClick={onSwitchToClientPreview}
            className="flex-1 md:flex-none flex items-center justify-center gap-1.5 bg-slate-950 hover:bg-slate-800 text-amber-400 font-black text-xs px-4 py-2.5 rounded-xl shadow-xs transition cursor-pointer"
          >
            <Eye className="w-4 h-4" />
            <span>معاينة العرض الشامل</span>
          </button>
        </div>
      </div>

      {/* 2. Notice Banner: WhatsApp Image Dispatch Philosophy */}
      <div className="p-4 bg-amber-50/80 border border-amber-200 rounded-2xl flex items-start gap-3 text-xs text-amber-950">
        <div className="w-8 h-8 rounded-xl bg-amber-200/80 flex items-center justify-center shrink-0 mt-0.5">
          <ShieldCheck className="w-5 h-5 text-amber-800" />
        </div>
        <div className="space-y-1">
          <strong className="font-black block text-amber-900 text-xs sm:text-sm">
            نظام رفع وتأمين العينات المصورة (Direct Image Upload & Protected Watermark):
          </strong>
          <p className="leading-relaxed text-amber-800 font-medium">
            ارفع أي صورة من جهازك مباشرة لكل قسم (اللوجو، الكتالوج، بوست السوشيال، أو البانر الترويجي) وسيقوم النظام فوراً بحرق العلامة المائية داخل بيكسلات الصورة لمنع استغلالها قبل التعاقد. يمكنك نسخ الصورة المحمية أو إرسالها للعميل بضغطة زر.
          </p>
        </div>
      </div>

      {/* 2.5 Ecosystem Aggregator & Sync Bar */}
      <div className="p-4 bg-slate-900 text-white rounded-2xl shadow-md border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="bg-amber-400 text-slate-950 text-[10px] font-black px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <Database className="w-3 h-3" />
              <span>مستودع المنظومة المساعد (Ecosystem Hub)</span>
            </span>
            <span className="text-slate-400 text-xs">
              السيرفر: <code className="text-amber-300 font-mono text-[11px]">hzlbbzxccqfdeyumtxph</code>
            </span>
            {ecosystemSyncStatus.synced && (
              <span className="bg-emerald-950 text-emerald-300 border border-emerald-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                <span>
                  {ecosystemSyncStatus.visualFound && ecosystemSyncStatus.marketingFound
                    ? 'تم دمج مخرجات المرحلتين 1 و 2 بنجاح'
                    : ecosystemSyncStatus.visualFound
                    ? 'تم جلب تصاميم الهوية (المرحلة 2)'
                    : ecosystemSyncStatus.marketingFound
                    ? 'تم جلب خطة التسويق (المرحلة 1)'
                    : 'سيرفر المساعدين جاهز ومتصل'}
                </span>
              </span>
            )}
          </div>
          <p className="text-xs text-slate-300">
            <strong className="text-amber-300">بوابة التأكيد والنقل الحصرية:</strong> المرحلة 3 هي البوابة الوحيدة المخولة برفع وتأكيد أصول وتصاميم النشاط ونقلها للسيرفر الأساسي.
          </p>
        </div>

        <button
          type="button"
          onClick={triggerEcosystemSync}
          disabled={isSyncingEcosystem}
          className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shrink-0"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isSyncingEcosystem ? 'animate-spin' : ''}`} />
          <span>{isSyncingEcosystem ? 'جاري المزامنة...' : 'مزامنة مخرجات المنظومة'}</span>
        </button>
      </div>

      {/* 3. Section Navigation Tabs */}
      <div className="flex items-center gap-1.5 bg-slate-200/80 p-1.5 rounded-2xl overflow-x-auto text-xs font-black">
        <button
          type="button"
          onClick={() => setActiveTab('visual_assets')}
          className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl transition-all cursor-pointer shrink-0 ${
            activeTab === 'visual_assets'
              ? 'bg-amber-500 text-slate-950 shadow-sm'
              : 'text-slate-700 hover:text-slate-950 hover:bg-white/60'
          }`}
        >
          <Upload className="w-3.5 h-3.5" />
          <span>🎨 رفع وتأمين تصاميم الصور (4 أصول)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('acrylic_stand')}
          className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl transition-all cursor-pointer shrink-0 ${
            activeTab === 'acrylic_stand'
              ? 'bg-amber-500 text-slate-950 shadow-sm'
              : 'text-slate-700 hover:text-slate-950 hover:bg-white/60'
          }`}
        >
          <QrCode className="w-3.5 h-3.5" />
          <span>💎 ستاند الطاولة الأكريليكي (3D)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('ai_posts')}
          className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl transition-all cursor-pointer shrink-0 ${
            activeTab === 'ai_posts'
              ? 'bg-amber-500 text-slate-950 shadow-sm'
              : 'text-slate-700 hover:text-slate-950 hover:bg-white/60'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>🪄 منشورات الذكاء الاصطناعي ({pitch.visualAssets.socialMockupPosts.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('package_deal')}
          className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl transition-all cursor-pointer shrink-0 ${
            activeTab === 'package_deal'
              ? 'bg-amber-500 text-slate-950 shadow-sm'
              : 'text-slate-700 hover:text-slate-950 hover:bg-white/60'
          }`}
        >
          <Tag className="w-3.5 h-3.5" />
          <span>🏷️ الباقة والتسعير والضمان</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('all')}
          className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl transition-all cursor-pointer shrink-0 mr-auto ${
            activeTab === 'all'
              ? 'bg-slate-950 text-amber-400 shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>📋 عرض جميع الأقسام معاً</span>
        </button>
      </div>

      {/* 4. Tab 1: The 4 Protected Visual Asset Cards with direct image uploads */}
      {(activeTab === 'visual_assets' || activeTab === 'all') && (
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-amber-500" />
              <h2 className="text-base font-black text-slate-900">
                بطاقات رفع الأصول وتأمين العلامة المائية (إرسال مباشر للواتساب)
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onSwitchToImagesOnlyPreview}
                className="text-xs font-bold text-amber-700 bg-amber-100 hover:bg-amber-200 px-3 py-1 rounded-lg border border-amber-300 transition cursor-pointer flex items-center gap-1"
              >
                <ImageIcon className="w-3.5 h-3.5" />
                <span>معاينة الرابط كصور فقط 🖼️</span>
              </button>
              <span className="text-xs font-bold text-slate-500 hidden sm:inline">
                4 أصول متكاملة (لوجو • كتالوج • بوست • عرض)
              </span>
            </div>
          </div>

          {/* Card 1: Logo */}
          <AssetPitchCard
            assetKey="logo"
            titleAr="1. الشعار الأيقوني الفاخر (Emblem Logo)"
            subtitleAr="أيقونة العلامة التجارية متناظرة بخلفية بيضاء نقية"
            badge="الهوية والشعار"
            badgeColor="bg-amber-100 text-amber-900 border-amber-300"
            originalImageUrl={pitch.visualAssets.logoDataUrl}
            onUpdateImage={(url) => updateVisualAsset('logoDataUrl', url)}
            messageTitle={messages.logo.titleAr}
            defaultMessageText={messages.logo.text}
            clientPhone={bizPhone}
            businessName={bizName}
            watermarkSettings={pitch.watermarkSettings}
            business={biz}
          />

          {/* Card 2: Catalog / Services Price Menu */}
          <AssetPitchCard
            assetKey="catalog"
            titleAr="2. كتالوج وقائمة الأسعار والخدمات (Price Menu Board)"
            subtitleAr="لوحة خدمات وأسعار منظمة بالجنيه المصري ترفع ثقة الزبائن"
            badge="المنيو والأسعار"
            badgeColor="bg-blue-100 text-blue-900 border-blue-300"
            originalImageUrl={pitch.visualAssets.catalogDataUrl}
            onUpdateImage={(url) => updateVisualAsset('catalogDataUrl', url)}
            messageTitle={messages.catalog.titleAr}
            defaultMessageText={messages.catalog.text}
            clientPhone={bizPhone}
            businessName={bizName}
            watermarkSettings={pitch.watermarkSettings}
            business={biz}
          />

          {/* Card 3: Social Media Branded Post */}
          <AssetPitchCard
            assetKey="social_post"
            titleAr="3. بوست السوشيال ميديا الإعلاني المخصص (Branded Post)"
            subtitleAr="تصميم سينمائي واقعي مدمج بهوية النشاط وإطار رسمي"
            badge="بوست السوشيال"
            badgeColor="bg-purple-100 text-purple-900 border-purple-300"
            originalImageUrl={pitch.visualAssets.socialMockupPosts[0]?.imageUrl}
            onUpdateImage={updateSocialPostImage}
            messageTitle={messages.social_post.titleAr}
            defaultMessageText={messages.social_post.text}
            clientPhone={bizPhone}
            businessName={bizName}
            watermarkSettings={pitch.watermarkSettings}
            business={biz}
          />

          {/* Card 4: Promotional Discount Banner */}
          <AssetPitchCard
            assetKey="promo_offer"
            titleAr="4. إعلان العرض الترويجي وبطاقة الخصم (Promo Offer Banner)"
            subtitleAr="بانر إعلاني ناري مع شارة خصم واضحة لزيادة زبائن المحل"
            badge="حملة العروض"
            badgeColor="bg-rose-100 text-rose-900 border-rose-300"
            originalImageUrl={pitch.visualAssets.promoOfferDataUrl}
            onUpdateImage={(url) => updateVisualAsset('promoOfferDataUrl', url)}
            messageTitle={messages.promo_offer.titleAr}
            defaultMessageText={messages.promo_offer.text}
            clientPhone={bizPhone}
            businessName={bizName}
            watermarkSettings={pitch.watermarkSettings}
            business={biz}
          />
        </div>
      )}

      {/* 5. Tab 2: 3D Acrylic Stand */}
      {(activeTab === 'acrylic_stand' || activeTab === 'all') && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div className="flex items-center gap-2">
              <QrCode className="w-5 h-5 text-amber-500" />
              <h2 className="text-base font-black text-slate-900">
                مجسم ستاند الطاولة الأكريليكي الفاخر (3D Acrylic Table Stand)
              </h2>
            </div>
            <span className="text-xs font-bold bg-amber-100 text-amber-900 px-2.5 py-1 rounded-full border border-amber-300">
              المجسم الأكثر إبهاراً للزبائن
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            
            {/* Stand Controls (6 cols) */}
            <div className="md:col-span-7 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  خامة وتطعيم مجسم الستاند:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['gold', 'silver', 'crystal'] as const).map((mat) => (
                    <button
                      key={mat}
                      type="button"
                      onClick={() => updateStand({ material: mat })}
                      className={`p-2.5 rounded-xl text-xs font-black transition-all cursor-pointer flex flex-col items-center gap-1 border ${
                        pitch.visualAssets.acrylicStand.material === mat
                          ? 'bg-amber-500 text-slate-950 border-amber-600 shadow-xs font-black'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <span>
                        {mat === 'gold' && 'ذهبى ملكي VIP'}
                        {mat === 'silver' && 'فضي براق'}
                        {mat === 'crystal' && 'كريستال شفاف'}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  العبارة الإرشادية لتقييم الزبائن على الستاند:
                </label>
                <input
                  type="text"
                  value={pitch.visualAssets.acrylicStand.tagline}
                  onChange={(e) => updateStand({ tagline: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-amber-500 outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  الرابط الهدف عند مسح الـ QR (رابط خرائط Google المعتمد):
                </label>
                <input
                  type="text"
                  value={pitch.visualAssets.acrylicStand.qrTargetUrl}
                  onChange={(e) => updateStand({ qrTargetUrl: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-800 focus:bg-white focus:ring-2 focus:ring-amber-500 outline-hidden"
                />
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 flex items-center gap-2">
                <span className="text-amber-500 font-bold">⚡️ شريحة NFC:</span>
                <span>مدمجة تتيح تقييم الزبون بمجرد ملامسة ظهر هاتفه للستاند دون الحاجة لفتح الكاميرا.</span>
              </div>
            </div>

            {/* Live 3D Miniature Stand Preview (5 cols) */}
            <div className="md:col-span-5 flex flex-col items-center justify-center p-6 bg-gradient-to-b from-slate-100 to-slate-200 rounded-2xl border border-slate-300 relative shadow-inner">
              
              {/* Stand Plate */}
              <div className={`w-44 bg-white/95 backdrop-blur-md rounded-2xl p-4 border-2 ${standStyles.borderColor} shadow-2xl flex flex-col items-center text-center relative transition-transform transform hover:scale-105 duration-300`}>
                
                {/* Header Tag */}
                <div className={`text-[9px] font-black px-2.5 py-0.5 rounded-full mb-2 ${standStyles.badgeBg}`}>
                  تقييم 5 نجوم Google
                </div>

                {/* Merchant Name */}
                <span className="text-xs font-black text-slate-950 truncate w-full mb-2.5">
                  {bizName}
                </span>

                {/* QR Code */}
                {standQrDataUrl ? (
                  <img
                    src={standQrDataUrl}
                    alt="QR Stand"
                    className="w-24 h-24 rounded-lg border border-slate-200 mb-2.5 pointer-events-none"
                  />
                ) : (
                  <div className="w-24 h-24 bg-slate-200 animate-pulse rounded-lg mb-2.5" />
                )}

                {/* Tagline */}
                <span className="text-[9px] text-slate-700 font-bold leading-tight">
                  {pitch.visualAssets.acrylicStand.tagline}
                </span>

                {/* NFC Touch badge */}
                <span className="mt-1.5 text-[8px] font-bold text-slate-400">
                  ⚡️ يدعم اللمس الذكي NFC
                </span>

              </div>

              {/* Heavy Base Stand */}
              <div className={`w-52 h-4 mt-1.5 rounded-t-sm bg-gradient-to-r ${standStyles.baseGradient} shadow-md border-t border-white/40`} />
              <div className="w-56 h-1.5 bg-slate-400/50 rounded-full blur-xs mt-0.5" />
            </div>

          </div>
        </div>
      )}

      {/* 6. Tab 3: AI Generated Posts & Content Strategy */}
      {(activeTab === 'ai_posts' || activeTab === 'all') && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-amber-500" />
                <span>المنشورات وبراويز السوشيال ميديا المخصصة ({pitch.visualAssets.socialMockupPosts.length} منشورات)</span>
              </h2>

              <button
                type="button"
                onClick={onOpenPostGenerator}
                className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs px-4 py-2 rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>توليد منشور جديد بالذكاء الاصطناعي 🪄</span>
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              منشورات مكتوبة باللهجة المصرية المعتمدة ومتزامنة مع استراتيجية المرحلة 1. يمكنك توليد منشورات جديدة وتعديلها بسهولة.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {pitch.visualAssets.socialMockupPosts.map((post, idx) => (
                <div key={post.id || idx} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs flex flex-col justify-between">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold bg-amber-100 text-amber-900 px-2.5 py-0.5 rounded-md text-[10px]">
                        {post.tag || `منشور ${idx + 1}`}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">قالب برواز</span>
                    </div>
                    <strong className="text-slate-900 font-black block leading-tight text-sm">
                      {post.headline}
                    </strong>
                    <p className="text-slate-600 text-xs leading-relaxed line-clamp-3">
                      {post.caption}
                    </p>
                  </div>

                  {post.imageUrl && (
                    <div className="mt-2 pt-2 border-t border-slate-200 flex items-center gap-2">
                      <img src={post.imageUrl} alt="post frame" className="w-9 h-9 object-cover rounded-lg border border-slate-300" />
                      <span className="text-[10px] text-emerald-700 font-bold">صورة البرواز مرفقة ✓</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Server Text Posts & Marketing Strategy Details */}
          <ServerTextPostsPanel
            pitch={pitch}
            clientPhone={bizPhone}
            businessName={bizName}
          />
        </div>
      )}

      {/* 7. Tab 4: Package Deal, Pricing, Guarantee & Deliverables */}
      {(activeTab === 'package_deal' || activeTab === 'all') && (
        <div className="space-y-6">
          {/* Headline & Hook */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500" />
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

          {/* Pricing & Guarantee */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
              <Tag className="w-5 h-5 text-amber-500" />
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

          {/* Deliverables List */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <h2 className="text-base font-black text-slate-900 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-500" />
                <span>مخرجات الباقة المعروضة للعميل ({pitch.deliverables.length} عناصر أساسية)</span>
              </span>
              <span className="text-xs text-slate-400 font-normal">الأصول الحساسة مقفلة برمجياً لحين التعاقد</span>
            </h2>

            <div className="space-y-2.5">
              {pitch.deliverables.map((item, idx) => (
                <div
                  key={item.id}
                  className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-start justify-between gap-3 text-xs"
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
      )}

      {/* Direct WhatsApp Call to Action Bar */}
      <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0">
            <Send className="w-5 h-5 text-emerald-700" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-black text-emerald-950">
              جاهز لإرسال الرابط أو العينات المحمية لواتساب {bizName}؟
            </h4>
            <p className="text-[11px] text-emerald-800">
              يمكنك فتح نافذة صياغة رسائل الواتساب للحصول على نص الإقناع المباشر وتوليد الردود الذكية.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onOpenWhatsAppModal}
          className="w-full sm:w-auto px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-xs transition-all cursor-pointer flex items-center justify-center gap-1.5 shrink-0"
        >
          <Send className="w-3.5 h-3.5" />
          <span>فتح نافذة رسائل الواتساب 💬</span>
        </button>
      </div>

    </div>
  );
};
