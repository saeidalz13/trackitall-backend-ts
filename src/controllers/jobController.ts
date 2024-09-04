import { Request, Response } from "express";
import { Job } from "../entity/job";
import { constants } from "http2";
import { ApiRespCreator } from "../utils/apiRespUtils";
import {
  JobApplication,
  RespJobApplications,
  RespJobApplication,
} from "../models/job/jobApplication";

export default class JobController {
  public postJob = async (req: Request, res: Response) => {
    try {
      const reqBody: JobApplication = req.body;

      const job = new Job();
      job.position = reqBody.position;
      job.companyName = reqBody.companyName;

      if (reqBody.description) {
        job.description = reqBody.description;
      }

      if (reqBody.appliedDate) {
        job.appliedDate = reqBody.appliedDate;
      }

      if (reqBody.link) {
        job.link = reqBody.link;
      }
      const insertedJob = await job.save();

      const apiResp = ApiRespCreator.createSuccessResponse<RespJobApplication>({
        jobUlid: insertedJob.jobUlid,
      });

      res.send(constants.HTTP_STATUS_CREATED).json(apiResp);
    } catch (error) {
      console.error(error);
      res
        .status(constants.HTTP_STATUS_INTERNAL_SERVER_ERROR)
        .send(ApiRespCreator.createErrUnexpected());
    }
  };

  public getJobs = async (req: Request, res: Response) => {
    try {
      const userUlid = req.query.userUlid;
      if (typeof userUlid !== "string") {
        res
          .status(constants.HTTP_STATUS_BAD_REQUEST)
          .send(ApiRespCreator.createErrBadQueryParam("userUlid", userUlid));
        return;
      }

      const jobs = await Job.findBy({ userUlid: userUlid });

      if (jobs.length === 0) {
        res.sendStatus(constants.HTTP_STATUS_NO_CONTENT);
        return;
      }

      const apiResp = ApiRespCreator.createSuccessResponse<any>(
        {
          "job_applications": jobs,
        }
      );
      res.status(constants.HTTP_STATUS_OK).send(apiResp);
    } catch (error) {
      console.error(error);
      res
        .status(constants.HTTP_STATUS_INTERNAL_SERVER_ERROR)
        .send(ApiRespCreator.createErrUnexpected());
    }
  };
}
