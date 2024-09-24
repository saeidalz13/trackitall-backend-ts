import { Request, Response } from "express";
import Busboy from "busboy";
import path from "path";
import fs from "fs";
import { ApiLogger } from "../utils/serverUtils";
import { constants } from "http2";
import { ApiRespCreator } from "../utils/apiRespUtils";
import { DataSource } from "typeorm";
import { Job } from "../entity/job";

export default class FsController {
  dataSource: DataSource;

  constructor(dataSource: DataSource) {
    this.dataSource = dataSource;
  }

  private fetchQueryParam = (req: Request, param: string): string | null => {
    const queryParam = req.query[param];
    if (typeof queryParam !== "string") {
      return null;
    }
    return queryParam;
  };

  public postResume = async (req: Request, res: Response) => {
    const jobUlid = this.fetchQueryParam(req, "jobUlid");
    if (jobUlid === null) {
      res
        .status(constants.HTTP_STATUS_BAD_REQUEST)
        .send(ApiRespCreator.createErrBadQueryParam("jobUlid", jobUlid));
      return;
    }

    const userUlid = this.fetchQueryParam(req, "userUlid");
    if (userUlid === null) {
      res
        .status(constants.HTTP_STATUS_BAD_REQUEST)
        .send(ApiRespCreator.createErrBadQueryParam("userUlid", userUlid));
      return;
    }

    const bb = Busboy({ headers: req.headers });
    bb.on("file", async (_, stream, __) => {
      try {
        const userPath = path.join(
          __dirname,
          "..",
          "filestorage",
          "resumes",
          userUlid
        );
        fs.mkdirSync(userPath, { recursive: true });

        const resumePath = path.join(userPath, `resume_${jobUlid}.pdf`);
        stream.pipe(fs.createWriteStream(resumePath));

        await this.dataSource
          .createQueryBuilder(Job, "jobs")
          .update(Job)
          .set({ resumePath: resumePath })
          .where("jobUlid = :jobUlid", { jobUlid })
          .andWhere("userUlid = :userUlid", { userUlid })
          .execute();
      } catch (error) {
        ApiLogger.error(error);
        res.sendStatus(constants.HTTP_STATUS_INTERNAL_SERVER_ERROR);
      }
    });

    bb.on("finish", () => {
      res.sendStatus(constants.HTTP_STATUS_OK);
    });

    bb.on("error", (error) => {
      ApiLogger.error(error);
      if (!res.headersSent) {
        res.sendStatus(constants.HTTP_STATUS_INTERNAL_SERVER_ERROR);
      }
    });

    return req.pipe(bb);
  };
}
