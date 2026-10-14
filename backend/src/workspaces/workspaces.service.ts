import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service.js';
import { CreateWorkspaceDto } from './dto/create-workspace.dto.js';

@Injectable()
export class WorkspacesService {
  constructor(private readonly prisma: PrismaService) {}

  async inviteMember(workspaceId: number, userId: number, email: string) {
    const membership = await this.prisma.workspaceMember.findUnique({
      where: { userId_workspaceId: { userId, workspaceId } },
    });
    if (!membership || !['OWNER', 'ADMIN'].includes(membership.role)) {
      throw new ForbiddenException('Only owners and admins can invite members');
    }
    const user = await this.prisma.user.findUnique({ where: { email: email.trim() } });
    if (!user) throw new NotFoundException('User must register before joining a workspace');
    return this.prisma.workspaceMember.upsert({
      where: { userId_workspaceId: { userId: user.id, workspaceId } },
      create: { userId: user.id, workspaceId, role: 'MEMBER' },
      update: {},
      select: { userId: true, workspaceId: true, role: true },
    });
  }

  create(dto: CreateWorkspaceDto, userId: number) {
    return this.prisma.workspace.create({
      data: {
        name: dto.name,

        members: {
          create: {
            userId,
            role: 'OWNER',
          },
        },
      },

      include: {
        members: true,
      },
    });
  }

  findAllForUser(userId: number) {
    return this.prisma.workspace.findMany({
      where: {
        members: {
          some: {
            userId,
          },
        },
      },

      include: {
        members: true,
        channels: true,
      },
    });
  }
}
