import { Router } from "express";
import AuthMiddleware from "../middlewares/authMiddleware";
import { DataSource } from "typeorm";
import FsController from "../controllers/fsController";
import { Urls } from "./urls";

const newFsRouter = (dataSource: DataSource, jwtSecret: string): Router => {
  const router = Router();
  const authMiddleware = new AuthMiddleware(jwtSecret).authenticate;
  router.use(Urls.FS, authMiddleware);

  const fsController = new FsController(dataSource);
  router.post(Urls.RESUME, fsController.postResume);
  router.get(Urls.RESUME, fsController.getResume);
  router.delete(Urls.RESUME, fsController.deleteResume);

  return router;
};

export default newFsRouter;
