import {
  Controller,
  Get,
  Param,
  ParseBoolPipe,
  ParseIntPipe,
  Query,
  ValidationPipe,
} from '@nestjs/common';
import {
  Body,
  Delete,
  Patch,
  Post,
  UseGuards,
  UsePipes,
} from '@nestjs/common/decorators';
import { AuthGuard } from 'src/guards/auth.guard';
import { BillRequest } from 'src/dtos/Request/billRequest.dto';

import { BillService } from 'src/services/bill.service';
import { Roles } from 'src/roleConfig/roles.decorator';
import { Role } from 'src/roleConfig/role.enum';
import { RolesGuard } from 'src/guards/roles.guard';

@Controller('api/v1')
export class BillController {
  constructor(private readonly billService: BillService) {}

  @Roles(Role.Admin, Role.Manager, Role.Employee)
  @UseGuards(AuthGuard, RolesGuard)
  @Get('/bills')
  @UsePipes(new ValidationPipe({ transform: true }))
  getAllBill(
    @Query('limit') limit: number,
    @Query('page') page: number,
    @Query('id') id: number,
    @Query('timeform') timeFrom: Date,
    @Query('timeto') timeTo: Date,
    @Query('cancel') isCancel: boolean,
  ) {
    return this.billService.getAllBill({
      limit,
      page,
      id,
      timeFrom,
      timeTo,
      isCancel,
    });
  }
  @Roles(Role.Admin, Role.Manager, Role.Employee)
  @UseGuards(AuthGuard, RolesGuard)
  @Get('/bills/dashboard')
  @UsePipes(new ValidationPipe({ transform: true }))
  getBillForDashBoard(
    @Query('month') month: number,
    @Query('year') year: number,
  ) {
    return this.billService.getAllBillForDashBoard(month, year);
  }

  @Roles(Role.Admin, Role.Manager, Role.Employee)
  @UseGuards(AuthGuard, RolesGuard)
  @Get('/bills/:id')
  getBIll(@Param('id', ParseIntPipe) id: number) {
    return this.billService.getBill(id);
  }

  @Roles(Role.Admin, Role.Manager, Role.Employee)
  @UseGuards(AuthGuard, RolesGuard)
  @Post('/bills')
  createBill(@Body() billRequest: BillRequest) {
    return this.billService.createBill(billRequest);
  }

  @Roles(Role.Admin, Role.Manager, Role.Employee)
  @UseGuards(AuthGuard, RolesGuard)
  @Patch('/bills/:id')
  cancelBill(
    @Param('id', ParseIntPipe) id: number,
    @Query('cancel', ParseBoolPipe) cancel: boolean,
  ) {
    return this.billService.cancelBill(id, cancel);
  }
  @Roles(Role.Admin, Role.Manager)
  @UseGuards(AuthGuard, RolesGuard)
  @Delete('/bills/:id')
  deleteBill(@Param('id', ParseIntPipe) id: number) {
    return this.billService.deleteBill(id);
  }
}
