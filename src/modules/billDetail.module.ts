import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BillDetail } from 'src/entitys/billDetail.entity';
import { Drink } from 'src/entitys/drink.entity';
import { BillDetailService } from 'src/services/billDetail.service';

@Module({
  imports: [TypeOrmModule.forFeature([BillDetail, Drink])],
  providers: [BillDetailService],
  exports: [BillDetailService],
})
export class BillDetailModule {}
