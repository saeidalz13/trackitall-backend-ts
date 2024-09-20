import {
  BaseEntity,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  type Relation,
} from "typeorm";
import { User } from "./user";


@Entity("interview_questions")
export class InterviewQuestions extends BaseEntity {
  @PrimaryGeneratedColumn({ name: "id" })
  id!: number;

  @Column({
    name: "question",
    type: "varchar",
    length: 400,
    nullable: false,
    unique: true,
  })
  question!: string;

  @Column({
    name: "response",
    type: "varchar",
    length: 2000,
    nullable: true,
  })
  response?: string;

  // User relationship
  @ManyToOne(() => User, (user: User) => user.interviewQuestions, {
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  })
  @JoinColumn({ name: "user_ulid" })
  user!: Relation<User>;

  @Column({ name: "user_ulid", type: "char", length: 26 })
  userUlid!: string;
}
