import { Module } from '@nestjs/common';
import { MessagesController } from './messages.controller.js';
import { MessagesService } from './messages.service.js';
import { WorkspaceAccessModule } from '../workspace-access/worskpace-acces.module.js';

@Module({
  imports: [WorkspaceAccessModule],
  controllers: [MessagesController],
  providers: [MessagesService],
})
export class MessagesModule {}
