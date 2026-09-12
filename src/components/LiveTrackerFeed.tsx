import React, { useState } from 'react';
import { 
  Activity, 
  Eye, 
  Clock, 
  Smartphone, 
  Monitor, 
  Tablet, 
  Flame, 
  CheckCircle, 
  ChevronUp, 
  ChevronDown, 
  MessageSquare,
  AlertCircle
} from 'lucide-react';
import { TrackingSession } from '../types';

interface LiveTrackerFeedProps {
  sessions: TrackingSession[];
  onOpenWhatsAppForSession?: (session: TrackingSession) => void;
}

export const LiveTrackerFeed: React.FC<LiveTrackerFeedProps> = ({
  sessions,
  onOpenWhatsAppForSession
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const liveCount = sessions.filter(s => s.isLiveNow).length;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden transition-all duration-200">
      
      {/* Tracker Header */}
      <div 
        onClick={() => setIsExpanded(!isExpanded)}
        className="p-4 flex items-center justify-between bg-gradient-to-r from-slate-900 to-slate-800 text-white cursor-pointer select-none"
      >
        <div className="flex items-center gap-3">
          <div className="relative">
            <Activity className="w-5 h-5 text-emerald-400" />
            {liveCount > 0 && (
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs sm:text-sm font-black tracking-wide">رادار تتبع تصفح واهتمام العملاء اللحظي (Live Radar)</h3>
              <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                liveCount > 0 
                  ? 'bg-emerald-500 text-slate-950 animate-pulse' 
                  : 'bg-slate-700 text-slate-300'
              }`}>
                {liveCount > 0 ? `${liveCount} عميل يتصفح الآن!` : 'في وضع الاستعداد'}
              </span>
            </div>
            <p className="text-[11px] text-slate-400">سجل لحظي لمراقبة مدة مكوث أصحاب الأنشطة وتفاعلهم مع مجسمات العرض</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-400 hidden sm:inline font-mono">
            {sessions.length} زيارات مسجلة
          </span>
          <button className="p-1 rounded-lg bg-slate-800 text-slate-300 hover:text-white transition-colors">
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Expanded Sessions Feed */}
      {isExpanded && (
        <div className="p-4 space-y-3 max-h-80 overflow-y-auto bg-slate-50/50">
          {sessions.length === 0 ? (
            <div className="py-8 text-center text-slate-400 text-xs font-bold">
              لا توجد جلسات تتبع مسجلة بعد. أرسل رابط العرض لأي نشاط لمشاهدة التحليلات اللحظية هنا!
            </div>
          ) : (
            sessions.map((sess) => {
              const minutes = Math.floor(sess.totalDurationSeconds / 60);
              const seconds = sess.totalDurationSeconds % 60;
              const formattedDuration = minutes > 0 ? `${minutes} د و ${seconds} ث` : `${seconds} ثانية`;

              return (
                <div
                  key={sess.sessionId}
                  className={`p-3.5 rounded-xl border transition-all ${
                    sess.isLiveNow
                      ? 'bg-emerald-50/80 border-emerald-300 shadow-xs ring-1 ring-emerald-400/20'
                      : 'bg-white border-slate-200'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    
                    {/* Activity info & status */}
                    <div className="flex items-center gap-2.5">
                      <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                        sess.isLiveNow ? 'bg-emerald-500 animate-ping' : 'bg-slate-300'
                      }`} />

                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black text-slate-900">{sess.businessName}</span>
                          
                          {/* Device icon */}
                          <span className="text-slate-400" title={sess.deviceType}>
                            {sess.deviceType === 'mobile' && <Smartphone className="w-3.5 h-3.5" />}
                            {sess.deviceType === 'desktop' && <Monitor className="w-3.5 h-3.5" />}
                            {sess.deviceType === 'tablet' && <Tablet className="w-3.5 h-3.5" />}
                          </span>

                          {/* Score Badge */}
                          {sess.engagementScore === 'ultra' && (
                            <span className="bg-rose-100 text-rose-700 text-[10px] font-black px-2 py-0.2 rounded-full border border-rose-200 flex items-center gap-0.5">
                              <Flame className="w-3 h-3 text-rose-600" />
                              اهتمام فائق (جاهز للإغلاق!)
                            </span>
                          )}
                          {sess.engagementScore === 'high' && (
                            <span className="bg-amber-100 text-amber-800 text-[10px] font-black px-2 py-0.2 rounded-full border border-amber-200">
                              تفاعل عالي 🔥
                            </span>
                          )}
                          {sess.engagementScore === 'medium' && (
                            <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.2 rounded-full">
                              مستوى جيد
                            </span>
                          )}
                        </div>

                        {/* Timing and Views */}
                        <div className="flex items-center gap-3 text-[11px] text-slate-500 mt-1 flex-wrap">
                          <span className="flex items-center gap-1 font-mono">
                            <Clock className="w-3 h-3 text-slate-400" />
                            <span>مدة البقاء: {formattedDuration}</span>
                          </span>

                          {sess.whatsappCtaClicked && (
                            <span className="text-emerald-700 font-bold flex items-center gap-1">
                              <CheckCircle className="w-3 h-3 text-emerald-600" />
                              ضغط على زر تأكيد الواتساب!
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Section Breakdown Pills */}
                    <div className="flex items-center gap-1.5 flex-wrap self-start sm:self-center">
                      {sess.viewedSections.map((sec) => (
                        <span
                          key={sec.sectionId}
                          className="bg-slate-100 border border-slate-200 text-slate-700 text-[10px] font-semibold px-2 py-0.5 rounded-md"
                        >
                          {sec.titleAr} ({sec.viewCount}x)
                        </span>
                      ))}
                    </div>

                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

    </div>
  );
};
