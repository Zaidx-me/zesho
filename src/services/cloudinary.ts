const CLOUD_NAME = 'dcs8nycyc';
const UPLOAD_PRESET = 'zesho_unsigned';

export async function uploadPdfToCloudinary(
  uri: string,
  fileName: string,
  onProgress?: (progress: number) => void
): Promise<string | null> {
  try {
    const formData = new FormData();
    formData.append('file', {
      uri,
      type: 'application/pdf',
      name: fileName,
    } as any);
    formData.append('upload_preset', UPLOAD_PRESET);
    formData.append('folder', 'zesho_books');
    // Explicitly mark as raw so Cloudinary doesn't try to process it as an image
    formData.append('resource_type', 'raw');

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/raw/upload`,
      {
        method: 'POST',
        body: formData,
        headers: { 'X-Requested-With': 'XMLHttpRequest' },
      }
    );

    const data = await response.json();
    if (data.secure_url) {
      onProgress?.(100);
      return data.secure_url;
    }

    const errMsg = data.error?.message || JSON.stringify(data);
    console.error('Cloudinary error:', errMsg);
    throw new Error(errMsg);
  } catch (error: any) {
    console.error('Cloudinary upload error:', error?.message || error);
    throw error;
  }
}
