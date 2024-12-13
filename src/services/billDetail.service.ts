import { Injectable } from '@nestjs/common';
import { BadRequestException } from '@nestjs/common/exceptions';
import { InjectRepository } from '@nestjs/typeorm';
import { BillDetailRequest } from 'src/dtos/Request/billDetailRequest.dto';
import { DetailResponse } from 'src/dtos/Response/DeatailResponse.dto';
import { Bill } from 'src/entitys/bill.entity';
import { BillDetail } from 'src/entitys/billDetail.entity';
import { Drink } from 'src/entitys/drink.entity';
import { Repository } from 'typeorm';

@Injectable()
export class BillDetailService {
  constructor(
    @InjectRepository(BillDetail)
    private readonly billDetailRepository: Repository<BillDetail>,
    @InjectRepository(Drink)
    private readonly drinkRepository: Repository<Drink>,
  ) {}

  async getBillDetail(bill: Bill) {
    const billDetails = await this.billDetailRepository.find({
      relations: ['drink'],
      where: { bill: bill },
    });

    const response: DetailResponse[] = [];
    billDetails.forEach((item: BillDetail) => {
      const drinkName = item.drink ? item.drink.name : 'This drink was deleted';
      const detailResponse: DetailResponse = {
        id: item.id,
        price: item.price,
        amount: item.amount,
        drinkName: drinkName,
      };
      response.push(detailResponse);
    });
    return response;
  }
  async createBillDetail(bill: Bill, billDetailRequest: BillDetailRequest) {
    const drink = await this.drinkRepository.findOneBy({
      id: billDetailRequest.drinkId,
    });
    if (!drink) {
      throw new BadRequestException(
        `drink id: ${billDetailRequest.drinkId} not found`,
      );
    }
    const billDetail = await this.billDetailRepository.save({
      amount: billDetailRequest.amount,
      price: drink.price,
      bill: bill,
      drink: drink,
    });
    return billDetail;
  }
}
