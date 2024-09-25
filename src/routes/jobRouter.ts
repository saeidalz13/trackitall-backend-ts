import { Router } from "express";
import AuthMiddleware from "../middlewares/authMiddleware";
import { Urls } from "./urls";
import JobController from "../controllers/jobController";
import { DataSource } from "typeorm";

const newJobRouter = (dataSource: DataSource, jwtSecret: string) => {
  const router = Router();
  const authMiddleware = new AuthMiddleware(jwtSecret).authenticate;
  router.use(Urls.JOBS, authMiddleware);

  const jobController = new JobController(dataSource);

  router.get(Urls.JOBS, jobController.getJobs);
  router.get(Urls.SINGLE_JOB, jobController.getJob);
  router.get(Urls.INTERVIEW_QUESTIONS, jobController.getJobInterviewQuestions);

  // Delete
  router.delete(Urls.SINGLE_JOB, jobController.deleteJob);

  // Post
  router.post(Urls.JOBS, jobController.postJob);

  // Patch
  router.patch(Urls.SINGLE_JOB, jobController.patchJob);
  router.patch(
    Urls.JOB_INTERVIEW_QUESTION,
    jobController.patchJobInterviewQuestion
  );

  return router;
};

export default newJobRouter;
