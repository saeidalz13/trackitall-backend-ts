import { Request, Response } from "express";
import { constants } from "http2";
import { ApiResp, NoPayload } from "../models/api/ApiResp";
import { ReqSignup, RespSignupPayload } from "../models/auth/signup";
import { DataSource, EntityNotFoundError, QueryFailedError } from "typeorm";
import { User } from "../entity/user";
import { PostgresError } from "pg-error-enum";
import { ReqLogin, RespLoginPayload } from "../models/auth/login";
import { ApiRespCreator } from "../utils/apiRespUtils";
import jwt from "jsonwebtoken";
import { COOKIE_NAME } from "../constants/serverConsts";
import { ApiJwtPayload } from "../models/auth/auth";
import Token from "../entity/token";
import { ApiLogger } from "../utils/serverUtils";
import { InterviewQuestions } from "../entity/interviewQuestions";
import { generateDefaultInterviewQuestions } from "../constants/userConsts";

export class AuthController {
  private dataSource: DataSource;
  private jwtSecret: string;
  private emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  private specialChars = /[`!@#$%^&*()_\-+=[\]{};':"\\|,.<>/?~ ]/;

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

  private buildJWT(userId: string, email: string): string {
    const jwtP: ApiJwtPayload = { userId: userId, email: email };
    return jwt.sign(jwtP, this.jwtSecret, { expiresIn: "1h" });
  }

  private async storeJWT(
    req: Request,
    jwtToken: string
  ): Promise<ApiResp<NoPayload> | null> {
    try {
      const ua = req.headers["user-agent"];
      if (!ua) {
        console.log("undefined user-agent");
        return ApiRespCreator.createErrUserAgent();
      }

      const hostname = req.hostname;
      if (!hostname) {
        console.log("undefined hostname from request");
        return ApiRespCreator.createErrIp();
      }

      const t = new Token();
      t.hoseName = hostname;
      t.userAgent = ua;
      t.jwtToken = jwtToken;

      t.expiryTime = new Date(Date.now() + 60 * 60 * 1000);
      await t.save();
      return null;
    } catch (error) {
      console.error(error);
      return ApiRespCreator.createErrUnexpected();
    }
  }

  private isEmailValid = (email: string): boolean => {
    if (email === "") {
      return false;
    }

    return this.emailRegex.test(email);
  };

  private validatePassword = (password: string): null | string => {
    if (password == "") {
      return "no password provided";
    }

    if (password.length <= 8) {
      return "Length must be equal or grater than 8";
    }

    if (!this.specialChars.test(password)) {
      return "Must contain at least one special character";
    }

    if (!/\d/.test(password)) {
      return "Must contain at least one number";
    }

    return null;
  };

  public postSignup = async (req: Request, res: Response) => {
    if (!this.isReqBodyValid(req.body)) {
      res
        .status(constants.HTTP_STATUS_BAD_REQUEST)
        .send(ApiRespCreator.createErrInvalidBody());
      return;
    }

    const reqBody: ReqSignup = req.body;
    const hashedPw = Bun.password.hashSync(reqBody.password, {
      algorithm: "bcrypt",
      cost: 10,
    });

    // normalizing email and password
    reqBody.password = reqBody.password.trim();
    reqBody.email = reqBody.email.trim();
    reqBody.email = reqBody.email.toLowerCase();

    if (!this.isEmailValid(reqBody.email)) {
      res
        .status(constants.HTTP_STATUS_BAD_REQUEST)
        .send(ApiRespCreator.createErrCustom("invalid email address"));
      return;
    }

    const err = this.validatePassword(reqBody.password);
    if (err !== null) {
      res
        .status(constants.HTTP_STATUS_BAD_REQUEST)
        .send(ApiRespCreator.createErrCustom(err));
      return;
    }

    try {
      const user = new User();
      user.email = reqBody.email;
      user.password = hashedPw;
      const insertedRes = await user.save();

      const apiResp = ApiRespCreator.createSuccessResponse<RespSignupPayload>({
        email: insertedRes.email,
        user_id: insertedRes.id,
      });

      const jwtToken = this.buildJWT(user.id, user.email);

      const apiErr = await this.storeJWT(req, jwtToken);
      if (apiErr) {
        res.status(constants.HTTP_STATUS_BAD_REQUEST).send(apiErr);
        return;
      }

      await this.dataSource
        .createQueryBuilder()
        .insert()
        .into(InterviewQuestions)
        .values(generateDefaultInterviewQuestions(insertedRes.id))
        .execute();

      res.cookie(COOKIE_NAME, jwtToken, {
        sameSite: "none",
        secure: false,
        httpOnly: true,
        maxAge: 3600000,
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
      }

      console.error("Unexpected error in sign up:", error);
      res
        .status(constants.HTTP_STATUS_INTERNAL_SERVER_ERROR)
        .send(ApiRespCreator.createErrUnexpected());
    }
  };

  public postLogin = async (req: Request, res: Response) => {
    if (!this.isReqBodyValid(req.body)) {
      res
        .status(constants.HTTP_STATUS_BAD_REQUEST)
        .send(ApiRespCreator.createErrInvalidBody());
      return;
    }

    const reqBody: ReqLogin = req.body;

    try {
      const user = await User.findOne({ where: { email: reqBody.email } });

      if (!user) {
        res
          .status(constants.HTTP_STATUS_NOT_FOUND)
          .send(ApiRespCreator.createErrResourceNotFound("user"));
        return;
      }

      const jwtToken = this.buildJWT(user.id, user.email);

      const apiErr = await this.storeJWT(req, jwtToken);
      if (apiErr) {
        res.status(constants.HTTP_STATUS_BAD_REQUEST).send(apiErr);
        return;
      }

      res.cookie(COOKIE_NAME, jwtToken, {
        sameSite: "none",
        secure: false,
        httpOnly: true,
        maxAge: 3600000,
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
        .send(ApiRespCreator.createErrUnexpected());
    }
  };

  public getAuth = async (req: Request, res: Response) => {
    try {
      const cookieValue = req.cookies[COOKIE_NAME];
      const userAgent = req.headers["user-agent"];
      const hostname = req.hostname;

      const dbToken = await Token.findOneBy({ jwtToken: cookieValue });

      if (
        !dbToken ||
        dbToken.hoseName !== hostname ||
        dbToken.userAgent !== userAgent
      ) {
        res.sendStatus(constants.HTTP_STATUS_UNAUTHORIZED);
        return;
      }

      if (cookieValue) {
        try {
          const jwtP = jwt.verify(cookieValue, this.jwtSecret);
          if (typeof jwtP !== "string") {
            const decodedP = jwtP as ApiJwtPayload;
            decodedP.email;

            const user = await User.findOne({
              where: { email: decodedP.email },
            });

            if (!user) {
              res
                .status(constants.HTTP_STATUS_UNAUTHORIZED)
                .send(ApiRespCreator.createErrResourceNotFound("user"));
              return;
            }

            ApiLogger.log("Valid request; Forwarding...");
            res.status(constants.HTTP_STATUS_OK).send(
              ApiRespCreator.createSuccessResponse<RespLoginPayload>({
                email: user.email,
                user_id: user.id,
              })
            );
            return;
          }
        } catch (error) {
          // This is an expired token and needs to be deleted
          await Token.delete(dbToken.jwtToken);
          ApiLogger.error(error);
        }
      }

      res.sendStatus(constants.HTTP_STATUS_UNAUTHORIZED);
    } catch (error) {
      ApiLogger.log(error);
      res.sendStatus(constants.HTTP_STATUS_UNAUTHORIZED);
    }
  };

  public postSignOut = async (req: Request, res: Response) => {
    const cookieValue = req.cookies[COOKIE_NAME];

    if (!cookieValue) {
      return;
    }

    // It doesn't matter if it fails
    Token.delete(cookieValue)
      .then(() => res.sendStatus(constants.HTTP_STATUS_NO_CONTENT))
      .catch((error) => ApiLogger.error(`Failed to delete token: ${error}`));
  };

  public deleteUser = async (req: Request, res: Response) => {
    try {
      const userUlid = req.params["userUlid"];

      await this.dataSource
        .createQueryBuilder()
        .delete()
        .from(User)
        .where("id = :id", { id: userUlid })
        .execute();

      res.sendStatus(constants.HTTP_STATUS_NO_CONTENT);
    } catch (error) {
      if (error instanceof EntityNotFoundError) {
        res.sendStatus(constants.HTTP_STATUS_NOT_FOUND);
        return;
      }

      console.error(error);
      res
        .status(constants.HTTP_STATUS_INTERNAL_SERVER_ERROR)
        .send(ApiRespCreator.createErrUnexpected());
    }
  };
}
