import {
  Body,
  Controller,
  Param,
  ParseIntPipe,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { ChannelsService } from './channels.service.js';
import { CreateChannelDto } from './dto/create-channel.dto.js';

@Controller('workspaces/:workspaceId/channels')
@UseGuards(AuthGuard('jwt'))
export class ChannelsController {
  constructor(private readonly channelsService: ChannelsService) {}

  @Post()
  create(
    @Param('workspaceId', ParseIntPipe) workspaceId: number,
    @Body() dto: CreateChannelDto,
    @Req() req: any,
  ) {
    return this.channelsService.create(workspaceId, req.user.userId, dto);
  }
}
