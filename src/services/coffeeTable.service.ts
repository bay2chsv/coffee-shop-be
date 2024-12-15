import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CoffeeTableResponse } from 'src/dtos/Response/CoffeeTableResponse.dto';

import { ResultResponse } from 'src/dtos/Response/ResultResponse.dto';
import { CoffeeTable } from 'src/entitys/coffeeTable.entity';
import { ResponseFormatter } from 'src/utils/ResponseFormatter';
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
    const totalPage = Math.ceil(totalItem / take);
    const coffeeTableResponse = coffeeTables.map((table) =>
      this.mapToCoffeeTableResponse(table),
    );
    return ResponseFormatter.formatResponse(
      true,
      'Fetched all tables',
      coffeeTableResponse,
      {
        page,
        limit: take,
        totalItem,
        totalPage: totalPage,
      },
    );
  }
  async getCoffeeTable(id: number) {
    const coffeeTable = await this.coffeeTableRepository.findOneBy({ id: id });
    if (!coffeeTable) throw new BadRequestException(`this ${id} is not found`);
    const coffeeTableResponse = this.mapToCoffeeTableResponse(coffeeTable);
    return ResponseFormatter.formatResponse(
      true,
      'Fetched get table',
      coffeeTableResponse,
    );
  }
  async createCoffeeTable(name: string) {
    if (await this.coffeeTableRepository.existsBy({ name: name })) {
      throw new BadRequestException('this name is already used');
    }
    const coffeeTable = await this.coffeeTableRepository.save({ name });

    const coffeeTableResponse = this.mapToCoffeeTableResponse(coffeeTable);
    return ResponseFormatter.formatResponse(
      true,
      'Create table',
      coffeeTableResponse,
    );
  }
  async updateCoffeeTable(id: number, name: string) {
    const coffeeTable = await this.coffeeTableRepository.findOneBy({ id: id });
    if (!coffeeTable) {
      throw new BadRequestException(`coffeeTable id:${id} not found`);
    }
    if (!name) {
      throw new BadRequestException('Param is null');
    }
    coffeeTable.name = name;

    const newTable = await this.coffeeTableRepository.save(coffeeTable);

    const coffeeTableResponse = this.mapToCoffeeTableResponse(newTable);
    return ResponseFormatter.formatResponse(
      true,
      'Update table',
      coffeeTableResponse,
    );
  }

  async deleteCoffeeTable(id: number) {
    const coffeeTable = await this.coffeeTableRepository.findOneBy({ id: id });
    if (!coffeeTable) {
      throw new BadRequestException(`table is:${id} not found`);
    }
    await this.coffeeTableRepository.remove(coffeeTable);
    return ResponseFormatter.formatResponse(true, 'Remove table');
  }

  private mapToCoffeeTableResponse(table: CoffeeTable): CoffeeTableResponse {
    return {
      id: table.id,
      name: table.name,
    };
  }
}
