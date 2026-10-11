import { Module } from '@nestjs/common';
import { MessagesController } from './messages.controller.js';
import { MessagesService } from './messages.service.js';
import { WorkspaceAccessModule } from '../workspace-access/worskpace-acces.module.js';
import { MessagesGateway } from './messages.gateway.js';
import { AuthModule } from '../auth/auth.module.js';

@Module({
  imports: [WorkspaceAccessModule, AuthModule],
  controllers: [MessagesController],
  providers: [MessagesService, MessagesGateway],
})
export class MessagesModule {}
