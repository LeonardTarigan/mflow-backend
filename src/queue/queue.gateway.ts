import { Inject } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Server, Socket } from 'socket.io';
import { Logger } from 'winston';

import { CalledQueue, WaitingQueueDetail } from './queue.model';

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
    this.logger.info(`Waiting queue updated: `, data);
    this.server.emit('waiting_queue_update', data);
  }

  emitCalledQueueUpdate(data: CalledQueue) {
    this.logger.info(`Called queue updated: `, data);
    this.server.emit('called_queue_update', data);
  }

  @SubscribeMessage('trigger_called_queue_update')
  handleTriggerCalledQueueUpdate(
    @MessageBody() data: CalledQueue,
    @ConnectedSocket() client: Socket,
  ) {
    this.logger.info(`Triggered from client ${client.id}: `, data);
    this.emitCalledQueueUpdate(data);
  }
}
