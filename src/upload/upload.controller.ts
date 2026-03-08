import {
  Controller,
  Post,
  Get,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiBearerAuth, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CloudinaryService } from './cloudinary.service';

@ApiTags('upload')
@Controller('upload')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class UploadController {
  constructor(private cloudinary: CloudinaryService) {}

  @Get('signature')
  @Roles('ADMIN')
  getSignature(@Query('folder') folder?: string) {
    return this.cloudinary.generateSignature(folder || 'music-app/images');
  }

  @Post('image')
  @Roles('ADMIN')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
      },
    },
  })
  async uploadImage(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }), // 5MB
          new FileTypeValidator({ fileType: /image\/(jpeg|png|webp|gif)/i }),
        ],
      }),
    )
    file: Express.Multer.File,
  ) {
    const result = await this.cloudinary.uploadImage(file);
    return {
      message: 'Image uploaded successfully',
      data: result,
    };
  }

  @Post('audio')
  @Roles('ADMIN')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
      },
    },
  })
  async uploadAudio(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 20 * 1024 * 1024 }), // 20MB
          new FileTypeValidator({
            fileType: /audio\/(mpeg|wav|ogg|aac|mp4|x-m4a|mp3)/i,
          }),
        ],
      }),
    )
    file: Express.Multer.File,
  ) {
    const result = await this.cloudinary.uploadAudio(file);
    return {
      message: 'Audio uploaded successfully',
      data: result,
    };
  }
}
