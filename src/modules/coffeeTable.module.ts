import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CoffeeTableController } from 'src/contorllers/coffeeTable.controller';
import { CoffeeTable } from 'src/entitys/coffeeTable.entity';
import { CoffeeTableService } from 'src/services/coffeeTable.service';

@Module({
  imports: [TypeOrmModule.forFeature([CoffeeTable])],
  controllers: [CoffeeTableController],
  providers: [CoffeeTableService],
})
export class CoffeeTableModule {}
