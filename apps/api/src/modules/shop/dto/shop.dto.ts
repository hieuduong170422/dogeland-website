import { IsEnum, IsInt, IsOptional, IsString, IsUrl, Min, IsBoolean, IsNumber } from 'class-validator';
import { ShopItemType } from '@prisma/client';
import { Type } from 'class-transformer';

export class GetShopItemsDto {
  @IsOptional()
  @IsEnum(ShopItemType)
  type?: ShopItemType;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;
}

export class PurchaseDto {
  @IsInt()
  @Min(1)
  itemId!: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  quantity?: number = 1;

  @IsOptional()
  @IsString()
  serverId?: string;
}

export class CreateShopItemDto {
  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsInt()
  @Min(1)
  price!: number;

  @IsEnum(ShopItemType)
  type!: ShopItemType;

  @IsOptional()
  @IsString()
  serverId?: string;

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean = true;

  @IsOptional()
  @IsInt()
  sortOrder?: number = 0;
}

export class UpdateShopItemDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  price?: number;

  @IsOptional()
  @IsEnum(ShopItemType)
  type?: ShopItemType;

  @IsOptional()
  @IsString()
  serverId?: string;

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsInt()
  sortOrder?: number;
}
