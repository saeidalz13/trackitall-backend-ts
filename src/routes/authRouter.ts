import { Router } from "express";
import { AuthController } from "../controllers/authController";
import { Urls } from "./urls";
import { DataSource } from "typeorm";
import { logRequest } from "../middlewares/logMiddleware";

const NewAuthRouter = (dataSource: DataSource, jwtSecret: string): Router => {
  const router = Router();
  router.use(logRequest);
  const authController = new AuthController(dataSource, jwtSecret);

  router.post(Urls.SIGNUP, authController.postSignup);
  router.post(Urls.LOGIN, authController.postLogin);
  router.delete(Urls.SIGNOUT, authController.postSignOut);
  router.delete(Urls.USERS, authController.deleteUser);
  router.get(Urls.AUTH, authController.getAuth);
  return router;
};

export default NewAuthRouter;
