import { IsEmail, IsString, MinLength, MaxLength, Matches } from 'class-validator';

export class RegisterDto {
  @IsString()
  @MinLength(20, { message: 'name must be between 20 and 60 characters' })
  @MaxLength(60, { message: 'name must be between 20 and 60 characters' })
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8, { message: 'password must be between 8 and 16 characters' })
  @MaxLength(16, { message: 'password must be between 8 and 16 characters' })
  @Matches(/^(?=.*[A-Z])(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).+$/, {
    message: 'password must contain at least one uppercase letter and one special character',
  })
  password: string;

  @IsString()
  @MaxLength(400, { message: 'address must be at most 400 characters' })
  address: string;
}
