import { ForbiddenException, Injectable } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service.js';
import { CreateChannelDto } from './dto/create-channel.dto.js';
import { WorkspaceAccessService } from '../workspace-access/workspace-access.service.js';
@Injectable()
export class ChannelsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly workspaceAccess: WorkspaceAccessService,
  ) {}
  async create(workspaceId: number, userId: number, dto: CreateChannelDto) {
    const membership = await this.workspaceAccess.getMembership(
      userId,
      workspaceId,
    );

    const allowedRoles = ['OWNER', 'ADMIN'];
    if (!allowedRoles.includes(membership.role)) {
      throw new ForbiddenException(
        'You do not have permission to create channels',
      );
    }

    return this.prisma.channel.create({
      data: {
        name: dto.name,
        workspaceId,
      },
    });
  }
}
