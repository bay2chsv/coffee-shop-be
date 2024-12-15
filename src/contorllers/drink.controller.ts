import {
  Controller,
  Delete,
  Get,
  Param,
  ParseBoolPipe,
  ParseIntPipe,
  Patch,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { Body } from '@nestjs/common/decorators/http/route-params.decorator';
import { DrinkRequest } from 'src/dtos/Request/drinkRequest.dto';
import { DrinkService } from 'src/services/drink.service';
import { AuthGuard } from 'src/guards/auth.guard';
import { Roles } from 'src/roleConfig/roles.decorator';
import { Role } from 'src/roleConfig/role.enum';
import { RolesGuard } from 'src/guards/roles.guard';

@Controller('/api/v1')
export class DrinkController {
  constructor(private drinkService: DrinkService) {}

  @Get('/drinks')
  getAllCategory(
    @Query('limit') limit: number,
    @Query('page') page: number,
    @Query('name') name: string,
    @Query('category') category: string,
  ) {
    return this.drinkService.getAllDrink({ limit, page, name, category });
  }

  @Get('/drinks/all')
  getAllDrinkForEmployee(@Query('category') category: string) {
    return this.drinkService.getAllDrinkForEmployee({ category });
  }

  @Get('/drinks/:id')
  getCategory(@Param('id', ParseIntPipe) id: number) {
    return this.drinkService.getDrink(id);
  }

  @Roles(Role.Admin, Role.Manager)
  @UseGuards(AuthGuard, RolesGuard)
  @Post('/drinks')
  createCategory(@Body() drinkRequest: DrinkRequest) {
    return this.drinkService.createDrink(drinkRequest);
  }

  @Roles(Role.Admin, Role.Manager)
  @UseGuards(AuthGuard, RolesGuard)
  @Patch('/drinks/:id')
  handleSellDrink(
    @Param('id', ParseIntPipe) id: number,
    @Query('sell', ParseBoolPipe) sell: boolean,
  ) {
    console.log('ID:', id, 'Sell:', sell);
    return this.drinkService.handleBlockDrink(id, sell);
  }

  @Roles(Role.Admin, Role.Manager)
  @UseGuards(AuthGuard, RolesGuard)
  @Put('/drinks/:id')
  updateCategory(
    @Param('id', ParseIntPipe) id: number,
    @Body() drinkRequest: DrinkRequest,
  ) {
    return this.drinkService.updateDrink(id, drinkRequest);
  }

  @Roles(Role.Admin)
  @UseGuards(AuthGuard, RolesGuard)
  @Delete('/drinks/:id')
  deleteCategory(@Param('id', ParseIntPipe) id: number) {
    return this.drinkService.deleteDrink(id);
  }
}
