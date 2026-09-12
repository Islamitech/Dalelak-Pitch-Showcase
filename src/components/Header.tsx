import React, { useState } from 'react';
import { 
  Sparkles, 
  Store, 
  Eye, 
  Sliders, 
  Send, 
  CheckCircle2, 
  ShieldCheck, 
  Database, 
  Activity,
  Smartphone,
  Settings,
  X
} from 'lucide-react';
import { PitchPackage, TrackingSession } from '../types';
import { 
  getCoreConfig, 
  saveCoreConfig, 
  getEcosystemConfig, 
  saveEcosystemConfig,
  getGeminiKey,
  saveGeminiKey
} from '../services/dalilakService';

interface HeaderProps {
  currentPitch: PitchPackage;
  currentMode: 'admin' | 'client';
  onModeChange: (mode: 'admin' | 'client') => void;
  onOpenActivitiesModal: () => void;
  onOpenWhatsAppModal: () => void;
  onOpenPromoteModal: () => void;
  onOpenWatermarkSettings: () => void;
  liveSessions: TrackingSession[];
  isCoreLive: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentPitch,
  currentMode,
  onModeChange,
  onOpenActivitiesModal,
  onOpenWhatsAppModal,
  onOpenPromoteModal,
  onOpenWatermarkSettings,
  liveSessions,
  isCoreLive
}) => {
  const activeNowCount = liveSessions.filter(s => s.isLiveNow).length;
  const bizName = currentPitch.business.name_ar || currentPitch.business.name_en || 'النشاط التجاري';

  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [coreUrl, setCoreUrl] = useState(() => getCoreConfig().url);
  const [coreKey, setCoreKey] = useState(() => getCoreConfig().key);
  const [ecosystemUrl, setEcosystemUrl] = useState(() => getEcosystemConfig().url);
  const [ecosystemKey, setEcosystemKey] = useState(() => getEcosystemConfig().key);
  const [geminiKey, setGeminiKey] = useState(() => getGeminiKey());
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    saveCoreConfig(coreUrl, coreKey);
    saveEcosystemConfig(ecosystemUrl, ecosystemKey);
    saveGeminiKey(geminiKey);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      setShowSettingsModal(false);
    }, 1500);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          
          {/* Brand & Active Business */}
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-400 p-0.5 shadow-md shadow-amber-500/20 flex items-center justify-center">
              <div className="w-full h-full bg-slate-900 rounded-[14px] flex items-center justify-center text-amber-400 font-black text-xl">
                د
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-black text-slate-900 tracking-tight">دليـلـك</span>
                <span className="bg-amber-100 text-amber-800 text-[11px] font-extrabold px-2.5 py-0.5 rounded-full border border-amber-200">
                  استوديو الإغلاق المحمي 🛡️
                </span>
                <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  isCoreLive 
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                    : 'bg-slate-100 text-slate-600 border border-slate-200'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${isCoreLive ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
                  {isCoreLive ? 'السيرفر الأساسي متصل' : 'معاينة محلية'}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-600 font-medium">
                <span className="text-slate-400">النشاط المختار:</span>
                <span className="font-bold text-slate-800 truncate max-w-[200px] sm:max-w-[320px]">{bizName}</span>
                <button
                  onClick={onOpenActivitiesModal}
                  className="text-amber-600 hover:text-amber-700 font-bold hover:underline inline-flex items-center gap-1 text-[11px] cursor-pointer"
                >
                  <Store className="w-3 h-3" />
                  [تغيير]
                </button>
              </div>
            </div>
          </div>

          {/* Center Mode Switcher */}
          <div className="hidden md:flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => onModeChange('admin')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                currentMode === 'admin'
                  ? 'bg-white text-slate-900 shadow-xs border border-slate-200/80'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Sliders className="w-3.5 h-3.5 text-amber-500" />
              <span>لوحة إعداد العرض</span>
            </button>
            <button
              onClick={() => onModeChange('client')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                currentMode === 'client'
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>معاينة شاشة العميل</span>
              {currentPitch.watermarkSettings.enabled && (
                <span className="bg-amber-600/60 text-[9px] px-1.5 py-0.2 rounded-full font-mono">محمي 🔒</span>
              )}
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            
            {/* Live Viewers Pulse */}
            <div className="hidden lg:flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-2.5 py-1.5 rounded-lg text-xs font-bold">
              <span className={`w-2 h-2 rounded-full ${activeNowCount > 0 ? 'bg-emerald-500 animate-ping' : 'bg-slate-300'}`} />
              <span className="text-slate-700">تصفح حي:</span>
              <span className={`font-mono font-black ${activeNowCount > 0 ? 'text-emerald-600' : 'text-slate-400'}`}>
                {activeNowCount}
              </span>
            </div>

            {/* Watermark Settings */}
            <button
              onClick={onOpenWatermarkSettings}
              title="إعدادات الحماية والعلامة المائية"
              className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 hover:text-slate-900 transition-colors cursor-pointer"
            >
              <ShieldCheck className={`w-5 h-5 ${currentPitch.watermarkSettings.enabled ? 'text-amber-500' : 'text-slate-400'}`} />
            </button>

            {/* WhatsApp Pitch Message Modal */}
            <button
              onClick={onOpenWhatsAppModal}
              className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-2 rounded-xl text-xs font-black shadow-xs hover:shadow-sm transition-all cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span className="hidden sm:inline">رسالة واتساب العميل</span>
            </button>

            {/* Settings Modal Toggle */}
            <button
              onClick={() => setShowSettingsModal(true)}
              title="إعدادات السيرفرات وقواعد البيانات"
              className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 hover:text-slate-900 transition-colors cursor-pointer"
            >
              <Settings className="w-5 h-5 text-slate-600" />
            </button>

            {/* Promote to Core Modal */}
            <button
              onClick={onOpenPromoteModal}
              className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 px-3.5 py-2 rounded-xl text-xs font-black shadow-xs hover:shadow-md transition-all cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>ترقية واعتماد</span>
            </button>

          </div>

        </div>
      </div>

      {/* Settings Modal */}
      {showSettingsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 border border-slate-200 shadow-2xl text-right space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-amber-100 text-amber-800">
                  <Database className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">إعدادات السيرفرات وقواعد البيانات</h3>
                  <p className="text-xs text-slate-500">Supabase Multi-Tier Server Configuration</p>
                </div>
              </div>
              <button
                onClick={() => setShowSettingsModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSettings} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  1. سيرفر مخرجات التطبيقات المساعدة (Dedicated Ecosystem Server):
                </label>
                <input
                  type="text"
                  value={ecosystemUrl}
                  onChange={(e) => setEcosystemUrl(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 font-mono text-xs"
                  placeholder="https://hzlbbzxccqfdeyumtxph.supabase.co"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  مفتاح سيرفر المخرجات (Ecosystem Anon Key):
                </label>
                <input
                  type="password"
                  value={ecosystemKey}
                  onChange={(e) => setEcosystemKey(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 font-mono text-xs"
                  placeholder="أدخل مفتاح Supabase Anon Key الخاص بالمشروع hzlbbzxccqfdeyumtxph"
                />
                <p className="text-[11px] text-slate-400 mt-0.5">
                  تجد المفتاح في: Supabase Dashboard &gt; Project Settings &gt; API &gt; anon public
                </p>
              </div>

              <div className="pt-2 border-t border-slate-100">
                <label className="block font-bold text-slate-700 mb-1">
                  2. السيرفر الأساسي لدليلك (Core Production Server):
                </label>
                <input
                  type="text"
                  value={coreUrl}
                  onChange={(e) => setCoreUrl(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 font-mono text-xs"
                  placeholder="https://xdqpbajymacpdccorjcj.supabase.co"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  مفتاح السيرفر الأساسي (Core Anon Key):
                </label>
                <input
                  type="password"
                  value={coreKey}
                  onChange={(e) => setCoreKey(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 font-mono text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  مفتاح Google Gemini AI (لتوليد وتحسين رسائل الواتساب):
                </label>
                <input
                  type="password"
                  value={geminiKey}
                  onChange={(e) => setGeminiKey(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 font-mono text-xs"
                  placeholder="AQ... أو AIzaSy..."
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  مفتاحك السحابي مدمج تلقائياً (gemini-3.6-flash)، وتستطيع إدخال مفتاحك الخاص في أي وقت.
                </p>
              </div>

              {savedSuccess && (
                <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>تم حفظ وتحديث إعدادات السيرفر بنجاح!</span>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowSettingsModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold shadow-xs"
                >
                  حفظ الإعدادات
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Mobile Mode Switcher Bar */}
      <div className="md:hidden flex items-center justify-around bg-slate-50 border-t border-slate-200 px-3 py-1.5">
        <button
          onClick={() => onModeChange('admin')}
          className={`flex items-center gap-1.5 py-1 px-3 rounded-lg text-xs font-bold ${
            currentMode === 'admin' ? 'bg-white text-slate-900 shadow-xs border border-slate-200' : 'text-slate-600'
          }`}
        >
          <Sliders className="w-3.5 h-3.5 text-amber-500" />
          <span>لوحة الإدارة</span>
        </button>
        <button
          onClick={() => onModeChange('client')}
          className={`flex items-center gap-1.5 py-1 px-3 rounded-lg text-xs font-bold ${
            currentMode === 'client' ? 'bg-amber-500 text-white shadow-xs' : 'text-slate-600'
          }`}
        >
          <Smartphone className="w-3.5 h-3.5" />
          <span>صفحة العميل (محمية)</span>
        </button>
      </div>
    </header>
  );
};
