import { Injectable } from '@nestjs/common';
import { BadRequestException } from '@nestjs/common/exceptions';
import { InjectRepository } from '@nestjs/typeorm';
import { BillRequest } from 'src/dtos/Request/billRequest.dto';
import { BillDetailResponse } from 'src/dtos/Response/BIllDetailResponse.dto';
import { BillResponse } from 'src/dtos/Response/BillResponse.dto';
import { CoffeeTableResponse } from 'src/dtos/Response/CoffeeTableResponse.dto';
import { DetailResponse } from 'src/dtos/Response/DeatailResponse.dto';

import { ResultResponse } from 'src/dtos/Response/ResultResponse.dto';
import { Bill } from 'src/entitys/bill.entity';
import { CoffeeTable } from 'src/entitys/coffeeTable.entity';
import { Between, LessThan, MoreThan, Repository } from 'typeorm';
import { Transactional } from 'typeorm-transactional';
import { BillDetailService } from './billDetail.service';
import { startOfDay, endOfDay, startOfMonth, endOfMonth } from 'date-fns';
import { ResponseFormatter } from 'src/utils/ResponseFormatter';
@Injectable()
export class BillService {
  constructor(
    @InjectRepository(Bill)
    private readonly billRepository: Repository<Bill>,
    private billDetailService: BillDetailService,
    @InjectRepository(CoffeeTable)
    private readonly coffeeTableRepository: Repository<CoffeeTable>,
  ) {}

  async getAllBill(query): Promise<ResultResponse<BillResponse[]>> {
    const take = query.limit || 10;
    const page = query.page || 1;
    const skip = (page - 1) * take;
    const id = query.id;
    const isCancel = query.isCancel;
    const timeFrom = query.timeFrom;
    const timeTo = query.timeTo;
    const whereCondition: any = {};
    const today = new Date();

    whereCondition.createdAt = Between(startOfDay(today), endOfDay(today));
    if (id) {
      whereCondition.id = id;
    }
    if (isCancel !== undefined) {
      whereCondition.isCancel = isCancel;
      whereCondition.createdAt = LessThan(endOfDay(today));
    }
    if (timeFrom)
      whereCondition.createdAt = MoreThan(startOfDay(new Date(timeFrom)));
    if (timeTo) whereCondition.createdAt = LessThan(endOfDay(new Date(timeTo)));
    if (timeFrom && timeTo)
      whereCondition.createdAt = Between(
        startOfDay(timeFrom),
        endOfDay(timeTo),
      );
    const [bills, totalItem] = await this.billRepository.findAndCount({
      relations: ['coffeeTable'],
      where: whereCondition,
      take: take,
      skip: skip,
    });
    const totalPage = Math.ceil(totalItem / take);

    const billResponses = bills.map((account) =>
      this.mapToBillResponse(account),
    );
    return ResponseFormatter.formatResponse(
      true,
      'Fetched all accounts',
      billResponses,
      {
        page,
        limit: take,
        totalItem,
        totalPage: totalPage,
      },
    );
  }

  async getAllBillForDashBoard(
    month: number,
    year: number,
  ): Promise<ResultResponse<BillResponse[]>> {
    const whereCondition: any = {};
    // import { startOfDay, endOfDay } from 'date-fns';
    const date = new Date(year, month - 1);
    whereCondition.createdAt = Between(startOfMonth(date), endOfMonth(date));

    const bills = await this.billRepository.find({
      relations: ['coffeeTable'],
      where: whereCondition,
    });

    const billResponses = bills.map((account) =>
      this.mapToBillResponse(account),
    );
    return ResponseFormatter.formatResponse(
      true,
      'Fetched all accounts',
      billResponses,
    );
  }

  async getBill(id: number): Promise<ResultResponse<BillDetailResponse>> {
    const bill = await this.billRepository.findOne({
      relations: ['coffeeTable'],
      where: { id: id },
    });
    if (!bill) {
      throw new BadRequestException(`this id:${id} not found`);
    }
    const billResponse = this.mapToBillResponse(bill);

    const detailResponse: DetailResponse[] =
      await this.billDetailService.getBillDetail(bill);

    const billDetailResponse: BillDetailResponse = {
      bill: billResponse,
      billDetail: detailResponse,
    };
    return ResponseFormatter.formatResponse(
      true,
      'get Bill detail',
      billDetailResponse,
    );
  }

  @Transactional()
  async createBill(
    billRequest: BillRequest,
  ): Promise<ResultResponse<BillDetailResponse>> {
    const table = await this.coffeeTableRepository.findOneBy({
      id: billRequest.coffeeTableId,
    });
    if (!table) {
      throw new BadRequestException(
        `table id:${billRequest.coffeeTableId} not found`,
      );
    }
    const current = new Date();
    if (!(current.getHours() >= 7 && current.getHours() < 23)) {
      throw new BadRequestException(
        `System is closed now work daily on 7.00-23.00`,
      );
    }

    const bill = await this.billRepository.save({
      total: billRequest.total,
      coffeeTable: table,
      createdAt: new Date(),
    });
    const detailResponses: DetailResponse[] = [];

    await Promise.all(
      billRequest.detail.map(async (item) => {
        const billDetail = await this.billDetailService.createBillDetail(
          bill,
          item,
        );
        const detailResponse: DetailResponse = {
          id: billDetail.id,
          price: billDetail.price,
          amount: billDetail.amount,
          drinkName: billDetail.drink.name,
        };
        detailResponses.push(detailResponse);
      }),
    );

    const billResponse = this.mapToBillResponse(bill);

    const billDetailResponse: BillDetailResponse = {
      bill: billResponse,
      billDetail: detailResponses,
    };

    return ResponseFormatter.formatResponse(
      true,
      'get Bill detail',
      billDetailResponse,
    );
  }
  async cancelBill(id: number, isCancel: boolean) {
    const bill = await this.billRepository.findOneBy({ id: id });
    if (!bill) {
      throw new BadRequestException(`this id:${id} not found`);
    }
    bill.isCancel = isCancel;
    const cancelBill = await this.billRepository.save(bill);
    const billResponse = this.mapToBillResponse(cancelBill);

    return ResponseFormatter.formatResponse(
      true,
      'cancel bill and add detail successfly',
      billResponse,
    );
  }
  async deleteBill(id: number) {
    const bill = await this.billRepository.findOneBy({ id: id });
    if (!bill) {
      throw new BadRequestException(`this id:${id} not found`);
    }
    if (!bill.isCancel) {
      throw new BadRequestException('Only cancel bill can be deleted');
    }
    await this.billRepository.remove(bill);
    return ResponseFormatter.formatResponse(true, 'delete successfully');
  }
  private mapToCoffeeTableResponse(table: CoffeeTable): CoffeeTableResponse {
    return {
      id: table.id,
      name: table.name,
    };
  }
  private mapToBillResponse(bill: Bill): BillResponse {
    return {
      id: bill.id,
      total: bill.total,
      isCancel: bill.isCancel,
      createdAt: bill.createdAt.getTime(),
      coffeeTable: this.mapToCoffeeTableResponse(bill.coffeeTable),
    };
  }
}
