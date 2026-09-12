import React, { useState, useEffect } from 'react';
import { 
  X, 
  Search, 
  Store, 
  MapPin, 
  Phone, 
  CheckCircle, 
  Clock, 
  RefreshCw, 
  Settings, 
  Check, 
  Sparkles,
  Layers,
  Database,
  Calendar,
  MessageSquare,
  FileText
} from 'lucide-react';
import { DalilakBusiness, EcosystemActivitySummary } from '../types';
import { 
  fetchDalilakBusinesses, 
  fetchRecentEcosystemActivities,
  fetchBusinessById,
  getCoreConfig, 
  saveCoreConfig, 
  extractBusinessGoogleInfo 
} from '../services/dalilakService';

interface DalilakActivitiesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectBusiness: (business: DalilakBusiness) => void;
  currentSelectedId?: string;
}

const GOVERNORATES = [
  'الكل',
  'القاهرة',
  'الجيزة',
  'الإسكندرية',
  'الدقهلية',
  'الشرقية',
  'القليوبية',
  'الغربية',
  'البحيرة'
];

export const DalilakActivitiesModal: React.FC<DalilakActivitiesModalProps> = ({
  isOpen,
  onClose,
  onSelectBusiness,
  currentSelectedId
}) => {
  const [activeTab, setActiveTab] = useState<'ecosystem' | 'core'>('ecosystem');
  const [ecosystemActivities, setEcosystemActivities] = useState<EcosystemActivitySummary[]>([]);
  const [businesses, setBusinesses] = useState<DalilakBusiness[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGov, setSelectedGov] = useState('الكل');
  const [errorNotice, setErrorNotice] = useState<string | null>(null);
  const [showConfig, setShowConfig] = useState(false);

  // Database settings
  const [customUrl, setCustomUrl] = useState('');
  const [customKey, setCustomKey] = useState('');

  useEffect(() => {
    if (isOpen) {
      loadAllData();
      const cfg = getCoreConfig();
      setCustomUrl(cfg.url);
      setCustomKey(cfg.key);
    }
  }, [isOpen]);

  const loadAllData = async () => {
    setLoading(true);
    setErrorNotice(null);
    try {
      const [ecoRows, coreRes] = await Promise.all([
        fetchRecentEcosystemActivities(30),
        fetchDalilakBusinesses({
          search: searchTerm,
          governorate: selectedGov === 'الكل' ? undefined : selectedGov,
          limit: 60
        })
      ]);
      setEcosystemActivities(ecoRows);
      setBusinesses(coreRes.data);
      if (ecoRows.length > 0 && !searchTerm) {
        setActiveTab('ecosystem');
      } else if (ecoRows.length === 0) {
        setActiveTab('core');
      }
      if (coreRes.error && ecoRows.length === 0) {
        setErrorNotice(coreRes.error);
      }
    } catch (err) {
      console.error(err);
      setErrorNotice('تعذر تحميل البيانات المباشرة');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveConfig = () => {
    saveCoreConfig(customUrl, customKey);
    setShowConfig(false);
    loadAllData();
  };

  const handleSelectEcosystemItem = async (eco: EcosystemActivitySummary) => {
    let biz = businesses.find(b => b.id === eco.business_id);
    if (!biz) {
      biz = (await fetchBusinessById(eco.business_id)) || undefined;
    }
    const finalBiz: DalilakBusiness = biz || {
      id: eco.business_id,
      name_ar: eco.business_name,
      category: eco.category || 'عام',
      city: eco.city || 'مصر',
      phone: eco.phone || '',
      verification_status: 'verified'
    };
    onSelectBusiness(finalBiz);
    onClose();
  };

  const filteredEcosystem = ecosystemActivities.filter(item => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return true;
    const matchName = (item.business_name || '').toLowerCase().includes(term);
    const matchCat = (item.category || '').toLowerCase().includes(term);
    const matchCity = (item.city || '').toLowerCase().includes(term);
    const matchPhone = (item.phone || '').includes(term);
    const matchId = (item.business_id || '').toLowerCase().includes(term);
    return matchName || matchCat || matchCity || matchPhone || matchId;
  });

  const filteredBusinesses = businesses.filter(b => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return true;
    const matchNameAr = (b.name_ar || '').toLowerCase().includes(term);
    const matchNameEn = (b.name_en || '').toLowerCase().includes(term);
    const matchPhone = (b.phone || '').includes(term);
    const matchCity = (b.city || '').toLowerCase().includes(term);
    return matchNameAr || matchNameEn || matchPhone || matchCity;
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-slate-200 flex flex-col max-h-[90vh] overflow-hidden">
        
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-black">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <span>سحب وتحديد نشاط تجاري من دليلك</span>
                <span className="text-xs font-bold text-amber-700 bg-amber-100 px-2.5 py-0.5 rounded-full border border-amber-200">
                  {filteredBusinesses.length} نشاط متاح
                </span>
              </h2>
              <p className="text-xs text-slate-500">اختر النشاط لتوليد حزمة الإبهار التسويقي وصفحة الاستعراض المحمية</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowConfig(!showConfig)}
              title="إعدادات الاتصال بالسيرفر الأساسي"
              className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-200/60 transition-colors cursor-pointer"
            >
              <Settings className="w-5 h-5" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Server Config Drawer */}
        {showConfig && (
          <div className="p-4 bg-amber-50/80 border-b border-amber-200 text-xs text-slate-800 space-y-3">
            <div className="font-bold text-amber-900 flex items-center gap-1.5">
              <Settings className="w-4 h-4" />
              <span>إعدادات الاتصال المباشر بقاعدة بيانات دليلك (Supabase Core):</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-600 mb-1 font-bold">رابط الخادم (Supabase URL):</label>
                <input
                  type="text"
                  value={customUrl}
                  onChange={(e) => setCustomUrl(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-800 font-mono focus:ring-2 focus:ring-amber-500 outline-hidden"
                />
              </div>
              <div>
                <label className="block text-slate-600 mb-1 font-bold">المفتاح العام (Anon Key):</label>
                <input
                  type="password"
                  value={customKey}
                  onChange={(e) => setCustomKey(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-800 font-mono focus:ring-2 focus:ring-amber-500 outline-hidden"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <button
                onClick={handleSaveConfig}
                className="bg-amber-600 text-white font-bold px-4 py-1.5 rounded-lg hover:bg-amber-700 transition-colors cursor-pointer"
              >
                حفظ وإعادة الاتصال
              </button>
            </div>
          </div>
        )}

        {/* Dual Tab Navigation: Ecosystem Server Hub vs Core Database */}
        <div className="flex items-center border-b border-slate-200 bg-slate-100/80 p-2 gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('ecosystem')}
            className={`flex-1 py-2.5 px-3.5 rounded-xl text-xs font-black flex items-center justify-center gap-2 transition cursor-pointer ${
              activeTab === 'ecosystem'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-200/80 border border-slate-200'
            }`}
          >
            <Database className="w-4 h-4 text-emerald-300" />
            <span>أنشطة سيرفر المنظومة المساعد (المرحلة 1 و 2)</span>
            <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
              activeTab === 'ecosystem' ? 'bg-emerald-800 text-emerald-100' : 'bg-slate-200 text-slate-700'
            }`}>
              {ecosystemActivities.length} جاهز
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('core')}
            className={`flex-1 py-2.5 px-3.5 rounded-xl text-xs font-black flex items-center justify-center gap-2 transition cursor-pointer ${
              activeTab === 'core'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-200/80 border border-slate-200'
            }`}
          >
            <Store className="w-4 h-4 text-amber-200" />
            <span>كافة أنشطة السيرفر الأساسي (Core Supabase)</span>
            <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
              activeTab === 'core' ? 'bg-amber-800 text-amber-100' : 'bg-slate-200 text-slate-700'
            }`}>
              {filteredBusinesses.length}
            </span>
          </button>
        </div>

        {/* Filter & Search Bar */}
        <div className="p-4 border-b border-slate-100 bg-white flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder={activeTab === 'ecosystem' ? 'ابحث في مخرجات المنظومة المحفوظة...' : 'ابحث باسم النشاط، رقم التليفون، المدينة...'}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-3 pr-10 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-hidden transition-all"
            />
          </div>

          {activeTab === 'core' && (
            <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
              {GOVERNORATES.map((gov) => (
                <button
                  key={gov}
                  onClick={() => setSelectedGov(gov)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
                    selectedGov === gov
                      ? 'bg-amber-500 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {gov}
                </button>
              ))}
            </div>
          )}

          <button
            onClick={loadAllData}
            disabled={loading}
            title="تحديث القائمة"
            className="p-2 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 cursor-pointer self-end sm:self-center shrink-0"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-amber-600' : ''}`} />
          </button>
        </div>

        {errorNotice && (
          <div className="px-5 py-2 bg-amber-50 text-amber-800 text-xs font-semibold border-b border-amber-200">
            {errorNotice}
          </div>
        )}

        {/* Business List Grid */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
          {loading ? (
            <div className="py-16 text-center text-slate-400">
              <RefreshCw className="w-8 h-8 animate-spin mx-auto text-amber-500 mb-2" />
              <p className="text-sm font-bold">جاري فحص وتحديث بيانات المنظومة...</p>
            </div>
          ) : activeTab === 'ecosystem' ? (
            filteredEcosystem.length === 0 ? (
              <div className="py-16 text-center text-slate-400">
                <Database className="w-12 h-12 mx-auto text-slate-300 mb-2" />
                <p className="text-sm font-bold text-slate-700">لا توجد أنشطة محفوظة في سيرفر المساعدين حالياً</p>
                <p className="text-xs text-slate-400 mt-1">قم بتوليد خطة تسويقية في (التطبيق 1) وحفظها لتظهر هنا فوراً</p>
              </div>
            ) : (
              filteredEcosystem.map((eco) => {
                const isSelected = currentSelectedId === eco.business_id;
                const calendarCount = Array.isArray(eco.calendar) ? eco.calendar.length : 0;
                const readyPostsCount = Array.isArray(eco.ready_posts) ? eco.ready_posts.length : 0;
                const campaignsCount = Array.isArray(eco.whatsapp_campaigns) ? eco.whatsapp_campaigns.length : 0;

                return (
                  <div
                    key={eco.business_id}
                    onClick={() => handleSelectEcosystemItem(eco)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                      isSelected
                        ? 'bg-emerald-50/90 border-emerald-300 ring-2 ring-emerald-500/20 shadow-xs'
                        : 'bg-white border-slate-200 hover:border-emerald-300 hover:shadow-xs'
                    }`}
                  >
                    <div className="flex items-start gap-3.5">
                      <div className="w-11 h-11 rounded-2xl bg-emerald-500/10 border border-emerald-200 flex items-center justify-center text-emerald-700 shrink-0 mt-0.5">
                        <Database className="w-6 h-6" />
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-base font-black text-slate-950">{eco.business_name}</h3>
                          <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
                            {eco.category || 'نشاط تجاري'}
                          </span>
                          <span className="inline-flex items-center gap-1 text-[10px] font-black text-emerald-800 bg-emerald-100 border border-emerald-300 px-2.5 py-0.5 rounded-full">
                            <Check className="w-3 h-3 text-emerald-600" />
                            جاهز من استوديو التسويق (المرحلة 1) ⚡
                          </span>
                        </div>

                        {eco.persona?.slogan && (
                          <p className="text-xs text-amber-900 font-semibold italic bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200 inline-block">
                            «{eco.persona.slogan}»
                          </p>
                        )}

                        <div className="flex items-center gap-3 text-xs text-slate-600 flex-wrap pt-0.5">
                          <span className="inline-flex items-center gap-1 font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded-md">
                            <Calendar className="w-3.5 h-3.5 text-amber-600" />
                            {calendarCount} يوماً خطة محتوى
                          </span>
                          <span className="inline-flex items-center gap-1 font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded-md">
                            <FileText className="w-3.5 h-3.5 text-blue-600" />
                            {readyPostsCount} بوستات جاهزة
                          </span>
                          <span className="inline-flex items-center gap-1 font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded-md">
                            <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                            {campaignsCount} حملات واتساب
                          </span>
                        </div>

                        <div className="flex items-center gap-4 text-xs text-slate-500 pt-1 flex-wrap font-medium">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-slate-400" />
                            <span>{eco.city || 'مصر'}</span>
                          </span>
                          {eco.phone && (
                            <span className="flex items-center gap-1 font-mono">
                              <Phone className="w-3.5 h-3.5 text-slate-400" />
                              <span dir="ltr">{eco.phone}</span>
                            </span>
                          )}
                          {eco.updated_at && (
                            <span className="flex items-center gap-1 text-[11px] text-slate-400 font-mono">
                              <Clock className="w-3 h-3 text-slate-400" />
                              <span>{new Date(eco.updated_at).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}</span>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                      <button
                        className={`text-xs font-black px-4 py-2 rounded-xl transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-xs'
                        }`}
                      >
                        {isSelected ? 'العرض الحالي ✓' : 'تحميل ومزامنة العرض ←'}
                      </button>
                    </div>
                  </div>
                );
              })
            )
          ) : filteredBusinesses.length === 0 ? (
            <div className="py-16 text-center text-slate-400">
              <Store className="w-12 h-12 mx-auto text-slate-300 mb-2" />
              <p className="text-sm font-bold text-slate-600">لا توجد أنشطة مطابقة للبحث</p>
              <p className="text-xs text-slate-400 mt-1">جرّب تغيير كلمات البحث أو اختيار محافظة أخرى</p>
            </div>
          ) : (
            filteredBusinesses.map((biz) => {
              const googleInfo = extractBusinessGoogleInfo(biz);
              const isSelected = currentSelectedId === biz.id;

              return (
                <div
                  key={biz.id}
                  onClick={() => {
                    onSelectBusiness(biz);
                    onClose();
                  }}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    isSelected
                      ? 'bg-amber-50/90 border-amber-300 ring-2 ring-amber-500/20 shadow-xs'
                      : 'bg-white border-slate-200 hover:border-amber-300 hover:shadow-xs'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 shrink-0 mt-0.5">
                      <Store className="w-5 h-5 text-amber-600" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-sm font-black text-slate-900">{biz.name_ar}</h3>
                        {biz.name_en && (
                          <span className="text-xs text-slate-400 font-mono font-bold">({biz.name_en})</span>
                        )}
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                          {biz.category || 'نشاط تجاري'}
                        </span>
                        {googleInfo.isVerified ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-black text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                            <Check className="w-3 h-3" />
                            خرائط Google موثق ⭐️
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                            <Clock className="w-3 h-3" />
                            بانتظار التوثيق
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-4 text-xs text-slate-500 mt-1.5 flex-wrap">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          <span>{biz.governorate || 'مصر'} - {biz.city || 'المركز'} {biz.street ? `(${biz.street})` : ''}</span>
                        </span>
                        <span className="flex items-center gap-1 font-mono">
                          <Phone className="w-3.5 h-3.5 text-slate-400" />
                          <span dir="ltr">{biz.phone}</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                    <button
                      className={`text-xs font-black px-3.5 py-1.5 rounded-xl transition-all ${
                        isSelected
                          ? 'bg-amber-600 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-700 hover:bg-amber-500 hover:text-white'
                      }`}
                    >
                      {isSelected ? 'النشاط الحالي ✓' : 'اختيار وتوليد العرض ←'}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>دليلك • استوديو العروض الترويجية والإغلاق البيعي (المرحلة 3)</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold transition-colors cursor-pointer"
          >
            إغلاق
          </button>
        </div>

      </div>
    </div>
  );
};
