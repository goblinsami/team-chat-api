import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';

import { AuthGuard } from '@nestjs/passport';

import { WorkspacesService } from './workspaces.service.js';
import { CreateWorkspaceDto } from './dto/create-workspace.dto.js';

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
}
