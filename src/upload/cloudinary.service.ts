import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import { Readable } from 'stream';
import { parseBuffer } from 'music-metadata';

export type CloudinaryUploadResult = {
  url: string;
  publicId: string;
  format: string;
  bytes: number;
  duration?: number;
  metadata?: {
    title?: string;
    artist?: string;
    album?: string;
    year?: number;
  };
};

@Injectable()
export class CloudinaryService {
  private readonly logger = new Logger(CloudinaryService.name);

  constructor(private config: ConfigService) {
    cloudinary.config({
      cloud_name: this.config.get('CLOUDINARY_CLOUD_NAME'),
      api_key: this.config.get('CLOUDINARY_API_KEY'),
      api_secret: this.config.get('CLOUDINARY_API_SECRET'),
    });
  }

  generateSignature(folder: string) {
    const timestamp = Math.round(new Date().getTime() / 1000);
    const signature = cloudinary.utils.api_sign_request(
      {
        timestamp,
        folder,
      },
      this.config.get<string>('CLOUDINARY_API_SECRET')!,
    );

    return {
      signature,
      timestamp,
      cloudName: this.config.get<string>('CLOUDINARY_CLOUD_NAME'),
      apiKey: this.config.get<string>('CLOUDINARY_API_KEY'),
    };
  }

  async uploadImage(
    file: Express.Multer.File,
    folder = 'music-app/images',
  ): Promise<CloudinaryUploadResult> {
    return this.upload(file, {
      folder,
      resource_type: 'image',
    });
  }

  async uploadAudio(
    file: Express.Multer.File,
    folder = 'music-app/audio',
  ): Promise<CloudinaryUploadResult> {
    // Extract metadata from audio file
    let audioMetadata: { duration?: number; title?: string; artist?: string } =
      {};
    try {
      const metadata = await parseBuffer(file.buffer, {
        mimeType: file.mimetype,
      });
      audioMetadata = {
        duration: metadata.format.duration,
        title: metadata.common.title,
        artist: metadata.common.artist,
      };
      this.logger.log(
        `Audio metadata extracted: duration=${audioMetadata.duration}s`,
      );
    } catch (error) {
      this.logger.warn(`Failed to extract audio metadata: ${error.message}`);
    }

    const uploadResult = await this.upload(file, {
      folder,
      resource_type: 'video', // Cloudinary uses 'video' for audio files
    });

    // Merge audio metadata with upload result
    return {
      ...uploadResult,
      duration: audioMetadata.duration || uploadResult.duration,
      metadata: {
        title: audioMetadata.title,
        artist: audioMetadata.artist,
      },
    };
  }

  async delete(
    publicId: string,
    resourceType: 'image' | 'video' = 'image',
  ): Promise<void> {
    await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
    });
  }

  private upload(
    file: Express.Multer.File,
    options: Record<string, unknown>,
  ): Promise<CloudinaryUploadResult> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        options,
        (error, result: UploadApiResponse | undefined) => {
          if (error || !result) {
            return reject(new Error(error?.message || 'Upload failed'));
          }
          resolve({
            url: result.secure_url,
            publicId: result.public_id,
            format: result.format,
            bytes: result.bytes,
            duration: result.duration as number | undefined,
          });
        },
      );

      const readable = new Readable();
      readable.push(file.buffer);
      readable.push(null);
      readable.pipe(uploadStream);
    });
  }
}
