import { CategoryResponse } from './CategoryResponse.dto';

export class DrinkResponse {
  id: number;
  name: string;
  imageUrl: string;
  price: number;
  isSell: boolean;
  category: CategoryResponse;
}
