import { IsIn, IsInt, IsOptional, Max, Min } from 'class-validator';
import { Transform } from 'class-transformer';
import { GAME_MODES, PERIODS } from '../leaderboard.service';

export class GetLeaderboardDto {
  @IsOptional()
  @IsIn(GAME_MODES)
  gameMode?: string;

  @IsOptional()
  @IsIn(PERIODS)
  period?: string;

  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsInt()
  @Min(1)
  @Max(100)
  page?: number;
}
