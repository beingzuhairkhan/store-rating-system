import { Controller, Get, Param, Query } from '@nestjs/common';
import { StoresService } from './stores.service';
import { Roles } from 'src/common/decorators/roles.decorator';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { Role } from '@prisma/client';

@Controller('store-owner')
export class StoreOwnerController {
  constructor(private storesService: StoresService) { }

  @Roles(Role.STORE_OWNER)
  @Get('store')
  async getMyStore(
    @CurrentUser() user: { sub: string },
    @Query('search') search?: string,
    @Query('name') name?: string,
    @Query('email') email?: string,
    @Query('address') address?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: 'asc' | 'desc',
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const stores = await this.storesService.findStoreByOwner({
      ownerId: user.sub,
      search,
      name,
      email,
      address,
      sortBy,
      sortOrder,
      page: Math.max(parseInt(page || '1', 10), 1),
      limit: Math.max(parseInt(limit || '10', 10), 1),
    });

    return {
      message: 'Store retrieved successfully',
      data: stores,
    };
  }

  @Roles(Role.STORE_OWNER)
  @Get('store/:id')
  async getStoreById(
    @CurrentUser() user: { sub: string },
    @Param('id') storeId: string,
  ) {
    const store = await this.storesService.findStoreByIdForOwner(
      storeId,
      user.sub,
    );

    return {
      message: 'Store retrieved successfully',
      data: store,
    };
  }
}
