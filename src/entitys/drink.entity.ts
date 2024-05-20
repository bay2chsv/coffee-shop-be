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
  forEach(arg0: (item: any) => void) {
    throw new Error('Method not implemented.');
  }
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false })
  name: string;

  @Column({ name: 'image_url', nullable: false })
  imageUrl: string;

  @Column({ nullable: false }) //default is numberic ex 20
  // @Column('decimal', { precision: 10, scale: 2, nullable: false }) ex 20.53
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
