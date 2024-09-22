import { Request, Response } from "express";
import { Job } from "../entity/job";
import { constants } from "http2";
import { ApiRespCreator } from "../utils/apiRespUtils";
import {
  RespJobApplication,
  ReqJobApplication,
  RespJobApplications,
  JobApplication,
  RespJobInterviewQuestions,
  JobInterviewQuestionsModified,
} from "../models/job/jobApplication";
import { DataSource, EntityNotFoundError } from "typeorm";
import { ApiLogger } from "../utils/serverUtils";
import { error } from "console";
import { InterviewQuestion } from "../entity/interviewQuestion";
import { JobInterviewQuestion } from "../entity/jobInterviewQuestion";

export default class JobController {
  private dataSource: DataSource;

  constructor(dataSource: DataSource) {
    this.dataSource = dataSource;
  }

  private prepareJobsResp = (jobs: Job[]): JobApplication[] => {
    const resp: JobApplication[] = [];

    for (let i = 0; i < jobs.length; i++) {
      resp.push(jobs[i].toJSON());
    }

    return resp;
  };

  private fetchUserUlidFromQuery = (req: Request): string | null => {
    const userUlid = req.query.userUlid;
    if (typeof userUlid !== "string") {
      return null;
    }
    return userUlid;
  };

  private isRecentRequested = (
    queryParam: any,
    expectedValue: any
  ): boolean => {
    return typeof queryParam === "string" && queryParam === expectedValue;
  };

  private extractNumQuery = (queryParam: any): number | null => {
    try {
      if (typeof queryParam !== "string") {
        return null;
      }

      return parseInt(queryParam, 10);
    } catch (error) {
      return null;
    }
  };

  private fetchRecentJobs = async (userUlid: string): Promise<Job[]> => {
    return this.dataSource
      .getRepository(Job)
      .createQueryBuilder("Job")
      .where("Job.user_ulid = :userUlid", { userUlid })
      .orderBy("Job.job_ulid", "DESC")
      .limit(3)
      .getMany();
  };

  private fetchJobsWithPagination = async (
    userUlid: string,
    limit: number,
    offset: number,
    search: any
  ): Promise<Job[]> => {
    const queryBuilder = this.dataSource
      .getRepository(Job)
      .createQueryBuilder("jobs")
      .where("jobs.user_ulid = :userUlid", { userUlid });

    if (typeof search === "string" && search.trim() !== "") {
      queryBuilder.andWhere(
        `(jobs.position ILIKE :search OR jobs.company_name ILIKE :search OR jobs.description ILIKE :search)`,
        { search: `%${search}%` }
      );
    }

    queryBuilder.orderBy("jobs.job_ulid", "DESC").limit(limit).offset(offset);

    return queryBuilder.getMany();
  };

  private createNewJob(reqBody: ReqJobApplication): Job {
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

    return job;
  }

  public postJob = async (req: Request, res: Response) => {
    try {
      const reqBody: ReqJobApplication = req.body;
      const userUlid = this.fetchUserUlidFromQuery(req);
      if (!userUlid) {
        res
          .status(constants.HTTP_STATUS_BAD_REQUEST)
          .send(ApiRespCreator.createErrBadQueryParam("userUlid", userUlid));
        return;
      }

      const job = this.createNewJob(reqBody);

      const insertedJob = await this.dataSource.manager.transaction(
        async (tem) => {
          const insertedJob = await tem.save(job);

          const interviewQuestions = await tem
            .createQueryBuilder(InterviewQuestion, "interview_questions")
            .where("interview_questions.user_ulid = :userUlid", {
              userUlid: userUlid,
            })
            .getMany();

          const jobQuestions = [];
          for (let i = 0; i < interviewQuestions.length; i++) {
            jobQuestions.push({
              jobUlid: insertedJob.jobUlid,
              interviewQuestionId: interviewQuestions[i].id,
            });
          }

          await tem
            .createQueryBuilder()
            .insert()
            .into(JobInterviewQuestion)
            .values(jobQuestions)
            .execute();

          return insertedJob;
        }
      );

      const apiResp = ApiRespCreator.createSuccessResponse<RespJobApplication>({
        jobUlid: insertedJob.jobUlid,
        appliedDate: insertedJob.appliedDate,
      });

      res.status(constants.HTTP_STATUS_CREATED).json(apiResp);
    } catch (error) {
      ApiLogger.error(error);
      res
        .status(constants.HTTP_STATUS_INTERNAL_SERVER_ERROR)
        .send(ApiRespCreator.createErrUnexpected());
    }
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
      let jobCount = -1;
      let jobs: Job[] = [];

      if (this.isRecentRequested(recent, "true")) {
        jobs = await this.fetchRecentJobs(userUlid);
      } else {
        const limit = this.extractNumQuery(req.query.limit);
        const offset = this.extractNumQuery(req.query.offset);

        if (limit === null || offset === null) {
          res.sendStatus(constants.HTTP_STATUS_BAD_REQUEST);
          return;
        }

        const search = req.query.search;

        jobs = await this.fetchJobsWithPagination(
          userUlid,
          limit,
          offset,
          search
        );
        jobCount = await Job.countBy({ userUlid: userUlid });
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
        res
          .status(constants.HTTP_STATUS_OK)
          .send(
            ApiRespCreator.createSuccessResponse<JobApplication>(job.toJSON())
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

  public getJobInterviewQuestions = async (req: Request, res: Response) => {
    const jobUlid = req.params["jobUlid"];

    try {
      const jiq = await this.dataSource.manager
        .createQueryBuilder(JobInterviewQuestion, "job_interview_question")
        .innerJoinAndSelect(
          "job_interview_question.interviewQuestion",
          "interview_question"
        )
        .where("job_interview_question.jobUlid = :jobUlid", { jobUlid })
        .select([
          "job_interview_question.id",
          "interview_question.question",
          "job_interview_question.response",
        ])
        .orderBy("interview_question.id", "ASC")
        .getMany();

      const payload: RespJobInterviewQuestions = {
        job_interview_questions: [],
      };

      for (let i = 0; i < jiq.length; i++) {
        payload.job_interview_questions.push({
          id: jiq[i].id,
          question: jiq[i].interviewQuestion.question,
          response: jiq[i].response,
        });
      }

      res
        .status(constants.HTTP_STATUS_OK)
        .send(ApiRespCreator.createSuccessResponse(payload));
    } catch (error) {
      ApiLogger.error(error);
      if (error instanceof EntityNotFoundError) {
        res.sendStatus(constants.HTTP_STATUS_NOT_FOUND);
      } else {
        res.sendStatus(constants.HTTP_STATUS_INTERNAL_SERVER_ERROR);
      }
    }
  };

  public patchJob = async (req: Request, res: Response) => {
    const jobUlid = req.params["jobUlid"];

    try {
      const jobRepo = this.dataSource.getRepository(Job);
      const job = await jobRepo.findOneBy({ jobUlid: jobUlid });
      if (!job) {
        ApiLogger.log("HERE1");
        res.sendStatus(constants.HTTP_STATUS_NOT_FOUND);
        return;
      }

      const updatedJob = jobRepo.merge(job, req.body);
      await jobRepo.save(updatedJob);

      ApiLogger.log("HERE2");

      res
        .status(constants.HTTP_STATUS_OK)
        .send(
          ApiRespCreator.createSuccessResponse<JobApplication>(
            updatedJob.toJSON()
          )
        );
    } catch (error) {
      if (error instanceof EntityNotFoundError) {
        ApiLogger.log("HERE3");
        res.sendStatus(constants.HTTP_STATUS_NOT_FOUND);
      } else {
        res.sendStatus(constants.HTTP_STATUS_INTERNAL_SERVER_ERROR);
      }
    }
  };

  public patchJobInterviewQuestion = async (req: Request, res: Response) => {
    const jobUlid = req.params["jobUlid"];
    const jiqIdParams = req.params["jiqId"];

    try {
      const jiqId = parseInt(jiqIdParams, 10);

      const jiqRepo = this.dataSource.getRepository(JobInterviewQuestion);
      const jiq = await jiqRepo.findOneBy({ id: jiqId, jobUlid: jobUlid });
      if (!jiq) {
        res.sendStatus(constants.HTTP_STATUS_NOT_FOUND);
        return;
      }

      const updatedJiq = jiqRepo.merge(jiq, req.body);
      await jiqRepo.save(updatedJiq);

      const iq = await InterviewQuestion.findOneBy({
        id: updatedJiq.interviewQuestionId,
      });
      if (!iq) {
        res.sendStatus(constants.HTTP_STATUS_NOT_FOUND);
        return;
      }

      res
        .status(constants.HTTP_STATUS_OK)
        .send(
          ApiRespCreator.createSuccessResponse<JobInterviewQuestionsModified>(
            updatedJiq.toJSON(iq.question)
          )
        );
    } catch (error) {
      ApiLogger.error(error);

      if (error instanceof EntityNotFoundError) {
        res.sendStatus(constants.HTTP_STATUS_NOT_FOUND);
      } else {
        res.sendStatus(constants.HTTP_STATUS_INTERNAL_SERVER_ERROR);
      }
    }
  };

  public deleteJob = async (req: Request, res: Response) => {
    const jobUlid = req.params["jobUlid"];

    Job.delete(jobUlid)
      .then((_) => {
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
