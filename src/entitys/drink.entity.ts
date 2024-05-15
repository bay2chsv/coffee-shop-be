import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { BillDetail } from './billDetail.entity';
import { Category } from './category.entity';

@Entity()
export class Drink {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false })
  name: string;

  @Column({ name: 'image_url', nullable: false })
  imageUrl: string;

  @Column({ nullable: false })
  price: number;

  @Column({ default: true })
  isSell: boolean;

  @ManyToOne(() => Category, (category) => category.drinks, {
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'category_id' })
  category: Category;

  @OneToMany(() => BillDetail, (billDetail) => billDetail.drink)
  billDetails: BillDetail[];
}
