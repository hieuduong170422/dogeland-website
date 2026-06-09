import { Controller, Get, Query, Res, Delete } from '@nestjs/common';
import { Response } from 'express';
import { DiscordService } from './discord.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';
import type { JwtPayload } from '../auth/strategies/jwt.strategy';
import { ConfigService } from '@nestjs/config';

@Controller('discord')
export class DiscordController {
  constructor(
    private readonly service: DiscordService,
    private readonly config: ConfigService,
  ) {}

  @Get('authorize')
  authorize(@CurrentUser() user: JwtPayload, @Res() res: Response) {
    const url = this.service.getAuthorizeUrl(user.sub);
    return res.redirect(url);
  }

  @Get('callback')
  @Public()
  async callback(
    @Query('code') code: string,
    @Query('state') state: string,
    @Res() res: Response,
  ) {
    const frontendUrl = this.config.get<string>('app.frontendUrl') ?? 'http://localhost:3000';
    try {
      await this.service.handleCallback(code, state);
      return res.redirect(`${frontendUrl}/settings/profile?discord=success`);
    } catch (err: any) {
      const msg = encodeURIComponent(err?.message ?? 'Discord link failed');
      return res.redirect(`${frontendUrl}/settings/profile?discord=error&msg=${msg}`);
    }
  }

  @Delete('unlink')
  unlink(@CurrentUser() user: JwtPayload) {
    return this.service.unlinkDiscord(BigInt(user.sub));
  }
}
