import {
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';

import { CoffeeTableService } from 'src/services/coffeeTable.service';
import { AuthGuard } from 'src/guards/auth.guard';
import { Role } from 'src/roleConfig/role.enum';
import { Roles } from 'src/roleConfig/roles.decorator';
import { RolesGuard } from 'src/guards/roles.guard';
@Controller('/api/v1')
export class CoffeeTableController {
  constructor(private coffeeTableService: CoffeeTableService) {}

  @Get('/coffeetables')
  @UsePipes(new ValidationPipe({ transform: true }))
  getAllCategory(
    @Query('limit') limit: number,
    @Query('page') page: number,
    @Query('name') name: string,
  ) {
    return this.coffeeTableService.getAllCoffeeTable({ limit, page, name });
  }

  @Get('/coffeetables/:id')
  getCategory(@Param('id', ParseIntPipe) id: number) {
    return this.coffeeTableService.getCoffeeTable(id);
  }

  @Roles(Role.Admin, Role.Manager)
  @UseGuards(AuthGuard, RolesGuard)
  @Post('/coffeetables')
  createCategory(@Query('name') name: string) {
    return this.coffeeTableService.createCoffeeTable(name);
  }
  @UseGuards(AuthGuard)
  @Roles(Role.Admin, Role.Manager)
  @Patch('/coffeetables/:id')
  updateCategory(
    @Param('id', ParseIntPipe) id: number,
    @Query('name') name: string,
  ) {
    return this.coffeeTableService.updateCoffeeTable(id, name);
  }
  @UseGuards(AuthGuard)
  @Roles(Role.Admin, Role.Manager)
  @Delete('/coffeetables/:id')
  deleteCategory(@Param('id', ParseIntPipe) id: number) {
    return this.coffeeTableService.deleteCoffeeTable(id);
  }
}
