import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { JwtService } from '@nestjs/jwt';
import { Server, Socket } from 'socket.io';

import { PrismaService } from '../prisma/prisma.service.js';
import { WorkspaceAccessService } from '../workspace-access/workspace-access.service.js';
import { RedisService } from '../redis/redis.service.js';
@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class MessagesGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
    private readonly workspaceAccess: WorkspaceAccessService,
    private readonly redis: RedisService,
  ) {}

  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth.token;

      const payload = await this.jwtService.verifyAsync(token);

      client.data.user = {
        userId: payload.sub,
        email: payload.email,
      };

      await this.redis.set(`user:${payload.sub}:online`, 'true', 60);
    } catch {
      client.disconnect();
    }
  }
  async handleDisconnect(client: Socket) {
    const userId = client.data.user?.userId;

    if (!userId) {
      return;
    }

    await this.redis.del(`user:${userId}:online`);
  }
  @SubscribeMessage('channel:join')
  async joinChannel(
    @MessageBody() channelId: number,
    @ConnectedSocket() client: Socket,
  ) {
    const channel = await this.prisma.channel.findUnique({
      where: {
        id: channelId,
      },
    });

    if (!channel) {
      return {
        success: false,
        message: 'Channel not found',
      };
    }

    await this.workspaceAccess.getMembership(
      client.data.user.userId,
      channel.workspaceId,
    );

    await client.join(`channel:${channelId}`);

    return {
      success: true,
    };
  }
  @SubscribeMessage('channel:leave')
  async leaveChannel(
    @MessageBody() channelId: number,
    @ConnectedSocket() client: Socket,
  ) {
    await client.leave(`channel:${channelId}`);

    return {
      success: true,
    };
  }

  emitNewMessage(channelId: number, message: unknown) {
    this.server.to(`channel:${channelId}`).emit('message:new', message);
  }
}
