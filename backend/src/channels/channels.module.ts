import { Module } from '@nestjs/common';

import { ChannelsController } from './channels.controller.js';
import { ChannelsService } from './channels.service.js';
import { WorkspaceAccessModule } from '../workspace-access/worskpace-acces.module.js';

@Module({
  imports: [WorkspaceAccessModule],
  controllers: [ChannelsController],
  providers: [ChannelsService],
})
export class ChannelsModule {}
