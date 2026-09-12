import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { AdminPitchComposer } from './components/AdminPitchComposer';
import { ClientTeaserPreview } from './components/ClientTeaserPreview';
import { DalilakActivitiesModal } from './components/DalilakActivitiesModal';
import { WatermarkControls } from './components/WatermarkControls';
import { WhatsAppCopyModal } from './components/WhatsAppCopyModal';
import { PromoteLeadModal } from './components/PromoteLeadModal';
import { LiveTrackerFeed } from './components/LiveTrackerFeed';
import { DalilakBusiness, PitchPackage, TrackingSession } from './types';
import { 
  createDefaultPitchPackage, 
  getDemoBusinesses, 
  savePitchPackage, 
  getSavedPitchPackages,
  fetchDalilakBusinesses,
  fetchLatestEcosystemActivity,
  enrichPitchPackageWithEcosystemData,
  fetchPitchPackageRemote
} from './services/dalilakService';
import { subscribeToTrackingUpdates } from './services/leadTrackingService';
import { Sliders, Smartphone, Sparkles, Database, Loader2 } from 'lucide-react';

// Synchronously detect client preview URL parameters BEFORE initial React render
function getInitialClientParameters() {
  if (typeof window === 'undefined') {
    return { isClient: false, pitchParam: null, bizParam: null };
  }
  const params = new URLSearchParams(window.location.search);
  const pitchParam = params.get('pitch') || params.get('preview') || params.get('p');
  const bizParam = params.get('biz') || params.get('b') || params.get('id');
  const isClient = !!(pitchParam || bizParam || params.get('view') === 'client');
  return { isClient, pitchParam, bizParam };
}

const initialClientInfo = getInitialClientParameters();

export function App() {
  // Synchronous initialization ensures client NEVER sees admin mode, not even for 1 millisecond
  const [mode, setMode] = useState<'admin' | 'client'>(() => (initialClientInfo.isClient ? 'client' : 'admin'));
  const [isClientStandalone, setIsClientStandalone] = useState<boolean>(() => initialClientInfo.isClient);

  const [currentPitch, setCurrentPitch] = useState<PitchPackage>(() => {
    const saved = getSavedPitchPackages();
    if (initialClientInfo.isClient) {
      const matched = saved.find(p => 
        (initialClientInfo.pitchParam && p.id === initialClientInfo.pitchParam) || 
        (initialClientInfo.bizParam && p.businessId === initialClientInfo.bizParam)
      );
      if (matched) return matched;
    } else if (saved.length > 0) {
      return saved[0];
    }
    const demoBiz = getDemoBusinesses()[0];
    return createDefaultPitchPackage(demoBiz);
  });

  const [isLoadingRemotePitch, setIsLoadingRemotePitch] = useState<boolean>(() => {
    if (!initialClientInfo.isClient) return false;
    const saved = getSavedPitchPackages();
    const matched = saved.find(p => 
      (initialClientInfo.pitchParam && p.id === initialClientInfo.pitchParam) || 
      (initialClientInfo.bizParam && p.businessId === initialClientInfo.bizParam)
    );
    return !matched;
  });

  const [isCoreLive, setIsCoreLive] = useState(false);
  const [ecosystemAlert, setEcosystemAlert] = useState<{
    business: DalilakBusiness;
    marketingActivity: any;
  } | null>(null);

  // Modals state
  const [activitiesModalOpen, setActivitiesModalOpen] = useState(false);
  const [whatsAppModalOpen, setWhatsAppModalOpen] = useState(false);
  const [promoteModalOpen, setPromoteModalOpen] = useState(false);
  const [watermarkControlsOpen, setWatermarkControlsOpen] = useState(false);

  // Real-time tracking sessions
  const [liveSessions, setLiveSessions] = useState<TrackingSession[]>([]);

  const handleSelectBusiness = async (business: DalilakBusiness) => {
    const initialPkg = createDefaultPitchPackage(business);
    setCurrentPitch(initialPkg);
    savePitchPackage(initialPkg);

    try {
      const { enrichedPitch } = await enrichPitchPackageWithEcosystemData(initialPkg);
      setCurrentPitch(enrichedPitch);
      savePitchPackage(enrichedPitch);
    } catch (err) {
      console.warn('Ecosystem enrichment error on selection:', err);
    }
  };

  // 1. Check URL parameters for direct client pitch link & Auto-Detect latest ecosystem activity
  useEffect(() => {
    const { isClient, pitchParam, bizParam } = initialClientInfo;

    if (isClient) {
      const saved = getSavedPitchPackages();
      const matched = saved.find(p => (pitchParam && p.id === pitchParam) || (bizParam && p.businessId === bizParam));
      
      if (matched) {
        setCurrentPitch(matched);
        setIsLoadingRemotePitch(false);
      } else {
        // Fetch and reconstruct from Ecosystem Supabase across devices (phones/desktops anywhere)
        setIsLoadingRemotePitch(true);
        fetchPitchPackageRemote(pitchParam || undefined, bizParam || undefined).then(remotePkg => {
          if (remotePkg) {
            setCurrentPitch(remotePkg);
            savePitchPackage(remotePkg);
          }
        }).catch(err => {
          console.warn('Error fetching remote pitch:', err);
        }).finally(() => {
          setIsLoadingRemotePitch(false);
        });
      }
    } else {
      // Auto-detect latest activity from Ecosystem Supabase (e.g. مطعم المذاق العالمي from Stage 1)
      fetchLatestEcosystemActivity().then(latest => {
        if (latest) {
          if (currentPitch.businessId === 'biz_sultan_01') {
            // Automatically switch from dummy/demo Sultan to the real activity saved in Ecosystem
            handleSelectBusiness(latest.business);
          } else if (latest.business.id !== currentPitch.businessId) {
            setEcosystemAlert(latest);
          }
        }
      }).catch(() => {});
    }

    // Check core connection
    fetchDalilakBusinesses({ limit: 1 }).then(res => {
      setIsCoreLive(res.isLive);
    });

    // Subscribe to live telemetry tracking
    const unsub = subscribeToTrackingUpdates((sessions) => {
      setLiveSessions([...sessions]);
    });

    return () => unsub();
  }, []);

  const handleUpdatePitch = (updated: PitchPackage) => {
    setCurrentPitch(updated);
    savePitchPackage(updated);
  };

  const handlePromotionSuccess = (invoiceNumber: string) => {
    const updated: PitchPackage = {
      ...currentPitch,
      status: 'promoted',
      watermarkSettings: {
        ...currentPitch.watermarkSettings,
        enabled: false // Unlocked after promotion!
      }
    };
    handleUpdatePitch(updated);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col antialiased">
      
      {/* Floating Mode Switcher ONLY when testing locally in admin, NEVER in client standalone preview */}
      {mode === 'client' && !isClientStandalone && (
        <div className="fixed top-3 left-3 z-50 flex items-center gap-2 bg-slate-950/90 backdrop-blur-md text-white px-3 py-1.5 rounded-full shadow-lg border border-slate-700 text-xs font-bold">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          <span>معاينة العميل التجريبية</span>
          <button
            onClick={() => setMode('admin')}
            className="text-amber-400 hover:text-white underline mr-2 cursor-pointer font-extrabold flex items-center gap-1"
          >
            <Sliders className="w-3 h-3" />
            <span>العودة للوحة الإدارة ←</span>
          </button>
        </div>
      )}

      {/* Ecosystem Smart Sync Alert Banner */}
      {ecosystemAlert && mode === 'admin' && (
        <div className="bg-gradient-to-r from-emerald-700 via-emerald-600 to-teal-700 text-white px-4 py-2.5 text-xs font-bold flex items-center justify-between shadow-md border-b border-emerald-500 animate-in slide-in-from-top duration-300">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-300 animate-ping" />
            <Sparkles className="w-4 h-4 text-emerald-200" />
            <span>
              تم رصد مخرجات تسويقية حديثة في سيرفر المنظومة لنشاط: <strong className="text-amber-300 font-black text-sm">«{ecosystemAlert.business.name_ar}»</strong>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                handleSelectBusiness(ecosystemAlert.business);
                setEcosystemAlert(null);
              }}
              className="bg-white hover:bg-emerald-50 text-emerald-950 px-3.5 py-1.5 rounded-xl text-xs font-black shadow-xs transition cursor-pointer flex items-center gap-1.5"
            >
              <Database className="w-3.5 h-3.5 text-emerald-700" />
              <span>تحميل ومزامنة النشاط الآن ←</span>
            </button>
            <button
              type="button"
              onClick={() => setEcosystemAlert(null)}
              className="text-white/80 hover:text-white px-2 py-1 cursor-pointer font-bold"
              title="إغلاق التنبيه"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Standard Admin Header */}
      {mode === 'admin' && (
        <Header
          currentPitch={currentPitch}
          currentMode={mode}
          onModeChange={setMode}
          onOpenActivitiesModal={() => setActivitiesModalOpen(true)}
          onOpenWhatsAppModal={() => setWhatsAppModalOpen(true)}
          onOpenPromoteModal={() => setPromoteModalOpen(true)}
          onOpenWatermarkSettings={() => setWatermarkControlsOpen(true)}
          liveSessions={liveSessions}
          isCoreLive={isCoreLive}
        />
      )}

      {/* Main Content View */}
      <main className="flex-1">
        {mode === 'admin' ? (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
            
            {/* Live Radar HUD Bar */}
            <LiveTrackerFeed
              sessions={liveSessions}
              onOpenWhatsAppForSession={(s) => setWhatsAppModalOpen(true)}
            />

            {/* Central Admin Composer Cockpit */}
            <AdminPitchComposer
              pitch={currentPitch}
              onUpdatePitch={handleUpdatePitch}
              onSwitchToClientPreview={() => setMode('client')}
              onOpenWhatsAppModal={() => setWhatsAppModalOpen(true)}
              onOpenWatermarkSettings={() => setWatermarkControlsOpen(true)}
            />

          </div>
        ) : isLoadingRemotePitch ? (
          /* High-Tech Standalone Remote Loading Screen */
          <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 text-center">
            <div className="w-18 h-18 rounded-3xl bg-gradient-to-tr from-amber-500 to-amber-400 p-1 mb-5 shadow-xl shadow-amber-500/20 animate-bounce">
              <div className="w-full h-full bg-slate-900 rounded-[22px] flex items-center justify-center text-amber-400 font-black text-2xl">
                د
              </div>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 mb-2">منظومة دليلك الذكية 🇪🇬</h2>
            <p className="text-slate-600 text-xs sm:text-sm max-w-sm mb-5 font-medium leading-relaxed">
              جاري فك تشفير وتجهيز المعاينة الحصرية لنشاطك التجاري من سيرفر المنظومة المباشر...
            </p>
            <div className="w-48 h-2 bg-slate-200 rounded-full overflow-hidden mb-3">
              <div className="w-full h-full bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 animate-pulse" />
            </div>
            <span className="text-[11px] text-slate-400 font-bold flex items-center gap-1.5">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-500" />
              <span>تحميل الأصول البصرية والخطة التسويقية</span>
            </span>
          </div>
        ) : (
          /* Client Interactive Teaser Showcase */
          <ClientTeaserPreview
            pitch={currentPitch}
            isStandalone={isClientStandalone}
          />
        )}
      </main>

      {/* Modals */}
      <DalilakActivitiesModal
        isOpen={activitiesModalOpen}
        onClose={() => setActivitiesModalOpen(false)}
        onSelectBusiness={handleSelectBusiness}
        currentSelectedId={currentPitch.businessId}
      />

      <WatermarkControls
        isOpen={watermarkControlsOpen}
        onClose={() => setWatermarkControlsOpen(false)}
        settings={currentPitch.watermarkSettings}
        onChange={(newSettings) => handleUpdatePitch({ ...currentPitch, watermarkSettings: newSettings })}
      />

      <WhatsAppCopyModal
        isOpen={whatsAppModalOpen}
        onClose={() => setWhatsAppModalOpen(false)}
        pitch={currentPitch}
      />

      <PromoteLeadModal
        isOpen={promoteModalOpen}
        onClose={() => setPromoteModalOpen(false)}
        pitch={currentPitch}
        onSuccess={handlePromotionSuccess}
      />

    </div>
  );
}

export default App;
