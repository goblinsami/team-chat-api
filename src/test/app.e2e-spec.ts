import { beforeAll, afterAll, describe, expect, it } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { randomUUID } from 'node:crypto';

import { AppModule } from '../app.module.js';
import { PrismaService } from '../prisma/prisma.service.js';

describe.sequential('App E2E', () => {
  let app: INestApplication | undefined;
  let prisma: PrismaService | undefined;
  const runId = randomUUID();
  const email = `e2e-${runId}@example.com`;
  const workspaceName = `E2E Workspace ${runId}`;

  let token: string;
  let workspaceId: number;
  let channelId: number;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    prisma = moduleFixture.get(PrismaService);

    await app.init();
  });

  afterAll(async () => {
    try {
      if (prisma) {
        await prisma.$transaction(async (tx) => {
          const workspaces = await tx.workspace.findMany({
            where: { name: workspaceName, members: { some: { user: { email } } } },
            select: { id: true },
          });
          const ids = workspaces.map(({ id }) => id);
          await tx.message.deleteMany({
            where: { OR: [{ user: { email } }, { channel: { workspaceId: { in: ids } } }] },
          });
          await tx.channel.deleteMany({ where: { workspaceId: { in: ids } } });
          await tx.workspaceMember.deleteMany({
            where: { OR: [{ user: { email } }, { workspaceId: { in: ids } }] },
          });
          await tx.workspace.deleteMany({ where: { id: { in: ids } } });
          await tx.user.deleteMany({ where: { email } });
        });
      }
    } finally {
      await app?.close();
    }
  });

  it('should register a user', async () => {
    const response = await request(app!.getHttpServer())
      .post('/users')
      .send({
        name: 'E2E User',
        email,
        password: 'password123',
      })
      .expect(201);

    expect(response.body.email).toBe(email);
  });

  it('should login', async () => {
    const response = await request(app!.getHttpServer())
      .post('/auth/login')
      .send({
        email,
        password: 'password123',
      })
      .expect(201);

    token = response.body.accessToken;

    expect(token).toBeDefined();
  });

  it('should create workspace', async () => {
    const response = await request(app!.getHttpServer())
      .post('/workspaces')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: workspaceName,
      })
      .expect(201);

    workspaceId = response.body.id;

    expect(response.body.name).toBe(workspaceName);
  });

  it('should create channel', async () => {
    const response = await request(app!.getHttpServer())
      .post(`/workspaces/${workspaceId}/channels`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'general',
      })
      .expect(201);

    channelId = response.body.id;

    expect(response.body.name).toBe('general');
  });

  it('should create message', async () => {
    const response = await request(app!.getHttpServer())
      .post(`/channels/${channelId}/messages`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        text: 'Hello E2E',
      })
      .expect(201);

    expect(response.body.text).toBe('Hello E2E');
  });

  it('should get messages', async () => {
    const response = await request(app!.getHttpServer())
      .get(`/channels/${channelId}/messages`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(response.body.data).toHaveLength(1);

    expect(response.body.data[0].text).toBe('Hello E2E');
  });
});
