import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class ProfileRequest {
  @IsNotEmpty()
  @IsEmail()
  email: string;
  newPassword?: string;
  oldPassword?: string;
  @IsNotEmpty()
  @IsString()
  fullName: string;
}
