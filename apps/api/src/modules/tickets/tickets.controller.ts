import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { TicketsService } from './tickets.service';
import {
  CreateMessageDto,
  CreateTicketDto,
  ListTicketsDto,
  UpdateTicketStatusDto,
} from './dto/ticket.dto';

@Controller('tickets')
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  @Post()
  createTicket(
    @CurrentUser() user: { id: bigint; role: string },
    @Body() dto: CreateTicketDto,
  ) {
    return this.ticketsService.createTicket(user.id, dto);
  }

  @Get('me')
  getMyTickets(
    @CurrentUser() user: { id: bigint; role: string },
    @Query() query: ListTicketsDto,
  ) {
    return this.ticketsService.getMyTickets(user.id, query);
  }

  @Get('admin')
  @Roles('MODERATOR', 'ADMIN')
  adminListTickets(@Query() query: ListTicketsDto) {
    return this.ticketsService.adminListTickets(query);
  }

  @Get(':id')
  getTicket(
    @Param('id') id: string,
    @CurrentUser() user: { id: bigint; role: string },
  ) {
    return this.ticketsService.getTicket(BigInt(id), user.id, user.role);
  }

  @Get(':id/messages')
  getMessages(
    @Param('id') id: string,
    @CurrentUser() user: { id: bigint; role: string },
  ) {
    return this.ticketsService.getMessages(BigInt(id), user.id, user.role);
  }

  @Post(':id/messages')
  sendMessage(
    @Param('id') id: string,
    @CurrentUser() user: { id: bigint; role: string },
    @Body() dto: CreateMessageDto,
  ) {
    return this.ticketsService.sendMessage(BigInt(id), user.id, user.role, dto);
  }

  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string,
    @CurrentUser() user: { id: bigint; role: string },
    @Body() dto: UpdateTicketStatusDto,
  ) {
    return this.ticketsService.updateStatus(BigInt(id), user.id, user.role, dto);
  }
}
