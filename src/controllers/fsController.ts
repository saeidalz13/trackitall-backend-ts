import { Request, Response } from "express";
import Busboy from "busboy";
import path from "path";
import fs from "fs";
import { ApiLogger } from "../utils/serverUtils";
import { constants } from "http2";
import { ApiRespCreator } from "../utils/apiRespUtils";
import { DataSource, EntityNotFoundError } from "typeorm";
import { Job } from "../entity/job";

export default class FsController {
  private dataSource: DataSource;
  private basePathResume: string;

  constructor(dataSource: DataSource) {
    this.dataSource = dataSource;
    this.basePathResume = path.join(__dirname, "..", "filestorage", "resumes");
  }

  private genResumePath(userUlid: string, jobUlid: string): string {
    return path.join(this.basePathResume, userUlid, `resume_${jobUlid}.pdf`);
  }

  private fetchQueryParam = (req: Request, param: string): string | null => {
    const queryParam = req.query[param];
    if (typeof queryParam !== "string") {
      return null;
    }
    return queryParam;
  };

  public getResume = async (req: Request, res: Response) => {
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

    const resumePath = this.genResumePath(userUlid, jobUlid);
    if (!fs.existsSync(resumePath)) {
      res.sendStatus(constants.HTTP_STATUS_NOT_FOUND);
      return;
    }

    res.sendFile(resumePath, (error) => {
      if (error) {
        ApiLogger.error(`Error sending file: ${error.message}`);
        // Send an error response if there was an issue sending the file
        return res
          .status(constants.HTTP_STATUS_INTERNAL_SERVER_ERROR)
          .send(ApiRespCreator.createErrUnexpected());
      }
    });
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
        const userPath = path.join(this.basePathResume, userUlid);
        fs.mkdirSync(userPath, { recursive: true });

        const resumePath = this.genResumePath(userUlid, jobUlid);
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
  public deleteResume = async (req: Request, res: Response) => {
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

    this.dataSource.manager.transaction(async (tem) => {
      try {
        await tem
          .createQueryBuilder()
          .update(Job)
          .set({ resumePath: null })
          .where("jobUlid = :jobUlid", { jobUlid })
          .andWhere("userUlid = :userUlid", { userUlid })
          .execute();

        const resumePath = this.genResumePath(userUlid, jobUlid);
        fs.unlinkSync(resumePath);

        ApiLogger.log("Resume deleted");
        res.sendStatus(constants.HTTP_STATUS_NO_CONTENT);
      } catch (error) {
        ApiLogger.error(error);
        if (error instanceof EntityNotFoundError) {
          res.sendStatus(constants.HTTP_STATUS_NOT_FOUND);
          return;
        }

        console.error(error);
        res
          .status(constants.HTTP_STATUS_INTERNAL_SERVER_ERROR)
          .send(ApiRespCreator.createErrUnexpected());
      }
    });
  };
}
