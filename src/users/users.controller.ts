import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Roles, RolesGuard } from '../auth/roles.decorator.js';
import { UsersService } from './users.service.js';
import { CreateUserDto, UpdateUserDto } from './users.dto.js';
import { RedisService } from '../redis/redis.service.js';
@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly redis: RedisService,
  ) {}
  @Get()
  findAll() {
    return this.usersService.findAll();
  }
  @Get(':id/online')
  async isOnline(@Param('id', ParseIntPipe) id: number) {
    return {
      userId: id,
      online: await this.redis.isUserOnline(id),
    };
  }

  @Get('me')
  @UseGuards(AuthGuard('jwt'))
  getMe(@Req() req: any) {
    return this.usersService.findOne(req.user.userId);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.findOne(id);
  }

  @Post()
  create(@Body() body: CreateUserDto) {
    return this.usersService.create(body);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() body: UpdateUserDto) {
    return this.usersService.update(id, body);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('ADMIN')
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.remove(id);
  }
}
