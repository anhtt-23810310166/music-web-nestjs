import { IsOptional, IsString, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateSongDto {
  @ApiProperty({ example: 'Em Của Ngày Hôm Qua' })
  @IsString()
  title: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  avatar?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 'https://s3.../song.mp3' })
  @IsString()
  audio: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  lyrics?: string;

  @ApiPropertyOptional()
  @IsOptional()
  singerId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  topicId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  duration?: number;

  @ApiPropertyOptional()
  @IsOptional()
  position?: number;

  @ApiPropertyOptional({ enum: ['ACTIVE', 'INACTIVE'] })
  @IsOptional()
  @IsEnum(['ACTIVE', 'INACTIVE'])
  status?: string;
}

export class UpdateSongDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  avatar?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  audio?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  lyrics?: string;

  @ApiPropertyOptional()
  @IsOptional()
  singerId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  topicId?: string;

  @ApiPropertyOptional({ enum: ['ACTIVE', 'INACTIVE'] })
  @IsOptional()
  @IsEnum(['ACTIVE', 'INACTIVE'])
  status?: string;

  @ApiPropertyOptional()
  @IsOptional()
  duration?: number;

  @ApiPropertyOptional()
  @IsOptional()
  position?: number;
}
