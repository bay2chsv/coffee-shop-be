import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  JoinColumn,
  OneToMany,
  CreateDateColumn,
  ManyToOne,
} from 'typeorm';
import { BillDetail } from './billDetail.entity';
import { CoffeeTable } from './coffeeTable.entity';

@Entity()
export class Bill {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  total: number;
  @Column({ default: false })
  isCancel: boolean;
  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => CoffeeTable, (coffeeTable) => coffeeTable.bills, {
    onDelete: 'SET NULL',
  })
  @JoinColumn()
  coffeeTable: CoffeeTable;

  @OneToMany(() => BillDetail, (billDetail) => billDetail.bill)
  @JoinColumn()
  billDetail: BillDetail[];
}
