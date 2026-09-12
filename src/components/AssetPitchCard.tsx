import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  ShieldCheck, 
  Download, 
  Copy, 
  Check, 
  Send, 
  Upload, 
  Image as ImageIcon, 
  Eye, 
  Lock, 
  Sparkles,
  ExternalLink,
  RefreshCw,
  Sliders
} from 'lucide-react';
import { 
  stampWatermarkOnImage, 
  downloadWatermarkedImage, 
  copyImageToClipboard 
} from '../utils/watermarkCanvasEngine';
import { createWhatsAppDirectUrl } from '../utils/assetPitchMessageBuilder';
import { DalilakBusiness, WatermarkSettings } from '../types';
import { generateSmartWhatsAppPitch } from '../services/pitchAiService';

interface AssetPitchCardProps {
  assetKey: 'logo' | 'catalog' | 'social_post' | 'promo_offer';
  titleAr: string;
  subtitleAr: string;
  badge: string;
  badgeColor?: string;
  originalImageUrl?: string;
  onUpdateImage: (newUrl: string) => void;
  messageTitle: string;
  defaultMessageText: string;
  clientPhone: string;
  businessName: string;
  watermarkSettings?: WatermarkSettings;
  business?: DalilakBusiness;
}

export const AssetPitchCard: React.FC<AssetPitchCardProps> = ({
  assetKey,
  titleAr,
  subtitleAr,
  badge,
  badgeColor = 'bg-amber-100 text-amber-900 border-amber-300',
  originalImageUrl,
  onUpdateImage,
  messageTitle,
  defaultMessageText,
  clientPhone,
  businessName,
  watermarkSettings,
  business
}) => {
  const [viewMode, setViewMode] = useState<'watermarked' | 'original'>('watermarked');
  const [watermarkedDataUrl, setWatermarkedDataUrl] = useState<string>('');
  const [watermarkedBlob, setWatermarkedBlob] = useState<Blob | null>(null);
  const [processingWatermark, setProcessingWatermark] = useState(false);
  
  const [customMessage, setCustomMessage] = useState(defaultMessageText);
  const [copiedText, setCopiedText] = useState(false);
  const [copiedImage, setCopiedImage] = useState(false);
  const [isGeneratingAiMessage, setIsGeneratingAiMessage] = useState(false);

  // Update default message if business changes
  useEffect(() => {
    setCustomMessage(defaultMessageText);
  }, [defaultMessageText]);

  const handleEnhanceWithAi = async () => {
    if (!business) return;
    setIsGeneratingAiMessage(true);
    try {
      const typeMap: Record<string, any> = {
        logo: 'logo',
        catalog: 'catalog',
        social_post: 'post',
        promo_offer: 'offer'
      };
      const aiText = await generateSmartWhatsAppPitch(business, typeMap[assetKey] || 'full');
      if (aiText) {
        setCustomMessage(aiText);
      }
    } catch (e) {
      console.warn('AI enhance error:', e);
    } finally {
      setIsGeneratingAiMessage(false);
    }
  };

  // Generate watermarked image whenever original image changes
  useEffect(() => {
    if (!originalImageUrl) {
      setWatermarkedDataUrl('');
      setWatermarkedBlob(null);
      return;
    }

    let isMounted = true;
    setProcessingWatermark(true);

    stampWatermarkOnImage(originalImageUrl, {
      primaryText: watermarkSettings?.text || 'معاينة خاصة • غير مصرح بالنشر قبل التعاقد',
      secondaryText: watermarkSettings?.secondaryText || `دليلك • نشاط: ${businessName}`,
      opacity: watermarkSettings?.opacity ?? 0.24,
      density: watermarkSettings?.density || 'medium',
      angle: watermarkSettings?.angle ?? -28
    })
      .then((res) => {
        if (isMounted) {
          setWatermarkedDataUrl(res.dataUrl);
          setWatermarkedBlob(res.blob);
          setProcessingWatermark(false);
        }
      })
      .catch((err) => {
        console.error('Watermarking failed:', err);
        if (isMounted) setProcessingWatermark(false);
      });

    return () => {
      isMounted = false;
    };
  }, [originalImageUrl, watermarkSettings, businessName]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          onUpdateImage(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDownloadProtected = () => {
    if (watermarkedDataUrl) {
      const safeBizName = businessName.replace(/\s+/g, '_');
      downloadWatermarkedImage(watermarkedDataUrl, `${safeBizName}_${assetKey}_preview_protected.jpg`);
    }
  };

  const handleCopyImage = async () => {
    if (watermarkedBlob) {
      const ok = await copyImageToClipboard(watermarkedBlob);
      if (ok) {
        setCopiedImage(true);
        setTimeout(() => setCopiedImage(false), 2000);
      }
    }
  };

  const handleCopyText = () => {
    navigator.clipboard.writeText(customMessage);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  const activeImageDisplay = viewMode === 'watermarked' ? (watermarkedDataUrl || originalImageUrl) : originalImageUrl;
  const directWhatsAppUrl = createWhatsAppDirectUrl(clientPhone, customMessage);

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden flex flex-col transition-all hover:shadow-md">
      
      {/* Top Card Header */}
      <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className={`text-[11px] font-black px-2.5 py-0.5 rounded-full border ${badgeColor}`}>
            {badge}
          </span>
          <div>
            <h3 className="text-sm font-black text-slate-900 leading-tight">
              {titleAr}
            </h3>
            <span className="text-[11px] text-slate-500 font-medium">
              {subtitleAr}
            </span>
          </div>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-1 bg-slate-200/70 p-1 rounded-xl text-xs font-bold">
          <button
            type="button"
            onClick={() => setViewMode('watermarked')}
            className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 cursor-pointer ${
              viewMode === 'watermarked'
                ? 'bg-amber-500 text-slate-950 font-black shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Shield className="w-3 h-3" />
            <span>مؤمنة بالعلامة</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode('original')}
            className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 cursor-pointer ${
              viewMode === 'original'
                ? 'bg-white text-slate-900 font-black shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Eye className="w-3 h-3" />
            <span>الأصلية</span>
          </button>
        </div>
      </div>

      {/* Center Image Stage */}
      <div className="p-4 flex flex-col sm:flex-row gap-5">
        
        {/* Visual Stage Container */}
        <div className="sm:w-1/2 flex flex-col">
          <div className="w-full h-64 bg-slate-100 rounded-xl border border-slate-200 relative overflow-hidden flex items-center justify-center group shadow-inner">
            {activeImageDisplay ? (
              <img
                src={activeImageDisplay}
                alt={titleAr}
                className="w-full h-full object-contain p-2 transition-transform duration-300 group-hover:scale-102"
              />
            ) : (
              <div className="flex flex-col items-center justify-center text-slate-400 p-6 text-center">
                <ImageIcon className="w-10 h-10 mb-2 text-slate-300" />
                <span className="text-xs font-bold text-slate-600">لا توجد صورة محددة بعد</span>
                <span className="text-[10px] text-slate-400 mt-1">ارفع صورة من جهازك لحرق العلامة المائية عليها فوراً</span>
              </div>
            )}

            {/* Spinner during watermark processing */}
            {processingWatermark && (
              <div className="absolute inset-0 bg-white/75 backdrop-blur-xs flex items-center justify-center gap-2 text-xs font-bold text-amber-700">
                <RefreshCw className="w-4 h-4 animate-spin text-amber-600" />
                <span>جاري حرق العلامة المائية داخل الصورة...</span>
              </div>
            )}

            {/* Shield Watermark Badge */}
            {viewMode === 'watermarked' && watermarkedDataUrl && (
              <div className="absolute top-2 left-2 bg-slate-950/80 backdrop-blur-xs text-amber-400 text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-1 shadow-xs">
                <ShieldCheck className="w-3 h-3" />
                <span>مؤمنة ضد الاستخدام</span>
              </div>
            )}
          </div>

          {/* Action buttons under image */}
          <div className="grid grid-cols-2 gap-2 mt-3">
            <label className="py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer border border-slate-200">
              <Upload className="w-3.5 h-3.5 text-indigo-600" />
              <span>رفع / استبدال الصورة</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>

            <button
              type="button"
              onClick={handleDownloadProtected}
              disabled={!watermarkedDataUrl || processingWatermark}
              className="py-2 px-3 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-slate-950 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition cursor-pointer shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>تحميل الصورة المحمية</span>
            </button>
          </div>

          {/* Quick copy image button */}
          <button
            type="button"
            onClick={handleCopyImage}
            disabled={!watermarkedBlob}
            className="w-full mt-1.5 py-1.5 px-3 bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 rounded-lg text-[11px] font-bold flex items-center justify-center gap-1 transition cursor-pointer"
          >
            {copiedImage ? (
              <>
                <Check className="w-3 h-3 text-emerald-600" />
                <span className="text-emerald-700 font-black">تم نسخ الصورة المائية للحافظة!</span>
              </>
            ) : (
              <>
                <Copy className="w-3 h-3 text-slate-400" />
                <span>نسخ الصورة مباشرة (للصقها في شات الواتساب Ctrl+V)</span>
              </>
            )}
          </button>
        </div>

        {/* WhatsApp Pitch Message Side */}
        <div className="sm:w-1/2 flex flex-col justify-between space-y-3 bg-emerald-50/50 p-4 rounded-xl border border-emerald-200/80">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-black text-emerald-900 flex items-center gap-1.5">
                <Send className="w-3.5 h-3.5 text-emerald-600" />
                <span>رسالة الواتساب المرافقة لهذه الصورة:</span>
              </span>
              <div className="flex items-center gap-1.5">
                {business && (
                  <button
                    type="button"
                    onClick={handleEnhanceWithAi}
                    disabled={isGeneratingAiMessage}
                    className="text-[11px] font-bold text-amber-900 bg-amber-100 hover:bg-amber-200 flex items-center gap-1 cursor-pointer px-2.5 py-0.5 rounded-md border border-amber-300 transition"
                    title="توليد رسالة مخصصة باللهجة المصرية بواسطة Gemini 3.6 Flash"
                  >
                    <Sparkles className={`w-3 h-3 text-amber-600 ${isGeneratingAiMessage ? 'animate-spin' : ''}`} />
                    <span>{isGeneratingAiMessage ? 'جاري الصياغة...' : 'صياغة ذكية (AI)'}</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleCopyText}
                  className="text-[11px] font-bold text-emerald-700 hover:text-emerald-900 flex items-center gap-1 cursor-pointer bg-white px-2 py-0.5 rounded-md border border-emerald-200"
                >
                  {copiedText ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-600" />
                      <span>تم النسخ ✓</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>نسخ النص</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Editable Text Area */}
            <textarea
              rows={7}
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              className="w-full p-3 bg-white border border-emerald-200 rounded-xl text-xs text-slate-800 leading-relaxed focus:ring-2 focus:ring-emerald-500 outline-hidden font-medium resize-none"
              dir="rtl"
            />
          </div>

          {/* Direct Send via WhatsApp Button */}
          <a
            href={directWhatsAppUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs sm:text-sm font-black flex items-center justify-center gap-2 shadow-md shadow-emerald-100 transition-all cursor-pointer"
          >
            <Send className="w-4 h-4" />
            <span>إرسال الرسالة إلى واتساب النشاط مباشرة</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

      </div>

    </div>
  );
};
