import { IsIn, IsInt, IsNotEmpty, IsOptional, IsString, Max, MaxLength, Min, MinLength } from 'class-validator';
import { Transform } from 'class-transformer';
import { TicketStatus, TicketType } from '@prisma/client';

export class CreateTicketDto {
  @IsString()
  @MinLength(5)
  @MaxLength(120)
  title: string;

  @IsIn(['BUG', 'BAN_APPEAL', 'BILLING', 'GENERAL'])
  type: TicketType;

  @IsString()
  @MinLength(10)
  @MaxLength(5000)
  content: string;
}

export class CreateMessageDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(5000)
  content: string;
}

export class UpdateTicketStatusDto {
  @IsIn(['OPEN', 'CLOSED'])
  status: TicketStatus;
}

export class ListTicketsDto {
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsInt()
  @Min(1)
  @Max(200)
  page?: number;

  @IsOptional()
  @IsIn(['OPEN', 'CLOSED'])
  status?: TicketStatus;

  @IsOptional()
  @IsIn(['BUG', 'BAN_APPEAL', 'BILLING', 'GENERAL'])
  type?: TicketType;
}
