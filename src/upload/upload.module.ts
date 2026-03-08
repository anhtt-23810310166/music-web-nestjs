import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { CloudinaryService } from './cloudinary.service';
import { UploadController } from './upload.controller';

@Module({
  imports: [
    MulterModule.register({
      storage: memoryStorage(), // Store in memory for streaming to Cloudinary
    }),
  ],
  controllers: [UploadController],
  providers: [CloudinaryService],
  exports: [CloudinaryService], // Export for use in other modules
})
export class UploadModule {}
