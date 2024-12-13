import { Role } from 'src/roleConfig/role.enum';
import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Account {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  fullName: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ default: false, name: 'is_block' })
  isBlock: boolean;
  @Column({ default: false, name: 'is_active' })
  isActive: boolean;
  @Column({ type: 'enum', default: Role.User, name: 'role' })
  role: Role;
}
