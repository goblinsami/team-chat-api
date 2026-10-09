import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class MessagesGateway {
  @WebSocketServer()
  server: Server;

  @SubscribeMessage('channel:join')
  joinChannel(
    @MessageBody() channelId: number,
    @ConnectedSocket() client: Socket,
  ) {
    client.join(`channel:${channelId}`);
  }

  emitNewMessage(channelId: number, message: unknown) {
    this.server.to(`channel:${channelId}`).emit('message:new', message);
  }
}
