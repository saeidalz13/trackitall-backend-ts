import { Request, Response } from "express";
import { constants } from "http2";
import { ApiResp } from "../models/api/ApiResp";
import { ReqSignup, RespSignupPayload } from "../models/auth/signup";
import { DataSource, QueryFailedError } from "typeorm";
import { User } from "../entity/user";
import { PostgresError } from "pg-error-enum";
import { ReqLogin, RespLoginPayload } from "../models/auth/login";
import { ApiRespCreator } from "../utils/apiRespUtils";
import jwt, { Secret, JwtPayload, TokenExpiredError } from "jsonwebtoken";
import { COOKIE_NAME } from "../constants/serverConsts";
import { ApiJwtPayload } from "../models/auth/auth";

export class AuthController {
  private dataSource: DataSource;
  private jwtSecret: string;

  constructor(dataSource: DataSource, jwtSecret: string) {
    this.dataSource = dataSource;
    this.jwtSecret = jwtSecret;
  }

  private isReqBodyValid(body: any): body is ReqLogin {
    return (
      typeof body === "object" &&
      typeof body.email === "string" &&
      typeof body.password === "string"
    );
  }

  private buildCookie(userId: string, email: string): string {
    const jwtP: ApiJwtPayload = { userId: userId, email: email };
    return jwt.sign(jwtP, this.jwtSecret, { expiresIn: "15m" });
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

      res.cookie(COOKIE_NAME, this.buildCookie(user.id, user.email), {
        sameSite: "none",
        secure: false,
        httpOnly: true,
        maxAge: 900000, // 15 mins
        path: "/",
      });

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
          .send(ApiRespCreator.createResourceNotFound("user"));
        return;
      }

      res.cookie(COOKIE_NAME, this.buildCookie(user.id, user.email), {
        sameSite: "none",
        secure: false,
        httpOnly: true,
        maxAge: 90000000, // 15 mins
        path: "/",
      });

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

  public getAuth = async (req: Request, res: Response) => {
    try {
      const cookieValue = req.cookies[COOKIE_NAME];

      if (cookieValue) {
        const jwtP = jwt.verify(cookieValue, this.jwtSecret);

        if (typeof jwtP !== "string") {
          const decodedP = jwtP as ApiJwtPayload;
          decodedP.email;

          const user = await User.findOne({ where: { email: decodedP.email } });

          if (!user) {
            res
              .status(constants.HTTP_STATUS_NOT_FOUND)
              .send(ApiRespCreator.createResourceNotFound("user"));
            return;
          }

          res.status(constants.HTTP_STATUS_OK).send(
            ApiRespCreator.createSuccessResponse<RespLoginPayload>({
              email: user.email,
              user_id: user.id,
            })
          );
        }
      }
    } catch (error) {
      if (error instanceof TokenExpiredError) {
        console.error("expired token!")
      }
      res
        .status(constants.HTTP_STATUS_INTERNAL_SERVER_ERROR)
        .send(ApiRespCreator.createUnexpectedErrorResponse());
    }
  };
}
