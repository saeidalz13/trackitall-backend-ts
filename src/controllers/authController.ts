import { Request, Response } from "express";
import { constants } from "http2";
import { ApiResp, NoPayload } from "../models/api/ApiResp";
import { ReqSignup, RespSignupPayload } from "../models/auth/signup";
import { DataSource, QueryFailedError } from "typeorm";
import { User } from "../entity/user";
import { PostgresError } from "pg-error-enum";
import { ReqLogin, RespLoginPayload } from "../models/auth/login";
import { ApiRespCreator } from "../utils/apiRespUtils";
import jwt, { TokenExpiredError } from "jsonwebtoken";
import { COOKIE_NAME } from "../constants/serverConsts";
import { ApiJwtPayload } from "../models/auth/auth";
import Token from "../entity/token";
import { ApiLogger } from "../utils/serverUtils";

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

    // TODO: Add Check for email and password
    // ! Take the criteria from frontend

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

      res.cookie(COOKIE_NAME, jwtToken, {
        sameSite: "none",
        secure: false,
        httpOnly: true,
        maxAge: 3600000, // 1 hour
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
          .send(ApiRespCreator.createErrUnexpected());
      }
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
        maxAge: 3600000, // 1 hour
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

      if (cookieValue) {
        const jwtP = jwt.verify(cookieValue, this.jwtSecret);

        if (typeof jwtP !== "string") {
          const decodedP = jwtP as ApiJwtPayload;
          decodedP.email;

          const user = await User.findOne({ where: { email: decodedP.email } });

          if (!user) {
            res
              .status(constants.HTTP_STATUS_UNAUTHORIZED)
              .send(ApiRespCreator.createErrResourceNotFound("user"));
            return;
          }

          res.status(constants.HTTP_STATUS_OK).send(
            ApiRespCreator.createSuccessResponse<RespLoginPayload>({
              email: user.email,
              user_id: user.id,
            })
          );
          return;
        }
      }

      res.sendStatus(constants.HTTP_STATUS_UNAUTHORIZED);
    } catch (error) {
      if (error instanceof TokenExpiredError) {
        console.error("expired token!");
      }
      res
        .status(constants.HTTP_STATUS_UNAUTHORIZED)
        .send(ApiRespCreator.createErrUnexpected());
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
}
