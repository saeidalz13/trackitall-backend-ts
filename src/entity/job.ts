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
  OneToMany,
} from "typeorm";
import { ulid } from "ulid";
import { User } from "./user";
import { JobApplication } from "../models/job/jobApplication";
import { JobInterviewQuestion } from "./jobInterviewQuestion";
import { MaxChar } from "../constants/serverConsts";

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

  @Column({ type: "varchar", length: 500, nullable: true })
  link: string | null = null;

  @Column({
    type: "varchar",
    length: MaxChar.JOB_DESC,
    nullable: true,
  })
  description: string | null = null;

  @Column({ type: "varchar", length: MaxChar.AI_SUMMARY, nullable: true })
  aiInsight: string | null = null;

  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt!: Date;

  // Each user can have many jobs
  @ManyToOne(() => User, (user: User) => user.jobs, {
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  })
  @JoinColumn({ name: "user_ulid" })
  user!: Relation<User>;
  @Column({ name: "user_ulid", type: "char", length: 26 })
  userUlid!: string;

  // job interview relationship
  @OneToMany(() => JobInterviewQuestion, (jiq) => jiq.job, {
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  })
  jobInterviewQuestions?: Relation<JobInterviewQuestion>[];

  public toJSON(): JobApplication {
    return {
      jobUlid: this.jobUlid,
      position: this.position,
      companyName: this.companyName,
      appliedDate: this.appliedDate,
      description: this.description,
      link: this.link,
      aiInsight: this.aiInsight,
    };
  }
}
