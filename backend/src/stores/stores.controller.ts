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
import { Role } from '@prisma/client';

@Controller('stores')
export class StoresController {
  constructor(private storesService: StoresService) {}

  @Roles(Role.USER, Role.ADMIN)
  @Get()
  async findAll(
    @Query('name') name?: string,
    @Query('address') address?: string,
    @Query('sortBy') sortBy: string = 'createdAt',
    @Query('sortOrder') sortOrder: 'asc' | 'desc' = 'desc',
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const pageNum = parseInt(page || '1', 10);
    const limitNum = parseInt(limit || '10', 10);
    const skip = (pageNum - 1) * limitNum;

    const where: Record<string, unknown> = {};
    if (name) where.name = { contains: name, mode: 'insensitive' };
    if (address) where.address = { contains: address, mode: 'insensitive' };

    const validSortFields = ['name', 'address', 'createdAt', 'updatedAt'];
    const orderBy: Record<string, 'asc' | 'desc'> = {
      [validSortFields.includes(sortBy) ? sortBy : 'createdAt']:
        sortOrder === 'asc' ? 'asc' : 'desc',
    };

    const [stores, total] = await Promise.all([
      this.storesService.findAllStores({ skip, take: limitNum, where, orderBy }),
      this.storesService.count(where),
    ]);

    const storesWithAvg = await Promise.all(
      stores.map(async (s) => ({
        ...s,
        averageRating: await this.storesService.getStoreAverageRating(s.id),
      })),
    );

    return {
      message: 'Stores retrieved successfully',
      data: {
        items: storesWithAvg,
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
