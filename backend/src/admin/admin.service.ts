import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UsersService } from 'src/users/users.service';
import { StoresService } from 'src/stores/stores.service';
import { RatingsService } from 'src/ratings/ratings.service';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { CreateStoreDto } from 'src/stores/dto/create-store.dto';
import { Prisma, Role } from '@prisma/client';

@Injectable()
export class AdminService {
  constructor(
    private prisma: PrismaService,
    private usersService: UsersService,
    private storesService: StoresService,
    private ratingsService: RatingsService,
  ) { }

  async createUser(dto: CreateUserDto) {
    const existing = await this.usersService.findByEmail(dto.email);
    if (existing) throw new ConflictException('Email already registered');
    const user = await this.usersService.createUser(dto);
    return { message: 'User created successfully', data: user };
  }

  async createStore(dto: CreateStoreDto) {
    const store = await this.storesService.createStore(dto);
    return { message: 'Store created successfully', data: store };
  }

  async getDashboardStats() {
    const [totalUsers, totalStores, totalRatings] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.store.count(),
      this.ratingsService.count(),
    ]);

    return {
      message: 'Dashboard statistics retrieved successfully',
      data: { totalUsers, totalStores, totalRatings },
    };
  }

  async listUsers(params: {
    search?: string;
    name?: string;
    email?: string;
    address?: string;
    role?: string;
    sortBy?: string;
    order?: 'asc' | 'desc';
    sortOrder?: 'asc' | 'desc';
    page?: number;
    limit?: number;
  }) {
    const {
      search,
      name,
      email,
      address,
      role,
      sortBy = 'createdAt',
      order = 'desc',
      sortOrder,
      page = 1,
      limit = 10,
    } = params;

    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};

    // Global search
    if (search) {
      where.OR = [
        {
          name: {
            contains: search,
            mode: 'insensitive',
          },
        },
        {
          email: {
            contains: search,
            mode: 'insensitive',
          },
        },
        {
          address: {
            contains: search,
            mode: 'insensitive',
          },
        },
      ];
    }

    // Individual filters
    if (name) {
      where.name = {
        contains: name,
        mode: 'insensitive',
      };
    }

    if (email) {
      where.email = {
        contains: email,
        mode: 'insensitive',
      };
    }

    if (address) {
      where.address = {
        contains: address,
        mode: 'insensitive',
      };
    }

    if (role) {
      where.role = role;
    }

    const validSortFields = [
      'name',
      'email',
      'address',
      'role',
      'createdAt',
      'updatedAt',
    ];

    const safeSortBy = validSortFields.includes(sortBy)
      ? sortBy
      : 'createdAt';

    const safeSortOrder = sortOrder ?? order;

    const safeOrder =
      safeSortOrder === 'asc' ? 'asc' : 'desc';

    const orderBy: Record<string, 'asc' | 'desc'> = {
      [safeSortBy]: safeOrder,
    };

    const [users, total] = await Promise.all([
      this.usersService.findMany({
        skip,
        take: limit,
        where,
        orderBy,
      }),
      this.usersService.count(where),
    ]);

    return {
      message: 'Users retrieved successfully',
      data: {
        items: users,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }


  async listStores(params: {
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

    const where: Prisma.StoreWhereInput = {};

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

    const [stores, total] = await Promise.all([
      this.storesService.findAllStores({
        skip,
        take: limit,
        where,
        orderBy,
      }),

      this.storesService.count(where),
    ]);

    const storesWithAvg = await Promise.all(
      stores.map(async (store) => ({
        ...store,
        averageRating:
          await this.storesService.getStoreAverageRating(store.id),
      })),
    );

    return {
      message: 'Stores retrieved successfully',
      data: {
        items: storesWithAvg,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }


  async getUserDetails(id: string) {
    const user = await this.usersService.findById(id);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const stores = await this.prisma.store.findMany({
      where: {
        ownerId: id,
      },
      select: {
        id: true,
        name: true,
        email: true,
        address: true,

        ratings: {
          select: {
            rating: true,
          },
        },
      },
    });

    const storesWithAverage = stores.map((store) => {
      const ratings = store.ratings.map((r) => r.rating);

      const averageRating =
        ratings.length > 0
          ? ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length
          : 0;

      return {
        id: store.id,
        name: store.name,
        email: store.email,
        address: store.address,
        averageRating: Number(averageRating.toFixed(1)),
      };
    });

    return {
      message: 'User details retrieved successfully',
      data: {
        ...user,
        stores: storesWithAverage,
      },
    };
  }



  async getStoreDetails(id: string) {
    const store = await this.storesService.findStoreById(id);
    const averageRating = await this.storesService.getStoreAverageRating(id);
    const ratings = await this.ratingsService.getRatingsForStore(id);

    return {
      message: 'Store details retrieved successfully',
      data: { ...store, averageRating, ratings },
    };
  }

  async getStoreOwnerAverageRating(ownerId: string) {
    const owner = await this.usersService.findById(ownerId);
    if (!owner) throw new NotFoundException('User not found');
    if (owner.role !== Role.STORE_OWNER) {
      throw new ConflictException('User is not a store owner');
    }

    const averageRating = await this.ratingsService.getAverageRatingForOwner(ownerId);
    return {
      message: 'Store owner average rating retrieved successfully',
      data: { owner, averageRating },
    };
  }
}
