import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';

@Processor('notifications')
export class NotificationsProcessor extends WorkerHost {
  async process(job: Job) {
    if (job.name === 'new-message') {
      console.log(`Processing notification for user ${job.data.userId}`);

      // Aquí en el futuro:
      // enviar email
      // push notification
      // etc.
    }
  }
}
