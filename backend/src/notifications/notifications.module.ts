import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';

import { NotificationsService } from './notifications.service.js';
import { NotificationsProcessor } from './notifications.processor.js';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'notifications',
    }),
  ],
  providers: [NotificationsService, NotificationsProcessor],
  exports: [NotificationsService],
})
export class NotificationsModule {}
