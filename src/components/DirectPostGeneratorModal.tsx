import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  Send, 
  Copy, 
  Check, 
  RefreshCw, 
  Store, 
  Flame, 
  Layers, 
  Tag, 
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { 
  PitchPackage, 
  MarketingTone, 
  ReadySocialPost, 
  SocialMockupItem 
} from '../types';
import { 
  generateDirectMarketingPost, 
  GeneratedPostResult 
} from '../services/geminiMarketingEngine';
import { 
  savePostsToPhase1Progress 
} from '../services/dalilakService';
import { 
  MARKETING_TONES 
} from '../utils/egyptianDialectPrompts';

interface DirectPostGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  pitch: PitchPackage;
  onAddPostToPitch: (post: ReadySocialPost, mockup: SocialMockupItem) => void;
}

export const DirectPostGeneratorModal: React.FC<DirectPostGeneratorModalProps> = ({
  isOpen,
  onClose,
  pitch,
  onAddPostToPitch,
}) => {
  const [platform, setPlatform] = useState<'facebook' | 'instagram' | 'tiktok' | 'promo' | 'general'>('facebook');
  const [tone, setTone] = useState<MarketingTone>('friendly_baladi');
  const [customTopic, setCustomTopic] = useState('');
  const [loading, setLoading] = useState(false);
  const [generatedResult, setGeneratedResult] = useState<GeneratedPostResult | null>(null);
  const [copied, setCopied] = useState(false);
  const [addedNotice, setAddedNotice] = useState(false);

  const biz = pitch.business;
  const bizName = biz.name_ar || biz.name_en || 'النشاط التجاري';

  if (!isOpen) return null;

  const handleGenerate = async () => {
    setLoading(true);
    setAddedNotice(false);
    try {
      const result = await generateDirectMarketingPost({
        business: biz,
        platform,
        tone,
        customTopic: customTopic.trim() || undefined,
      });

      setGeneratedResult(result);
    } catch (e) {
      console.error('Post generation error:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyToPitch = () => {
    if (!generatedResult) return;

    // 1. Add to active Pitch Package
    onAddPostToPitch(generatedResult.post, generatedResult.mockupItem);

    // 2. Persist to Phase 1 Shared Storage
    savePostsToPhase1Progress(pitch.businessId, bizName, generatedResult.post);

    setAddedNotice(true);
    confetti({
      particleCount: 80,
      spread: 60,
      origin: { y: 0.7 }
    });

    setTimeout(() => {
      onClose();
    }, 1500);
  };

  const handleCopyContent = () => {
    if (!generatedResult) return;
    const fullText = `${generatedResult.post.title}\n\n${generatedResult.post.content}\n\n${generatedResult.post.hashtags.join(' ')}`;
    navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-gradient-to-r from-amber-500/10 via-amber-400/10 to-transparent">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-black shadow-xs">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-black text-slate-900">
                  توليد منشورات تسويقية بالذكاء الاصطناعي 🪄
                </h2>
                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-2 py-0.5 rounded-full border border-emerald-200">
                  ربط مباشر مع المرحلة 1 ⚡️
                </span>
              </div>
              <p className="text-xs text-slate-500">
                صياغة منشورات جذابة باللهجة المصرية لـ «{bizName}» ودمجها في براويز العرض فوراً
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-5 overflow-y-auto max-h-[75vh]">
          
          {/* Step 1: Platform Selection */}
          <div>
            <label className="block text-xs font-black text-slate-800 mb-2">
              1. اختر المنصة ونوع المنشور:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'facebook', label: 'فيسبوك 📘', sub: 'نص إعلاني وقصة' },
                { id: 'instagram', label: 'إنستغرام 📸', sub: 'برواز بصري جذاب' },
                { id: 'tiktok', label: 'تيك توك 🎵', sub: 'سيناريو ريلز سريع' },
                { id: 'promo', label: 'عروض وخصومات 🔥', sub: 'تحفيز وبيع مباشر' },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setPlatform(item.id as any)}
                  className={`p-2.5 rounded-xl border text-right transition-all cursor-pointer ${
                    platform === item.id
                      ? 'bg-amber-50 border-amber-400 ring-2 ring-amber-500/20 shadow-xs'
                      : 'bg-white border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <strong className="text-xs font-black text-slate-900 block">{item.label}</strong>
                  <span className="text-[10px] text-slate-400 block">{item.sub}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Step 2: Tone of Voice Selection */}
          <div>
            <label className="block text-xs font-black text-slate-800 mb-2">
              2. نبرة الصوت المصرية (Marketing Tone):
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {MARKETING_TONES.slice(0, 5).map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTone(t.id)}
                  className={`p-2.5 rounded-xl border text-right transition-all cursor-pointer ${
                    tone === t.id
                      ? 'bg-amber-500 text-white shadow-xs border-amber-500'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <strong className="text-xs font-bold block leading-tight">{t.name.split('(')[0]}</strong>
                  <span className={`text-[10px] block mt-0.5 ${tone === t.id ? 'text-amber-100' : 'text-slate-400'}`}>
                    {t.badge}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Step 3: Custom Idea or Offer */}
          <div>
            <label className="block text-xs font-black text-slate-800 mb-1">
              3. فكرة محددة أو عرض ترويجي إضافي (اختياري):
            </label>
            <input
              type="text"
              value={customTopic}
              onChange={(e) => setCustomTopic(e.target.value)}
              placeholder="مثلاً: خصم 25% على وجبات التوفير بمناسبة نهاية الأسبوع"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-amber-500 outline-hidden"
            />
          </div>

          {/* Generate Button */}
          <div className="pt-1">
            <button
              type="button"
              disabled={loading}
              onClick={handleGenerate}
              className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs sm:text-sm py-3 rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span>{loading ? 'جاري الصياغة والتوليد عبر Gemini الذكي...' : 'توليد المنشور التسويقي الآن 🪄'}</span>
            </button>
          </div>

          {/* Generated Result Preview */}
          {generatedResult && (
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3 animate-in fade-in duration-300">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-slate-900">
                    {generatedResult.post.badge}
                  </span>
                  <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-full">
                    {generatedResult.source === 'gemini-ai' ? `ذكاء اصطناعي (${generatedResult.modelUsed})` : 'محرك التسويق المصري الذكي'}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleCopyContent}
                  className="flex items-center gap-1 text-[11px] font-bold text-slate-600 hover:text-slate-900 cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'تم النسخ' : 'نسخ النص'}</span>
                </button>
              </div>

              {/* Title & Body */}
              <div className="space-y-1.5">
                <strong className="text-xs font-black text-slate-900 block">
                  {generatedResult.post.title}
                </strong>
                <p className="text-xs text-slate-700 leading-relaxed font-medium whitespace-pre-line">
                  {generatedResult.post.content}
                </p>
              </div>

              {/* Image idea & Hashtags */}
              <div className="pt-2 border-t border-slate-200/80 flex flex-col gap-1.5 text-[11px]">
                <span className="text-slate-500">
                  <strong>فكرة التصميم البصري:</strong> {generatedResult.post.imageIdea}
                </span>
                <span className="text-amber-700 font-bold font-mono">
                  {generatedResult.post.hashtags.join(' ')}
                </span>
              </div>

              {/* Action Button: Insert into Pitch & Phase 1 */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleApplyToPitch}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs py-2.5 rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>
                    {addedNotice ? 'تمت الإضافة ومزامنة المرحلة 1 بنجاح! ✓' : 'إضافة المنشور لبراويز العرض ومزامنة المرحلة 1'}
                  </span>
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <span className="text-[11px] text-slate-400">
            يتم حفظ المنشورات تلقائياً في قاعدة بيانات المنظومة لاستوديو التسويق
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold transition-colors cursor-pointer"
          >
            إغلاق
          </button>
        </div>

      </div>
    </div>
  );
};
