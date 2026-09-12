import { IsInt, Min, Max } from 'class-validator';

export class UpdateRatingDto {
  @IsInt({ message: 'rating must be an integer between 1 and 5' })
  @Min(1, { message: 'rating must be at least 1' })
  @Max(5, { message: 'rating must be at most 5' })
  rating: number;
}
