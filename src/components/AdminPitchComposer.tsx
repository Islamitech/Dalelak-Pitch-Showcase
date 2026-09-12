import React, { useState } from 'react';
import { 
  Sparkles, 
  Store, 
  MapPin, 
  Phone, 
  Tag, 
  QrCode, 
  ShieldCheck, 
  Eye, 
  Send, 
  Layers, 
  Sliders,
  CheckCircle2,
  Calendar,
  Award
} from 'lucide-react';
import { PitchPackage } from '../types';
import { AssetPitchCard } from './AssetPitchCard';
import { ServerTextPostsPanel } from './ServerTextPostsPanel';
import { buildAssetPitchMessages } from '../utils/assetPitchMessageBuilder';
import { getAcrylicMaterialStyles } from '../utils/mockupComposer';

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
  const biz = pitch.business;
  const bizName = biz.name_ar || biz.name_en || 'النشاط التجاري';
  const bizPhone = biz.phone || '';
  const bizLocation = biz.city ? biz.city + (biz.governorate ? ' - ' + biz.governorate : '') : 'المقر الميداني';

  const messages = buildAssetPitchMessages({
    business: biz,
    discountedPrice: pitch.discountedPrice,
    currency: pitch.currency
  });

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

  const standStyles = getAcrylicMaterialStyles(pitch.visualAssets.acrylicStand.material);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* 1. Top Command Bar: Real Ground-Truth Business Header */}
      <div className="bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 rounded-2xl p-5 shadow-sm text-slate-950 flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span className="bg-slate-950 text-amber-400 text-xs font-black px-2.5 py-0.5 rounded-full">
              محطة إنتاج العينات المحمية وإرسال الواتساب
            </span>
            <span className="bg-white/80 text-slate-900 text-xs font-bold px-2.5 py-0.5 rounded-full border border-slate-300/60">
              كود النشاط: <strong className="font-mono font-black">{biz.id || 'BIZ-CORE'}</strong>
            </span>
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
            onClick={onOpenWatermarkSettings}
            className="flex-1 md:flex-none flex items-center justify-center gap-1.5 bg-white/90 hover:bg-white text-slate-900 font-bold text-xs px-3.5 py-2.5 rounded-xl shadow-xs transition cursor-pointer border border-slate-300"
          >
            <Sliders className="w-4 h-4 text-amber-600" />
            <span>إعدادات العلامة المائية</span>
          </button>

          <button
            type="button"
            onClick={onSwitchToClientPreview}
            className="flex-1 md:flex-none flex items-center justify-center gap-1.5 bg-slate-950 hover:bg-slate-800 text-amber-400 font-black text-xs px-4 py-2.5 rounded-xl shadow-xs transition cursor-pointer"
          >
            <Eye className="w-4 h-4" />
            <span>معاينة شاشة العرض (3D Stand)</span>
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
            نظام العينات المصورة المباشرة (Direct WhatsApp Visual Teasers):
          </strong>
          <p className="leading-relaxed text-amber-800 font-medium">
            يتم حرق العلامة المائية الشبكية غير القابلة للإزالة داخل بيكسلات كل صورة فوراً. يستطيع المندوب تحميل الصورة المحمية وإرسالها في شات واتساب صاحب المحل مع الرسالة المخصصة لها، ليرى العميل بعينه قوة التصميم دون إمكانية استغلاله أو طباعته قبل التعاقد الرسمي.
          </p>
        </div>
      </div>

      {/* 3. The 4 Protected Visual Asset Pitch Cards */}
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-amber-500" />
            <h2 className="text-base font-black text-slate-900">
              الأصول البصرية المحمية بالعلامة المائية (للإرسال المباشر على واتساب)
            </h2>
          </div>
          <span className="text-xs font-bold text-slate-500">
            4 أصول متكاملة (لوجو • كتالوج • بوست • عرض)
          </span>
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
        />
      </div>

      {/* 4. Server-Driven Text Posts & Marketing Strategy Panel */}
      <ServerTextPostsPanel
        pitch={pitch}
        clientPhone={bizPhone}
        businessName={bizName}
      />

    </div>
  );
};
