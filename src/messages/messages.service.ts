import { Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service.js';
import { WorkspaceAccessService } from '../workspace-access/workspace-access.service.js';
import { CreateMessageDto } from './dto/create-message.dto.js';
import { MessagesGateway } from './messages.gateway.js';

@Injectable()
export class MessagesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly workspaceAccess: WorkspaceAccessService,
    private readonly messagesGateway: MessagesGateway,
  ) {}

  async create(channelId: number, userId: number, dto: CreateMessageDto) {
    const channel = await this.prisma.channel.findUnique({
      where: { id: channelId },
    });

    if (!channel) {
      throw new NotFoundException('Channel not found');
    }

    await this.workspaceAccess.getMembership(userId, channel.workspaceId);

    const message = await this.prisma.message.create({
      data: {
        text: dto.text,
        userId,
        channelId,
      },

      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    this.messagesGateway.emitNewMessage(channelId, message);

    return message;
  }

  async findAll(channelId: number, userId: number, cursor?: number, take = 20) {
    const channel = await this.prisma.channel.findUnique({
      where: { id: channelId },
    });

    if (!channel) {
      throw new NotFoundException('Channel not found');
    }

    await this.workspaceAccess.getMembership(userId, channel.workspaceId);

    const messages = await this.prisma.message.findMany({
      where: {
        channelId,
      },

      take,

      ...(cursor && {
        cursor: {
          id: cursor,
        },
        skip: 1,
      }),

      orderBy: {
        id: 'desc',
      },

      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    const nextCursor =
      messages.length === take ? messages[messages.length - 1].id : null;

    return {
      data: messages,
      nextCursor,
    };
  }
}
