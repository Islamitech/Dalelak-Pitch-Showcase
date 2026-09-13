import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { AdminPitchComposer } from './components/AdminPitchComposer';
import { ClientTeaserPreview } from './components/ClientTeaserPreview';
import { ImageOnlyShowcase } from './components/ImageOnlyShowcase';
import { DalilakActivitiesModal } from './components/DalilakActivitiesModal';
import { WatermarkControls } from './components/WatermarkControls';
import { WhatsAppCopyModal } from './components/WhatsAppCopyModal';
import { PromoteLeadModal } from './components/PromoteLeadModal';
import { AdvancedLinkSettingsModal } from './components/AdvancedLinkSettingsModal';
import { DirectPostGeneratorModal } from './components/DirectPostGeneratorModal';
import { LiveTrackerFeed } from './components/LiveTrackerFeed';
import { 
  DalilakBusiness, 
  PitchPackage, 
  TrackingSession, 
  ReadySocialPost, 
  SocialMockupItem 
} from './types';
import { 
  createDefaultPitchPackage, 
  getDemoBusinesses, 
  savePitchPackage, 
  getSavedPitchPackages,
  fetchDalilakBusinesses,
  checkAndImportPhase1Progress
} from './services/dalilakService';
import { subscribeToTrackingUpdates } from './services/leadTrackingService';
import { Sliders, Smartphone, Image as ImageIcon, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

export function App() {
  const [currentPitch, setCurrentPitch] = useState<PitchPackage>(() => {
    const saved = getSavedPitchPackages();
    if (saved.length > 0) return saved[0];
    const demoBiz = getDemoBusinesses()[0];
    return createDefaultPitchPackage(demoBiz);
  });

  const [mode, setMode] = useState<'admin' | 'client' | 'images_only'>('admin');
  const [isClientStandalone, setIsClientStandalone] = useState(false);
  const [isCoreLive, setIsCoreLive] = useState(false);
  const [isSyncingPhase1, setIsSyncingPhase1] = useState(false);

  // Modals state
  const [activitiesModalOpen, setActivitiesModalOpen] = useState(false);
  const [whatsAppModalOpen, setWhatsAppModalOpen] = useState(false);
  const [promoteModalOpen, setPromoteModalOpen] = useState(false);
  const [watermarkControlsOpen, setWatermarkControlsOpen] = useState(false);
  const [advancedLinkModalOpen, setAdvancedLinkModalOpen] = useState(false);
  const [postGeneratorModalOpen, setPostGeneratorModalOpen] = useState(false);

  // Real-time tracking sessions
  const [liveSessions, setLiveSessions] = useState<TrackingSession[]>([]);

  // 1. Check URL parameters for direct client pitch link & specific view mode
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const pitchId = params.get('pitch');
    const viewParam = params.get('view');

    if (pitchId) {
      setIsClientStandalone(true);
      if (viewParam === 'images_only') {
        setMode('images_only');
      } else {
        setMode('client');
      }

      const saved = getSavedPitchPackages();
      const matched = saved.find(p => p.id === pitchId);
      if (matched) {
        setCurrentPitch(matched);
      }
    } else if (viewParam === 'images_only') {
      setMode('images_only');
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

  // 2. Auto-check Phase 1 sync when business changes
  useEffect(() => {
    if (currentPitch.businessId) {
      checkAndImportPhase1Progress(currentPitch.businessId).then(progress => {
        if (progress && (progress.readyPosts?.length || progress.calendar?.length)) {
          applyPhase1ProgressToPitch(progress, false);
        }
      });
    }
  }, [currentPitch.businessId]);

  const applyPhase1ProgressToPitch = (progress: any, notify = true) => {
    const updated = { ...currentPitch };

    // Update marketingData
    updated.marketingData = {
      persona: progress.persona || null,
      calendar: progress.calendar || [],
      readyPosts: progress.readyPosts || [],
      whatsappCampaigns: progress.whatsappCampaigns || [],
      isSyncedFromPhase1: true,
      syncedAt: new Date().toISOString()
    };

    // Update socialMockupPosts if readyPosts exist
    if (progress.readyPosts && progress.readyPosts.length > 0) {
      updated.visualAssets = {
        ...updated.visualAssets,
        socialMockupPosts: progress.readyPosts.map((p: any, idx: number) => ({
          id: p.id || `post_${idx}`,
          headline: p.title || `منشور تسويقي لـ ${currentPitch.business.name_ar}`,
          caption: p.content || '',
          accent: idx % 2 === 0 ? 'amber' : 'emerald',
          tag: p.badge || 'سوشيال ميديا'
        }))
      };
    }

    // Update content calendar snippet if calendar exists
    if (progress.calendar && progress.calendar.length > 0) {
      updated.visualAssets.contentPlanSnippet = progress.calendar.slice(0, 6).map((c: any) => ({
        day: c.day,
        pillar: c.pillarTitle || c.pillar || 'تسويق',
        title: c.headline || 'منشور اليوم',
        hook: c.hookText || c.bodyText?.slice(0, 80) || '',
        callToAction: c.callToAction || 'تواصل معنا الآن'
      }));
    }

    setCurrentPitch(updated);
    savePitchPackage(updated);

    if (notify) {
      confetti({
        particleCount: 70,
        spread: 50,
        origin: { y: 0.6 }
      });
    }
  };

  const handleManualSyncPhase1 = async () => {
    setIsSyncingPhase1(true);
    try {
      const progress = await checkAndImportPhase1Progress(currentPitch.businessId);
      if (progress && (progress.readyPosts?.length || progress.calendar?.length)) {
        applyPhase1ProgressToPitch(progress, true);
      } else {
        alert('لم يتم العثور على خطة تسويقية سابقة لهذا النشاط في المرحلة 1. يمكنك توليد منشورات جديدة الآن عبر زر «توليد منشورات 🪄»!');
      }
    } finally {
      setIsSyncingPhase1(false);
    }
  };

  const handleAddPostToPitch = (post: ReadySocialPost, mockup: SocialMockupItem) => {
    const updatedPosts = [mockup, ...(currentPitch.visualAssets.socialMockupPosts || [])];
    const updatedReadyPosts = [post, ...(currentPitch.marketingData?.readyPosts || [])];

    const updated: PitchPackage = {
      ...currentPitch,
      visualAssets: {
        ...currentPitch.visualAssets,
        socialMockupPosts: updatedPosts
      },
      marketingData: {
        ...currentPitch.marketingData,
        readyPosts: updatedReadyPosts,
        isSyncedFromPhase1: true,
        syncedAt: new Date().toISOString()
      },
      updatedAt: new Date().toISOString()
    };

    setCurrentPitch(updated);
    savePitchPackage(updated);
  };

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
      
      {/* Floating Return Button if in client preview mode */}
      {mode !== 'admin' && (
        <div className="fixed top-3 left-3 z-50 flex items-center gap-2 bg-slate-950/90 backdrop-blur-md text-white px-3.5 py-1.5 rounded-full shadow-lg border border-slate-700 text-xs font-bold">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          <span>{mode === 'images_only' ? 'معاينة تصاميم الصور فقط' : 'معاينة العرض الشامل'}</span>
          <button
            onClick={() => setMode('admin')}
            className="text-amber-400 hover:text-white underline mr-2 cursor-pointer font-extrabold flex items-center gap-1"
          >
            <Sliders className="w-3 h-3" />
            <span>العودة للإدارة ←</span>
          </button>
        </div>
      )}

      {/* Admin Header */}
      {mode === 'admin' && (
        <Header
          currentPitch={currentPitch}
          currentMode={mode}
          onModeChange={setMode}
          onOpenActivitiesModal={() => setActivitiesModalOpen(true)}
          onOpenWhatsAppModal={() => setWhatsAppModalOpen(true)}
          onOpenPromoteModal={() => setPromoteModalOpen(true)}
          onOpenWatermarkSettings={() => setWatermarkControlsOpen(true)}
          onOpenAdvancedLinkSettings={() => setAdvancedLinkModalOpen(true)}
          onOpenPostGenerator={() => setPostGeneratorModalOpen(true)}
          onSyncPhase1={handleManualSyncPhase1}
          isSyncingPhase1={isSyncingPhase1}
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
              onSwitchToImagesOnlyPreview={() => setMode('images_only')}
              onOpenWhatsAppModal={() => setWhatsAppModalOpen(true)}
              onOpenWatermarkSettings={() => setWatermarkControlsOpen(true)}
              onOpenAdvancedLinkSettings={() => setAdvancedLinkModalOpen(true)}
              onOpenPostGenerator={() => setPostGeneratorModalOpen(true)}
            />

          </div>
        ) : mode === 'images_only' ? (
          /* Dedicated Image Designs Only Showcase */
          <ImageOnlyShowcase
            pitch={currentPitch}
            onSwitchToFullView={() => setMode('client')}
          />
        ) : (
          /* Full Client Interactive Teaser Showcase */
          <ClientTeaserPreview
            pitch={currentPitch}
            isStandalone={isClientStandalone}
            onSwitchToImagesOnly={() => setMode('images_only')}
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

      <AdvancedLinkSettingsModal
        isOpen={advancedLinkModalOpen}
        onClose={() => setAdvancedLinkModalOpen(false)}
        pitch={currentPitch}
        onUpdatePitch={handleUpdatePitch}
      />

      <DirectPostGeneratorModal
        isOpen={postGeneratorModalOpen}
        onClose={() => setPostGeneratorModalOpen(false)}
        pitch={currentPitch}
        onAddPostToPitch={handleAddPostToPitch}
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
