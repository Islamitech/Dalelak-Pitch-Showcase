import React from 'react';
import { 
  X, 
  Shield, 
  ShieldCheck, 
  ShieldAlert, 
  Eye, 
  Sliders, 
  Check, 
  Sparkles,
  Lock,
  Layers
} from 'lucide-react';
import { WatermarkSettings } from '../types';

interface WatermarkControlsProps {
  isOpen: boolean;
  onClose: () => void;
  settings: WatermarkSettings;
  onChange: (newSettings: WatermarkSettings) => void;
}

export const WatermarkControls: React.FC<WatermarkControlsProps> = ({
  isOpen,
  onClose,
  settings,
  onChange
}) => {
  if (!isOpen) return null;

  const update = (partial: Partial<WatermarkSettings>) => {
    onChange({ ...settings, ...partial });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-black">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                <span>إعدادات الحماية والعلامة المائية ضد السرقة (Anti-Theft)</span>
              </h2>
              <p className="text-xs text-slate-500">التحكم في طبقات الحماية الثلاث لمنع نسخ أو سرقة الأصول قبل التعاقد</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-5 space-y-5 overflow-y-auto max-h-[75vh]">
          
          {/* Master Toggle */}
          <div className="flex items-center justify-between p-3.5 bg-amber-50/60 border border-amber-200 rounded-xl">
            <div className="flex items-center gap-2.5">
              <Lock className="w-5 h-5 text-amber-600" />
              <div>
                <span className="text-xs font-black text-slate-900 block">تفعيل منظومة الحماية الكاملة</span>
                <span className="text-[11px] text-slate-500">تطبيق العلامة المائية وحظر النسخ التلقائي في وضع العميل</span>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.enabled}
                onChange={(e) => update({ enabled: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
            </label>
          </div>

          {/* Texts */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                النص الأساسي للعلامة المائية:
              </label>
              <input
                type="text"
                value={settings.text}
                onChange={(e) => update({ text: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-amber-500 outline-hidden font-bold"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                نص التحذير وكود الحماية الفرعي:
              </label>
              <input
                type="text"
                value={settings.secondaryText}
                onChange={(e) => update({ secondaryText: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-amber-500 outline-hidden font-medium"
              />
            </div>
          </div>

          {/* Visual Sliders */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Opacity */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-xs font-bold text-slate-700">شدة الوضوح (الشفافية):</span>
                <span className="text-xs font-mono font-black text-amber-600">
                  {Math.round(settings.opacity * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="0.05"
                max="0.45"
                step="0.01"
                value={settings.opacity}
                onChange={(e) => update({ opacity: parseFloat(e.target.value) })}
                className="w-full accent-amber-500"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                <span>خفيفة (5%)</span>
                <span>متوسطة (20%)</span>
                <span>بارزة (45%)</span>
              </div>
            </div>

            {/* Angle */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-xs font-bold text-slate-700">زاوية الميل:</span>
                <span className="text-xs font-mono font-black text-amber-600">
                  {settings.angle}°
                </span>
              </div>
              <input
                type="range"
                min="-45"
                max="45"
                step="1"
                value={settings.angle}
                onChange={(e) => update({ angle: parseInt(e.target.value) })}
                className="w-full accent-amber-500"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                <span>-45°</span>
                <span>0° أفقي</span>
                <span>+45°</span>
              </div>
            </div>

          </div>

          {/* Density Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              كثافة تكرار الشبكة:
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['sparse', 'medium', 'dense'] as const).map((density) => (
                <button
                  key={density}
                  onClick={() => update({ density })}
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    settings.density === density
                      ? 'bg-amber-500 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {density === 'sparse' && 'متباعدة (خفيفة)'}
                  {density === 'medium' && 'متوازنة (موصى بها)'}
                  {density === 'dense' && 'مكثفة جداً (أقصى حماية)'}
                </button>
              ))}
            </div>
          </div>

          {/* Browser Interaction Defenses */}
          <div className="space-y-2 pt-2 border-t border-slate-200">
            <span className="text-xs font-black text-slate-900 block mb-2">
              طبقات حماية المتصفح الإضافية:
            </span>

            <label className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-slate-50 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.blockRightClick}
                onChange={(e) => update({ blockRightClick: e.target.checked })}
                className="w-4 h-4 text-amber-600 rounded border-slate-300 focus:ring-amber-500"
              />
              <div>
                <span className="text-xs font-bold text-slate-800 block">حظر النقر بزر الفأرة الأيمن (Context Menu Block)</span>
                <span className="text-[10px] text-slate-400">يمنع العميل من الضغط يميناً وحفظ الصور أو فحص العنصر</span>
              </div>
            </label>

            <label className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-slate-50 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.blockKeyboardShortcuts}
                onChange={(e) => update({ blockKeyboardShortcuts: e.target.checked })}
                className="w-4 h-4 text-amber-600 rounded border-slate-300 focus:ring-amber-500"
              />
              <div>
                <span className="text-xs font-bold text-slate-800 block">تعطيل اختصارات الحفظ والطباعة (Ctrl+S / Ctrl+P)</span>
                <span className="text-[10px] text-slate-400">يمنع حفظ صفحة الويب كـ HTML أو طباعتها كـ PDF دون موافقة</span>
              </div>
            </label>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="bg-amber-600 hover:bg-amber-700 text-white font-black text-xs px-5 py-2.5 rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            تطبيق وحفظ الإعدادات
          </button>
        </div>

      </div>
    </div>
  );
};
