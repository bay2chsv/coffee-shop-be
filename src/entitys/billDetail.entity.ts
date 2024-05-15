import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  JoinColumn,
  OneToMany,
  CreateDateColumn,
  ManyToOne,
} from 'typeorm';
import { Bill } from './bill.entity';

import { Drink } from './drink.entity';

@Entity()
export class BillDetail {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  price: number;
  @Column()
  amount: number; // Creation date

  @ManyToOne(() => Bill, (bill) => bill.billDetail, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'bill_id' })
  bill: Bill;
  @ManyToOne(() => Drink, (drink) => drink.billDetails, {
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'drink_id' })
  drink: Drink;
}
