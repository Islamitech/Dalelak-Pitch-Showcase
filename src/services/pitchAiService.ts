import { GoogleGenAI } from '@google/genai';
import { DalilakBusiness } from '../types';
import { getBackupGeminiKey, getGeminiKey } from './dalilakService';

export const PRIMARY_PITCH_MODEL = 'gemini-3.6-flash';
export const FALLBACK_PITCH_MODELS = ['gemini-3.6-flash', 'gemini-3.7-flash', 'gemini-3.5-flash', 'gemini-flash-latest'];

/**
 * Call Gemini REST endpoint with candidate models
 */
async function callGeminiRest(apiKey: string, model: string, prompt: string): Promise<string | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 12000);

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.7,
        },
      }),
      signal: controller.signal,
    });

    clearTimeout(timer);
    if (!res.ok) return null;
    const data = await res.json();
    return data?.candidates?.[0]?.content?.parts?.[0]?.text || null;
  } catch {
    clearTimeout(timer);
    return null;
  }
}

/**
 * Generates an ultra-compelling personalized Egyptian WhatsApp message for pitching protected visual assets to the business owner
 */
export async function generateSmartWhatsAppPitch(
  business: DalilakBusiness,
  assetType: 'logo' | 'catalog' | 'post' | 'offer' | 'full' = 'full',
  repName = 'أحمد كمال (مستشار التوثيق والتسويق)'
): Promise<string | null> {
  const primaryKey = getGeminiKey();
  const backupKey = getBackupGeminiKey();

  const bizName = business.name_ar || business.name_en || 'النشاط';
  const category = business.category || 'عام';
  const city = business.city || business.governorate || 'مصر';
  const ownerName = business.owner_name ? `أ/ ${business.owner_name}` : 'يا فندم';

  const assetTypeLabel = {
    logo: 'شعار وهوية بصرية رقمية فاخرة مستخلصة من واجهة محله',
    catalog: 'كاتالوج ومنيو منتجات رقمي أنيق',
    post: 'قوالب وبوستات سوشيال ميديا موحدة',
    offer: 'بانر عروض وباقات استثنائية',
    full: 'حقيبة عينات بصرية محمية كاملة (لوجو + بوست + ستاند + كتالوج)',
  }[assetType];

  const prompt = `
أنت كبير مسؤولي المبيعات الميدانية والتسويق في منصة دليلك 🇪🇬.
المطلوب: كتابة رسالة واتساب مصرية احترافية، راقية وذكية جداً، ومقنعة 100% موجهة لصاحب نشاط تجاري لإرسال صورة عينة بصرية محمية بالعلامة المائية له:

📌 بيانات النشاط:
- اسم المنشأة: "${bizName}"
- التصنيف: "${category}"
- المدينة/المنطقة: "${city}"
- صاحب النشاط: "${ownerName}"
- المندوب المرسل: "${repName}"
- نوع العينة المرفقة في الصورة: "${assetTypeLabel}"

🎯 قواعد الصياغة:
1. مخاطبة ودية ومحترمة باللهجة المصرية البيزنس (راقية ومقنعة بدون ابتذال).
2. الإشارة المباشرة إلى صورة العينة المرفقة ("زي ما حضرتك شايف في الصورة المرفقة..").
3. توضيح أن العينة عليها علامة مائية للمعاينة فقط لحفظ حقوق العمل حتى التعاقد الرسمي.
4. إبراز القيمة المضافة لنشاطه بالتحديد في ${city}، ودور منصة دليلك في مضاعفة زبائنه وتصدره.
5. نداء عمل واضح ومحفز للرد وتحديد موعد تسليم ستاند الأكريليك أو البدء.
6. لا تضع أي مقدمات، أخرج فقط نص الرسالة الجاهزة للإرسال على واتساب مباشرة مع الإيموجي المناسب.
`;

  const keysToTry = [primaryKey, backupKey].filter(Boolean);

  for (const key of keysToTry) {
    // 1. Try GoogleGenAI SDK
    try {
      const ai = new GoogleGenAI({ apiKey: key });
      const response = await ai.models.generateContent({
        model: PRIMARY_PITCH_MODEL,
        contents: prompt,
      });
      if (response.text && response.text.trim().length > 30) {
        return response.text.trim();
      }
    } catch (sdkErr: any) {
      console.warn('SDK failed with', PRIMARY_PITCH_MODEL, sdkErr?.message);
    }

    // 2. Try REST with fallback models
    for (const model of FALLBACK_PITCH_MODELS) {
      const text = await callGeminiRest(key, model, prompt);
      if (text && text.trim().length > 30) {
        return text.trim();
      }
    }
  }

  return null;
}
