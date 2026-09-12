import React, { useState } from 'react';
import { 
  X, 
  Send, 
  Copy, 
  Check, 
  ExternalLink, 
  Sparkles, 
  User, 
  Phone,
  Flame,
  Gift,
  Award,
  Download,
  Image as ImageIcon,
  CheckCheck,
  Zap
} from 'lucide-react';
import { PitchPackage } from '../types';
import { 
  buildPitchMessages, 
  GeneratedPitchMessage, 
  PitchMessageTone 
} from '../utils/pitchMessageBuilder';

interface WhatsAppCopyModalProps {
  isOpen: boolean;
  onClose: () => void;
  pitch: PitchPackage;
}

export const WhatsAppCopyModal: React.FC<WhatsAppCopyModalProps> = ({
  isOpen,
  onClose,
  pitch
}) => {
  const [repName, setRepName] = useState('أحمد كمال (مستشار التوثيق والتسويق)');
  const [activeTab, setActiveTab] = useState<PitchMessageTone>('teaser');
  const [copied, setCopied] = useState(false);
  const [copiedImage, setCopiedImage] = useState(false);

  if (!isOpen) return null;

  const bizName = pitch.business.name_ar || pitch.business.name_en || 'النشاط التجاري';
  const clientPhone = pitch.business.phone || pitch.business.owner_phone || '';
  const messages = buildPitchMessages(pitch, repName);
  const currentMsg = messages.find(m => m.id === activeTab) || messages[0];

  const handleCopy = () => {
    navigator.clipboard.writeText(currentMsg.text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownloadCoverImage = () => {
    const a = document.createElement('a');
    a.href = '/og-pitch-preview.jpg';
    a.download = `معاينة-دليلك-الحصرية-${bizName.replace(/\s+/g, '_')}.jpg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setCopiedImage(true);
    setTimeout(() => setCopiedImage(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-black shadow-md shadow-emerald-600/20">
              <Send className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
                <span>إرسال رابط المعاينة المباشر إلى واتساب النشاط 💬</span>
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                رسائل تحفيزية باللهجة المصرية مع صورة توضيحية لما تحتويه الباقة لدفع العميل لفتح الرابط
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

        {/* Rep Name Input & Tone Tabs */}
        <div className="p-4 border-b border-slate-200 bg-slate-50/70 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-700 shrink-0">
              <User className="w-4 h-4 text-emerald-600" />
              <span>اسم المندوب أو المستشار:</span>
            </div>
            <input
              type="text"
              value={repName}
              onChange={(e) => setRepName(e.target.value)}
              className="flex-1 bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-slate-800 font-bold focus:ring-2 focus:ring-emerald-500 outline-hidden shadow-2xs"
              placeholder="اكتب اسمك ليظهر في توقيع الرسالة"
            />
          </div>

          {/* Tone Selector */}
          <div>
            <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-1.5">
              اختر أسلوب ونبرة الرسالة:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {messages.map((m) => (
                <button
                  key={m.id}
                  onClick={() => setActiveTab(m.id)}
                  className={`p-2.5 rounded-xl text-xs font-bold transition-all flex flex-col items-center gap-1 text-center cursor-pointer ${
                    activeTab === m.id
                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20 scale-[1.02]'
                      : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <span className="line-clamp-1">{m.titleAr}</span>
                  <span className={`text-[10px] font-medium px-1.5 py-0.2 rounded-full ${
                    activeTab === m.id ? 'bg-emerald-700/60 text-emerald-100' : 'bg-slate-100 text-slate-500'
                  }`}>
                    {m.badge}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Content Area: WhatsApp Chat Simulation & Message Box */}
        <div className="p-4 sm:p-5 flex-1 overflow-y-auto space-y-4 bg-slate-100/60">
          
          {/* WhatsApp Live Bubble Simulation with Rich Preview Image */}
          <div className="bg-[#efeae2] border border-[#d1d7db] rounded-2xl p-4 shadow-inner">
            <div className="text-[11px] font-black text-slate-500 mb-2 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>شكل الرسالة وصورة الرابط في محادثة واتساب العميل (WhatsApp Preview):</span>
              </span>
              <button
                type="button"
                onClick={handleDownloadCoverImage}
                className="text-[11px] font-bold text-emerald-700 hover:text-emerald-800 bg-white hover:bg-emerald-50 border border-emerald-300 px-2.5 py-1 rounded-lg flex items-center gap-1 transition cursor-pointer shadow-2xs"
              >
                {copiedImage ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Download className="w-3.5 h-3.5" />}
                <span>{copiedImage ? 'تم تحميل الصورة!' : 'تحميل صورة الغلاف لإرفاقها 🖼️'}</span>
              </button>
            </div>

            {/* Simulated WhatsApp Bubble */}
            <div className="bg-white rounded-2xl p-3.5 shadow-sm border border-slate-200/80 max-w-xl mx-auto space-y-3 text-right" dir="rtl">
              
              {/* WhatsApp Link Preview Card (The Exact Image & Title WhatsApp Shows) */}
              <div className="border border-slate-200 rounded-xl overflow-hidden bg-slate-50 shadow-2xs">
                <div className="relative aspect-[16/9] w-full bg-slate-900 overflow-hidden">
                  <img
                    src="/og-pitch-preview.jpg"
                    alt="معاينة حصرية لنشاطك التجاري - منظومة دليلك"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 right-2 bg-slate-950/80 backdrop-blur-xs text-amber-300 text-[10px] font-black px-2 py-0.5 rounded-md border border-amber-500/40 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-400" />
                    <span>صورة المعاينة التوضيحية للباقة</span>
                  </div>
                </div>

                <div className="p-2.5 space-y-1">
                  <h4 className="text-xs font-black text-slate-900 leading-snug">
                    معاينة حصرية لنشاطك التجاري | منظومة دليلك الذكية 🇪🇬
                  </h4>
                  <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed font-medium">
                    اضغط لمعاينة الشعار الرقمي المعتمد، كتالوج وقائمة الخدمات، استاند الأكريليك الذكي بـ QR كود، وخطة تصدر Google Maps لـ «{bizName}».
                  </p>
                  <span className="text-[10px] font-mono text-slate-400 block pt-0.5">
                    dalilaak.com / preview
                  </span>
                </div>
              </div>

              {/* Message Text Preview */}
              <div className="text-xs sm:text-[13px] text-slate-800 leading-relaxed whitespace-pre-line font-medium pt-1 border-t border-slate-100">
                {currentMsg.text}
              </div>

              {/* Timestamp & Double Checkmarks */}
              <div className="flex items-center justify-end gap-1 text-[10px] text-slate-400 font-mono pt-1">
                <span>12:00 م</span>
                <CheckCheck className="w-3.5 h-3.5 text-emerald-500" />
              </div>
            </div>
          </div>

          {/* Raw Textarea Editor */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-700">
              <span>نص الرسالة الكامل الجاهز للإرسال:</span>
              <span className="text-[11px] text-slate-400">يمكنك تعديل أي جزء قبل الإرسال</span>
            </div>
            <textarea
              readOnly
              value={currentMsg.text}
              rows={6}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 font-medium leading-relaxed resize-none focus:outline-hidden"
            />
          </div>

        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-white border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-slate-600 flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
              <Phone className="w-4 h-4" />
            </div>
            <div>
              <span className="block text-[10px] text-slate-400 font-bold">رقم النشاط المستهدف:</span>
              <strong className="font-mono text-slate-900 text-xs sm:text-sm" dir="ltr">
                {clientPhone || 'غير مسجل رقم'}
              </strong>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={handleCopy}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-800 font-black text-xs transition-colors cursor-pointer shadow-2xs"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'تم النسخ بنجاح!' : 'نسخ النص فقط'}</span>
            </button>

            <a
              href={currentMsg.waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs shadow-md shadow-emerald-600/25 transition-all transform active:scale-95 cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>إرسال مباشر إلى واتساب العميل</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

      </div>
    </div>
  );
};
