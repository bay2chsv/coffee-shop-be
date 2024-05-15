import { IsNumber, IsNotEmpty } from 'class-validator';

export class BillDetailRequest {
  @IsNumber()
  @IsNotEmpty()
  amount: number;
  @IsNumber()
  @IsNotEmpty()
  drinkId: number;
}
