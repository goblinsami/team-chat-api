import { Test } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { io, type Socket } from 'socket.io-client';
import type { INestApplication } from '@nestjs/common';
import { MessagesGateway } from '../src/messages/messages.gateway.js';
import { MessagesService } from '../src/messages/messages.service.js';
import { WorkspacesService } from '../src/workspaces/workspaces.service.js';
import { WorkspaceAccessService } from '../src/workspace-access/workspace-access.service.js';
import { PrismaService } from '../src/prisma/prisma.service.js';
import { RedisService } from '../src/redis/redis.service.js';

describe('Workspace invitations and realtime messages', () => {
  let app: INestApplication;
  let url: string;
  const sockets: Socket[] = [];
  const jwt = new JwtService({ secret: 'test-only-secret' });
  const members = new Map<number, string>([[1, 'OWNER']]);
  const prisma = {
    workspaceMember: {
      findUnique: async ({ where }: any) => {
        const { userId, workspaceId } = where.userId_workspaceId;
        const role = workspaceId === 1 ? members.get(userId) : undefined;
        return role ? { userId, workspaceId, role } : null;
      },
      upsert: async ({ create }: any) => { members.set(create.userId, members.get(create.userId) ?? create.role); return create; },
    },
    user: { findUnique: async ({ where }: any) => where.email === 'guest@example.com' ? { id: 2 } : null },
    channel: { findUnique: async ({ where }: any) => where.id === 5 ? { id: 5, workspaceId: 1 } : null },
    message: { create: async ({ data }: any) => ({ id: 1, ...data, user: { name: 'Guest' } }) },
  };

  beforeAll(async () => {
    const module = await Test.createTestingModule({ providers: [
      MessagesGateway, MessagesService, WorkspacesService, WorkspaceAccessService,
      { provide: JwtService, useValue: jwt },
      { provide: PrismaService, useValue: prisma },
      { provide: RedisService, useValue: { set: async () => {}, del: async () => {} } },
    ] }).compile();
    app = module.createNestApplication();
    await app.listen(0, '127.0.0.1');
    url = await app.getUrl();
  });
  afterAll(async () => { sockets.forEach((socket) => socket.disconnect()); await app?.close(); });

  async function connect(userId: number) {
    const ticket = await jwt.signAsync({ sub: userId, purpose: 'socket' }, { expiresIn: '60s' });
    const socket = io(url, { transports: ['websocket'], auth: { ticket }, reconnection: false });
    sockets.push(socket);
    await new Promise<void>((resolve, reject) => {
      const timer = setTimeout(() => reject(Error('Socket connection timeout')), 3000);
      socket.once('connect', () => { clearTimeout(timer); resolve(); });
      socket.once('connect_error', (error) => { clearTimeout(timer); reject(error); });
    });
    return socket;
  }
  const join = (socket: Socket) => socket.timeout(3000).emitWithAck('channel:join', 5);

  it('allows an invited member to write and delivers to both members', async () => {
    const workspaces = app.get(WorkspacesService);
    await expect(workspaces.inviteMember(1, 3, 'guest@example.com')).rejects.toThrow('Only owners');
    await expect(workspaces.inviteMember(1, 1, 'missing@example.com')).rejects.toThrow('register');
    const guest = await connect(2);
    expect((await join(guest)).success).toBe(false);
    await workspaces.inviteMember(1, 1, 'guest@example.com');
    await workspaces.inviteMember(1, 1, 'guest@example.com');
    expect(members.get(2)).toBe('MEMBER');
    await expect(workspaces.inviteMember(1, 2, 'guest@example.com')).rejects.toThrow('Only owners');
    const owner = await connect(1);
    expect((await join(owner)).success).toBe(true);
    expect((await join(guest)).success).toBe(true);
    const received = [owner, guest].map((socket) => new Promise<any>((resolve, reject) => {
      const timer = setTimeout(() => reject(Error('Message timeout')), 3000);
      socket.once('message:new', (message) => { clearTimeout(timer); resolve(message); });
    }));
    await app.get(MessagesService).create(5, 2, { text: 'Hello live' });
    for (const message of await Promise.all(received)) expect(message.text).toBe('Hello live');
    const outsider = await connect(3);
    expect((await join(outsider)).success).toBe(false);
    await expect(app.get(MessagesService).create(5, 3, { text: 'Forbidden' })).rejects.toThrow();
  });
});
