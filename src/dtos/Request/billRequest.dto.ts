import { BillDetailRequest } from './billDetailRequest.dto';
import { IsNumber, IsNotEmpty, IsArray } from 'class-validator';
export class BillRequest {
  @IsNumber()
  @IsNotEmpty()
  total: number;

  @IsNumber()
  @IsNotEmpty()
  coffeeTableId: number;

  @IsArray()
  @IsNotEmpty()
  detail: BillDetailRequest[];
}
