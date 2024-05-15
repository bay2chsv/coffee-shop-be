import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm/dist';
import { BillController } from 'src/contorllers/bill.controller';
import { Bill } from 'src/entitys/bill.entity';
import { CoffeeTable } from 'src/entitys/coffeeTable.entity';
import { BillService } from 'src/services/bill.service';
import { BillDetailModule } from './billDetail.module';

@Module({
  imports: [TypeOrmModule.forFeature([Bill, CoffeeTable]), BillDetailModule],
  controllers: [BillController],
  providers: [BillService],
})
export class BillModule {}
