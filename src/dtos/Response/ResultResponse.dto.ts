export class ResultResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  page?: number;
  limit?: number;
  totalItem?: number;
  totalPage?: number;
}
