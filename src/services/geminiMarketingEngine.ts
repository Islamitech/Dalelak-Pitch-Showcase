import {
  DalilakBusiness,
  MarketingPersona,
  MarketingTone,
  ReadySocialPost,
  SocialMockupItem,
} from '../types';
import {
  generateCategoryAwareLocalStrategy,
  MARKETING_TONES,
} from '../utils/egyptianDialectPrompts';
import { getAvailableGeminiKeys } from './dalilakService';

export const ACTIVE_GEMINI_MODELS = [
  'gemini-3.5-flash',
  'gemini-flash-latest',
  'gemini-3.6-flash',
  'gemini-flash-lite-latest',
];

export interface GeneratePostOptions {
  business: DalilakBusiness;
  platform: 'facebook' | 'instagram' | 'tiktok' | 'promo' | 'general';
  tone: MarketingTone;
  customTopic?: string;
}

export interface GeneratedPostResult {
  post: ReadySocialPost;
  mockupItem: SocialMockupItem;
  source: 'gemini-ai' | 'smart-egyptian-engine';
  modelUsed?: string;
}

/**
 * Calls Google Gemini REST API with timeout and fast JSON response
 */
async function callGeminiRestApi(
  apiKey: string,
  model: string,
  prompt: string,
  timeoutMs = 30000
): Promise<{ text: string | null; error?: string }> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.75,
          responseMimeType: 'application/json',
          maxOutputTokens: 2048,
          thinkingConfig: {
            thinkingBudget: 0,
          },
        },
      }),
      signal: controller.signal,
    });

    clearTimeout(timer);
    if (!res.ok) {
      const errBody = await res.text();
      return { text: null, error: `HTTP ${res.status}: ${errBody.slice(0, 100)}` };
    }

    const data = await res.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || null;
    return { text, error: text ? undefined : 'No text response from model' };
  } catch (e: any) {
    clearTimeout(timer);
    return { text: null, error: e.message || String(e) };
  }
}

/**
 * Directly generates high-converting marketing posts for any business
 */
export async function generateDirectMarketingPost(
  options: GeneratePostOptions
): Promise<GeneratedPostResult> {
  const biz = options.business;
  const businessName = biz.name_ar || biz.name_en || 'النشاط التجاري';
  const category = biz.category || 'خدمات وأعمال عامة';
  const city = biz.city || biz.governorate || 'مصر';
  const toneDef = MARKETING_TONES.find(t => t.id === options.tone) || MARKETING_TONES[0];

  const availableKeys = getAvailableGeminiKeys();

  if (availableKeys.length > 0) {
    const prompt = `
أنت كبير كتاب الإعلانات والتسويق الرقمي لمنظومة "دليلك" المتخصصة في السوق المصري.
المهمة: كتابة منشور تسويقي إبداعي جذاب ومبهر لـ "${businessName}" في "${city}"، التخصص: "${category}".
المنصة المستهدفة: "${options.platform}".
نبرة الصوت المطلوبة: "${toneDef.name}" - ${toneDef.description}.
موضوع أو فكرة إضافية: ${options.customTopic || 'إبراز جودة النشاط وخدماته المتميزة وعرض حصري أو تقييمات العملاء'}.

قواعد النشر:
1. اكتب باللهجة المصرية الحقيقية الأنيقة (بدون فصحى مصطنعة وبدون ابتذال).
2. ابدأ بجملة افتتاحية (Hook) تخطف العين فوراً في أول سطرين.
3. ضع تفاصيل القيمة الحقيقية للعميل.
4. أنهِ المنشور بطلب إجراء واضح (Call To Action - CTA) مثل التواصل أو الزيارة أو الواتساب.
5. اقترح فكرة تصميم بصرية مناسبة لوضعها في قالب إعلاني مميز.
6. اقترح 4 إلى 6 هاشتاجات متداولة في مصر لمجال النشاط.

أجب بصيغة JSON فقط:
{
  "title": "عنوان قصير وجذاب للمنشور",
  "badge": "${getPlatformBadge(options.platform)}",
  "content": "نص المنشور الكامل بالعامية المصرية...",
  "hashtags": ["#دليلك", "#..."],
  "imageIdea": "فكرة التصميم المقترح...",
  "shortHeadline": "مانشيت تسويقي قصير من 5 إلى 8 كلمات يوضع داخل الصورة كعنوان رئيسي",
  "accentColor": "amber"
}
`.trim();

    for (const key of availableKeys) {
      for (const model of ACTIVE_GEMINI_MODELS) {
        try {
          const { text, error } = await callGeminiRestApi(key, model, prompt, 25000);
          if (error || !text) continue;

          let cleaned = text.trim();
          if (cleaned.startsWith('```json')) cleaned = cleaned.slice(7);
          if (cleaned.startsWith('```')) cleaned = cleaned.slice(3);
          if (cleaned.endsWith('```')) cleaned = cleaned.slice(0, -3);
          cleaned = cleaned.trim();

          const parsed = JSON.parse(cleaned);
          if (parsed?.content) {
            const readyPost: ReadySocialPost = {
              id: `post_${Date.now()}`,
              platform: options.platform,
              title: parsed.title || `منشور ${businessName}`,
              badge: parsed.badge || getPlatformBadge(options.platform),
              content: parsed.content,
              hashtags: Array.isArray(parsed.hashtags) ? parsed.hashtags : ['#دليلك'],
              imageIdea: parsed.imageIdea || 'تصميم بمنتجات النشاط داخل برواز دليلك',
              accent: parsed.accentColor || 'amber',
            };

            const mockupItem: SocialMockupItem = {
              id: `mockup_${Date.now()}`,
              headline: parsed.shortHeadline || parsed.title || `الجودة والتميز مع ${businessName}`,
              caption: parsed.content.slice(0, 160) + '...',
              accent: parsed.accentColor || 'amber',
              tag: getPlatformTag(options.platform),
            };

            return {
              post: readyPost,
              mockupItem,
              source: 'gemini-ai',
              modelUsed: model,
            };
          }
        } catch (e) {
          // Fall through to next model
        }
      }
    }
  }

  // Fallback: Smart Egyptian local marketing engine
  const localStrategy = generateCategoryAwareLocalStrategy(
    businessName,
    category,
    city,
    options.tone,
    biz.description
  );

  const fallbackPost = localStrategy.readyPosts[0] || {
    id: `post_local_${Date.now()}`,
    platform: options.platform,
    title: `أفضل تجربة مع «${businessName}» في ${city}`,
    badge: getPlatformBadge(options.platform),
    content: `التفاصيل دايماً بتصنع الفرق.. ومع ${businessName} بنقدملك أحسن جودة وأعلى مستوى خدمة في ${city}. شرفنا بالزيارة أو تواصل معنا واستمتع بالفرق بنفسك!`,
    hashtags: ['#دليلك', `#${businessName.replace(/\s+/g, '_')}`, `#${city}`],
    imageIdea: 'صورة الواجهة أو المنتجات داخل إطار دليلك المعتمد',
  };

  const mockupItem: SocialMockupItem = {
    id: `mockup_local_${Date.now()}`,
    headline: `أعلى جودة في ${city}.. التجربة خير برهان! ✨`,
    caption: fallbackPost.content.slice(0, 150) + '...',
    accent: 'amber',
    tag: getPlatformTag(options.platform),
  };

  return {
    post: fallbackPost,
    mockupItem,
    source: 'smart-egyptian-engine',
  };
}

function getPlatformBadge(platform: string): string {
  switch (platform) {
    case 'facebook': return '📘 فيسبوك';
    case 'instagram': return '📸 إنستغرام';
    case 'tiktok': return '🎵 تيك توك / ريلز';
    case 'promo': return '🔥 عروض وتخفيضات';
    default: return '📱 منشور سوشيال ميديا';
  }
}

function getPlatformTag(platform: string): string {
  switch (platform) {
    case 'facebook': return 'منشور فيسبوك';
    case 'instagram': return 'إنستغرام مميز';
    case 'tiktok': return 'فيديو وريلز';
    case 'promo': return 'عرض خاص';
    default: return 'سوشيال ميديا';
  }
}
