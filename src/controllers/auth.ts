import { Request, Response } from "express";
import { constants } from "http2";
import { ApiResp } from "../models/api/ApiResp";
import { ReqSignup, RespSignupPayload } from "../models/auth/signup";
import { DataSource, QueryFailedError } from "typeorm";
import { User } from "../entity/user";
import { PostgresError } from "pg-error-enum";
import { ReqLogin, RespLoginPayload } from "../models/auth/login";
import { ApiRespCreator } from "../utils/apiRespUtils";

export class AuthController {
  private dataSource: DataSource;

  constructor(dataSource: DataSource) {
    this.dataSource = dataSource;
  }

  private isReqBodyValid(body: any): body is ReqLogin {
    return (
      typeof body === "object" &&
      typeof body.email === "string" &&
      typeof body.password === "string"
    );
  }

  public postSignup = async (req: Request, res: Response) => {
    if (!this.isReqBodyValid(req.body)) {
      res
        .status(constants.HTTP_STATUS_BAD_REQUEST)
        .send(ApiRespCreator.createInvalidBodyResponse());
      return;
    }

    const reqBody: ReqSignup = req.body;

    const hashedPw = Bun.password.hashSync(reqBody.password, {
      algorithm: "bcrypt",
      cost: 10,
    });

    // TODO: Add Check for email and password
    // ! Take the criteria from frontend

    try {
      const user = new User();
      user.email = reqBody.email;
      user.password = hashedPw;
      const insertedRes = await user.save();

      const apiResp: ApiResp<RespSignupPayload> = {
        payload: {
          email: insertedRes.email,
          user_id: insertedRes.id,
        },
      };

      res.status(constants.HTTP_STATUS_OK).send(apiResp);
    } catch (error) {
      if (error instanceof QueryFailedError) {
        const dbError = error.driverError as any;

        // Unique email violation
        if (dbError.code === PostgresError.UNIQUE_VIOLATION) {
          const apiResp: ApiResp<boolean> = {
            error: "This email is alraedy associated with a user",
          };

          res.status(constants.HTTP_STATUS_BAD_REQUEST).send(apiResp);
          return;
        }

        // Unexpected violations
        console.log("Unexpected error in sign up:", error);
        res
          .status(constants.HTTP_STATUS_INTERNAL_SERVER_ERROR)
          .send(ApiRespCreator.createUnexpectedErrorResponse());
      }
    }
  };

  public postLogin = async (req: Request, res: Response) => {
    if (!this.isReqBodyValid(req.body)) {
      res
        .status(constants.HTTP_STATUS_BAD_REQUEST)
        .send(ApiRespCreator.createInvalidBodyResponse());
      return;
    }

    const reqBody: ReqLogin = req.body;

    try {
      const user = await User.findOne({ where: { email: reqBody.email } });

      if (!user) {
        res
          .status(constants.HTTP_STATUS_NOT_FOUND)
          .send(ApiRespCreator.createResourceNotFound());
        return;
      }

      res.status(constants.HTTP_STATUS_OK).send(
        ApiRespCreator.createSuccessResponse<RespLoginPayload>({
          email: user.email,
          user_id: user.id,
        })
      );
    } catch (error) {
      res
        .status(constants.HTTP_STATUS_INTERNAL_SERVER_ERROR)
        .send(ApiRespCreator.createUnexpectedErrorResponse());
    }
  };
}
