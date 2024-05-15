import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CoffeeTableResponse } from 'src/dtos/Response/CoffeeTableResponse.dto';

import { ResultResponse } from 'src/dtos/Response/ResultResponse.dto';
import { Account } from 'src/entitys/account.entity';
import { CoffeeTable } from 'src/entitys/coffeeTable.entity';
import { Drink } from 'src/entitys/drink.entity';
import { Repository } from 'typeorm';

@Injectable()
export class CoffeeTableService {
  constructor(
    @InjectRepository(CoffeeTable)
    private readonly coffeeTableRepository: Repository<CoffeeTable>,
  ) {}
  async getAllCoffeeTable(
    query,
  ): Promise<ResultResponse<CoffeeTableResponse[]>> {
    const take = query.limit || 5;
    const page = query.page || 1;
    const skip = (page - 1) * take;
    const name = query.name;
    const whereCondition: any = {};
    if (name) whereCondition.name = name;
    const [coffeeTables, totalItem] =
      await this.coffeeTableRepository.findAndCount({
        where: whereCondition,
        take: take,
        skip: skip,
      });
    let tableList: CoffeeTableResponse[] = [];
    coffeeTables.forEach((item) => {
      let categoryResponse = new CoffeeTableResponse();
      categoryResponse.id = item.id;
      categoryResponse.name = item.name;
      tableList.push(categoryResponse);
    });

    const totalPage = Math.ceil(totalItem / take);
    const resultResponse: ResultResponse<CoffeeTableResponse[]> = {
      success: true,
      message: 'get all CoffeeTable',
      data: tableList,
      totalItem: totalItem,
      totalPage: totalPage,
      limit: take,
      page: page,
    };
    return resultResponse;
  }
  async getCoffeeTable(id: number) {
    const coffeeTable = await this.coffeeTableRepository.findOneBy({ id: id });
    if (!coffeeTable) throw new BadRequestException(`this ${id} is not found`);
    const coffeeTableResponse: CoffeeTableResponse = {
      id: coffeeTable.id,
      name: coffeeTable.name,
    };
    const response: ResultResponse<CoffeeTableResponse> = {
      success: true,
      message: 'get Table successfully',
      data: coffeeTableResponse,
    };
    return response;
  }
  async createCoffeeTable(name: string) {
    if (await this.coffeeTableRepository.existsBy({ name: name })) {
      throw new BadRequestException('this name is already used');
    }
    const coffeeTable = await this.coffeeTableRepository.save({ name });

    const coffeeTableResponse: CoffeeTableResponse = {
      id: coffeeTable.id,
      name: coffeeTable.name,
    };
    const response: ResultResponse<CoffeeTableResponse> = {
      message: 'create successfully',
      success: true,
      data: coffeeTableResponse,
    };
    return response;
  }
  async updateCoffeeTable(id: number, name: string) {
    if (!name) {
      throw new BadRequestException('Param is null');
    }
    const coffeeTable = await this.coffeeTableRepository.findOneBy({ id: id });
    if (!coffeeTable) {
      throw new BadRequestException(`coffeeTable id:${id} not found`);
    }
    if (!(coffeeTable.name === name)) {
      if (await this.coffeeTableRepository.existsBy({ name: name })) {
        throw new BadRequestException('this name is already used');
      }
    }
    let category = await this.coffeeTableRepository.findOneBy({ id: id });
    category = { ...category, name: name }; // Creating a new object with updated name
    // category.name = name; simply  Updating the name property of the existing object

    const updateCategory = await this.coffeeTableRepository.save(category);

    const coffeeTableResponse: CoffeeTableResponse = {
      id: updateCategory.id,
      name: updateCategory.name,
    };

    const response: ResultResponse<CoffeeTableResponse> = {
      success: true,
      message: 'update successfully',
      data: coffeeTableResponse,
    };
    return response;
  }

  async deleteCoffeeTable(id: number) {
    const coffeeTable = await this.coffeeTableRepository.findOneBy({ id: id });
    if (!coffeeTable) {
      throw new BadRequestException(`table is:${id} not found`);
    }
    await this.coffeeTableRepository.remove(coffeeTable);
    const response: ResultResponse<string> = {
      success: true,
      message: 'delete table successfully',
    };
    return response;
  }
}
