import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException } from '@nestjs/common';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { WorkspaceAccessService } from './workspace-access.service.js';
import { PrismaService } from '../prisma/prisma.service.js';

describe('WorkspaceAccessService', () => {
  let service: WorkspaceAccessService;

  const prismaMock = {
    workspaceMember: {
      findUnique: vi.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WorkspaceAccessService,
        {
          provide: PrismaService,
          useValue: prismaMock,
        },
      ],
    }).compile();

    service = module.get<WorkspaceAccessService>(WorkspaceAccessService);

    vi.clearAllMocks();
  });

  it('should return membership if user belongs to workspace', async () => {
    const membership = {
      id: 1,
      userId: 4,
      workspaceId: 1,
      role: 'MEMBER',
    };

    prismaMock.workspaceMember.findUnique.mockResolvedValue(membership);

    const result = await service.getMembership(4, 1);

    expect(result).toEqual(membership);
  });

  it('should throw ForbiddenException if user is not a member', async () => {
    prismaMock.workspaceMember.findUnique.mockResolvedValue(null);

    await expect(service.getMembership(4, 999)).rejects.toThrow(
      ForbiddenException,
    );
  });
});
