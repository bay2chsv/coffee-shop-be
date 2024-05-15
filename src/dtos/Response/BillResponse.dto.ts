import { IsEmpty } from 'class-validator';
import { CoffeeTableResponse } from './CoffeeTableResponse.dto';

export class BillResponse {
  id: number;

  total: number;

  isCancel: boolean;

  createdAt: number;

  coffeeTable: CoffeeTableResponse;
}
