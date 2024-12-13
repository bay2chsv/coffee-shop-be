import { BillResponse } from './BillResponse.dto';
import { DetailResponse } from './DeatailResponse.dto';

export class BillDetailResponse {
  bill: BillResponse;
  billDetail: DetailResponse[];
}
