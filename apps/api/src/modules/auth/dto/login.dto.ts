import { IsOptional, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @IsString()
  login: string; // username hoặc email

  @IsString()
  @MinLength(8)
  password: string;

  @IsOptional()
  rememberMe?: boolean;

  @IsOptional()
  @IsString()
  totpCode?: string; // nếu 2FA đang bật
}
