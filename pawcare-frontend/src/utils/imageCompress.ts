/**
 * Compresses/resizes large smartphone camera images to a clean JPEG under ~1600px
 * so mobile camera uploads never fail the 10 MB backend upload limit and OCR runs fast.
 */
export async function prepareCameraImage(file: File, maxDimension = 1600, quality = 0.86): Promise<File> {
  // If already a small, standard web image (< 2 MB) with standard MIME, keep as-is
  const standardMimes = ['image/jpeg', 'image/png', 'image/webp'];
  if (standardMimes.includes(file.type) && file.size <= 2 * 1024 * 1024) {
    return file;
  }

  return new Promise((resolve) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      let { width, height } = img;
      if (width > maxDimension || height > maxDimension) {
        if (width >= height) {
          height = Math.round((height * maxDimension) / width);
          width = maxDimension;
        } else {
          width = Math.round((width * maxDimension) / height);
          height = maxDimension;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(file);
        return;
      }

      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, width, height);
      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            resolve(file);
            return;
          }
          const baseName = (file.name || 'pet_photo').replace(/\.[^.]+$/, '');
          const converted = new File([blob], `${baseName}.jpg`, { type: 'image/jpeg' });
          resolve(converted);
        },
        'image/jpeg',
        quality
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(file);
    };

    img.src = objectUrl;
  });
}
