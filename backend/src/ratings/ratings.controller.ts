import { Controller, Post, Put, Get, Body, Param, Query } from '@nestjs/common';
import { RatingsService } from './ratings.service';
import { CreateRatingDto } from './dto/create-rating.dto';
import { UpdateRatingDto } from './dto/update-rating.dto';
import { Roles } from 'src/common/decorators/roles.decorator';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { Role } from '@prisma/client';

@Controller('ratings')
export class RatingsController {
  constructor(private ratingsService: RatingsService) {}

  @Roles(Role.USER)
  @Post()
  createRating(
    @CurrentUser() user: { sub: string },
    @Body() dto: CreateRatingDto,
  ) {
    return this.ratingsService.createOrUpdateRating(user.sub, dto);
  }

  @Roles(Role.USER)
  @Put(':id')
  updateRating(
    @CurrentUser() user: { sub: string },
    @Param('id') id: string,
    @Body() dto: UpdateRatingDto,
  ) {
    return this.ratingsService.updateRating(user.sub, id, dto);
  }

  @Roles(Role.USER)
  @Get('my')
  getMyRatingForStore(
    @CurrentUser() user: { sub: string },
    @Query('storeId') storeId: string,
  ) {
    return this.ratingsService.getUserRatingForStore(user.sub, storeId);
  }
}
