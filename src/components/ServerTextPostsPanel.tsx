import React, { useState, useEffect } from 'react';
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
  CheckCircle2,
  RefreshCw
} from 'lucide-react';
import { DalilakBusiness, PitchPackage } from '../types';
import { createWhatsAppDirectUrl } from '../utils/assetPitchMessageBuilder';
import { fetchEcosystemMarketingActivity } from '../services/dalilakService';

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
  const [activeTab, setActiveTab] = useState<'calendar' | 'ready_posts' | 'whatsapp_campaigns'>('calendar');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [dataSource, setDataSource] = useState<'local' | 'cloud' | 'default'>('default');

  const [calendarDays, setCalendarDays] = useState<any[]>(() => pitch.marketingData?.calendar || pitch.visualAssets.contentPlanSnippet || []);
  const [readyPosts, setReadyPosts] = useState<any[]>(() => pitch.marketingData?.readyPosts || pitch.visualAssets.socialMockupPosts || []);
  const [whatsappCampaigns, setWhatsappCampaigns] = useState<any[]>(() => pitch.marketingData?.whatsappCampaigns || []);
  const [brandPersona, setBrandPersona] = useState<any>(() => pitch.marketingData?.persona || null);

  const syncMarketingData = async () => {
    setIsSyncing(true);
    try {
      // 1. Check local storage first
      const mktKey = `dalelak_marketing_progress_${pitch.business.id}`;
      const rawMkt = localStorage.getItem(mktKey);
      if (rawMkt) {
        const mkt = JSON.parse(rawMkt);
        if (mkt.calendar && Array.isArray(mkt.calendar) && mkt.calendar.length > 0) {
          setCalendarDays(mkt.calendar.map((c: any) => ({
            day: c.day,
            pillar: c.pillarTitle || c.pillar,
            title: c.headline || c.title,
            hook: c.hookText || c.hook,
            callToAction: c.callToAction
          })));
          setDataSource('local');
        }
        if (mkt.readyPosts && Array.isArray(mkt.readyPosts) && mkt.readyPosts.length > 0) {
          setReadyPosts(mkt.readyPosts.map((p: any, i: number) => ({
            id: p.id || `post_${i}`,
            headline: p.title || p.headline,
            caption: p.content || p.caption,
            accent: i === 0 ? 'amber' : i === 1 ? 'emerald' : 'blue',
            tag: p.badge || p.platform || 'إعلان ترويجي'
          })));
        }
        if (mkt.whatsappCampaigns && Array.isArray(mkt.whatsappCampaigns) && mkt.whatsappCampaigns.length > 0) {
          setWhatsappCampaigns(mkt.whatsappCampaigns);
        }
        if (mkt.persona) {
          setBrandPersona(mkt.persona);
        }
      }

      // 2. Fetch from Ecosystem Supabase Server (hzlbbzxccqfdeyumtxph)
      const remoteData = await fetchEcosystemMarketingActivity(pitch.business.id);
      if (remoteData) {
        if (remoteData.calendar && Array.isArray(remoteData.calendar) && remoteData.calendar.length > 0) {
          setCalendarDays(remoteData.calendar.map((c: any) => ({
            day: c.day,
            pillar: c.pillarTitle || c.pillar,
            title: c.headline || c.title,
            hook: c.hookText || c.hook,
            callToAction: c.callToAction
          })));
          setDataSource('cloud');
        }
        if (remoteData.ready_posts && Array.isArray(remoteData.ready_posts) && remoteData.ready_posts.length > 0) {
          setReadyPosts(remoteData.ready_posts.map((p: any, i: number) => ({
            id: p.id || `post_${i}`,
            headline: p.title || p.headline,
            caption: p.content || p.caption,
            accent: i === 0 ? 'amber' : i === 1 ? 'emerald' : 'blue',
            tag: p.badge || p.platform || 'إعلان ترويجي'
          })));
          setDataSource('cloud');
        }
        if (remoteData.whatsapp_campaigns && Array.isArray(remoteData.whatsapp_campaigns) && remoteData.whatsapp_campaigns.length > 0) {
          setWhatsappCampaigns(remoteData.whatsapp_campaigns);
          setDataSource('cloud');
        }
        if (remoteData.persona) {
          setBrandPersona(remoteData.persona);
        }
      }
    } catch (e) {
      console.warn('Sync error:', e);
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    syncMarketingData();
  }, [pitch.business.id, pitch.marketingData]);

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

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden space-y-4 p-5">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`text-xs font-black px-2.5 py-0.5 rounded-full border ${
              dataSource === 'cloud'
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : dataSource === 'local'
                ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                : 'bg-slate-100 text-slate-700 border-slate-200'
            }`}>
              {dataSource === 'cloud' 
                ? 'متزامن مع سيرفر المنظومة السحابي ☁️'
                : dataSource === 'local'
                ? 'مخزن محلياً من استوديو التسويق 💾'
                : 'البيانات التلقائية'}
            </span>
            <button
              onClick={syncMarketingData}
              disabled={isSyncing}
              className="inline-flex items-center gap-1 text-[11px] font-bold text-sky-600 hover:text-sky-800 bg-sky-50 px-2 py-0.5 rounded-md hover:bg-sky-100 transition-colors"
              title="سحب أحدث بيانات من سيرفر المنظومة"
            >
              <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'جاري السحب...' : 'تحديث من السيرفر'}</span>
            </button>
            <h3 className="text-base font-black text-slate-900">
              المنشورات النصية وخطة المحتوى التسويقي
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            إرسال عينات مكتوبة لصاحب النشاط عبر واتساب لتوضيح قوة الصياغة وجذب زبائن المنطقة
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl flex-wrap">
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
            <span>خطة الـ 30 يوماً ({calendarDays.length})</span>
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
            <span>البوستات الإعلانية الجاهزة ({readyPosts.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('whatsapp_campaigns')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'whatsapp_campaigns'
                ? 'bg-white text-emerald-600 shadow-xs font-black'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>قوالب رسائل الواتساب المباشرة ({whatsappCampaigns.length > 0 ? whatsappCampaigns.length : 4})</span>
          </button>
        </div>
      </div>

      {/* Brand Persona & Slogan Banner */}
      {brandPersona && brandPersona.slogan && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-center justify-between gap-3 text-xs text-amber-950">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              شعار وهوية النشاط الرسمية: <strong className="text-amber-900 font-black">«{brandPersona.slogan}»</strong>
            </span>
          </div>
          {brandPersona.category && (
            <span className="bg-amber-200/70 text-amber-900 px-2 py-0.5 rounded-md font-bold text-[10px] shrink-0">
              {brandPersona.category}
            </span>
          )}
        </div>
      )}

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

      {/* Tab 3: Direct WhatsApp Campaigns */}
      {activeTab === 'whatsapp_campaigns' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(whatsappCampaigns.length > 0 ? whatsappCampaigns : [
            {
              id: 'camp_welcome',
              title: 'رسالة حجز واستفسار ترحيبية',
              goal: 'تأكيد الحجز أو استقبال طلب الدليفري',
              messageText: `يا مرحب بيك يا غالي في ${businessName}! 🌸 نورتنا وشرفتنا باستفسارك.
منيو النشاط كله تحت أمرك، بنقدملك أعلى جودة ونظافة مضمونة.
حبيت تطلب دليفري يوصلك لحد البيت، ولا تحجز زيارتك وتعيش اللمة معانا؟
قولنا طلبك وإحنا في الخدمة علطول! 😊`
            },
            {
              id: 'camp_care',
              title: 'رسالة متابعة ورعاية بعد الخدمة',
              goal: 'بناء ولاء قوي والتأكد من رضا العميل التام',
              messageText: `ألف هنا وشفا على قلبك يا طيب! ❤️
حبينا نطمن منك.. يا رب تكون تجربتك مع ${businessName} عجبتك وتكون الخدمة كانت على ذوقك؟
رأيك يهمنا جداً وبيه بنكبر ونطور من نفسنا دايماً. لو عندك أي ملاحظة أو اقتراح، إحنا بنسمعك بكل حب وجدعنة! 🤝`
            },
            {
              id: 'camp_reviews',
              title: 'طلب تقييم خرائط Google Maps',
              goal: 'الحصول على 5 نجوم لتعزيز السمعة الرقمية',
              messageText: `مساء الخير يا فندم ⭐️
كلامك الطيب ودعمك هو أكبر مكسب لينا في ${businessName}.
لو وقت حضرتك يسمح بدقيقة واحدة، يسعدنا جداً تشاركنا برأيك على صفحتنا الرسمية في Google Maps بالضغط هنا.
تقييمك بيفرق معانا وبيخلينا نخدمك أحسن كل مرة! شكراً لذوقك ولدعمك الغالي. 🌹`
            },
            {
              id: 'camp_promo',
              title: 'حملة العروض والمواسم الترويجية',
              goal: 'إعادة تنشيط العملاء السابقين وزيادة المبيعات',
              messageText: `علشان إنت من عيلتنا الغالية في ${businessName}.. جهزنا لك عرض حصري خاص بيك الأسبوع ده! 🔥
خصم فوري على كافة طلباتك أو وجبة إضافية مجانية عند زيارتنا اليومين دول.
ورّينا الرسالة دي عند الكاشير واستمتع بالعرض. مستنيينك تنورنا وتفرحنا بزيارتك! 🎉`
            }
          ]).map((camp, idx) => {
            const uniqueId = `camp_${camp.id || idx}`;
            const campText = camp.messageText || camp.content || '';
            const waUrl = createWhatsAppDirectUrl(clientPhone, campText);

            return (
              <div
                key={uniqueId}
                className="p-4 rounded-xl border border-emerald-200/80 bg-emerald-50/40 hover:bg-white hover:border-emerald-400 transition-all space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between flex-wrap gap-1">
                    <span className="bg-emerald-600 text-white font-black text-[10px] px-2.5 py-0.5 rounded-lg">
                      {camp.title || 'حملة واتساب'}
                    </span>
                    {camp.goal && (
                      <span className="text-[10px] text-slate-500 font-bold">
                        الهدف: {camp.goal}
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-700 bg-white p-3 rounded-xl border border-slate-200/80 leading-relaxed font-medium whitespace-pre-line">
                    {campText}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-200 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => handleCopy(uniqueId, campText)}
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
                        <span>نسخ النص</span>
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
                    <span>إرسال واتساب مباشر 🚀</span>
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
