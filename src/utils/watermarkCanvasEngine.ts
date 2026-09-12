import { WatermarkSettings } from '../types';

export interface WatermarkOptions {
  primaryText?: string;
  secondaryText?: string;
  opacity?: number;
  angle?: number;
  fontSize?: number;
  density?: 'sparse' | 'medium' | 'dense';
}

/**
 * Loads an image from a URL, Base64, or Blob into an HTMLImageElement
 */
function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = (err) => reject(new Error('فشل تحميل الصورة لتطبيق العلامة المائية: ' + err));
    img.src = src;
  });
}

/**
 * Burns an unremovable repeating diagonal watermark directly into image pixels using HTML5 Canvas
 */
export async function stampWatermarkOnImage(
  imageSource: string,
  options?: WatermarkOptions
): Promise<{ dataUrl: string; blob: Blob; width: number; height: number }> {
  const img = await loadImage(imageSource);
  
  const canvas = document.createElement('canvas');
  const width = img.naturalWidth || img.width || 1024;
  const height = img.naturalHeight || img.height || 1024;
  
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Canvas 2D context is not supported in this browser.');
  }

  // 1. Draw the base original image
  ctx.drawImage(img, 0, 0, width, height);

  // 2. Prepare watermark parameters
  const primaryText = options?.primaryText || 'معاينة خاصة • غير مصرح بالنشر قبل التعاقد';
  const secondaryText = options?.secondaryText || 'منظومة دليلك • حقوق التصميم والتنفيذ محفوظة';
  const opacity = Math.min(Math.max(options?.opacity ?? 0.24, 0.08), 0.5);
  const angleDeg = options?.angle ?? -28;
  const angleRad = (angleDeg * Math.PI) / 180;

  // Responsive font scaling based on image width
  const baseFontSize = options?.fontSize || Math.max(Math.round(width / 32), 16);
  const density = options?.density || 'medium';

  // Step spacing between diagonal repetitions
  const stepX = density === 'dense' ? baseFontSize * 12 : density === 'sparse' ? baseFontSize * 22 : baseFontSize * 16;
  const stepY = density === 'dense' ? baseFontSize * 7 : density === 'sparse' ? baseFontSize * 12 : baseFontSize * 9;

  // 3. Draw Repeating Diagonal Watermark Grid
  ctx.save();
  ctx.globalAlpha = opacity;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // Large bounding diagonal to cover rotated space
  const diagonal = Math.sqrt(width * width + height * height);
  const centerX = width / 2;
  const centerY = height / 2;

  ctx.translate(centerX, centerY);
  ctx.rotate(angleRad);

  for (let y = -diagonal; y <= diagonal; y += stepY) {
    for (let x = -diagonal; x <= diagonal; x += stepX) {
      // Primary bold text
      ctx.font = "800 " + baseFontSize + "px 'Cairo', 'Segoe UI', Tahoma, sans-serif";
      ctx.fillStyle = '#0f172a'; // Deep navy
      ctx.fillText(primaryText, x, y);

      // Subtle shadow / stroke effect for readability over any background
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = Math.max(1, Math.round(baseFontSize / 12));
      ctx.strokeText(primaryText, x, y);

      // Secondary warning text
      ctx.font = "700 " + Math.round(baseFontSize * 0.72) + "px 'Cairo', 'Segoe UI', Tahoma, sans-serif";
      ctx.fillStyle = '#dc2626'; // Alert Red
      ctx.fillText(secondaryText, x, y + baseFontSize * 0.9);
    }
  }

  ctx.restore();

  // 4. Subtle Border Shield Line
  ctx.save();
  ctx.strokeStyle = 'rgba(220, 38, 38, 0.45)';
  ctx.lineWidth = Math.max(4, Math.round(width / 150));
  ctx.strokeRect(8, 8, width - 16, height - 16);
  ctx.restore();

  // 5. Export Data URL & Blob
  const dataUrl = canvas.toDataURL('image/jpeg', 0.92);

  const blob: Blob = await new Promise((resolve) => {
    canvas.toBlob((b) => resolve(b || new Blob()), 'image/jpeg', 0.92);
  });

  return { dataUrl, blob, width, height };
}

/**
 * Triggers a direct browser file download for a watermarked dataUrl or Blob
 */
export function downloadWatermarkedImage(dataUrl: string, filename: string) {
  const a = document.createElement('a');
  a.href = dataUrl;
  a.download = filename.endsWith('.jpg') ? filename : filename + '.jpg';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

/**
 * Copies an image Blob to user's clipboard if supported
 */
export async function copyImageToClipboard(blob: Blob): Promise<boolean> {
  try {
    if (navigator.clipboard && (window as any).ClipboardItem) {
      const item = new (window as any).ClipboardItem({ [blob.type]: blob });
      await navigator.clipboard.write([item]);
      return true;
    }
  } catch (e) {
    console.warn('Clipboard image write not supported or failed:', e);
  }
  return false;
}
