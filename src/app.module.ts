import { RedisModule } from './redis/redis.module.js';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module.js';
import { UsersModule } from './users/users.module.js';
import { AuthModule } from './auth/auth.module.js';
import { WorkspacesModule } from './workspaces/workspaces.module.js';
import { ChannelsModule } from './channels/channels.module.js';
import { MessagesModule } from './messages/messages.module.js';
import { NotificationsModule } from './notifications/notifications.module.js';
import { BullModule } from '@nestjs/bullmq';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        connection: {
          url: configService.getOrThrow<string>('REDIS_URL'),
        },
      }),
    }),
    PrismaModule,
    UsersModule,
    AuthModule,
    WorkspacesModule,
    ChannelsModule,
    MessagesModule,
    RedisModule,
    NotificationsModule,
  ],
})
export class AppModule {}
