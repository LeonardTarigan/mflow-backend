import { Module } from '@nestjs/common';
import { AuthTestService } from './modules/auth/auth.spec.service';
import { DrugTestService } from './modules/drug/drug.spec.service';
import { RoomTestService } from './modules/room/room.spec.service';
import { UserTestService } from './modules/user/user.spec.service';

@Module({
  providers: [
    AuthTestService,
    DrugTestService,
    RoomTestService,
    UserTestService,
  ],
})
export class TestModule {}
