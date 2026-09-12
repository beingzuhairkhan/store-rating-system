import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateRatingDto } from './dto/create-rating.dto';
import { UpdateRatingDto } from './dto/update-rating.dto';

@Injectable()
export class RatingsService {
  constructor(private prisma: PrismaService) {}

  async createOrUpdateRating(userId: string, dto: CreateRatingDto) {
    const store = await this.prisma.store.findUnique({
      where: { id: dto.storeId },
    });
    if (!store) throw new NotFoundException('Store not found');

    const existing = await this.prisma.rating.findUnique({
      where: {
        userId_storeId: { userId, storeId: dto.storeId },
      },
    });

    if (existing) {
      const updated = await this.prisma.rating.update({
        where: { id: existing.id },
        data: { rating: dto.rating },
      });
      return { message: 'Rating updated successfully', data: updated };
    }

    const rating = await this.prisma.rating.create({
      data: {
        userId,
        storeId: dto.storeId,
        rating: dto.rating,
      },
    });
    return { message: 'Rating created successfully', data: rating };
  }

  async updateRating(userId: string, ratingId: string, dto: UpdateRatingDto) {
    const rating = await this.prisma.rating.findUnique({
      where: { id: ratingId },
    });
    if (!rating) throw new NotFoundException('Rating not found');
    if (rating.userId !== userId) {
      throw new ForbiddenException('You can only update your own ratings');
    }

    const updated = await this.prisma.rating.update({
      where: { id: ratingId },
      data: { rating: dto.rating },
    });
    return { message: 'Rating updated successfully', data: updated };
  }

  async getUserRatingForStore(userId: string, storeId: string) {
    return this.prisma.rating.findUnique({
      where: {
        userId_storeId: { userId, storeId },
      },
    });
  }

  async getRatingsForStore(storeId: string) {
    return this.prisma.rating.findMany({
      where: { storeId },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async count() {
    return this.prisma.rating.count();
  }

  async getAverageRatingForOwner(ownerId: string): Promise<number | null> {
    const store = await this.prisma.store.findFirst({
      where: { ownerId },
    });
    if (!store) return null;

    const result = await this.prisma.rating.aggregate({
      where: { storeId: store.id },
      _avg: { rating: true },
    });
    return result._avg.rating ? Math.round(result._avg.rating * 100) / 100 : null;
  }
}
