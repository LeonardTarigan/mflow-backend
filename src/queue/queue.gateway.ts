import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { Logger } from 'winston';
import { Inject } from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { WaitingQueueDetail } from './queue.model';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class QueueGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(@Inject(WINSTON_MODULE_PROVIDER) private logger: Logger) {}

  handleConnection(client: any) {
    this.logger.info(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: any) {
    this.logger.info(`Client disconnected: ${client.id}`);
  }

  emitWaitingQueueUpdate(data: WaitingQueueDetail[]) {
    this.server.emit('waiting_queue_update', data);
  }
}
