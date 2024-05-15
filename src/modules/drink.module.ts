import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DrinkController } from 'src/contorllers/drink.controller';
import { Category } from 'src/entitys/category.entity';
import { Drink } from 'src/entitys/drink.entity';
import { DrinkService } from 'src/services/drink.service';

@Module({
  imports: [TypeOrmModule.forFeature([Drink, Category])], // Ensure CategoryModule is correctly imported
  controllers: [DrinkController],
  providers: [DrinkService],
})
export class DrinkModule {}
