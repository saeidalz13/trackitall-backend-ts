import {
  BaseEntity,
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  type Relation,
} from "typeorm";
import { User } from "./user";
import { JobInterviewQuestion } from "./jobInterviewQuestion";

@Entity("interview_questions")
export class InterviewQuestion extends BaseEntity {
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

  // User relationship
  @ManyToOne(() => User, (user: User) => user.interviewQuestions, {
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  })
  @JoinColumn({ name: "user_ulid" })
  user!: Relation<User>;

  @Index("user_ulid_interview_questions")
  @Column({ name: "user_ulid", type: "char", length: 26 })
  userUlid!: string;

  // Each question here can be used for many jobs
  @OneToMany(() => JobInterviewQuestion, (jiq) => jiq.interviewQuestion, {
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  })
  jobInterviewQuestions?: Relation<JobInterviewQuestion>[];
}
