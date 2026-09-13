export interface DalilakBusiness {
  id: string;
  name_ar: string;
  name_en?: string;
  category?: string;
  governorate?: string;
  city?: string;
  street?: string;
  landmark?: string;
  phone: string;
  secondary_phone?: string;
  working_hours?: string;
  description?: string;
  lat?: number;
  lng?: number;
  owner_name?: string;
  owner_phone?: string;
  photos?: (string | { url: string; caption?: string })[];
  google_maps_url?: string;
  google_place_id?: string;
  verification_status?: 'verified' | 'in_progress' | 'pending' | string;
  notes?: string | Record<string, any>;
  invoice_number?: string;
  created_at?: string;
}

export type MarketingTone = 
  | 'friendly_baladi'     // أسلوب ودي بلدي (عشم وجدعنة وترحاب مصري أصيل)
  | 'luxury_prestigious'  // أسلوب راقٍ وفخم (VIP ووجاهة وأناقة)
  | 'urgent_enthusiastic' // أسلوب عروض ناري وحماسي (قنبلة التوفير والحق قبل النفاذ)
  | 'witty_smart'         // أسلوب ذكي وفرفوش (خفة دم وتفاعل شبابي ترند)
  | 'professional_direct';// أسلوب احترافي ومباشر (ثقة وأرقام وضمان وجودة)

export type ContentPillarType = 
  | 'engagement'    // المحتوى التفاعلي والتوعوي والمسابقات
  | 'showcase'      // استعراض جودة المنتجات والخدمات وكواليس العمل
  | 'offers'        // عروض وتخفيضات وباقات قوية مع CTA حاسم
  | 'social_proof'; // آراء العملاء، التقييمات، وقصص النجاح وبناء الثقة

export interface MarketingPersona {
  businessName: string;
  category: string;
  slogan: string;
  brandVoice: string;
  toneOfVoice: MarketingTone;
  targetAudience: {
    demographics: string;
    painPoints: string[];
    desires: string[];
  };
  uniqueSellingProposition: string;
  recommendedPostingSchedule: string;
  suggestedColors: {
    primary: string;
    secondary: string;
    accent: string;
  };
}

export interface ContentCalendarDay {
  day: number;
  pillar: ContentPillarType;
  pillarTitle: string;
  headline: string;
  hookText: string;
  bodyText: string;
  callToAction: string;
  visualDirection: string;
  hashtags: string[];
  bestTimeToPost: string;
  isCompleted?: boolean;
}

export interface ReadySocialPost {
  id: string;
  platform: 'facebook' | 'instagram' | 'tiktok' | 'threads' | 'promo' | 'general' | string;
  title: string;
  badge: string;
  content: string;
  hashtags: string[];
  imageIdea: string;
  accent?: string;
}

export interface WhatsAppCampaign {
  id: string;
  title: string;
  categoryTag: string;
  targetAudience: string;
  messageText: string;
  intendedGoal: string;
}

export interface EcosystemActivityProgress {
  businessId: string;
  businessName: string;
  lastUpdated: string;
  persona: MarketingPersona | null;
  calendar: ContentCalendarDay[];
  readyPosts: ReadySocialPost[];
  whatsappCampaigns: WhatsAppCampaign[];
  isPromotedToCore: boolean;
  promotedAt?: string;
  notes?: string;
  source?: 'gemini-ai' | 'smart-egyptian-engine';
  errorDetails?: string;
  modelUsed?: string;
}

export interface ServerConfig {
  coreUrl: string;
  coreKey: string;
  ecosystemUrl: string;
  ecosystemKey: string;
  geminiKey: string;
}

export interface WatermarkSettings {
  enabled: boolean;
  text: string;
  secondaryText: string;
  opacity: number; // 0.05 to 0.45
  angle: number; // -45 to 45
  fontSize: number;
  density: 'sparse' | 'medium' | 'dense';
  blockRightClick: boolean;
  blockKeyboardShortcuts: boolean;
  blurOnWindowBlur: boolean;
}

export interface DeliverableItem {
  id: string;
  title: string;
  description: string;
  iconName: string;
  isLockedHighRes: boolean;
  badge?: string;
}

export interface SocialMockupItem {
  id: string;
  headline: string;
  caption: string;
  accent: string;
  tag: string;
  imageUrl?: string;
}

export interface ContentPlanItem {
  day: number;
  pillar: string;
  title: string;
  hook: string;
  callToAction: string;
}

export interface AcrylicStandConfig {
  material: 'gold' | 'silver' | 'crystal';
  qrTargetUrl: string;
  nfcEnabled: boolean;
  tagline: string;
  subtext: string;
}

export interface LinkSectionVisibility {
  acrylicStand: boolean;
  logoTransformation: boolean;
  socialFrames: boolean;
  contentPlan: boolean;
  pricingDeal: boolean;
  countdownTimer: boolean;
  whatsappCta: boolean;
  growthMetrics: boolean;
}

export interface LinkSettings {
  viewMode: 'full' | 'images_only' | 'stand_only';
  customSlug?: string;
  expiresHours: number;
  pinCode?: string;
  sectionsVisible: LinkSectionVisibility;
}

export interface PitchPackage {
  id: string;
  businessId: string;
  business: DalilakBusiness;
  clientToken: string;
  themeColor: 'amber' | 'emerald' | 'blue' | 'purple' | 'rose';
  headline: string;
  subheadline: string;
  packageName: string;
  originalPrice: number;
  discountedPrice: number;
  currency: string;
  discountExpiresHours: number;
  guaranteeText: string;
  deliverables: DeliverableItem[];
  visualAssets: {
    logoType: 'vector' | 'signboard' | 'hybrid';
    logoDataUrl?: string;
    catalogDataUrl?: string;
    promoOfferDataUrl?: string;
    signboardPhotoUrl?: string;
    socialMockupPosts: SocialMockupItem[];
    contentPlanSnippet: ContentPlanItem[];
    acrylicStand: AcrylicStandConfig;
  };
  marketingData?: {
    persona?: MarketingPersona | null;
    calendar?: ContentCalendarDay[];
    readyPosts?: ReadySocialPost[];
    whatsappCampaigns?: WhatsAppCampaign[];
    isSyncedFromPhase1?: boolean;
    syncedAt?: string;
  };
  linkSettings: LinkSettings;
  watermarkSettings: WatermarkSettings;
  status: 'draft' | 'ready' | 'viewed' | 'negotiating' | 'promoted';
  createdAt: string;
  updatedAt: string;
}

export interface SectionViewStat {
  sectionId: string;
  titleAr: string;
  viewCount: number;
  timeSpentSeconds: number;
}

export interface TrackingSession {
  sessionId: string;
  pitchId: string;
  businessName: string;
  businessPhone: string;
  startTime: string;
  lastPingTime: string;
  totalDurationSeconds: number;
  isLiveNow: boolean;
  deviceType: 'mobile' | 'desktop' | 'tablet';
  viewedSections: SectionViewStat[];
  whatsappCtaClicked: boolean;
  engagementScore: 'low' | 'medium' | 'high' | 'ultra';
  notes?: string;
}

export interface PromoteLeadPayload {
  businessId: string;
  packageSelected: string;
  invoiceNumber: string;
  finalPrice: number;
  representativeName: string;
  clientConfirmationPhone: string;
  unwatermarkedAssetsReady: boolean;
  notes: string;
  promotedAt: string;
}
