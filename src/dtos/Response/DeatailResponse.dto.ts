import { IsEmpty } from 'class-validator';
import { Drink } from 'src/entitys/drink.entity';

export class DetailResponse {
  id: number;

  price: number;

  amount: number;

  drinkName: string;
}
