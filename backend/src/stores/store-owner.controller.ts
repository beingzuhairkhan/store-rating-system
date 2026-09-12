import { Controller, Get } from '@nestjs/common';
import { StoresService } from './stores.service';
import { Roles } from 'src/common/decorators/roles.decorator';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { Role } from '@prisma/client';

@Controller('store-owner')
export class StoreOwnerController {
  constructor(private storesService: StoresService) {}

  @Roles(Role.STORE_OWNER)
  @Get('store')
  async getMyStore(@CurrentUser() user: { sub: string }) {
    const store = await this.storesService.findStoreByOwner(user.sub);
    const averageRating = await this.storesService.getStoreAverageRating(store.id);
    return {
      message: 'Store retrieved successfully',
      data: { ...store, averageRating },
    };
  }
}
