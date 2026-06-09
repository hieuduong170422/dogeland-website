import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { EconomyService } from './economy.service';
import { RedeemGiftCodeDto } from './dto/redeem-gift-code.dto';

@Controller('economy')
export class EconomyController {
  constructor(private readonly economy: EconomyService) {}

  @Get('me')
  getBalance(@CurrentUser() user: { id: bigint }) {
    return this.economy.getBalance(user.id);
  }

  @Get('transactions')
  getTransactions(
    @CurrentUser() user: { id: bigint },
    @Query('page') page?: string,
  ) {
    return this.economy.getTransactions(user.id, page ? parseInt(page, 10) : 1);
  }

  @Post('redeem')
  redeemGiftCode(
    @CurrentUser() user: { id: bigint },
    @Body() dto: RedeemGiftCodeDto,
  ) {
    return this.economy.redeemGiftCode(user.id, dto);
  }
}
