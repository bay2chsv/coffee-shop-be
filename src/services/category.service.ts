import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CategoryResponse } from 'src/dtos/Response/CategoryResponse.dto';

import { ResultResponse } from 'src/dtos/Response/ResultResponse.dto';
import { Category } from 'src/entitys/category.entity';
import { ResponseFormatter } from 'src/utils/ResponseFormatter';

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
    const categoryList: CategoryResponse[] = [];

    categorys.forEach((item) => {
      const categoryResponse: CategoryResponse = {
        id: item.id,
        name: item.name,
      };
      categoryList.push(categoryResponse);
    });

    const totalPage = Math.ceil(totalItem / take);
    const categoryResponse = categorys.map((category) =>
      this.mapToCategoryResponse(category),
    );
    return ResponseFormatter.formatResponse(
      true,
      'Fetched all categories',
      categoryResponse,
      {
        page,
        limit: take,
        totalItem,
        totalPage: totalPage,
      },
    );
  }

  async getCategory(id: number) {
    const category = await this.categoryRepository.findOneBy({ id: id });
    if (!category) throw new BadRequestException(`this ${id} is not found`);

    const categoryResponse = this.mapToCategoryResponse(category);
    return ResponseFormatter.formatResponse(
      true,
      'Fetched get category',
      categoryResponse,
    );
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
    const categoryResponse = this.mapToCategoryResponse(category);
    return ResponseFormatter.formatResponse(
      true,
      'Create category',
      categoryResponse,
    );
  }
  async updateCategory(id: number, name: string) {
    const category = await this.categoryRepository.findOneBy({ id: id });
    if (!category) {
      throw new BadRequestException(`category id: ${id} not found`);
    }
    if (!name) {
      throw new BadRequestException('Param is null');
    }
    category.name = name;
    await this.categoryRepository.save(category);

    const categoryResponse = this.mapToCategoryResponse(category);
    return ResponseFormatter.formatResponse(
      true,
      'Update category',
      categoryResponse,
    );
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
    const categoryResponse = this.mapToCategoryResponse(category);
    return ResponseFormatter.formatResponse(
      true,
      'Remove category',
      categoryResponse,
    );
  }
  private mapToCategoryResponse(category: Category): CategoryResponse {
    return {
      id: category.id,
      name: category.name,
    };
  }
}
