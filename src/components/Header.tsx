import React from 'react';
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
  Link as LinkIcon,
  Image as ImageIcon,
  RefreshCw
} from 'lucide-react';
import { PitchPackage, TrackingSession } from '../types';

interface HeaderProps {
  currentPitch: PitchPackage;
  currentMode: 'admin' | 'client' | 'images_only';
  onModeChange: (mode: 'admin' | 'client' | 'images_only') => void;
  onOpenActivitiesModal: () => void;
  onOpenWhatsAppModal: () => void;
  onOpenPromoteModal: () => void;
  onOpenWatermarkSettings: () => void;
  onOpenAdvancedLinkSettings: () => void;
  onOpenPostGenerator: () => void;
  onSyncPhase1: () => void;
  isSyncingPhase1?: boolean;
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
  onOpenAdvancedLinkSettings,
  onOpenPostGenerator,
  onSyncPhase1,
  isSyncingPhase1 = false,
  liveSessions,
  isCoreLive
}) => {
  const activeNowCount = liveSessions.filter(s => s.isLiveNow).length;
  const bizName = currentPitch.business.name_ar || currentPitch.business.name_en || 'النشاط التجاري';
  const hasPhase1Data = Boolean(currentPitch.marketingData?.isSyncedFromPhase1);

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
                <span className="font-bold text-slate-800 truncate max-w-[160px] sm:max-w-[240px]">{bizName}</span>
                <button
                  onClick={onOpenActivitiesModal}
                  className="text-amber-600 hover:text-amber-700 font-bold hover:underline inline-flex items-center gap-0.5 text-[11px] cursor-pointer"
                >
                  <Store className="w-3 h-3" />
                  [تغيير]
                </button>
              </div>
            </div>
          </div>

          {/* Center View Switcher */}
          <div className="hidden lg:flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => onModeChange('admin')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                currentMode === 'admin'
                  ? 'bg-white text-slate-900 shadow-xs border border-slate-200/80'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Sliders className="w-3.5 h-3.5 text-amber-500" />
              <span>لوحة الإدارة</span>
            </button>
            <button
              onClick={() => onModeChange('client')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                currentMode === 'client'
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>العرض الشامل</span>
            </button>
            <button
              onClick={() => onModeChange('images_only')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                currentMode === 'images_only'
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ImageIcon className="w-3.5 h-3.5" />
              <span>تصاميم الصور فقط 🖼️</span>
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            
            {/* Phase 1 AI Generator Button */}
            <button
              onClick={onOpenPostGenerator}
              title="توليد منشورات تسويقية مباشرة بالذكاء الاصطناعي"
              className="flex items-center gap-1.5 bg-amber-500/15 hover:bg-amber-500/25 text-amber-900 border border-amber-300 px-3 py-2 rounded-xl text-xs font-black transition-colors cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span className="hidden sm:inline">توليد منشورات 🪄</span>
            </button>

            {/* Sync Phase 1 Button */}
            <button
              onClick={onSyncPhase1}
              disabled={isSyncingPhase1}
              title="مزامنة مع استوديو التسويق (المرحلة 1)"
              className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                hasPhase1Data
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100'
                  : 'border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <RefreshCw className={`w-4 h-4 ${isSyncingPhase1 ? 'animate-spin text-amber-500' : ''}`} />
            </button>

            {/* Advanced Link Settings */}
            <button
              onClick={onOpenAdvancedLinkSettings}
              title="الإعدادات المتقدمة للرابط"
              className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 hover:text-slate-900 transition-colors cursor-pointer"
            >
              <LinkIcon className="w-4 h-4 text-amber-600" />
            </button>

            {/* Watermark Settings */}
            <button
              onClick={onOpenWatermarkSettings}
              title="إعدادات الحماية والعلامة المائية"
              className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 hover:text-slate-900 transition-colors cursor-pointer"
            >
              <ShieldCheck className={`w-4 h-4 ${currentPitch.watermarkSettings.enabled ? 'text-amber-500' : 'text-slate-400'}`} />
            </button>

            {/* WhatsApp Pitch Message Modal */}
            <button
              onClick={onOpenWhatsAppModal}
              className="hidden sm:flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-2 rounded-xl text-xs font-black shadow-xs transition-all cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>رسالة الواتساب</span>
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

      {/* Mobile Mode Switcher Bar */}
      <div className="lg:hidden flex items-center justify-around bg-slate-50 border-t border-slate-200 px-3 py-1.5">
        <button
          onClick={() => onModeChange('admin')}
          className={`flex items-center gap-1.5 py-1 px-2.5 rounded-lg text-xs font-bold ${
            currentMode === 'admin' ? 'bg-white text-slate-900 shadow-xs border border-slate-200' : 'text-slate-600'
          }`}
        >
          <Sliders className="w-3 h-3 text-amber-500" />
          <span>الإدارة</span>
        </button>
        <button
          onClick={() => onModeChange('client')}
          className={`flex items-center gap-1.5 py-1 px-2.5 rounded-lg text-xs font-bold ${
            currentMode === 'client' ? 'bg-amber-500 text-white shadow-xs' : 'text-slate-600'
          }`}
        >
          <Smartphone className="w-3 h-3" />
          <span>العرض الشامل</span>
        </button>
        <button
          onClick={() => onModeChange('images_only')}
          className={`flex items-center gap-1.5 py-1 px-2.5 rounded-lg text-xs font-bold ${
            currentMode === 'images_only' ? 'bg-amber-500 text-white shadow-xs' : 'text-slate-600'
          }`}
        >
          <ImageIcon className="w-3 h-3" />
          <span>الصور فقط 🖼️</span>
        </button>
      </div>
    </header>
  );
};
