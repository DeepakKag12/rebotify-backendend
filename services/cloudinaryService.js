import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Upload image buffer to Cloudinary
 * @param {Buffer} buffer - Image buffer from multer memory storage
 * @param {string} folder - Folder name in Cloudinary (default: 'listings')
 * @returns {Promise<string>} - Cloudinary URL
 */
export const uploadImageToCloudinary = async (buffer, folder = 'listings') => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: folder,
        resource_type: 'image',
        transformation: [
          { width: 1200, height: 1200, crop: 'limit' }, // Limit max size
          { quality: 'auto:good' }, // Auto optimize quality
          { fetch_format: 'auto' } // Auto format (webp for modern browsers)
        ]
      },
      (error, result) => {
        if (error) {
          console.error('Cloudinary upload error:', error);
          reject(error);
        } else {
          console.log('Image uploaded to Cloudinary:', result.secure_url);
          resolve(result.secure_url);
        }
      }
    );
    
    uploadStream.end(buffer);
  });
};

/**
 * Upload multiple images to Cloudinary
 * @param {Array<Buffer>} buffers - Array of image buffers
 * @param {string} folder - Folder name in Cloudinary
 * @returns {Promise<Array<string>>} - Array of Cloudinary URLs
 */
export const uploadMultipleImagesToCloudinary = async (buffers, folder = 'listings') => {
  try {
    const uploadPromises = buffers.map(buffer => uploadImageToCloudinary(buffer, folder));
    const urls = await Promise.all(uploadPromises);
    return urls;
  } catch (error) {
    console.error('Error uploading multiple images:', error);
    throw error;
  }
};

/**
 * Delete image from Cloudinary by URL
 * @param {string} imageUrl - Cloudinary image URL
 * @returns {Promise<void>}
 */
export const deleteImageFromCloudinary = async (imageUrl) => {
  try {
    // Extract public_id from URL
    // URL format: https://res.cloudinary.com/cloud_name/image/upload/v1234567890/folder/public_id.jpg
    const urlParts = imageUrl.split('/');
    const publicIdWithExtension = urlParts.slice(-2).join('/'); // folder/public_id.jpg
    const publicId = publicIdWithExtension.split('.')[0]; // folder/public_id
    
    const result = await cloudinary.uploader.destroy(publicId);
    console.log('Image deleted from Cloudinary:', result);
    return result;
  } catch (error) {
    console.error('Error deleting image from Cloudinary:', error);
    throw error;
  }
};

/**
 * Delete multiple images from Cloudinary
 * @param {Array<string>} imageUrls - Array of Cloudinary image URLs
 * @returns {Promise<void>}
 */
export const deleteMultipleImagesFromCloudinary = async (imageUrls) => {
  try {
    const deletePromises = imageUrls.map(url => deleteImageFromCloudinary(url));
    await Promise.all(deletePromises);
  } catch (error) {
    console.error('Error deleting multiple images:', error);
    // Don't throw - just log, so main operation isn't blocked
  }
};

export default {
  uploadImageToCloudinary,
  uploadMultipleImagesToCloudinary,
  deleteImageFromCloudinary,
  deleteMultipleImagesFromCloudinary,
};
