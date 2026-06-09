import { Controller, Get, Param, Query } from '@nestjs/common';
import { Public } from '../../common/decorators/public.decorator';
import { PlayersService } from './players.service';

@Controller('players')
export class PlayersController {
  constructor(private readonly players: PlayersService) {}

  @Public()
  @Get('search')
  search(@Query('q') query: string) {
    return this.players.searchPlayers(query ?? '');
  }

  @Public()
  @Get(':username')
  getProfile(@Param('username') username: string) {
    return this.players.getProfile(username);
  }

  @Public()
  @Get(':username/rank')
  getRank(
    @Param('username') username: string,
    @Query('mode') mode?: string,
  ) {
    // Placeholder — sẽ join với user ID trong Phase 9
    return { rank: null, gameMode: mode ?? 'global' };
  }
}
