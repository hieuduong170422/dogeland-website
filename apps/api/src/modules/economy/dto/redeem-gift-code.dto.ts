import { IsString, Length } from 'class-validator';

export class RedeemGiftCodeDto {
  @IsString()
  @Length(4, 64)
  code: string;
}
