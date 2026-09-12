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
  fetchDalilakBusinesses
} from './services/dalilakService';
import { subscribeToTrackingUpdates } from './services/leadTrackingService';
import { Sliders, Smartphone } from 'lucide-react';

export function App() {
  const [currentPitch, setCurrentPitch] = useState<PitchPackage>(() => {
    const saved = getSavedPitchPackages();
    if (saved.length > 0) return saved[0];
    const demoBiz = getDemoBusinesses()[0];
    return createDefaultPitchPackage(demoBiz);
  });

  const [mode, setMode] = useState<'admin' | 'client'>('admin');
  const [isClientStandalone, setIsClientStandalone] = useState(false);
  const [isCoreLive, setIsCoreLive] = useState(false);

  // Modals state
  const [activitiesModalOpen, setActivitiesModalOpen] = useState(false);
  const [whatsAppModalOpen, setWhatsAppModalOpen] = useState(false);
  const [promoteModalOpen, setPromoteModalOpen] = useState(false);
  const [watermarkControlsOpen, setWatermarkControlsOpen] = useState(false);

  // Real-time tracking sessions
  const [liveSessions, setLiveSessions] = useState<TrackingSession[]>([]);

  // 1. Check URL parameters for direct client pitch link
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const pitchId = params.get('pitch');
    if (pitchId) {
      setMode('client');
      setIsClientStandalone(true);
      const saved = getSavedPitchPackages();
      const matched = saved.find(p => p.id === pitchId);
      if (matched) {
        setCurrentPitch(matched);
      }
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

  const handleSelectBusiness = (business: DalilakBusiness) => {
    const newPkg = createDefaultPitchPackage(business);
    setCurrentPitch(newPkg);
    savePitchPackage(newPkg);
  };

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
      
      {/* Floating Mode Switcher if in client mode */}
      {mode === 'client' && (
        <div className="fixed top-3 left-3 z-50 flex items-center gap-2 bg-slate-950/90 backdrop-blur-md text-white px-3 py-1.5 rounded-full shadow-lg border border-slate-700 text-xs font-bold">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          <span>معاينة العميل</span>
          <button
            onClick={() => setMode('admin')}
            className="text-amber-400 hover:text-white underline mr-2 cursor-pointer font-extrabold flex items-center gap-1"
          >
            <Sliders className="w-3 h-3" />
            <span>العودة للوحة الإدارة ←</span>
          </button>
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
