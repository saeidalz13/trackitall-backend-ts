import { Request, Response } from "express";
import { Job } from "../entity/job";
import { constants } from "http2";
import { ApiRespCreator } from "../utils/apiRespUtils";
import {
  RespJobApplication,
  ReqJobApplication,
  RespJobApplications,
  JobApplication,
} from "../models/job/jobApplication";
import { DataSource, EntityNotFoundError } from "typeorm";
import { ApiLogger } from "../utils/serverUtils";
import { error } from "console";

export default class JobController {
  private dataSource: DataSource;

  constructor(dataSource: DataSource) {
    this.dataSource = dataSource;
  }

  private prepareJobsResp = (jobs: Job[]): JobApplication[] => {
    const resp: JobApplication[] = [];

    for (let i = 0; i < jobs.length; i++) {
      resp.push({
        jobUlid: jobs[i].jobUlid,
        position: jobs[i].position,
        companyName: jobs[i].companyName,
        appliedDate: jobs[i].appliedDate,
        description: jobs[i].description,
        link: jobs[i].link,
        notes: jobs[i].notes,
      });
    }

    return resp;
  };

  private fetchRecentJobs = async (): Promise<Job[]> => {
    const jobs = await this.dataSource
      .getRepository(Job)
      .createQueryBuilder("Job")
      .orderBy("Job.job_ulid", "DESC")
      .limit(3)
      .getMany();

    return jobs;
  };

  public postJob = async (req: Request, res: Response) => {
    try {
      const reqBody: ReqJobApplication = req.body;

      const job = new Job();
      job.position = reqBody.position;
      job.companyName = reqBody.companyName;
      job.userUlid = reqBody.user_ulid;

      if (reqBody.description) {
        job.description = reqBody.description;
      }
      if (reqBody.appliedDate) {
        job.appliedDate = reqBody.appliedDate;
      }
      if (reqBody.link) {
        job.link = reqBody.link;
      }
      if (reqBody.notes) {
        job.link = reqBody.notes;
      }

      const insertedJob = await job.save();

      const apiResp = ApiRespCreator.createSuccessResponse<RespJobApplication>({
        jobUlid: insertedJob.jobUlid,
        appliedDate: insertedJob.appliedDate,
      });

      res.status(constants.HTTP_STATUS_CREATED).json(apiResp);
    } catch (error) {
      console.error(error);
      res
        .status(constants.HTTP_STATUS_INTERNAL_SERVER_ERROR)
        .send(ApiRespCreator.createErrUnexpected());
    }
  };

  private fetchUserUlidFromQuery = (req: Request): string | null => {
    const userUlid = req.query.userUlid;
    if (typeof userUlid !== "string") {
      return null;
    }
    return userUlid;
  };

  public getJobs = async (req: Request, res: Response) => {
    try {
      const userUlid = this.fetchUserUlidFromQuery(req);
      if (!userUlid) {
        res
          .status(constants.HTTP_STATUS_BAD_REQUEST)
          .send(ApiRespCreator.createErrBadQueryParam("userUlid", userUlid));
        return;
      }

      const recent = req.query.recent;
      const jobCount = await Job.countBy({ userUlid: userUlid });
      let jobs: Job[] = [];
      if (typeof recent === "string") {
        ApiLogger.log("fetching recent jobs");
        jobs = await this.fetchRecentJobs();
      } else {
        jobs = await Job.findBy({ userUlid: userUlid });
      }
      if (jobs.length === 0) {
        res.sendStatus(constants.HTTP_STATUS_NO_CONTENT);
        return;
      }

      const modJobs = this.prepareJobsResp(jobs);
      const apiResp = ApiRespCreator.createSuccessResponse<RespJobApplications>(
        {
          jobApplications: modJobs,
          jobCount: jobCount,
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

  public getJob = async (req: Request, res: Response) => {
    const jobUlid = req.params["jobUlid"];

    Job.findOneByOrFail({ jobUlid: jobUlid })
      .then((job) => {
        res.status(constants.HTTP_STATUS_OK).send(
          ApiRespCreator.createSuccessResponse<JobApplication>({
            jobUlid: job.jobUlid,
            position: job.position,
            companyName: job.companyName,
            appliedDate: job.appliedDate,
            notes: job.notes,
            description: job.description,
            link: job.link,
          })
        );
      })

      .catch((error) => {
        if (error instanceof EntityNotFoundError) {
          res.sendStatus(constants.HTTP_STATUS_NOT_FOUND);
        } else {
          res.sendStatus(constants.HTTP_STATUS_INTERNAL_SERVER_ERROR);
        }
      });
  };

  public deleteJob = async (req: Request, res: Response) => {
    const jobUlid = req.params["jobUlid"];

    Job.delete(jobUlid)
      .then((deleted) => {
        ApiLogger.log(deleted);
        res.sendStatus(constants.HTTP_STATUS_NO_CONTENT);
      })

      .catch((_) => {
        if (error instanceof EntityNotFoundError) {
          res.sendStatus(constants.HTTP_STATUS_NOT_FOUND);
        } else {
          res.sendStatus(constants.HTTP_STATUS_INTERNAL_SERVER_ERROR);
        }
      });
  };
}
