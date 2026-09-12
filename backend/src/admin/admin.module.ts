import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { UsersModule } from 'src/users/users.module';
import { StoresModule } from 'src/stores/stores.module';
import { RatingsModule } from 'src/ratings/ratings.module';

@Module({
  imports: [UsersModule, StoresModule, RatingsModule],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
