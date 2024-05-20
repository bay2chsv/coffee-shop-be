import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DrinkRequest } from 'src/dtos/Request/drinkRequest.dto';
import { CategoryResponse } from 'src/dtos/Response/CategoryResponse.dto';
import { DrinkResponse } from 'src/dtos/Response/DrinkResponse.dto';

import { ResultResponse } from 'src/dtos/Response/ResultResponse.dto';
import { BillDetail } from 'src/entitys/billDetail.entity';
import { Category } from 'src/entitys/category.entity';

import { Drink } from 'src/entitys/drink.entity';
import { Like, Repository } from 'typeorm';

@Injectable()
export class DrinkService {
  constructor(
    @InjectRepository(Drink)
    private readonly drinkRepository: Repository<Drink>,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}
  async getAllDrink(query): Promise<ResultResponse<DrinkResponse[]>> {
    const take = query.limit || 5;
    const page = query.page || 1;
    const name = query.name;
    const category = query.category;
    const skip = (page - 1) * take;

    const whereCondition: any = {};

    if (name) whereCondition.name = name;
    if (category) {
      whereCondition.category = {};
      whereCondition.category.name = category;
    }
    const [drinks, totalItem] = await this.drinkRepository.findAndCount({
      relations: ['category'],
      where: whereCondition,
      take: take,
      skip: skip,
    });

    let drinkResponses: DrinkResponse[] = [];
    drinks.forEach((item) => {
      let drinkResponse: DrinkResponse = {
        id: item.id,
        name: item.name,
        category: item.category,
        imageUrl: item.imageUrl,
        price: item.price,
      };
      drinkResponses.push(drinkResponse);
    });

    const totalPage = Math.ceil(totalItem / take);
    const resultResponse: ResultResponse<DrinkResponse[]> = {
      success: true,
      message: 'get all drink',
      data: drinkResponses,
      totalItem: totalItem,
      totalPage: totalPage,
      limit: take,
      page: page,
    };
    return resultResponse;
  }
  async getAllDrinkForEmployee(
    query,
  ): Promise<ResultResponse<DrinkResponse[]>> {
    const category = query.category;
    const whereCondition: any = {};
    if (category) {
      whereCondition.category = {}; // suppose to declear whereCondition.category= {} for making Nest can understand that we have category propoty
      whereCondition.category.name = category;
    }
    const drinks = await this.drinkRepository.find({
      relations: ['category'],
      where: whereCondition,
    });

    let drinkResponses: DrinkResponse[] = [];
    drinks.forEach((item) => {
      let drinkResponse: DrinkResponse = {
        id: item.id,
        name: item.name,
        category: item.category,
        imageUrl: item.imageUrl,
        price: item.price,
      };
      drinkResponses.push(drinkResponse);
    });

    const resultResponse: ResultResponse<DrinkResponse[]> = {
      success: true,
      message: 'get all drink for employee',
      data: drinkResponses,
    };
    return resultResponse;
  }
  async getDrink(id: number) {
    const drink = await this.drinkRepository.findOne({
      relations: ['category'],
      where: { id: id },
    });
    if (!drink) throw new BadRequestException(`this ${id} not found`);
    const drinkResponse: DrinkResponse = {
      id: drink.id,
      imageUrl: drink.imageUrl,
      name: drink.name,
      price: drink.price,
      category: drink.category,
    };
    const response: ResultResponse<DrinkResponse> = {
      success: true,
      message: 'get drink successfully',
      data: drinkResponse,
    };
    return response;
  }
  async createDrink(drinkRequest: DrinkRequest) {
    if (await this.drinkRepository.existsBy({ name: drinkRequest.name })) {
      throw new BadRequestException('this name is already used');
    }
    if (
      !(await this.categoryRepository.existsBy({ id: drinkRequest.categoryId }))
    ) {
      throw new BadRequestException(
        `Something wrong with category please watched back your category`,
      );
    }
    if (drinkRequest.price <= 0) {
      throw new BadRequestException(`prince must be bigger than 0`);
    }
    const category = await this.categoryRepository.findOneBy({
      id: drinkRequest.categoryId,
    });
    const drink = await this.drinkRepository.save({
      name: drinkRequest.name,
      price: drinkRequest.price,
      imageUrl: drinkRequest.imageUrl,
      category: category,
    });
    const categoryResponse: CategoryResponse = {
      id: category.id,
      name: category.name,
    };
    const drinkResponse: DrinkResponse = {
      id: drink.id,
      name: drink.name,
      price: drink.price,
      imageUrl: drink.imageUrl,
      category: categoryResponse,
    };

    const resultResponse: ResultResponse<DrinkResponse> = {
      success: true,
      message: 'create drink successfully',
      data: drinkResponse,
    };
    return resultResponse;
  }
  async handleSellDrink(id: number, sell: boolean) {
    const drink = await this.drinkRepository.findOneBy({ id: id });
    if (!drink) {
      throw new BadRequestException(`drink id: ${id} not found`);
    }
    drink.isSell = sell;
    const newDrink = await this.drinkRepository.save(drink);
    const drinkResponse: DrinkResponse = {
      id: newDrink.id,
      name: newDrink.name,
      imageUrl: newDrink.imageUrl,
      price: newDrink.price,
      category: newDrink.category,
    };
    const resultResponse: ResultResponse<DrinkResponse> = {
      message: 'update drink',
      success: true,
      data: drinkResponse,
    };
    return resultResponse;
  }

  async updateDrink(id: number, drinkRequest: DrinkRequest) {
    if (drinkRequest.price <= 0) {
      throw new Error(`prince must be bigger than 0`);
    }
    const drink = await this.drinkRepository.findOne({
      relations: ['category'],
      where: { id: id },
    });
    if (!drink) {
      throw new Error(`drink id ${id} not found`);
    }
    if (!(drink.name === drinkRequest.name)) {
      if (await this.drinkRepository.existsBy({ name: drinkRequest.name })) {
        throw new Error(`${drinkRequest.name} name is already used`);
      }
    }
    const category = await this.categoryRepository.findOneBy({
      id: drinkRequest.categoryId,
    });
    if (!category) {
      throw new Error(
        `Something wrong with category please watched back your category`,
      );
    }

    const newDrink = await this.drinkRepository.save({
      id: id,
      name: drinkRequest.name,
      price: drinkRequest.price,
      imageUrl: drinkRequest.imageUrl,
      category: category,
    });
    const categoryResponse: CategoryResponse = {
      id: newDrink.category.id,
      name: newDrink.category.name,
    };
    const drinkResponse: DrinkResponse = {
      id: newDrink.id,
      name: newDrink.name,
      price: newDrink.price,
      imageUrl: newDrink.imageUrl,
      category: categoryResponse,
    };

    const resultResponse: ResultResponse<DrinkResponse> = {
      success: true,
      message: 'create drink successfully',
      data: drinkResponse,
    };
    return resultResponse;
  }
  async deleteDrink(id: number) {
    const drink = await this.drinkRepository.findOneBy({
      id: id,
    });
    if (!drink) {
      throw new Error(`drink id ${id} not found`);
    }
    this.drinkRepository.remove(drink);
  }
}
