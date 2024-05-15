import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { async } from 'rxjs';
import { CategoryResponse } from 'src/dtos/Response/CategoryResponse.dto';

import { ResultResponse } from 'src/dtos/Response/ResultResponse.dto';
import { Category } from 'src/entitys/category.entity';
import { Drink } from 'src/entitys/drink.entity';

import { Repository } from 'typeorm';

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}
  async getAllCatogory(query): Promise<ResultResponse<CategoryResponse[]>> {
    const take = query.limit || 5;
    const name = query.name;
    const page = query.page || 1;
    const skip = (page - 1) * take;

    const whereCondition: any = {};

    if (name) whereCondition.name = name;
    const [categorys, totalItem] = await this.categoryRepository.findAndCount({
      where: whereCondition,
      take: take,
      skip: skip,
    });
    let categoryList: CategoryResponse[] = [];

    categorys.forEach((item) => {
      let categoryResponse: CategoryResponse = { id: item.id, name: item.name };
      categoryList.push(categoryResponse);
    });

    const totalPage = Math.ceil(totalItem / take);
    const resultResponse: ResultResponse<CategoryResponse[]> = {
      success: true,
      message: 'get all category',
      data: categoryList,
      totalItem: totalItem,
      totalPage: totalPage,
      limit: take,
      page: page,
    };
    return resultResponse;
  }

  async getCategory(id: number) {
    const category = await this.categoryRepository.findOneBy({ id: id });
    if (!category) throw new BadRequestException(`this ${id} is not found`);
    const categoryResponse: CategoryResponse = {
      id: category.id,
      name: category.name,
    };
    const response: ResultResponse<CategoryResponse> = {
      success: true,
      message: 'get Category successfully',
      data: categoryResponse,
    };
    return response;
  }

  async createCategory(name: string) {
    if (!name) {
      throw new BadRequestException('Param is null');
    }
    if (await this.categoryRepository.existsBy({ name: name })) {
      throw new BadRequestException('this name is already used');
    }
    // const category = this.categoryRepository.create();
    const category = await this.categoryRepository.save({ name: name });
    const categoryResponse: CategoryResponse = {
      id: category.id,
      name: category.name,
    };
    const response: ResultResponse<CategoryResponse> = {
      message: 'create successfully',
      success: true,
      data: categoryResponse,
    };
    return response;
  }
  async updateCategory(id: number, name: string) {
    if (!name) {
      throw new BadRequestException('Param is null');
    }
    let category = await this.categoryRepository.findOneBy({ id: id });
    if (!category) {
      throw new BadRequestException(`category id: ${id} not found`);
    }
    if (!(category.name === name)) {
      if (await this.categoryRepository.existsBy({ name: name })) {
        throw new BadRequestException('this name is already used');
      }
    }
    //  category = { ...category, name: name };  Creating a new object with updated name
    category.name = name;
    //category.name = name; simply  Updating the name property of the existing object
    const upadteCategory = await this.categoryRepository.save(category);

    const categoryResponse: CategoryResponse = {
      id: upadteCategory.id,
      name: upadteCategory.name,
    };

    const response: ResultResponse<CategoryResponse> = {
      success: true,
      message: 'update successfully',
      data: categoryResponse,
    };
    return response;
  }

  async deleteCategory(id: number) {
    const category = await this.categoryRepository.findOne({
      relations: ['drinks'],
      where: { id: id },
    });
    if (!category) {
      throw new BadRequestException(`category id:${id} not found`);
    }
    await this.categoryRepository.remove(category);
    const response: ResultResponse<string> = {
      success: true,
      message: 'delete category successfully',
    };
    return response;
  }
}
