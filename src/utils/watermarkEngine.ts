import { WatermarkSettings } from '../types';

/**
 * Generates an SVG Data URL containing a repeating diagonal pattern of watermark text
 */
export function generateWatermarkPatternSvg(settings: WatermarkSettings): string {
  const primaryText = escapeXml(settings.text || 'معاينة خاصة • دليلك للمنظومة الذكية');
  const secondaryText = escapeXml(settings.secondaryText || 'عينة مؤمنة ضد الاستخدام قبل التعاقد');
  // High-visibility opacity (0.38 - 0.75) so it is impossible to miss on any background
  const opacity = Math.min(Math.max(settings.opacity || 0.42, 0.30), 0.80);
  const angle = settings.angle || -26;
  const fontSize = settings.fontSize || 14;

  let patternWidth = 320;
  let patternHeight = 180;

  if (settings.density === 'sparse') {
    patternWidth = 420;
    patternHeight = 240;
  } else if (settings.density === 'dense') {
    patternWidth = 240;
    patternHeight = 140;
  }

  const svgString = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${patternWidth}" height="${patternHeight}">
      <style>
        .wm-badge { fill: rgba(220, 38, 38, 0.08); stroke: rgba(220, 38, 38, 0.35); stroke-width: 1px; rx: 8px; }
        .wm-main { 
          fill: #dc2626; 
          stroke: #ffffff; 
          stroke-width: 1.6px; 
          paint-order: stroke fill;
          font-family: 'Cairo', system-ui, sans-serif; 
          font-weight: 900; 
          font-size: ${fontSize}px; 
        }
        .wm-sub { 
          fill: #0f172a; 
          stroke: #ffffff; 
          stroke-width: 1.3px; 
          paint-order: stroke fill;
          font-family: 'Cairo', system-ui, sans-serif; 
          font-weight: 800; 
          font-size: ${Math.max(fontSize - 3, 11)}px; 
        }
      </style>
      <g transform="rotate(${angle} ${patternWidth / 2} ${patternHeight / 2})" opacity="${opacity}">
        <rect x="5%" y="15%" width="90%" height="70%" class="wm-badge" />
        <text x="50%" y="43%" text-anchor="middle" class="wm-main">🔒 ${primaryText}</text>
        <text x="50%" y="68%" text-anchor="middle" class="wm-sub">⚠️ ${secondaryText}</text>
      </g>
    </svg>
  `.trim();

  return `data:image/svg+xml;utf8,${encodeURIComponent(svgString)}`;
}

/**
 * Attaches anti-theft defense event listeners (blocking right click, print, copy shortcuts)
 */
export function attachAntiTheftDefense(settings: WatermarkSettings): () => void {
  if (!settings.enabled) return () => {};

  const handleContextMenu = (e: MouseEvent) => {
    if (settings.blockRightClick) {
      e.preventDefault();
      showDefenseToast('⚠️ هذا المحتوى محمي بحقوق الملكية الفكرية لمنظومة دليلك');
    }
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (!settings.blockKeyboardShortcuts) return;

    // Block Ctrl+S (Save), Ctrl+P (Print), Ctrl+U (View Source)
    if ((e.ctrlKey || e.metaKey) && (e.key === 's' || e.key === 'p' || e.key === 'u' || e.key === 'S' || e.key === 'P' || e.key === 'U')) {
      e.preventDefault();
      showDefenseToast('🔒 خاصية الحفظ والطباعة مقفلة للعينات غير المعتمدة');
    }

    // Block PrintScreen
    if (e.key === 'PrintScreen') {
      showDefenseToast('🛡️ تم تفعيل علامة الحماية المائية على كامل الشاشة');
    }
  };

  const handleDragStart = (e: DragEvent) => {
    e.preventDefault();
  };

  document.addEventListener('contextmenu', handleContextMenu, true);
  document.addEventListener('keydown', handleKeyDown, true);
  document.addEventListener('dragstart', handleDragStart, true);

  return () => {
    document.removeEventListener('contextmenu', handleContextMenu, true);
    document.removeEventListener('keydown', handleKeyDown, true);
    document.removeEventListener('dragstart', handleDragStart, true);
  };
}

let toastTimeout: any = null;
function showDefenseToast(message: string) {
  const existing = document.getElementById('anti-theft-toast');
  if (existing) existing.remove();
  if (toastTimeout) clearTimeout(toastTimeout);

  const toast = document.createElement('div');
  toast.id = 'anti-theft-toast';
  toast.style.position = 'fixed';
  toast.style.bottom = '24px';
  toast.style.left = '50%';
  toast.style.transform = 'translateX(-50%)';
  toast.style.backgroundColor = '#0f172a';
  toast.style.color = '#f8fafc';
  toast.style.padding = '12px 24px';
  toast.style.borderRadius = '9999px';
  toast.style.boxShadow = '0 10px 25px -5px rgba(0, 0, 0, 0.4)';
  toast.style.fontSize = '14px';
  toast.style.fontWeight = 'bold';
  toast.style.zIndex = '99999';
  toast.style.border = '1px solid #f59e0b';
  toast.style.fontFamily = 'Cairo, sans-serif';
  toast.style.pointerEvents = 'none';
  toast.innerText = message;

  document.body.appendChild(toast);
  toastTimeout = setTimeout(() => {
    toast.remove();
  }, 3000);
}

function escapeXml(unsafe: string): string {
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '\'': return '&apos;';
      case '"': return '&quot;';
      default: return c;
    }
  });
}
