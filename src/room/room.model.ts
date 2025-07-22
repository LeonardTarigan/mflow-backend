import { PartialType, PickType } from '@nestjs/mapped-types';
import { ResponseMeta } from 'src/common/api.model';

export class RoomEntity {
  id: number;
  name: string;
  created_at: Date;
  updated_at: Date;
}

export class CreateRoomDto extends PickType(RoomEntity, ['name']) {}

export class UpdateRoomDto extends PartialType(CreateRoomDto) {}

export class GetAllRoomsResponse {
  data: RoomEntity[];
  meta: ResponseMeta;
}
