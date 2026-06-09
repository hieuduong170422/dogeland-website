import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { appConfig, authConfig, emailConfig, redisConfig } from './config/app.config';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { JwtAuthGuard } from './modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from './common/guards/roles.guard';
import { PrismaModule } from './persistence/prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { PlayersModule } from './modules/players/players.module';
import { EconomyModule } from './modules/economy/economy.module';
import { LeaderboardModule } from './modules/leaderboard/leaderboard.module';
import { ForumModule } from './modules/forum/forum.module';
import { WikiModule } from './modules/wiki/wiki.module';
import { TicketsModule } from './modules/tickets/tickets.module';
import { AdminModule } from './modules/admin/admin.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { ServerStatusModule } from './modules/server-status/server-status.module';
import { UsersModule } from './modules/users/users.module';
import { DiscordModule } from './modules/discord/discord.module';
import { ShopModule } from './modules/shop/shop.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, authConfig, emailConfig, redisConfig],
    }),
    PrismaModule,
    AuthModule,
    PlayersModule,
    EconomyModule,
    LeaderboardModule,
    ForumModule,
    WikiModule,
    TicketsModule,
    AdminModule,
    NotificationsModule,
    ServerStatusModule,
    UsersModule,
    DiscordModule,
    ShopModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    { provide: APP_FILTER, useClass: HttpExceptionFilter },
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class AppModule {}
