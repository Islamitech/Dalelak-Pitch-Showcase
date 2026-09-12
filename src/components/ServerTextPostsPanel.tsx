import React, { useState } from 'react';
import { 
  Sparkles, 
  Send, 
  Copy, 
  Check, 
  ExternalLink, 
  Calendar, 
  Layers, 
  Share2, 
  Clock, 
  FileText,
  MessageSquare,
  Flame,
  CheckCircle2
} from 'lucide-react';
import { DalilakBusiness, PitchPackage } from '../types';
import { createWhatsAppDirectUrl } from '../utils/assetPitchMessageBuilder';

interface ServerTextPostsPanelProps {
  pitch: PitchPackage;
  clientPhone: string;
  businessName: string;
}

export const ServerTextPostsPanel: React.FC<ServerTextPostsPanelProps> = ({
  pitch,
  clientPhone,
  businessName
}) => {
  const [activeTab, setActiveTab] = useState<'calendar' | 'ready_posts'>('calendar');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Helper to format WhatsApp message for a content plan day
  const formatCalendarWhatsAppText = (dayItem: any) => {
    return `السلام عليكم يا فندم 🌹
دي عينة من خطة المحتوى التسويقي لـ 30 يوماً اللي جهزها فريق دليلك لنشاط «${businessName}»:

🗓️ منشور اليوم رقم ${dayItem.day} (ركيزة: ${dayItem.pillar})
📌 عنوان البوست: ${dayItem.title}

✍️ نص المنشور المقترح:
«${dayItem.hook}»

🎯 الدعوة للتفاعل (CTA): ${dayItem.callToAction}

الخطة الكاملة لـ 30 يوماً بتستلمها حضرتك مع باقة التوثيق الرسمية في ملف PDF جاهز للنشر الفوري! 🚀`;
  };

  // Helper to format WhatsApp message for a ready social post
  const formatReadyPostWhatsAppText = (post: any) => {
    return `مساء الخير يا فندم،
ده نموذج من البوستات الإعلانية الجاهزة للنشر على صفحة «${businessName}»:

🏷️ نوع المنشور: ${post.tag || 'عرض حصري'}
🔥 ${post.headline}

✍️ الكابشن التسويقي:
${post.caption}

✨ كل بوست بيتصمم ليه إطار رسمي باللوجو وهاشتاجات موجهة لسكان منطقتكم لزيادة التفاعل! 🤝`;
  };

  const calendarDays = pitch.visualAssets.contentPlanSnippet || [];
  const readyPosts = pitch.visualAssets.socialMockupPosts || [];

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden space-y-4 p-5">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-black text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-200">
              بيانات مسحوبة من السيرفر • استوديو التسويق
            </span>
            <h3 className="text-base font-black text-slate-900">
              المنشورات النصية وخطة المحتوى التسويقي
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            إرسال عينات مكتوبة لصاحب النشاط عبر واتساب لتوضيح قوة الصياغة وجذب زبائن المنطقة
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
          <button
            type="button"
            onClick={() => setActiveTab('calendar')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'calendar'
                ? 'bg-white text-indigo-600 shadow-xs font-black'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>خطة الـ 30 يوماً (${calendarDays.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('ready_posts')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'ready_posts'
                ? 'bg-white text-indigo-600 shadow-xs font-black'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>البوستات الإعلانية الجاهزة (${readyPosts.length})</span>
          </button>
        </div>
      </div>

      {/* Tab 1: Content Calendar Days */}
      {activeTab === 'calendar' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {calendarDays.map((day, idx) => {
            const waMessage = formatCalendarWhatsAppText(day);
            const waUrl = createWhatsAppDirectUrl(clientPhone, waMessage);
            const uniqueId = `day_${day.day}_${idx}`;

            return (
              <div
                key={uniqueId}
                className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-white hover:border-indigo-300 transition-all space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="bg-indigo-600 text-white font-black text-[10px] px-2.5 py-0.5 rounded-lg">
                      اليوم ${day.day}
                    </span>
                    <span className="text-[11px] font-bold text-slate-500">
                      ركيزة: ${day.pillar}
                    </span>
                  </div>

                  <h4 className="text-xs font-black text-slate-900">
                    {day.title}
                  </h4>

                  <p className="text-xs text-slate-600 bg-white p-3 rounded-xl border border-slate-200/80 leading-relaxed font-medium">
                    «{day.hook}»
                  </p>

                  <div className="text-[11px] text-indigo-700 font-bold flex items-center gap-1">
                    <span>الهدف (CTA):</span>
                    <span className="text-slate-700">{day.callToAction}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-2 border-t border-slate-200 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => handleCopy(uniqueId, waMessage)}
                    className="py-1.5 px-3 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                  >
                    {copiedId === uniqueId ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-700 font-black">تم النسخ ✓</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-slate-400" />
                        <span>نسخ الرسالة</span>
                      </>
                    )}
                  </button>

                  <a
                    href={waUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-1.5 px-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-2xs"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>إرسال عبر واتساب</span>
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Tab 2: Ready Social Posts */}
      {activeTab === 'ready_posts' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {readyPosts.map((post, idx) => {
            const waMessage = formatReadyPostWhatsAppText(post);
            const waUrl = createWhatsAppDirectUrl(clientPhone, waMessage);
            const uniqueId = `post_${post.id || idx}`;

            return (
              <div
                key={uniqueId}
                className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-white hover:border-indigo-300 transition-all space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="bg-amber-500 text-slate-950 font-black text-[10px] px-2.5 py-0.5 rounded-lg">
                      {post.tag || 'إعلان ترويجي'}
                    </span>
                  </div>

                  <h4 className="text-xs font-black text-slate-900 leading-snug">
                    {post.headline}
                  </h4>

                  <p className="text-xs text-slate-600 bg-white p-3 rounded-xl border border-slate-200/80 leading-relaxed font-medium">
                    {post.caption}
                  </p>
                </div>

                {/* Actions */}
                <div className="pt-2 border-t border-slate-200 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => handleCopy(uniqueId, waMessage)}
                    className="py-1.5 px-3 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                  >
                    {copiedId === uniqueId ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-700 font-black">تم النسخ ✓</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-slate-400" />
                        <span>نسخ</span>
                      </>
                    )}
                  </button>

                  <a
                    href={waUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-1.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-2xs"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>واتساب</span>
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
