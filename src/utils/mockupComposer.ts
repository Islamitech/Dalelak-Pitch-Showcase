import QRCode from 'qrcode';
import { AcrylicStandConfig, DalilakBusiness } from '../types';

/**
 * Generates an in-memory QR Code data URL for the acrylic stand
 */
export async function generateQrDataUrl(targetUrl: string): Promise<string> {
  try {
    const url = targetUrl && targetUrl.startsWith('http') 
      ? targetUrl 
      : 'https://maps.google.com';
    return await QRCode.toDataURL(url, {
      errorCorrectionLevel: 'H',
      margin: 1,
      width: 320,
      color: {
        dark: '#0f172a',
        light: '#ffffff'
      }
    });
  } catch (err) {
    console.error('QR generation error:', err);
    return '';
  }
}

/**
 * Returns color classes and gradient styles based on acrylic material
 */
export function getAcrylicMaterialStyles(material: 'gold' | 'silver' | 'crystal') {
  switch (material) {
    case 'gold':
      return {
        baseGradient: 'from-amber-600 via-amber-400 to-yellow-600',
        borderColor: 'border-amber-400/40',
        accentText: 'text-amber-600',
        glowColor: 'rgba(245, 158, 11, 0.25)',
        badgeBg: 'bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950',
        label: 'أكريليك ذهبي فاخر (VIP Gold)'
      };
    case 'silver':
      return {
        baseGradient: 'from-slate-500 via-slate-300 to-slate-600',
        borderColor: 'border-slate-300/50',
        accentText: 'text-slate-700',
        glowColor: 'rgba(148, 163, 184, 0.25)',
        badgeBg: 'bg-gradient-to-r from-slate-700 to-slate-900 text-white',
        label: 'أكريليك فضي تيتانيوم (Titanium Silver)'
      };
    case 'crystal':
    default:
      return {
        baseGradient: 'from-sky-400 via-cyan-200 to-blue-500',
        borderColor: 'border-sky-300/40',
        accentText: 'text-sky-600',
        glowColor: 'rgba(56, 189, 248, 0.25)',
        badgeBg: 'bg-gradient-to-r from-sky-500 to-blue-600 text-white',
        label: 'كريستال شفاف نقي (Pure Crystal)'
      };
  }
}

/**
 * Calculates estimated customer engagement jump
 */
export function calculateProjectedGrowth(category?: string) {
  const cat = (category || '').toLowerCase();
  if (cat.includes('مطعم') || cat.includes('كافيه') || cat.includes('طعام')) {
    return {
      reviewsPerMonth: '+85 تقييم حقيقي 5 نجوم شهرياً',
      googleViewsJump: '+320% زيادة ظهور في خرائط Google',
      walkinCustomers: '+18% زيادة زبائن الشارع الجدد'
    };
  }
  if (cat.includes('سيار') || cat.includes('صيان')) {
    return {
      reviewsPerMonth: '+45 تقييم معتمد من ملاك السيارات',
      googleViewsJump: '+280% تصدر بحث أقرب ورشة/مركز بالمنطقة',
      walkinCustomers: '+25% اتصالات وحجوزات مباشرة'
    };
  }
  return {
    reviewsPerMonth: '+60 تقييم معتمد وشهادة ثقة',
    googleViewsJump: '+250% ارتفاع ترتيبك فوق المنافسين',
    walkinCustomers: '+20% زوار جدد للمقر'
  };
}
