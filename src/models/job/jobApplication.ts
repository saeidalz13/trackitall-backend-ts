export interface JobApplication {
  jobUlid: string;
  position: string;
  companyName: string;
  appliedDate: Date;
  description: string | null;
  link: string | null;
  aiInsight: string | null;
}

export interface RespJobApplications {
  jobApplications: JobApplication[];
  jobCount: number;
}

export interface RespJobApplication {
  jobUlid: string;
  appliedDate: Date;
}

export interface ReqJobApplication {
  user_ulid: string;
  position: string;
  companyName: string;
  appliedDate?: Date;
  description?: string;
  aiInsight?: string;
  link?: string;
}

export interface JobInterviewQuestionsModified {
  id: number;
  question: string;
  response: string | null;
}

export interface RespJobInterviewQuestions {
  job_interview_questions: JobInterviewQuestionsModified[];
}
