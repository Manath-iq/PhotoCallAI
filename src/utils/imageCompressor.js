/**
 * Compresses an image file to reduce its size for storage
 * @param {File|Blob} file - The image file to compress
 * @param {Object} options - Compression options
 * @param {Number} options.maxWidth - Maximum width of the compressed image
 * @param {Number} options.maxHeight - Maximum height of the compressed image
 * @param {Number} options.quality - JPEG quality (0-1)
 * @returns {Promise<string>} - Promise that resolves to a base64 data URL
 */
export const compressImage = async (
  file,
  { maxWidth = 800, maxHeight = 800, quality = 0.7 } = {}
) => {
  return new Promise((resolve, reject) => {
    // Create a FileReader to read the file
    const reader = new FileReader();
    
    // Set up FileReader callbacks
    reader.onload = (readerEvent) => {
      // Create an image element
      const img = new Image();
      
      img.onload = () => {
        // Calculate new dimensions while maintaining aspect ratio
        let width = img.width;
        let height = img.height;
        
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round(height * maxWidth / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round(width * maxHeight / height);
            height = maxHeight;
          }
        }
        
        // Create a canvas and resize the image
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        
        // Get the data URL (JPEG format with specified quality)
        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        
        resolve(dataUrl);
      };
      
      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };
      
      // Set the image source to the FileReader result
      img.src = readerEvent.target.result;
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    
    // Read the file as a data URL
    reader.readAsDataURL(file);
  });
};

/**
 * Estimates the size of a data URL in bytes
 * @param {string} dataUrl - The data URL string
 * @returns {number} - Estimated size in bytes
 */
export const estimateDataUrlSize = (dataUrl) => {
  // Remove the data URL prefix to get only the base64 data
  const base64 = dataUrl.split(',')[1];
  // Each base64 character represents 6 bits (3/4 byte)
  return Math.ceil(base64.length * 0.75);
};

/**
 * Checks if a data URL exceeds the specified size limit
 * @param {string} dataUrl - The data URL string
 * @param {number} maxSizeKB - Maximum size in kilobytes
 * @returns {boolean} - True if the data URL exceeds the size limit
 */
export const isDataUrlTooBig = (dataUrl, maxSizeKB = 500) => {
  const sizeInBytes = estimateDataUrlSize(dataUrl);
  const sizeInKB = sizeInBytes / 1024;
  return sizeInKB > maxSizeKB;
}; 