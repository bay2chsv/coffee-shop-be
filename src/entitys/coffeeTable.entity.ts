import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Bill } from './bill.entity';
import { Drink } from './drink.entity';

@Entity()
export class CoffeeTable {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;
  @OneToMany(() => Bill, (bill) => bill.coffeeTable)
  bills: Bill[];
}
