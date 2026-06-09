import { IsBoolean, IsNotEmpty, IsOptional, IsString, Matches, MaxLength, MinLength } from 'class-validator';

export class CreateWikiDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/^[a-z0-9-]+$/, { message: 'Slug chỉ được dùng chữ thường, số và dấu gạch ngang' })
  @MaxLength(80)
  slug: string;

  @IsString()
  @MinLength(3)
  @MaxLength(120)
  title: string;

  @IsString()
  @MinLength(1)
  @MaxLength(100000)
  content: string;

  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;
}

export class UpdateWikiDto {
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(120)
  title?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(100000)
  content?: string;

  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;
}
