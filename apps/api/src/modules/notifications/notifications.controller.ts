import { Controller, Get, Param, Patch, Query } from '@nestjs/common';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { NotificationsService } from './notifications.service';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  getNotifications(
    @CurrentUser() user: { id: bigint },
    @Query('page') page?: string,
  ) {
    return this.notificationsService.getForUser(user.id, page ? Number(page) : 1);
  }

  @Get('unread-count')
  getUnreadCount(@CurrentUser() user: { id: bigint }) {
    return this.notificationsService.getUnreadCount(user.id);
  }

  @Patch('read-all')
  markAllRead(@CurrentUser() user: { id: bigint }) {
    return this.notificationsService.markAllRead(user.id);
  }

  @Patch(':id/read')
  markRead(@Param('id') id: string, @CurrentUser() user: { id: bigint }) {
    return this.notificationsService.markRead(BigInt(id), user.id);
  }
}
