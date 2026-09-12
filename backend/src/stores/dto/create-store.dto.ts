import {
  IsString,
  IsEmail,
  IsOptional,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateStoreDto {
  @IsString()
  @MinLength(1, { message: 'name is required' })
  @MaxLength(60, { message: 'name must be at most 60 characters' })
  name: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @MaxLength(400, { message: 'address must be at most 400 characters' })
  address: string;

  @IsString()
  ownerId: string;
}
