import { PartialType } from '@nestjs/mapped-types';
import { IsInt, IsNotEmpty, IsPositive, IsString } from 'class-validator';
import { ResponseMeta } from 'src/common/api.model';

export class RoomEntity {
  @IsInt()
  @IsPositive()
  id: number;

  @IsString()
  @IsNotEmpty()
  name: string;
}

export class CreateRoomDto {
  @IsString()
  @IsNotEmpty()
  name: string;
}

export class UpdateRoomDto extends PartialType(CreateRoomDto) {}

export class GetAllRoomsResponse {
  data: RoomEntity[];
  meta: ResponseMeta;
}
