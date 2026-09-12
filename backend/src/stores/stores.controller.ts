import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  Param,
} from '@nestjs/common';
import { StoresService } from './stores.service';
import { CreateStoreDto } from './dto/create-store.dto';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Prisma, Role } from '@prisma/client';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';

@Controller('stores')
export class StoresController {
  constructor(private storesService: StoresService) { }

  @Roles(Role.USER, Role.ADMIN)
  @Get()
  async findAll(
    @CurrentUser() user: { sub: string },
    @Query('name') name?: string,
    @Query('address') address?: string,
    @Query('sortBy') sortBy: string = 'createdAt',
    @Query('sortOrder') sortOrder: 'asc' | 'desc' = 'desc',
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const pageNum = Math.max(parseInt(page || '1', 10), 1);
    const limitNum = Math.max(parseInt(limit || '10', 10), 1);
    const skip = (pageNum - 1) * limitNum;

    const where: Prisma.StoreWhereInput = {};

    if (name?.trim()) {
      where.name = {
        contains: name.trim(),
        mode: 'insensitive',
      };
    }

    if (address?.trim()) {
      where.address = {
        contains: address.trim(),
        mode: 'insensitive',
      };
    }

    const validSortFields = [
      'name',
      'address',
      'createdAt',
      'updatedAt',
    ];

    const orderBy = {
      [validSortFields.includes(sortBy) ? sortBy : 'createdAt']:
        sortOrder === 'asc' ? 'asc' : 'desc',
    } as Prisma.StoreOrderByWithRelationInput;

    const [stores, total] = await Promise.all([
      this.storesService.findAllStores({
        skip,
        take: limitNum,
        where,
        orderBy,
        userId: user.sub,
      }),

      this.storesService.count(where),
    ]);

    const storesWithRating = await Promise.all(
      stores.map(async (store) => ({
        ...store,
        averageRating: await this.storesService.getStoreAverageRating(
          store.id,
        ),
      })),
    );

    return {
      message: 'Stores retrieved successfully',
      data: {
        items: storesWithRating,
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    };
  }


  @Roles(Role.USER, Role.ADMIN)
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const store = await this.storesService.findStoreById(id);
    const averageRating = await this.storesService.getStoreAverageRating(id);
    return { message: 'Store retrieved successfully', data: { ...store, averageRating } };
  }

  @Roles(Role.ADMIN)
  @Post()
  async create(@Body() dto: CreateStoreDto) {
    const store = await this.storesService.createStore(dto);
    return { message: 'Store created successfully', data: store };
  }
}
