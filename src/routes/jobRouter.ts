import { Router } from "express";
import AuthMiddleware from "../middlewares/authMiddleware";
import { Urls } from "./urls";
import { AuthController } from "../controllers/authController";
import JobController from "../controllers/jobController";
import { DataSource } from "typeorm";

export default class JobRouter {
  router: Router;
  jobController: JobController;

  constructor(jwtSecret: string, dataSource: DataSource) {
    this.router = Router();
    this.router.use(new AuthMiddleware(jwtSecret).authenticate);

    this.jobController = new JobController(dataSource);
  }

  public route = (): Router => {
    this.router.get(Urls.JOBS, this.jobController.getJobs);
    this.router.get(Urls.SINGLE_JOB, this.jobController.getJob);

    this.router.delete(Urls.SINGLE_JOB, this.jobController.deleteJob);

    this.router.post(Urls.JOBS, this.jobController.postJob);

    return this.router;
  };
}
