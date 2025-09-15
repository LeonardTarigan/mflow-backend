import { Inject } from '@nestjs/common';
import {
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Server, Socket } from 'socket.io';
import { Logger } from 'winston';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class QueueGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(@Inject(WINSTON_MODULE_PROVIDER) private logger: Logger) {}

  handleConnection(client: Socket): void {
    this.logger.info(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket): void {
    this.logger.info(`Client disconnected: ${client.id}`);
  }

  emitWaitingQueueUpdate(): void {
    this.logger.info(`Waiting queue updated`);
    this.server.emit('waiting_queue_update');
  }

  emitCalledQueueUpdate(): void {
    this.logger.info(`Called queue updated: `);
    this.server.emit('called_queue_update');
  }

  @SubscribeMessage('trigger_called_queue_update')
  handleTriggerCalledQueueUpdate(@ConnectedSocket() client: Socket): void {
    this.logger.info(`Triggered from client ${client.id}`);
    this.emitCalledQueueUpdate();
  }
}
