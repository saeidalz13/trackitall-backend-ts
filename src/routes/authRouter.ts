import { Router } from "express";
import { AuthController } from "../controllers/auth";
import { Urls } from "./urls";
import { DataSource } from "typeorm";
import { logRequest } from "../middlewares/logMiddleware";

export default class AuthRouter {
  router: Router;
  dataSource: DataSource;
  jwtSecret: string;
  authController: AuthController;

  constructor(dataSource: DataSource, jwtSecret: string) {
    this.router = Router();
    this.router.use(logRequest);
    this.jwtSecret = jwtSecret

    this.dataSource = dataSource;
    this.authController = new AuthController(dataSource, jwtSecret);
  }

  public route(): Router {
    this.router.post(Urls.SIGNUP, this.authController.postSignup);
    this.router.post(Urls.LOGIN, this.authController.postLogin);
    this.router.get(Urls.AUTH, this.authController.getAuth)
    return this.router;
  }
}
