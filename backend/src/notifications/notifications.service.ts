import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectQueue('notifications')
    private readonly queue: Queue,
  ) {}

  async sendMessageNotification(userId: number, messageId: number) {
    await this.queue.add('new-message', {
      userId,
      messageId,
    });
  }
}
