import { PickType } from '@nestjs/mapped-types';
import {
  CareSessionDetail,
  CareSessionEntity,
} from 'src/care-session/domain/model/care-session.model';

export class MainQueueItem extends CareSessionDetail {}
export class GetMainQueueResponse {
  data: MainQueueItem[];
}

export class ActiveQueue {
  current: MainQueueItem;
  next_queues: { id: number; queue_number: string }[];
}

export class UpdateQueueStatusDto extends PickType(CareSessionEntity, [
  'status',
] as const) {}

export class UpdateQueueStatusResponse extends CareSessionEntity {}
