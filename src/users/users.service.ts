import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import type { CreateUserDto, UpdateUserDto } from './users.dto.js';
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
  try {
    return await this.prisma.user.create({
      data: dto,
    });
  } catch (error) {
    // luego mejoraremos este check
    throw new ConflictException('Email already exists');
  }
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