import { IsIn, IsInt, IsNotEmpty, IsOptional, IsString, Max, MaxLength, Min, MinLength } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateThreadDto {
  @IsString()
  @MinLength(5)
  @MaxLength(120)
  title: string;

  @IsString()
  @MinLength(10)
  @MaxLength(50000)
  content: string;

  @IsString()
  @IsNotEmpty()
  categorySlug: string;
}

export class CreatePostDto {
  @IsString()
  @MinLength(1)
  @MaxLength(50000)
  content: string;

  @Transform(({ value }) => BigInt(value))
  threadId: bigint;
}

export class ReactDto {
  @Transform(({ value }) => BigInt(value))
  postId: bigint;

  @IsIn(['like', 'dislike'])
  type: string;
}

export class ThreadQueryDto {
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsInt()
  @Min(1)
  @Max(200)
  page?: number;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  search?: string;
}

export class UpdateThreadDto {
  @IsOptional()
  @Transform(({ value }) => (value === 'true' || value === true ? true : false))
  isPinned?: boolean;

  @IsOptional()
  @Transform(({ value }) => (value === 'true' || value === true ? true : false))
  isLocked?: boolean;
}
