class AccountResponse {
  id: number;
  fullName: string;

  email: string;
  isActive: boolean;
  isBlock: boolean;

  role: {
    id: number;
    name: string;
  };
}
