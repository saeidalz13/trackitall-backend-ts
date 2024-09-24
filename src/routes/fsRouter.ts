import { Router } from "express";
import AuthMiddleware from "../middlewares/authMiddleware";
import { DataSource } from "typeorm";
import FsController from "../controllers/fsController";
import { Urls } from "./urls";

export default class FsRouter {
  router: Router;
  fsController: FsController;

  constructor(dataSource: DataSource, jwtSecret: string) {
    this.router = Router();

    this.router.use(new AuthMiddleware(jwtSecret).authenticate);
    this.fsController = new FsController(dataSource);
  }

  public route(): Router {
    this.router.post(Urls.RESUME, this.fsController.postResume);

    return this.router;
  }
}
