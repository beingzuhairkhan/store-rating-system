import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateStoreDto } from './dto/create-store.dto';
import { Prisma, Role } from '@prisma/client';

@Injectable()
export class StoresService {
  constructor(private prisma: PrismaService) { }

  async createStore(dto: CreateStoreDto) {
    const owner = await this.prisma.user.findUnique({ where: { id: dto.ownerId } });
    if (!owner) throw new NotFoundException('Store owner not found');
    if (owner.role !== Role.STORE_OWNER) {
      throw new ConflictException('Assigned owner must have role STORE_OWNER');
    }

    return this.prisma.store.create({
      data: {
        name: dto.name,
        email: dto.email,
        address: dto.address,
        ownerId: dto.ownerId,
      },
      include: { _count: { select: { ratings: true } } },
    });
  }

  async findStoreById(id: string) {
    const store = await this.prisma.store.findUnique({
      where: { id },
      include: {
        owner: {
          select: { id: true, name: true, email: true },
        },
        _count: { select: { ratings: true } },
      },
    });
    if (!store) throw new NotFoundException('Store not found');
    return store;
  }

  async findStoreByOwner(ownerId: string) {
    const store = await this.prisma.store.findFirst({
      where: { ownerId },
      include: {
        ratings: {
          include: {
            user: { select: { id: true, name: true, email: true } },
          },
        },
        _count: { select: { ratings: true } },
      },
    });
    if (!store) throw new NotFoundException('You do not have a store');
    return store;
  }

  async findAllStores(params: {
    skip?: number;
    take?: number;
    where?: Prisma.StoreWhereInput;
    orderBy?: Prisma.StoreOrderByWithRelationInput;
  }) {
    return this.prisma.store.findMany({
      skip: params.skip,
      take: params.take,
      where: params.where,
      orderBy: params.orderBy,

      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },

        _count: {
          select: {
            ratings: true,
          },
        },
      },
    });
  }

  async count(where?: Record<string, unknown>) {
    return this.prisma.store.count({ where });
  }

  async getStoreAverageRating(
    storeId: string,
  ): Promise<number | null> {
    const result = await this.prisma.rating.aggregate({
      where: {
        storeId,
      },
      _avg: {
        rating: true,
      },
    });

    if (result._avg.rating === null) {
      return null;
    }

    return Math.round(result._avg.rating * 100) / 100;
  }
}
