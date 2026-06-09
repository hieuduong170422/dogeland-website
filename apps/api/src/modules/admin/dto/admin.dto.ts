import { IsBoolean, IsEnum, IsInt, IsISO8601, IsOptional, IsString, Max, MaxLength, Min, MinLength } from 'class-validator';
import { Type } from 'class-transformer';
import { UserRole, UserStatus } from '@prisma/client';

export class AdminUsersQueryDto {
  @IsOptional() @IsString() search?: string;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) page?: number = 1;
  @IsOptional() @IsEnum(UserStatus) status?: UserStatus;
  @IsOptional() @IsEnum(UserRole) role?: UserRole;
}

export class BanUserDto {
  @IsBoolean() ban: boolean;
  @IsOptional() @IsString() @MaxLength(500) reason?: string;
}

export class ChangeRoleDto {
  @IsEnum(UserRole) role: UserRole;
}

export class CreateGiftCodeDto {
  @IsString() @MinLength(4) @MaxLength(64) code: string;
  @IsInt() @Min(1) maxUses: number;
  @IsInt() @Min(1) @Max(10_000_000) amount: number;
  @IsOptional() @IsISO8601() expiresAt?: string;
}

export class AdminAuditLogsQueryDto {
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) page?: number = 1;
  @IsOptional() @IsString() action?: string;
  @IsOptional() @IsString() userId?: string;
}

export class AdminGiftCodesQueryDto {
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) page?: number = 1;
}

export class AdjustBalanceDto {
  @IsInt() amount: number;
  @IsString() @MinLength(3) @MaxLength(200) reason: string;
}
