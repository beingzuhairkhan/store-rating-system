import { Module } from '@nestjs/common';
import { StoresController } from './stores.controller';
import { StoreOwnerController } from './store-owner.controller';
import { StoresService } from './stores.service';

@Module({
  controllers: [StoresController, StoreOwnerController],
  providers: [StoresService],
  exports: [StoresService],
})
export class StoresModule {}
