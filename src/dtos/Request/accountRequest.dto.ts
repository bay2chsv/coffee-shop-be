import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { Role } from 'src/roleConfig/role.enum';
export class AccountRequest {
  @IsEmail()
  @IsNotEmpty()
  email: string;
  @IsString()
  @IsNotEmpty()
  password: string;
  @IsString()
  @IsNotEmpty()
  fullName: string;
  roleId: Role;
}
