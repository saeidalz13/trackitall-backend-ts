import { DataSource } from "typeorm";
import OpenAI from "openai";
import { Request, Response } from "express";
import { constants } from "http2";
import { Job } from "../entity/job";
import { ApiLogger } from "../utils/serverUtils";

export default class AiContoller {
  private dataSource: DataSource;
  private openai: OpenAI;

  constructor(dataSource: DataSource, openApiKey: string) {
    this.dataSource = dataSource;
    this.openai = new OpenAI({
      apiKey: openApiKey,
    });
  }

  private fetchUserUlidFromQuery = (req: Request): string | null => {
    const userUlid = req.query.userUlid;
    if (typeof userUlid !== "string") {
      return null;
    }
    return userUlid;
  };

  private prepareAiInsightMessage = (
    jobDesc: string,
    companyName: string
  ): string => {
    return (
      jobDesc +
      `\n\n\nBased on the job description provided above, please give me information about ${companyName} company, their mission and useful insight you might have to help me succeed in my interview with them. KEEP YOUR ANSWER LESS THAN 10000 characters please.`
    );
  };

  public getAiInsight = async (req: Request, res: Response) => {
    const jobUlid = req.params["jobUlid"];
    const userUlid = this.fetchUserUlidFromQuery(req);
    if (!userUlid) {
      res.sendStatus(constants.HTTP_STATUS_BAD_REQUEST);
      return;
    }

    let jobDesc: string | null = null;

    try {
      const job = await this.dataSource
        .getRepository(Job)
        .findOneBy({ jobUlid: jobUlid, userUlid: userUlid });

      if (!job) {
        res.sendStatus(constants.HTTP_STATUS_NOT_FOUND);
        return;
      }

      jobDesc = job.description;

      if (jobDesc === null) {
        res.sendStatus(constants.HTTP_STATUS_NOT_FOUND);
        return;
      }

      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");
      res.write(`data: Connection established\n\n`);

      const stream = await this.openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "user",
            content: this.prepareAiInsightMessage(jobDesc, job.companyName),
          },
        ],
        stream: true,
      });

      for await (const chunk of stream) {
        const data = JSON.stringify(chunk.choices[0]?.delta.content || "");
        res.write(`data: ${data}\n\n`);
      }

      req.on("close", () => {
        res.end();
      });
    } catch (error) {
      ApiLogger.error(error);
      res.sendStatus(constants.HTTP_STATUS_INTERNAL_SERVER_ERROR);
      return;
    }

  };
}
