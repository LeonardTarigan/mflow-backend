import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { CommonModule } from './common/common.module';
import { DrugModule } from './drug/drug.module';
import { RoomModule } from './room/room.module';
import { UserModule } from './user/user.module';

@Module({
  imports: [CommonModule, AuthModule, DrugModule, RoomModule, UserModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
