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

    let response: BillResponse[] = [];
    bills.forEach((item: Bill) => {
      const coffeeTableResponse: CoffeeTableResponse = {
        id: item.coffeeTable.id,
        name: item.coffeeTable.name,
      };
      const billResponse: BillResponse = {
        id: item.id,
        total: item.total,
        isCancel: item.isCancel,
        createdAt: item.createdAt.getTime(),
        coffeeTable: coffeeTableResponse,
      };
      response.push(billResponse);
    });

    const totalPage = Math.ceil(totalItem / take);
    const resultResponse: ResultResponse<BillResponse[]> = {
      success: true,
      message: 'get all bill',
      data: response,
      totalItem: totalItem,
      totalPage: totalPage,
      limit: take,
      page: page,
    };
    return resultResponse;
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

    let response: BillResponse[] = [];
    bills.forEach((item: Bill) => {
      const coffeeTableResponse: CoffeeTableResponse = {
        id: item.coffeeTable.id,
        name: item.coffeeTable.name,
      };
      const billResponse: BillResponse = {
        id: item.id,
        total: item.total,
        isCancel: item.isCancel,
        createdAt: item.createdAt.getTime(),
        coffeeTable: coffeeTableResponse,
      };
      response.push(billResponse);
    });

    const resultResponse: ResultResponse<BillResponse[]> = {
      success: true,
      message: 'get all bill',
      data: response,
    };
    return resultResponse;
  }

  async getBill(id: number): Promise<ResultResponse<BillDetailResponse>> {
    const bill = await this.billRepository.findOne({
      relations: ['coffeeTable'],
      where: { id: id },
    });
    if (!bill) {
      throw new BadRequestException(`this id:${id} not found`);
    }
    const billResponse: BillResponse = {
      id: bill.id,
      total: bill.total,
      isCancel: bill.isCancel,
      createdAt: bill.createdAt.getTime(),
      coffeeTable: bill.coffeeTable,
    };
    const detailResponse: DetailResponse[] =
      await this.billDetailService.getBillDetail(bill);
    const billDetailResponse: BillDetailResponse = {
      bill: billResponse,
      billDetail: detailResponse,
    };
    const response: ResultResponse<BillDetailResponse> = {
      message: 'get Bill detail.',
      success: true,
      data: billDetailResponse,
    };
    return response;
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
    let detailResponses: DetailResponse[] = [];

    await Promise.all(
      // using Promise.all for waitting all the process in the loop successfully if don't use it detailResponses will return [] ()
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

    const billResponse: BillResponse = {
      id: bill.id,
      total: bill.total,
      isCancel: bill.isCancel,
      createdAt: bill.createdAt.getTime(),
      coffeeTable: bill.coffeeTable,
    };

    const billDetailResponse: BillDetailResponse = {
      bill: billResponse,
      billDetail: detailResponses,
    };

    const resultResponse: ResultResponse<BillDetailResponse> = {
      message: 'create bill and add detail successfly',
      data: billDetailResponse,
      success: true,
    };
    return resultResponse;
  }
  async cancelBill(id: number, isCancel: boolean) {
    const bill = await this.billRepository.findOneBy({ id: id });
    if (!bill) {
      throw new BadRequestException(`this id:${id} not found`);
    }
    bill.isCancel = isCancel;
    const cancelBill = await this.billRepository.save(bill);
    const billResponse: BillResponse = {
      id: cancelBill.id,
      total: cancelBill.total,
      isCancel: cancelBill.isCancel,
      createdAt: cancelBill.createdAt.getTime(),
      coffeeTable: cancelBill.coffeeTable,
    };
    const resultResponse: ResultResponse<BillResponse> = {
      message: 'create bill and add detail successfly',
      data: billResponse,
      success: true,
    };
    return resultResponse;
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
    const resultResponse: ResultResponse<string> = {
      message: 'delete successfully',
      success: true,
    };
    return resultResponse;
  }
}
