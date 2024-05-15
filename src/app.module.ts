import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { addTransactionalDataSource } from 'typeorm-transactional';
import { AuthModule } from './auth/auth.module';

import { Account } from './entitys/account.entity';
import { Bill } from './entitys/bill.entity';
import { BillDetail } from './entitys/billDetail.entity';
import { Category } from './entitys/category.entity';
import { CoffeeTable } from './entitys/coffeeTable.entity';
import { Drink } from './entitys/drink.entity';
import { Role } from './entitys/role.entity';
import { AccountModule } from './modules/account.module';
import { BillModule } from './modules/bill.module';
import { CategoryModule } from './modules/category.module';
import { CoffeeTableModule } from './modules/coffeeTable.module';
import { DrinkModule } from './modules/drink.module';
import { ImageModule } from './modules/image.module';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useFactory() {
        return {
          type: 'mysql',
          host: 'localhost',
          port: 3306,
          username: 'root',
          password: '123456',
          database: 'bk_coffeeshop',
          entities: [
            Account,
            Role,
            Bill,
            BillDetail,
            CoffeeTable,
            Drink,
            Category,
          ],
          synchronize: true,
        };
      },
      async dataSourceFactory(options) {
        if (!options) {
          throw new Error('Invalid options passed');
        }

        return addTransactionalDataSource(new DataSource(options));
      },
    }),
    AuthModule,
    CategoryModule,
    CoffeeTableModule,
    ImageModule,
    DrinkModule,
    BillModule,
    AccountModule,
  ],
})
export class AppModule {}
