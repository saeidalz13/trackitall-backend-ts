import { Router } from "express";
import { AuthController } from "../controllers/auth";
import { Urls } from "./urls";
import { DataSource } from "typeorm";
import { logRequest } from "../middlewares/logMiddleware";

export default class AuthRouter {
  router: Router;
  dataSource: DataSource;
  authController: AuthController;

  constructor(dataSource: DataSource) {
    this.router = Router();
    this.router.use(logRequest);

    this.dataSource = dataSource;
    this.authController = new AuthController(dataSource);
  }

  public route(): Router {
    this.router.post(Urls.SIGNUP, this.authController.postSignup);
    this.router.post(Urls.LOGIN, this.authController.postLogin);
    return this.router;
  }
}
