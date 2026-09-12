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
  Award
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
  const [activeTab, setActiveTab] = useState<PitchMessageTone>('authority');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const messages = buildPitchMessages(pitch, repName);
  const currentMsg = messages.find(m => m.id === activeTab) || messages[0];

  const handleCopy = () => {
    navigator.clipboard.writeText(currentMsg.text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-emerald-50/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-black">
              <Send className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                <span>تجهيز رسالة الواتساب الإقناعية للعميل 💬</span>
              </h2>
              <p className="text-xs text-slate-500">نصوص مدروسة نفسياً باللهجة المصرية المصممة لدفع صاحب المحل لفتح العرض</p>
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
        <div className="p-4 border-b border-slate-200 bg-slate-50/60 space-y-3">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-slate-400" />
            <span className="text-xs font-bold text-slate-700">اسم المندوب أو المستشار:</span>
            <input
              type="text"
              value={repName}
              onChange={(e) => setRepName(e.target.value)}
              className="flex-1 bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-800 font-bold focus:ring-2 focus:ring-emerald-500 outline-hidden"
              placeholder="اكتب اسمك لتظهر في التوقيع"
            />
          </div>

          {/* Tone Selector */}
          <div className="grid grid-cols-3 gap-2">
            {messages.map((m) => (
              <button
                key={m.id}
                onClick={() => setActiveTab(m.id)}
                className={`py-2 px-2.5 rounded-xl text-xs font-bold transition-all flex flex-col items-center gap-0.5 cursor-pointer ${
                  activeTab === m.id
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                <span>{m.titleAr}</span>
                <span className={`text-[10px] ${activeTab === m.id ? 'text-emerald-100' : 'text-slate-500'}`}>
                  {m.badge}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Message Content Box */}
        <div className="p-5 flex-1 overflow-y-auto">
          <div className="relative">
            <textarea
              readOnly
              value={currentMsg.text}
              rows={12}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs sm:text-sm text-slate-800 font-medium leading-relaxed resize-none focus:outline-hidden"
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-slate-500 flex items-center gap-1.5">
            <Phone className="w-3.5 h-3.5 text-emerald-600" />
            <span>رقم العميل: <strong className="font-mono text-slate-800" dir="ltr">{pitch.business.phone}</strong></span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={handleCopy}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-800 font-black text-xs transition-colors cursor-pointer"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'تم النسخ بنجاح!' : 'نسخ الرسالة'}</span>
            </button>

            <a
              href={currentMsg.waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-xs transition-colors cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>إرسال فوري عبر واتساب</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

      </div>
    </div>
  );
};
