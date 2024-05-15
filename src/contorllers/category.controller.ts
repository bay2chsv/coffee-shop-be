import {
  BadRequestException,
  Controller,
  DefaultValuePipe,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Put,
  Query,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { AuthGuard } from 'src/guards/auth.guard';
import { RolesGuard } from 'src/guards/roles.guard';
import { Role } from 'src/roleConfig/role.enum';
import { Roles } from 'src/roleConfig/roles.decorator';

import { CategoryService } from 'src/services/category.service';

@Controller('/api/v1')
export class CategoryController {
  constructor(private categoryService: CategoryService) {}

  @Get('/categories')
  @UsePipes(new ValidationPipe({ transform: true }))
  getAllCategory(
    @Query('limit') limit: number,
    @Query('page') page: number,
    @Query('name') name: string,
  ) {
    return this.categoryService.getAllCatogory({ limit, page, name });
  }

  @Get('/categories/:id')
  getCategory(@Param('id', ParseIntPipe) id: number) {
    return this.categoryService.getCategory(id);
  }

  @Roles(Role.Admin, Role.Manager)
  @UseGuards(AuthGuard, RolesGuard)
  @Post('/categories')
  createCategory(@Query('name') name: string) {
    return this.categoryService.createCategory(name);
  }

  @Roles(Role.Admin, Role.Manager)
  @UseGuards(AuthGuard, RolesGuard)
  @Patch('/categories/:id')
  updateCategory(
    @Param('id', ParseIntPipe) id: number,
    @Query('name') name: string,
  ) {
    return this.categoryService.updateCategory(id, name);
  }

  @Roles(Role.Admin, Role.Manager)
  @UseGuards(AuthGuard, RolesGuard)
  @Delete('/categories/:id')
  deleteCategory(@Param('id', ParseIntPipe) id: number) {
    return this.categoryService.deleteCategory(id);
  }
}
