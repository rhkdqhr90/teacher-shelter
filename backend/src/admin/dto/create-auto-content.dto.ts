import {
  IsString,
  IsEnum,
  IsOptional,
  IsIn,
  MinLength,
  MaxLength,
} from 'class-validator';
import { PostCategory } from '@prisma/client';

export class CreateAutoContentDto {
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  title: string;

  @IsString()
  @MinLength(1)
  content: string;

  @IsEnum(PostCategory)
  category: PostCategory;

  @IsOptional()
  @IsIn(['PUBLISHED', 'DRAFT'])
  status?: string = 'DRAFT';

  @IsOptional()
  @IsString()
  sourceUrl?: string;

  @IsOptional()
  @IsString()
  sourceName?: string;

  @IsOptional()
  @IsIn(['high', 'medium'])
  confidence?: string;
}
