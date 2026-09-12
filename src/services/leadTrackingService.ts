import { TrackingSession, SectionViewStat } from '../types';

const STORAGE_KEY_TRACKING_SESSIONS = 'dalelak_lead_tracking_sessions';

type TrackingListener = (sessions: TrackingSession[]) => void;
const listeners: Set<TrackingListener> = new Set();

export function subscribeToTrackingUpdates(listener: TrackingListener): () => void {
  listeners.add(listener);
  listener(getAllTrackingSessions());
  return () => listeners.delete(listener);
}

function notifyListeners() {
  const sessions = getAllTrackingSessions();
  listeners.forEach(cb => {
    try {
      cb(sessions);
    } catch (e) {
      console.error('Error notifying tracking listener:', e);
    }
  });
}

export function getAllTrackingSessions(): TrackingSession[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_TRACKING_SESSIONS);
    if (raw) {
      const parsed: TrackingSession[] = JSON.parse(raw);
      // Mark sessions as inactive if last ping was more than 30 seconds ago
      const now = Date.now();
      return parsed.map(s => {
        const lastPing = new Date(s.lastPingTime).getTime();
        const isLive = now - lastPing < 35000;
        return { ...s, isLiveNow: isLive };
      });
    }
  } catch (e) {
    console.error('Error loading tracking sessions:', e);
  }
  return getDemoTrackingSessions();
}

export function saveTrackingSessions(sessions: TrackingSession[]) {
  try {
    localStorage.setItem(STORAGE_KEY_TRACKING_SESSIONS, JSON.stringify(sessions));
    notifyListeners();
  } catch (e) {
    console.error('Error saving tracking sessions:', e);
  }
}

/**
 * Initializes or resumes a tracking session when client opens the teaser link
 */
export function startClientTrackingSession(pitchId: string, businessName: string, businessPhone: string): string {
  const sessions = getAllTrackingSessions();
  const sessionId = `sess_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

  // Detect device
  const ua = navigator.userAgent;
  let deviceType: 'mobile' | 'desktop' | 'tablet' = 'desktop';
  if (/iPad|Tablet/i.test(ua)) deviceType = 'tablet';
  else if (/Mobile|Android|iPhone/i.test(ua)) deviceType = 'mobile';

  const newSession: TrackingSession = {
    sessionId,
    pitchId,
    businessName,
    businessPhone,
    startTime: new Date().toISOString(),
    lastPingTime: new Date().toISOString(),
    totalDurationSeconds: 1,
    isLiveNow: true,
    deviceType,
    viewedSections: [
      { sectionId: 'hero', titleAr: 'مقدمة العرض والشعار', viewCount: 1, timeSpentSeconds: 1 }
    ],
    whatsappCtaClicked: false,
    engagementScore: 'low'
  };

  sessions.unshift(newSession);
  saveTrackingSessions(sessions);
  return sessionId;
}

/**
 * Client heartbeat ping called every 5 seconds while client is actively on the pitch page
 */
export function pingClientSession(sessionId: string, currentActiveSectionId?: string) {
  const sessions = getAllTrackingSessions();
  const session = sessions.find(s => s.sessionId === sessionId);
  if (!session) return;

  session.lastPingTime = new Date().toISOString();
  session.totalDurationSeconds += 5;
  session.isLiveNow = true;

  if (currentActiveSectionId) {
    recordSectionView(sessionId, currentActiveSectionId);
  }

  // Update engagement score
  session.engagementScore = calculateScore(session);
  saveTrackingSessions(sessions);
}

/**
 * Records when client scrolls to or views a specific feature section
 */
export function recordSectionView(sessionId: string, sectionId: string, sectionTitleAr?: string) {
  const sessions = getAllTrackingSessions();
  const session = sessions.find(s => s.sessionId === sessionId);
  if (!session) return;

  const sectionMap: Record<string, string> = {
    hero: 'مقدمة العرض والشعار',
    acrylic_stand: 'مجسم ستاند الأكريليك ثلاثي الأبعاد',
    logo_showcase: 'تحويل لافتة الشارع لشعار رقمي',
    social_frames: 'قوالب وبراويز السوشيال ميديا',
    content_plan: 'خطة محتوى الـ 30 يوماً',
    pricing_deal: 'باقة الأسعار والخصم الحصري',
    cta_bottom: 'زر الحجز والتواصل المباشر'
  };

  const title = sectionTitleAr || sectionMap[sectionId] || sectionId;
  const existing = session.viewedSections.find(s => s.sectionId === sectionId);

  if (existing) {
    existing.viewCount += 1;
    existing.timeSpentSeconds += 3;
  } else {
    session.viewedSections.push({
      sectionId,
      titleAr: title,
      viewCount: 1,
      timeSpentSeconds: 3
    });
  }

  session.engagementScore = calculateScore(session);
  saveTrackingSessions(sessions);
}

/**
 * Records client clicking the primary WhatsApp conversion CTA
 */
export function recordClientWhatsAppCta(sessionId: string) {
  const sessions = getAllTrackingSessions();
  const session = sessions.find(s => s.sessionId === sessionId);
  if (!session) return;

  session.whatsappCtaClicked = true;
  session.engagementScore = 'ultra';
  session.lastPingTime = new Date().toISOString();
  saveTrackingSessions(sessions);
}

function calculateScore(session: TrackingSession): 'low' | 'medium' | 'high' | 'ultra' {
  if (session.whatsappCtaClicked) return 'ultra';
  if (session.totalDurationSeconds > 120 || session.viewedSections.length >= 5) return 'high';
  if (session.totalDurationSeconds >= 25 || session.viewedSections.length >= 3) return 'medium';
  return 'low';
}

function getDemoTrackingSessions(): TrackingSession[] {
  return [
    {
      sessionId: 'sess_demo_1',
      pitchId: 'pitch_sultan',
      businessName: 'مطعم ومشويات السلطان الفاخرة',
      businessPhone: '01012345678',
      startTime: new Date(Date.now() - 140000).toISOString(),
      lastPingTime: new Date(Date.now() - 4000).toISOString(),
      totalDurationSeconds: 136,
      isLiveNow: true,
      deviceType: 'mobile',
      viewedSections: [
        { sectionId: 'hero', titleAr: 'مقدمة العرض والشعار', viewCount: 2, timeSpentSeconds: 25 },
        { sectionId: 'acrylic_stand', titleAr: 'مجسم ستاند الأكريليك ثلاثي الأبعاد', viewCount: 3, timeSpentSeconds: 50 },
        { sectionId: 'social_frames', titleAr: 'قوالب وبراويز السوشيال ميديا', viewCount: 2, timeSpentSeconds: 35 },
        { sectionId: 'pricing_deal', titleAr: 'باقة الأسعار والخصم الحصري', viewCount: 2, timeSpentSeconds: 26 }
      ],
      whatsappCtaClicked: true,
      engagementScore: 'ultra'
    },
    {
      sessionId: 'sess_demo_2',
      pitchId: 'pitch_rostico',
      businessName: 'كافيه روستيكو للقهوة المختصة',
      businessPhone: '01123456789',
      startTime: new Date(Date.now() - 3600000).toISOString(),
      lastPingTime: new Date(Date.now() - 3550000).toISOString(),
      totalDurationSeconds: 50,
      isLiveNow: false,
      deviceType: 'mobile',
      viewedSections: [
        { sectionId: 'hero', titleAr: 'مقدمة العرض والشعار', viewCount: 1, timeSpentSeconds: 15 },
        { sectionId: 'acrylic_stand', titleAr: 'مجسم ستاند الأكريليك ثلاثي الأبعاد', viewCount: 1, timeSpentSeconds: 20 },
        { sectionId: 'content_plan', titleAr: 'خطة محتوى الـ 30 يوماً', viewCount: 1, timeSpentSeconds: 15 }
      ],
      whatsappCtaClicked: false,
      engagementScore: 'medium'
    }
  ];
}
