/**
 * Kompresi gambar menggunakan Canvas
 * @param base64Str - String gambar asli dalam format Base64
 * @param maxWidth - Lebar maksimal (Rekomendasi A4: 1200px - 1500px)
 * @param quality - Kualitas kompresi (0.1 hingga 1.0)
 */
const compressImage = (base64Str: string, maxWidth = 1200, quality = 0.7): Promise<string> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = base64Str;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;

      // Logika resize proporsional
      if (width > maxWidth) {
        height = (maxWidth / width) * height;
        width = maxWidth;
      }

      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      ctx?.drawImage(img, 0, 0, width, height);

      // Export sebagai JPEG karena jauh lebih ringan daripada PNG untuk foto
      const compressedBase64 = canvas.toDataURL('image/jpeg', quality);
      resolve(compressedBase64);
    };
  });
};