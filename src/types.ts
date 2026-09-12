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

export interface WatermarkSettings {
  enabled: boolean;
  text: string;
  secondaryText: string;
  opacity: number; // 0.05 to 0.4
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
    persona?: any;
    calendar?: any[];
    readyPosts?: any[];
    whatsappCampaigns?: WhatsAppCampaignItem[];
  };
  watermarkSettings: WatermarkSettings;
  status: 'draft' | 'ready' | 'viewed' | 'negotiating' | 'promoted';
  createdAt: string;
  updatedAt: string;
}

export interface WhatsAppCampaignItem {
  id?: string;
  type?: string;
  title: string;
  goal?: string;
  audience?: string;
  messageText: string;
}

export interface EcosystemActivitySummary {
  business_id: string;
  business_name: string;
  category?: string;
  city?: string;
  phone?: string;
  persona?: any;
  calendar?: any[];
  ready_posts?: any[];
  whatsapp_campaigns?: any[];
  is_promoted_to_core?: boolean;
  updated_at?: string;
  hasMarketing: boolean;
  hasVisual: boolean;
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
