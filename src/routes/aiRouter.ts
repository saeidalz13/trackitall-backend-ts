import { Router } from "express";
import { DataSource } from "typeorm";
import { Urls } from "./urls";
import AiContoller from "../controllers/aiController";

const NewAiRouter = (dataSource: DataSource, openApiKey: string) => {
  const router = Router();
  const aiController = new AiContoller(dataSource, openApiKey);

  router.get(Urls.AI_INSIGHT, aiController.getAiInsight);

  return router;
};

export default NewAiRouter;
