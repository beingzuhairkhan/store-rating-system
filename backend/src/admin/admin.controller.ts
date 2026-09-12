import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { CreateStoreDto } from 'src/stores/dto/create-store.dto';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Role } from '@prisma/client';

@Controller('admin')
@Roles(Role.ADMIN)
export class AdminController {
  constructor(private adminService: AdminService) { }

  @Post('users')
  createUser(@Body() dto: CreateUserDto) {
    return this.adminService.createUser(dto);
  }

  @Post('stores')
  createStore(@Body() dto: CreateStoreDto) {
    return this.adminService.createStore(dto);
  }

  @Get('stats')
  getDashboardStats() {
    return this.adminService.getDashboardStats();
  }

  @Get('users')
  listUsers(
    @Query('search') search?: string,
    @Query('name') name?: string,
    @Query('email') email?: string,
    @Query('address') address?: string,
    @Query('role') role?: string,
    @Query('sortBy') sortBy?: string,
    @Query('order') order?: 'asc' | 'desc',
    @Query('sortOrder') sortOrder?: 'asc' | 'desc',
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.adminService.listUsers({
      search,
      name,
      email,
      address,
      role,
      sortBy,
      order,
      sortOrder,
      page: parseInt(page || '1', 10),
      limit: parseInt(limit || '10', 10),
    });
  }


  @Get('stores')
  listStores(
    @Query('search') search?: string,
    @Query('name') name?: string,
    @Query('email') email?: string,
    @Query('address') address?: string,
    @Query('sortBy') sortBy?: string,
    @Query('order') order?: 'asc' | 'desc',
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.adminService.listStores({
      search,
      name,
      email,
      address,
      sortBy,
      order,
      page: Math.max(parseInt(page || '1', 10), 1),
      limit: Math.max(parseInt(limit || '10', 10), 1),
    });
  }



  @Get('users/:id')
  getUserDetails(@Param('id') id: string) {
    return this.adminService.getUserDetails(id);
  }

  @Get('stores/:id')
  getStoreDetails(@Param('id') id: string) {
    return this.adminService.getStoreDetails(id);
  }

  @Get('store-owners/:id/rating')
  getStoreOwnerAverageRating(@Param('id') id: string) {
    return this.adminService.getStoreOwnerAverageRating(id);
  }
}
