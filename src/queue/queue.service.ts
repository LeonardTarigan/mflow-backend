import { Inject, Injectable } from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { CareSessionService } from 'src/care-session/care-session.service';
import { UserService } from 'src/user/user.service';
import { Logger } from 'winston';

import { QueueGateway } from './domain/gateway/queue.gateway';
import {
  ActiveQueue,
  GetMainQueueResponse,
  MainQueueItem,
  UpdateQueueStatusDto,
  UpdateQueueStatusResponse,
} from './domain/model/queue.model';

@Injectable()
export class QueueService {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private logger: Logger,
    private careSessionService: CareSessionService,
    private userService: UserService,
    private queueGateway: QueueGateway,
  ) {}

  async getMainQueue(): Promise<GetMainQueueResponse> {
    this.logger.info('QueueService.getMainQueue()');

    const careSessions = await this.careSessionService.getAll(
      1,
      undefined,
      undefined,
      'ACTIVE',
    );

    return careSessions;
  }

  async getPharmacyQueue(): Promise<ActiveQueue> {
    this.logger.info('QueueService.getPharmacyQueue()');

    const careSessions = await this.careSessionService.getAll(
      1,
      undefined,
      undefined,
      'WAITING_MEDICATION',
    );

    let currentQueue: MainQueueItem;

    if (careSessions.data.length !== 0) {
      currentQueue = careSessions.data[0];
    }

    return {
      current: currentQueue,
      next_queues: careSessions.data.slice(1).map((session) => ({
        id: session.id,
        queue_number: session.queue_number,
      })),
    };
  }

  async getDoctorQueue(doctorId: string): Promise<ActiveQueue> {
    this.logger.info(`QueueService.getDoctorQueue(doctorId=${doctorId})`);

    await this.userService.getById(doctorId);

    const ongingSession = await this.careSessionService.getAll(
      1,
      undefined,
      undefined,
      'IN_CONSULTATION',
      undefined,
      doctorId,
    );

    const waitingSessions = await this.careSessionService.getAll(
      1,
      undefined,
      undefined,
      'WAITING_CONSULTATION',
      undefined,
      doctorId,
    );

    let currentQueue: MainQueueItem;

    if (ongingSession.data.length !== 0) {
      currentQueue = ongingSession.data[0];
    }

    return {
      current: currentQueue,
      next_queues: waitingSessions.data.map((session) => ({
        id: session.id,
        queue_number: session.queue_number,
      })),
    };
  }

  async updateStatus(
    careSessionId: number,
    dto: UpdateQueueStatusDto,
  ): Promise<UpdateQueueStatusResponse> {
    try {
      const res = await this.careSessionService.updateStatus(
        careSessionId,
        dto,
      );

      this.queueGateway.emitWaitingQueueUpdate();

      return res;
    } catch (error) {
      throw error;
    }
  }
}
