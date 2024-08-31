import { Router } from "express";
import { AuthController } from "../controllers/auth";
import { Urls } from "./urls";
import { DataSource } from "typeorm";

export default class AuthRouter {
  router: Router;
  dataSource: DataSource;
  authController: AuthController;

  constructor(dataSource: DataSource) {
    this.router = Router();
    // Can add my middlewares to this
    // this.router.use()
    
    this.dataSource = dataSource;
    this.authController = new AuthController(dataSource);
  }

  public route(): Router {
    this.router.post(Urls.SIGNUP, this.authController.postSignup);
    return this.router;
  }
}
