import { Controller, Get, Param, Query, Post } from '@nestjs/common';
import { Public } from '../../common/decorators/public.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { LeaderboardService, GameMode, Period } from './leaderboard.service';
import { GetLeaderboardDto } from './dto/get-leaderboard.dto';

@Controller('leaderboard')
export class LeaderboardController {
  constructor(private readonly leaderboardService: LeaderboardService) {}

  @Get()
  @Public()
  getLeaderboard(@Query() query: GetLeaderboardDto) {
    return this.leaderboardService.getLeaderboard(
      (query.gameMode as GameMode) ?? 'global',
      (query.period as Period) ?? 'alltime',
      query.page ?? 1,
    );
  }

  @Get('player/:username')
  @Public()
  getPlayerRank(
    @Param('username') username: string,
    @Query('gameMode') gameMode?: string,
    @Query('period') period?: string,
  ) {
    return this.leaderboardService.getPlayerRank(
      username,
      (gameMode as GameMode) ?? 'global',
      (period as Period) ?? 'alltime',
    );
  }

  @Post('seed')
  @Roles('ADMIN')
  seedDemoData() {
    return this.leaderboardService.seedDemoData();
  }
}
