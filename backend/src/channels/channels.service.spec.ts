import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException } from '@nestjs/common';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ChannelsService } from './channels.service.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { WorkspaceAccessService } from '../workspace-access/workspace-access.service.js';

describe('ChannelsService', () => {
  let service: ChannelsService;

  const prismaMock = {
    channel: {
      create: vi.fn(),
    },
  };

  const workspaceAccessMock = {
    getMembership: vi.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChannelsService,
        {
          provide: PrismaService,
          useValue: prismaMock,
        },
        {
          provide: WorkspaceAccessService,
          useValue: workspaceAccessMock,
        },
      ],
    }).compile();

    service = module.get<ChannelsService>(ChannelsService);

    vi.clearAllMocks();
  });

  it('should allow OWNER to create a channel', async () => {
    workspaceAccessMock.getMembership.mockResolvedValue({
      userId: 1,
      workspaceId: 1,
      role: 'OWNER',
    });

    prismaMock.channel.create.mockResolvedValue({
      id: 1,
      name: 'backend',
      workspaceId: 1,
    });

    const result = await service.create(1, 1, { name: 'backend' });

    expect(result.name).toBe('backend');
  });

  it('should allow ADMIN to create a channel', async () => {
    workspaceAccessMock.getMembership.mockResolvedValue({
      userId: 1,
      workspaceId: 1,
      role: 'ADMIN',
    });

    prismaMock.channel.create.mockResolvedValue({
      id: 2,
      name: 'frontend',
      workspaceId: 1,
    });

    const result = await service.create(1, 1, { name: 'frontend' });

    expect(result.name).toBe('frontend');
  });

  it('should reject MEMBER', async () => {
    workspaceAccessMock.getMembership.mockResolvedValue({
      userId: 1,
      workspaceId: 1,
      role: 'MEMBER',
    });

    await expect(service.create(1, 1, { name: 'backend' })).rejects.toThrow(
      ForbiddenException,
    );
  });
});
