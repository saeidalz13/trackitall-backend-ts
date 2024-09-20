import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  BaseEntity,
  OneToMany,
  type Relation,
} from "typeorm";
import { ulid } from "ulid";
import { Job } from "./job";
import { InterviewQuestions } from "./interviewQuestions";

// BaseEntity gives us CRUD operations ability
@Entity("users")
export class User extends BaseEntity {
  @PrimaryColumn({ name: "id", type: "char", length: 26 })
  id: string = ulid();

  @Column({ type: "varchar", length: 100, nullable: false })
  email!: string;

  @Column({ type: "varchar", length: 60, nullable: false })
  password!: string;

  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt!: Date;

  @OneToMany(() => Job, (job) => job.user, {
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  })
  jobs?: Relation<Job>[];

  @OneToMany(() => InterviewQuestions, (iq) => iq.user, {
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  })
  interviewQuestions?: Relation<InterviewQuestions>[];
}
