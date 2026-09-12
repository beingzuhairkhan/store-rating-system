import { IsString, MinLength, MaxLength, Matches } from 'class-validator';

export class UpdatePasswordDto {
  @IsString()
  currentPassword: string;

  @IsString()
  @MinLength(8, { message: 'password must be between 8 and 16 characters' })
  @MaxLength(16, { message: 'password must be between 8 and 16 characters' })
  @Matches(/^(?=.*[A-Z])(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).+$/, {
    message: 'password must contain at least one uppercase letter and one special character',
  })
  newPassword: string;
}
