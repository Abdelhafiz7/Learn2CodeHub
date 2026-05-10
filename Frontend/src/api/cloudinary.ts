const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

export const uploadToCloudinary = async (
  file: File,
  onProgress?: (progress: number) => void
): Promise<string> => {

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', PRESET);
  formData.append('folder', 'course-files');

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    xhr.open(
      'POST',

      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/auto/upload`
    );

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable && onProgress) {
        const percent = Math.round((event.loaded / event.total) * 100);
        onProgress(percent);
      }
    };

    xhr.onload = () => {
      if (xhr.status === 200) {
        const data = JSON.parse(xhr.responseText);
        console.log('Uploaded:', data);
        resolve(data.secure_url);
      } else {
        const err = JSON.parse(xhr.responseText);
        console.error('Cloudinary error:', err.error?.message);
        reject(new Error(err?.error?.message || 'Upload failed'));
      }
    };

    xhr.onerror = () => reject(new Error('Upload error'));

    xhr.send(formData);
  });
};