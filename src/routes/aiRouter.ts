import { Router } from "express";
import { DataSource } from "typeorm";
import { Urls } from "./urls";
import AiContoller from "../controllers/aiController";

export default class AiRouter {
  router: Router;
  dataSource: DataSource;
  aiController: AiContoller;
  openApiKey: string;

  constructor(dataSource: DataSource, openApiKey: string, jwtSecret: string) {
    this.router = Router();
    this.dataSource = dataSource;
    this.openApiKey = openApiKey;

    this.aiController = new AiContoller(dataSource, openApiKey);
  }

  public route(): Router {
    this.router.get(Urls.AI_INSIGHT, this.aiController.getAiInsight);

    return this.router;
  }
}
