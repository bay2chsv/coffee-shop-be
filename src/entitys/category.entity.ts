import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Drink } from './drink.entity';

@Entity()
export class Category {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @OneToMany(() => Drink, (drink) => drink.category)
  drinks: Drink[]; // Changed from "drink" to "drinks"
}
