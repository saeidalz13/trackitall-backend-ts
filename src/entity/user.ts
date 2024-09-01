import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  BaseEntity,
} from "typeorm";
import { ulid } from "ulid";

// BaseEntity gives us CRUD operations ability
@Entity("users")
export class User extends BaseEntity {
  @PrimaryColumn({ type: "char", length: 26 })
  id: string = ulid();

  @Column({ type: "varchar", length: 100, nullable: false, unique: true })
  email!: string;

  @Column({ type: "varchar", length: 60, nullable: false })
  password!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
