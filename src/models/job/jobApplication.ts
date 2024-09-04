export interface JobApplication {
  ulid: string;
  position: string;
  companyName: string;
  appliedDate?: Date;
  description?: string;
  link?: string;
}

export interface RespJobApplications {
  jobApplications: JobApplication[];
}

export interface RespJobApplication {
  jobUlid: string;
}
