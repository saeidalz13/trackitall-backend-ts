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
  SINGLE_JOB = `${JOBS}/:jobUlid`,
  INTERVIEW_QUESTIONS = `${JOBS}/:jobUlid/interview-questions`,
  JOB_INTERVIEW_QUESTION = `${JOBS}/:jobUlid/job-interview-questions/:jiqId`,

  // AI
  AI_INSIGHT = "/ai-insight/:jobUlid",

  // Courses
  COURSES = "/courses",
  SINGLE_COURSE = `${COURSES}/:courseUlid`,

  // Fs
  FS = "/fs",
  RESUME = `${FS}/resume`,
}
