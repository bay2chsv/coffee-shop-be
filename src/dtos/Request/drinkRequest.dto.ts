import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
export class DrinkRequest {
  @IsNotEmpty()
  name: string;
  @IsNumber()
  @IsNotEmpty()
  price: number;
  @IsString()
  @IsNotEmpty()
  imageUrl: string;
  @IsNumber()
  @IsNotEmpty()
  categoryId: number;
}
