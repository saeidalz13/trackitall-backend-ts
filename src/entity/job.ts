import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  BaseEntity,
  ManyToOne,
  JoinColumn,
  type Relation,
} from "typeorm";
import { ulid } from "ulid";
import { User } from "./user";

@Entity("jobs")
export class Job extends BaseEntity {
  @PrimaryColumn({ name: "job_ulid", type: "char", length: 26 })
  jobUlid: string = ulid();

  @Column({ type: "varchar", length: 50, nullable: false })
  position!: string;

  @Column({
    name: "company_name",
    type: "varchar",
    length: 50,
    nullable: false,
  })
  companyName!: string;

  @Column({ name: "applied_date", type: "timestamptz", default: new Date() })
  appliedDate!: Date;

  @Column({ type: "varchar", length: 1000 })
  description?: string;

  @Column({ type: "varchar", length: 500 })
  link?: string;

  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt!: Date;

  @ManyToOne(() => User, (user: User) => user.jobs)
  @JoinColumn({ name: "user_ulid" })
  user!: Relation<User>;

  @Column({ name: "user_ulid", type: "char", length: 26 })
  userUlid!: string;
}
