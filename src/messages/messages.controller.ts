import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { MessagesService } from './messages.service.js';
import { CreateMessageDto } from './dto/create-message.dto.js';

@Controller('channels/:channelId/messages')
@UseGuards(AuthGuard('jwt'))
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Post()
  create(
    @Param('channelId', ParseIntPipe) channelId: number,
    @Body() dto: CreateMessageDto,
    @Req() req: any,
  ) {
    return this.messagesService.create(channelId, req.user.userId, dto);
  }

  @Get()
  findAll(
    @Param('channelId', ParseIntPipe) channelId: number,
    @Req() req: any,
  ) {
    return this.messagesService.findAll(channelId, req.user.userId);
  }
}
