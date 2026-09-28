import { Injectable } from '@nestjs/common';
import type { CreateUserDto, UpdateUserDto } from './users.controller.js';
import { db } from '../database.js';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}
  findAll() {
    return this.prisma.user.findMany();
  }

findOne(id: number) {
  return this.prisma.user.findUnique({
    where: { id },
  });
}

create(dto: CreateUserDto) {
  return this.prisma.user.create({
    data: {
      name: dto.name,
      email: dto.email,
    },
  });
}
update(id: number, dto: UpdateUserDto) {
  return this.prisma.user.update({
    where: { id },
    data: dto,
  });
}

  async remove(id: string) {
    const result = await db.query('DELETE FROM users WHERE id = $1', [id]);

    return { deleted: result.rowCount === 1 };
  }
}
