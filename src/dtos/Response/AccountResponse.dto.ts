import { Role } from 'src/roleConfig/role.enum';

export class AccountResponse {
  id: number;
  fullName: string;

  email: string;
  isActive: boolean;
  isBlock: boolean;

  role: Role;
}
