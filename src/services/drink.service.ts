import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DrinkRequest } from 'src/dtos/Request/drinkRequest.dto';
import { CategoryResponse } from 'src/dtos/Response/CategoryResponse.dto';
import { DrinkResponse } from 'src/dtos/Response/DrinkResponse.dto';

import { ResultResponse } from 'src/dtos/Response/ResultResponse.dto';
import { Category } from 'src/entitys/category.entity';

import { Drink } from 'src/entitys/drink.entity';
import { ResponseFormatter } from 'src/utils/ResponseFormatter';
import { Repository } from 'typeorm';

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
      whereCondition.category = { name: category };
    }
    const [drinks, totalItem] = await this.drinkRepository.findAndCount({
      relations: ['category'],
      where: whereCondition,
      take: take,
      skip: skip,
    });
    const totalPage = Math.ceil(totalItem / take);
    const drinkResponses = drinks.map((drink) =>
      this.mapToDrinkResponse(drink),
    );
    return ResponseFormatter.formatResponse(
      true,
      'Fetching drink responses',
      drinkResponses,
      {
        page,
        limit: take,
        totalItem,
        totalPage: totalPage,
      },
    );
  }
  async getAllDrinkForEmployee(
    query,
  ): Promise<ResultResponse<DrinkResponse[]>> {
    const category = query.category;
    const whereCondition: any = {};
    if (category) {
      whereCondition.category = {};
      whereCondition.category.name = category;
    }
    const drinks = await this.drinkRepository.find({
      relations: ['category'],
      where: whereCondition,
    });

    const drinkResponses = drinks.map((drink) =>
      this.mapToDrinkResponse(drink),
    );
    return ResponseFormatter.formatResponse(
      true,
      'Fetching drink responses dashboard',
      drinkResponses,
    );
  }
  async getDrink(id: number) {
    const drink = await this.drinkRepository.findOne({
      relations: ['category'],
      where: { id: id },
    });
    if (!drink) throw new BadRequestException(`this ${id} not found`);
    const drinkResponse = this.mapToDrinkResponse(drink);
    return ResponseFormatter.formatResponse(
      true,
      'get Drink Response',
      drinkResponse,
    );
  }
  async createDrink(drinkRequest: DrinkRequest) {
    const category = await this.categoryRepository.findOneBy({
      id: drinkRequest.categoryId,
    });
    if (!category) {
      throw new BadRequestException(
        `Something wrong with category please watched back your category`,
      );
    }
    if (drinkRequest.price <= 0) {
      throw new BadRequestException(`prince must be bigger than 0`);
    }

    const drink = await this.drinkRepository.save({
      name: drinkRequest.name,
      price: drinkRequest.price,
      imageUrl: drinkRequest.imageUrl,
      category: category,
    });
    const drinkResponse = this.mapToDrinkResponse(drink);
    return ResponseFormatter.formatResponse(
      true,
      'Create Drink Response',
      drinkResponse,
    );
  }
  async handleBlockDrink(id: number, isSell: boolean) {
    const drink = await this.drinkRepository.findOne({
      relations: ['category'],
      where: { id: id },
    });
    if (!drink) {
      throw new BadRequestException(`drink id: ${id} not found`);
    }
    drink.isSell = isSell;
    const newDrink = await this.drinkRepository.save(drink);
    const drinkResponse = this.mapToDrinkResponse(newDrink);
    return ResponseFormatter.formatResponse(
      true,
      'Block Drink Response',
      drinkResponse,
    );
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
    const drinkResponse = this.mapToDrinkResponse(newDrink);
    return ResponseFormatter.formatResponse(
      true,
      'Update Drink Response',
      drinkResponse,
    );
  }
  async deleteDrink(id: number): Promise<ResultResponse<string>> {
    const drink = await this.drinkRepository.findOneBy({
      id: id,
    });
    if (!drink) {
      throw new BadRequestException(`drink id ${id} not found`);
    }
    this.drinkRepository.remove(drink);
    return ResponseFormatter.formatResponse(true, 'Remove Drink Response');
  }
  private mapToCategoryResponse(category: Category): CategoryResponse {
    return {
      id: category.id,
      name: category.name,
    };
  }
  private mapToDrinkResponse(drink: Drink): DrinkResponse {
    return {
      id: drink.id,
      name: drink.name,
      imageUrl: drink.imageUrl,
      price: drink.price,
      isSell: drink.isSell,
      category: this.mapToCategoryResponse(drink.category),
    };
  }
}
