import { Body, Controller, Get, Param, ParseIntPipe, Post, Req, UseGuards } from '@nestjs/common';

import { AuthGuard } from '@nestjs/passport';

import { WorkspacesService } from './workspaces.service.js';
import { CreateWorkspaceDto } from './dto/create-workspace.dto.js';
import { InviteMemberDto } from './dto/invite-member.dto.js';

@Controller('workspaces')
@UseGuards(AuthGuard('jwt'))
export class WorkspacesController {
  constructor(private readonly workspacesService: WorkspacesService) {}

  @Post()
  create(@Body() dto: CreateWorkspaceDto, @Req() req: any) {
    return this.workspacesService.create(dto, req.user.userId);
  }

  @Get()
  findAll(@Req() req: any) {
    return this.workspacesService.findAllForUser(req.user.userId);
  }

  @Post(':workspaceId/members')
  invite(@Param('workspaceId', ParseIntPipe) workspaceId: number, @Body() dto: InviteMemberDto, @Req() req: any) {
    return this.workspacesService.inviteMember(workspaceId, req.user.userId, dto.email);
  }
}
