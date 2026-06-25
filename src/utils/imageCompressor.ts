/**
 * Utility to compress and resize images using HTML5 Canvas.
 * This ensures the base64 output size is well below Firestore's 1MB document limit,
 * while maintaining decent quality and high-speed loading.
 */
export function compressImage(
  base64Str: string,
  maxWidth = 600,
  maxHeight = 800,
  quality = 0.75
): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = base64Str;
    
    img.onload = () => {
      let width = img.width;
      let height = img.height;

      // Adjust dimensions while preserving aspect ratio
      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(base64Str); // fallback to original on failure
        return;
      }

      // Draw and compress
      ctx.drawImage(img, 0, 0, width, height);
      
      try {
        // Output as jpeg for superior compression
        const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(compressedDataUrl);
      } catch (e) {
        console.warn('Canvas toDataURL failed, falling back to original:', e);
        resolve(base64Str);
      }
    };

    img.onerror = (err) => {
      console.error('Failed to load image for compression:', err);
      resolve(base64Str); // fallback to original if image fails to load
    };
  });
}
