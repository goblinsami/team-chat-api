import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import * as bcrypt from 'bcrypt';

import { UsersService } from './users.service.js';
import { PrismaService } from '../prisma/prisma.service.js';

vi.mock('bcrypt', () => ({ hash: vi.fn() }));

describe('UsersService', () => {
  let service: UsersService;

  const prismaMock = {
    user: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: PrismaService,
          useValue: prismaMock,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);

    vi.clearAllMocks();
  });

  it('should return all users', async () => {
    const users = [
      {
        id: 1,
        name: 'Sami',
        email: 'sami@example.com',
      },
      {
        id: 2,
        name: 'Ismael',
        email: 'ismael@example.com',
      },
    ];

    prismaMock.user.findMany.mockResolvedValue(users);

    const result = await service.findAll();

    expect(result).toEqual(users);
  });

  it('should return one user', async () => {
    const user = {
      id: 1,
      name: 'Sami',
      email: 'sami@example.com',
    };

    prismaMock.user.findUnique.mockResolvedValue(user);

    const result = await service.findOne(1);

    expect(result).toEqual(user);
  });

  it('should throw NotFoundException if user does not exist', async () => {
    prismaMock.user.findUnique.mockResolvedValue(null);

    await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
  });

  it('should create a user', async () => {
    const dto = {
      name: 'Sami',
      email: 'sami@example.com',
      password: 'password123',
    };

    const createdUser = {
      id: 1,
      name: 'Sami',
      email: 'sami@example.com',
      password: 'hashed-password',
    };

    vi.mocked(bcrypt.hash).mockResolvedValue('hashed-password' as never);

    prismaMock.user.create.mockResolvedValue(createdUser);

    const result = await service.create(dto);

    expect(result).toEqual(createdUser);

    expect(prismaMock.user.create).toHaveBeenCalledWith({
      data: {
        name: 'Sami',
        email: 'sami@example.com',
        password: 'hashed-password',
      },
    });
  });
});
