import { Router } from "express";
import AuthMiddleware from "../middlewares/authMiddleware";
import { Urls } from "./urls";
import { AuthController } from "../controllers/authController";
import JobController from "../controllers/jobController";

export default class JobRouter {
  router: Router;
  jwtSecret: string;
  jobController: JobController

  constructor(jwtSecret: string) {
    this.router = Router();
    this.jwtSecret = jwtSecret
    this.router.use(new AuthMiddleware(jwtSecret).authenticate)

    this.jobController = new JobController()
  }

  public route = (): Router => {
    this.router.get(Urls.JOBS, this.jobController.getJobs)
    this.router.post(Urls.SINGLE_JOB, this.jobController.postJob)

    return this.router
  }
}
