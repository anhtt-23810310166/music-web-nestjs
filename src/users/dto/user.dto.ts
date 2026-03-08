import {
  IsString,
  IsEmail,
  IsOptional,
  IsNotEmpty,
  MinLength,
  IsBoolean,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateProfileDto {
  @ApiPropertyOptional({ description: 'Full name' })
  @IsString()
  @IsOptional()
  fullName?: string;

  @ApiPropertyOptional({ description: 'Avatar URL' })
  @IsString()
  @IsOptional()
  avatar?: string;

  @ApiPropertyOptional({ description: 'Phone number' })
  @IsString()
  @IsOptional()
  phone?: string;
}

export class ChangePasswordDto {
  @ApiProperty({ description: 'Current password' })
  @IsNotEmpty({ message: 'Current password is required' })
  @MinLength(6, { message: 'Password must be at least 6 characters' })
  currentPassword: string;

  @ApiProperty({ description: 'New password' })
  @IsNotEmpty({ message: 'New password is required' })
  @MinLength(6, { message: 'Password must be at least 6 characters' })
  newPassword: string;
}

export class ChangeEmailDto {
  @ApiProperty({ description: 'New email address' })
  @IsEmail({}, { message: 'Invalid email format' })
  @IsNotEmpty({ message: 'Email is required' })
  newEmail: string;
}

export class UserResponseDto {
  @ApiProperty({ description: 'User ID' })
  id: string;

  @ApiProperty({ description: 'Email address' })
  email: string;

  @ApiProperty({ description: 'Full name' })
  fullName: string;

  @ApiPropertyOptional({ description: 'Avatar URL' })
  avatar?: string;

  @ApiPropertyOptional({ description: 'Phone number' })
  phone?: string;

  @ApiProperty({ description: 'User role' })
  role: string;

  @ApiProperty({ description: 'Account status' })
  status: string;

  @ApiProperty({ description: 'Email verified status' })
  emailVerified: boolean;

  @ApiProperty({ description: 'Created at' })
  createdAt: Date;

  @ApiProperty({ description: 'Updated at' })
  updatedAt: Date;
}
