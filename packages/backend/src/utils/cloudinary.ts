import cloudinary, {
  productImageTransformations,
} from '../config/cloudinary.js';
import { Readable } from 'stream';
import sharp from 'sharp';
import fs from 'fs/promises';
import path from 'path';

const ALLOWED_FORMATS = ['jpg', 'jpeg', 'png', 'webp'];
const MIN_DIMENSIONS = { width: 200, height: 200 };

interface ImageValidationResult {
  isValid: boolean;
  error?: string;
}

export const validateImage = async (
  file: Express.Multer.File
): Promise<ImageValidationResult> => {
  try {
    const metadata = await sharp(file.buffer).metadata();

    if (
      !metadata.width ||
      !metadata.height ||
      metadata.width < MIN_DIMENSIONS.width ||
      metadata.height < MIN_DIMENSIONS.height
    ) {
      return {
        isValid: false,
        error: `Image dimensions must be at least ${MIN_DIMENSIONS.width}x${MIN_DIMENSIONS.height}`,
      };
    }

    return { isValid: true };
  } catch (error) {
    return {
      isValid: false,
      error: `Image validation failed: ${(error as Error).message}`,
    };
  }
};

export const uploadImage = async (
  file: Express.Multer.File
): Promise<string> => {
  const validation = await validateImage(file);
  if (!validation.isValid) {
    throw new Error(`Image upload failed: ${validation.error}`);
  }

  return await new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        ...productImageTransformations,
        resource_type: 'image',
      },
      (error, result) => {
        if (error) return reject(new Error(`Upload failed: ${error.message}`));
        if (!result?.secure_url)
          return reject(new Error('Upload failed: No secure URL returned'));
        resolve(result.secure_url);
      }
    );

    Readable.from(file.buffer)
      .pipe(stream)
      .on('error', (err) => reject(new Error(`Stream error: ${err.message}`)));
  });
};

export const uploadImages = async (
  files: Express.Multer.File[]
): Promise<string[]> => {
  const uploadPromises = files.map((file) => uploadImage(file));
  const res = await Promise.all(uploadPromises);
  return res;
};

export const deleteImage = async (publicId: string): Promise<void> => {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    throw new Error(`Image deletion failed: ${(error as Error).message}`);
  }
};

export const uploadImagesFromLocal = async (
  directoryPath: string
): Promise<string[]> => {
  try {
    const files = await fs.readdir(directoryPath);
    const imageFiles = files.filter((file) =>
      ALLOWED_FORMATS.includes(path.extname(file).slice(1).toLowerCase())
    );

    if (imageFiles.length === 0) {
      console.warn('No valid image files found in directory');
      return [];
    }

    let uploadedImages = [];

    for (const file of imageFiles) {
      const filePath = path.join(directoryPath, file);

      const result = await cloudinary.uploader.upload(filePath, {
        ...productImageTransformations,
        resource_type: 'image',
      });
      uploadedImages.push(result.secure_url);
    }
    return uploadedImages;
  } catch (error) {
    console.error('uploadImagesFromLocal error:', (error as Error).message);
    throw new Error(`Failed to upload images: ${(error as Error).message}`);
  }
};

export const getPublicIdFromUrl = (url: string): string => {
  try {
    const parts = url.split('/');
    const fileName = parts[parts.length - 1];
    const publicId = `${productImageTransformations.folder}/${
      fileName.split('.')[0]
    }`;
    return publicId;
  } catch (error) {
    throw new Error(`Failed to extract public ID: ${(error as Error).message}`);
  }
};
