import {
  IsString,
  IsOptional,
  IsBoolean,
  IsInt,
  IsEnum,
  IsDateString,
  MaxLength,
  MinLength,
  IsUrl,
  Matches,
} from 'class-validator';
import { BannerType } from '@prisma/client';

export class CreateBannerDto {
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  title: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  @Matches(/^(https?:\/\/|\/)/i, {
    message: 'imageUrl must be a valid URL or relative path',
  })
  imageUrl?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  @IsUrl({}, { message: 'linkUrl must be a valid URL' })
  linkUrl?: string;

  @IsString()
  @MinLength(1)
  @MaxLength(200)
  alt: string;

  @IsOptional()
  @IsEnum(BannerType)
  type?: BannerType;

  // 텍스트 배너 전용 필드
  @IsOptional()
  @IsString()
  @MaxLength(100)
  bannerText?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  subText?: string;

  @IsOptional()
  @IsString()
  @Matches(/^#[0-9A-Fa-f]{6}$/, {
    message: 'bgColor must be a valid hex color (e.g. #3B82F6)',
  })
  bgColor?: string;

  @IsOptional()
  @IsString()
  @Matches(/^#[0-9A-Fa-f]{6}$/, {
    message: 'textColor must be a valid hex color (e.g. #FFFFFF)',
  })
  textColor?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsInt()
  priority?: number;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;
}
