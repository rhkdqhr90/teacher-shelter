import {
  IsString,
  IsOptional,
  IsEmail,
  MaxLength,
  Matches,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { sanitizeTitle } from '../../common/utils/sanitize.util';

export class CreateApplicationDto {
  @IsString()
  postId: string;

  @IsString()
  @IsOptional()
  @MaxLength(3000)
  @Transform(sanitizeTitle)
  coverLetter?: string;

  @IsString()
  @IsOptional()
  @MaxLength(20)
  contactPhone?: string;

  @IsEmail()
  @IsOptional()
  contactEmail?: string;

  // 이력서 파일 정보
  @IsString()
  @IsOptional()
  @MaxLength(500)
  @Matches(/^\/uploads\/resume\/[a-zA-Z0-9_-]+\.(pdf|doc|docx)$/i, {
    message: '유효하지 않은 이력서 파일 URL입니다',
  })
  resumeUrl?: string;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  resumeFileName?: string;
}
