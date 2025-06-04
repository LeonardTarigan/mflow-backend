import { ResponseMeta } from 'src/common/api.model';

class Room {
  id: number;
  name: string;
  created_at: Date;
  updated_at: Date;
}

export class AddRoomDto {
  name: string;
}

export class AddRoomResponse extends Room {}

export class GetAllRoomsResponse {
  data: Room[];
  meta: ResponseMeta;
}

export class UpdateRoomDto {
  name?: string;
}
