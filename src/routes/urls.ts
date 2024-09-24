export enum Urls {
  HOME = "/",

  // Auth
  LOGIN = "/login",
  SIGNUP = "/signup",
  SIGNOUT = "/signout",
  USERS = "/users/:userUlid",
  AUTH = "/auth",

  // Jobs
  JOBS = "/jobs",
  SINGLE_JOB = "/jobs/:jobUlid",
  INTERVIEW_QUESTIONS = "/jobs/:jobUlid/interview-questions",
  JOB_INTERVIEW_QUESTION = "/jobs/:jobUlid/job-interview-questions/:jiqId",
  
  // AI
  AI_INSIGHT = "/ai-insight/:jobUlid",
  
  // Courses
  COURSES = "/courses",
  SINGLE_COURSE = "/courses/:courseUlid",

  // Fs
  RESUME = "/fs/resume",
}
