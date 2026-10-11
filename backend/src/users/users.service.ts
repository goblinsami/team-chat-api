import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import type { CreateUserDto, UpdateUserDto } from './users.dto.js';
import { PrismaService } from '../prisma/prisma.service.js';
import * as bcrypt from 'bcrypt';
@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}
  findAll() {
    return this.prisma.user.findMany();
  }

async findOne(id: number) {
  const user = await this.prisma.user.findUnique({
    where: { id },
  });

  if (!user) {
    throw new NotFoundException('User not found');
  }

  return user;
}

async create(dto: CreateUserDto) {
  const hashedPassword = await bcrypt.hash(dto.password, 10);

  return this.prisma.user.create({
    data: {
      name: dto.name,
      email: dto.email,
      password: hashedPassword,
    },
  });
}
async update(id: number, dto: UpdateUserDto) {
  await this.findOne(id);

  return this.prisma.user.update({
    where: { id },
    data: dto,
  });
}

async remove(id: number) {
  await this.findOne(id);

  return this.prisma.user.delete({
    where: { id },
  });
}
}