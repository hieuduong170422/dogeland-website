import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { ShopService } from './shop.service';
import { GetShopItemsDto, PurchaseDto, CreateShopItemDto, UpdateShopItemDto } from './dto/shop.dto';
import { Public } from '../../common/decorators/public.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserRole } from '@prisma/client';
import type { JwtPayload } from '../auth/strategies/jwt.strategy';

@Controller('shop')
export class ShopController {
  constructor(private readonly service: ShopService) {}

  // ─── Public endpoints ────────────────────────────────────────────────────────

  @Get('items')
  @Public()
  getItems(@Query() dto: GetShopItemsDto) {
    return this.service.getItems(dto);
  }

  @Get('items/:id')
  @Public()
  getItem(@Param('id', ParseIntPipe) id: number) {
    return this.service.getItemById(BigInt(id));
  }

  // ─── Authenticated endpoints ─────────────────────────────────────────────────

  @Post('purchase')
  purchase(@CurrentUser() user: JwtPayload, @Body() dto: PurchaseDto) {
    return this.service.purchase(BigInt(user.sub), dto);
  }

  @Get('purchases/me')
  getMyPurchases(
    @CurrentUser() user: JwtPayload,
    @Query('page', new ParseIntPipe({ optional: true })) page = 1,
  ) {
    return this.service.getMyPurchases(BigInt(user.sub), page);
  }

  // ─── Admin endpoints ─────────────────────────────────────────────────────────

  @Get('admin/items')
  @Roles(UserRole.ADMIN)
  adminGetAllItems(
    @Query('page', new ParseIntPipe({ optional: true })) page = 1,
  ) {
    return this.service.adminGetAllItems(page);
  }

  @Post('admin/items')
  @Roles(UserRole.ADMIN)
  adminCreateItem(@Body() dto: CreateShopItemDto) {
    return this.service.adminCreateItem(dto);
  }

  @Patch('admin/items/:id')
  @Roles(UserRole.ADMIN)
  adminUpdateItem(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateShopItemDto,
  ) {
    return this.service.adminUpdateItem(BigInt(id), dto);
  }

  @Delete('admin/items/:id')
  @Roles(UserRole.ADMIN)
  adminDeleteItem(@Param('id', ParseIntPipe) id: number) {
    return this.service.adminDeleteItem(BigInt(id));
  }
}
