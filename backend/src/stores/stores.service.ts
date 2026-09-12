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

  async findStoreByOwner(params: {
    ownerId: string;
    search?: string;
    name?: string;
    email?: string;
    address?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    page?: number;
    limit?: number;
  }) {
    const {
      ownerId,
      search,
      name,
      email,
      address,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      page = 1,
      limit = 10,
    } = params;

    const skip = (page - 1) * limit;

    const where: Prisma.StoreWhereInput = {
      ownerId,
    };

    // Global search
    if (search?.trim()) {
      const value = search.trim();

      where.OR = [
        {
          name: {
            contains: value,
            mode: 'insensitive',
          },
        },
        {
          email: {
            contains: value,
            mode: 'insensitive',
          },
        },
        {
          address: {
            contains: value,
            mode: 'insensitive',
          },
        },
      ];
    }

    // Individual filters
    if (name?.trim()) {
      where.name = {
        contains: name.trim(),
        mode: 'insensitive',
      };
    }

    if (email?.trim()) {
      where.email = {
        contains: email.trim(),
        mode: 'insensitive',
      };
    }

    if (address?.trim()) {
      where.address = {
        contains: address.trim(),
        mode: 'insensitive',
      };
    }

    // Sorting
    const validSortFields = [
      'name',
      'email',
      'address',
      'createdAt',
      'updatedAt',
    ] as const;

    const safeSortBy = validSortFields.includes(
      sortBy as (typeof validSortFields)[number],
    )
      ? sortBy
      : 'createdAt';

    const safeSortOrder: 'asc' | 'desc' =
      sortOrder === 'asc' ? 'asc' : 'desc';

    const orderBy = {
      [safeSortBy]: safeSortOrder,
    } as Prisma.StoreOrderByWithRelationInput;

    // Total count for pagination
    const total = await this.prisma.store.count({
      where,
    });

    if (total === 0) {
      throw new NotFoundException('You do not have a store');
    }

    // Only fetch data required by dashboard
    const stores = await this.prisma.store.findMany({
      where,
      orderBy,
      skip,
      take: limit,

      select: {
        id: true,
        name: true,
        email: true,
        address: true,

        _count: {
          select: {
            ratings: true,
          },
        },
      },
    });

    // Add rating information
    const storesWithRating = await Promise.all(
      stores.map(async (store) => {
        const averageRating = await this.getStoreAverageRating(
          store.id,
        );

        return {
          id: store.id,
          name: store.name,
          email: store.email,
          address: store.address,
          averageRating,
          ratingCount: store._count.ratings,
        };
      }),
    );

    /*
     * Summary should be calculated across ALL owner's stores,
     * not only the current paginated page.
     */
    const allStores = await this.prisma.store.findMany({
      where: {
        ownerId,
      },

      select: {
        id: true,

        _count: {
          select: {
            ratings: true,
          },
        },
      },
    });

    const totalStores = allStores.length;

    const totalRatings = allStores.reduce(
      (sum, store) => sum + store._count.ratings,
      0,
    );

    /*
     * Get averages for all stores so the dashboard's
     * overall average is not affected by pagination.
     */
    const allStoresWithRatings = await Promise.all(
      allStores.map(async (store) => {
        const averageRating = await this.getStoreAverageRating(
          store.id,
        );

        return {
          ratingCount: store._count.ratings,
          averageRating,
        };
      }),
    );

    const ratedStores = allStoresWithRatings.filter(
      (store) => store.ratingCount > 0,
    );

    const ratedStoreCount = ratedStores.length;

    const overallAverage =
      ratedStoreCount > 0
        ? ratedStores.reduce(
          (sum, store) =>
            sum + (store.averageRating ?? 0),
          0,
        ) / ratedStoreCount
        : null;

    const totalPages = Math.ceil(total / limit);

    return {
      stores: storesWithRating,

      summary: {
        totalStores,
        totalRatings,

        averageRating:
          overallAverage !== null
            ? Number(overallAverage.toFixed(1))
            : null,

        ratedStores: ratedStoreCount,
      },

      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    };
  }

  async findAllStores(params: {
    skip?: number;
    take?: number;
    where?: Prisma.StoreWhereInput;
    orderBy?: Prisma.StoreOrderByWithRelationInput;
    userId?: string;
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

        ratings: params.userId
          ? {
            where: {
              userId: params.userId,
            },
            select: {
              rating: true,
            },
          }
          : false,

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

  async findStoreByIdForOwner(
    storeId: string,
    ownerId: string,
  ) {
    const store = await this.prisma.store.findFirst({
      where: {
        id: storeId,
        ownerId,
      },
      select: {
        id: true,
        name: true,
        email: true,
        address: true,
        createdAt: true,
        updatedAt: true,

        ratings: {
          orderBy: {
            updatedAt: 'desc',
          },
          select: {
            id: true,
            rating: true,
            createdAt: true,
            updatedAt: true,

            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },

        _count: {
          select: {
            ratings: true,
          },
        },
      },
    });

    if (!store) {
      throw new NotFoundException(
        'Store not found or you do not have access to this store',
      );
    }

    const averageRating = await this.getStoreAverageRating(store.id);

    return {
      id: store.id,
      name: store.name,
      email: store.email,
      address: store.address,
      createdAt: store.createdAt,
      updatedAt: store.updatedAt,

      averageRating,
      ratingCount: store._count.ratings,

      ratings: store.ratings,
    };
  }


}
