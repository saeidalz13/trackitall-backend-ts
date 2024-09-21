export enum Urls {
  HOME = "/",
  LOGIN = "/login",
  SIGNUP = "/signup",
  SIGNOUT = "/signout",
  USERS = "/users/:userUlid",
  AUTH = "/auth",
  JOBS = "/jobs",
  SINGLE_JOB = "/jobs/:jobUlid",
  INTERVIEW_QUESTIONS = "/jobs/:jobUlid/interview-questions",
  JOB_INTERVIEW_QUESTION = "/jobs/:jobUlid/job-interview-questions/:jiqId",
  COURSES = "/courses",
  SINGLE_COURSE = "/courses/:courseUlid",
}
