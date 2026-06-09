import { IsString, Length } from 'class-validator';

export class VerifyTotpDto {
  @IsString()
  secret: string;

  @IsString()
  @Length(6, 6)
  code: string;
}

export class ValidateTotpDto {
  @IsString()
  @Length(6, 8) // 6 cho TOTP, 8 cho backup code
  code: string;
}
