export interface JobApplication {
  jobUlid: string;
  position: string;
  companyName: string;
  appliedDate: Date;
  description?: string;
  link?: string;
  notes?: string;
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
  notes?: string;
  link?: string;
}

interface JobInterviewQuestionsModified {
  id: number;
  question: string;
  response?: string;
}

export interface RespJobInterviewQuestions {
  job_interview_questions: JobInterviewQuestionsModified[];
}
