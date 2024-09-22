import {
  BaseEntity,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  type Relation,
} from "typeorm";
import { InterviewQuestion } from "./interviewQuestion";
import { Job } from "./job";
import { MaxChar } from "../constants/serverConsts";

@Entity("job_interview_questions")
export class JobInterviewQuestion extends BaseEntity {
  @PrimaryGeneratedColumn({ name: "id" })
  id!: number;

  // Many JobInterviewQuestions can be linked to one InterviewQuestion
  @ManyToOne(
    () => InterviewQuestion,
    (iq: InterviewQuestion) => iq.jobInterviewQuestions,
    {
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    }
  )
  @JoinColumn({ name: "interview_question_id" }) // This creates the foreign key column
  interviewQuestion!: Relation<InterviewQuestion>;
  @Column({ name: "interview_question_id" }) // The actual foreign key column
  interviewQuestionId!: number;

  // Each job can have many JobInterviewQuestions
  @ManyToOne(() => Job, (job: Job) => job.jobInterviewQuestions, {
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  })
  @JoinColumn({ name: "job_ulid" })
  job!: Relation<Job>;
  @Column({ name: "job_ulid", type: "char", length: 26 })
  jobUlid!: string;

  // Response to each question, initially null
  @Column({
    name: "response",
    type: "varchar",
    length: MaxChar.INTERVIEW_SAMPLE_QUESTION_RESP,
    nullable: true,
  })
  response: string | null = null;

  public toJSON(question: string) {
    return {
      id: this.id,
      question: question,
      response: this.response,
    };
  }
}
