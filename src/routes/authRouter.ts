import { Router } from "express";
import { AuthController } from "../controllers/auth";
import { Urls } from "./urls";
import { DataSource } from "typeorm";

export default class AuthRouter {
  router: Router;
  dataSource: DataSource;

  constructor(router: Router, dataSource: DataSource) {
    this.router = router;
    this.dataSource = dataSource;
    const authController = new AuthController(dataSource)

    router.post(Urls.SIGNUP, authController.postSignup);
  }
}


