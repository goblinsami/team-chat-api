import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { MessagesService } from './messages.service';
import { PrismaService } from '../prisma/prisma.service';
import { WorkspaceAccessService } from '../workspace-access/workspace-access.service';
import { MessagesGateway } from './messages.gateway';

describe('MessagesService', () => {
  let service: MessagesService;

  const prismaMock = {
    channel: {
      findUnique: vi.fn(),
    },
    message: {
      create: vi.fn(),
      findMany: vi.fn(),
    },
  };

  const workspaceAccessMock = {
    getMembership: vi.fn(),
  };

  const messagesGatewayMock = {
    emitNewMessage: vi.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MessagesService,
        {
          provide: PrismaService,
          useValue: prismaMock,
        },
        {
          provide: WorkspaceAccessService,
          useValue: workspaceAccessMock,
        },
        {
          provide: MessagesGateway,
          useValue: messagesGatewayMock,
        },
      ],
    }).compile();

    service = module.get<MessagesService>(MessagesService);

    vi.clearAllMocks();
  });

  it('should create a message and emit websocket event', async () => {
    prismaMock.channel.findUnique.mockResolvedValue({
      id: 1,
      workspaceId: 1,
      name: 'backend',
    });

    workspaceAccessMock.getMembership.mockResolvedValue({
      userId: 1,
      workspaceId: 1,
      role: 'MEMBER',
    });

    const message = {
      id: 10,
      text: 'Hola',
      userId: 1,
      channelId: 1,
    };

    prismaMock.message.create.mockResolvedValue(message);

    const result = await service.create(1, 1, { text: 'Hola' });

    expect(result).toEqual(message);

    expect(messagesGatewayMock.emitNewMessage).toHaveBeenCalledWith(1, message);
  });
});
