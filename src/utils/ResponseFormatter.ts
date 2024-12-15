/* eslint-disable prettier/prettier */
import { ResultResponse } from 'src/dtos/Response/ResultResponse.dto';
export class ResponseFormatter {
  static formatResponse<T>(
    success: boolean,
    message: string,
    data?: T,
    pagination?: {
      page?: number;
      limit?: number;
      totalItem?: number;
      totalPage?: number;
    },
  ): ResultResponse<T> {
    return {
      success,
      message,
      data,
      ...pagination,
    };
  }
}
