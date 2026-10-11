import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import * as bcrypt from 'bcrypt';

import { AuthService } from './auth.service.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { JwtService } from '@nestjs/jwt';

vi.mock('bcrypt', () => ({ compare: vi.fn() }));

describe('AuthService', () => {
  let service: AuthService;

  const prismaMock = {
    user: {
      findUnique: vi.fn(),
    },
  };

  const jwtServiceMock = {
    signAsync: vi.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: prismaMock,
        },
        {
          provide: JwtService,
          useValue: jwtServiceMock,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);

    vi.resetAllMocks();
  });

  it('should return access token with valid credentials', async () => {
    prismaMock.user.findUnique.mockResolvedValue({
      id: 1,
      email: 'sami@example.com',
      password: 'hashed-password',
      role: 'ADMIN',
    });

    vi.mocked(bcrypt.compare).mockResolvedValue(true as never);

    jwtServiceMock.signAsync.mockResolvedValue('fake-jwt-token');

    const result = await service.login({
      email: 'sami@example.com',
      password: 'password123',
    });

    expect(result).toEqual({
      accessToken: 'fake-jwt-token',
    });
  });

  it('should throw if user does not exist', async () => {
    prismaMock.user.findUnique.mockResolvedValue(null);

    await expect(
      service.login({
        email: 'missing@example.com',
        password: 'password123',
      }),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('should throw if password is incorrect', async () => {
    prismaMock.user.findUnique.mockResolvedValue({
      id: 1,
      email: 'sami@example.com',
      password: 'hashed-password',
      role: 'ADMIN',
    });

    vi.mocked(bcrypt.compare).mockResolvedValue(false as never);

    await expect(
      service.login({
        email: 'sami@example.com',
        password: 'wrong-password',
      }),
    ).rejects.toThrow(UnauthorizedException);
  });
});
