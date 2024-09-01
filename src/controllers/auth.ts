import { Request, Response } from "express";
import { constants } from "http2";
import { ApiResp } from "../models/api/ApiResp";
import { ReqSignup, RespSignupPayload } from "../models/auth/signup";
import { DataSource, QueryFailedError } from "typeorm";
import { User } from "../entity/user";
import { PostgresError } from "pg-error-enum";

export class AuthController {
  private dataSource: DataSource;

  constructor(dataSource: DataSource) {
    this.dataSource = dataSource;
  }

  public postSignup = async (req: Request, res: Response) => {
    const reqBody: ReqSignup = req.body;

    const hashedPw = Bun.password.hashSync(reqBody.password, {
      algorithm: "bcrypt",
      cost: 10,
    });

    try {
      // const insertedRes = await this.dataSource
      //   .createQueryBuilder()
      //   .insert()
      //   .into(User)
      //   .values({ email: reqBody.email, password: hashedPw })
      //   .execute();

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
        if (dbError.code === PostgresError.UNIQUE_VIOLATION) {
          const apiResp: ApiResp<boolean> = {
            error: "This email is alraedy associated with a user",
          };

          res.status(constants.HTTP_STATUS_BAD_REQUEST).send(apiResp);
          return;
        }

        const apiResp: ApiResp<boolean> = {
          error: "Unexpected error in server; Please try again",
        };
        console.log("Unexpected error in sign up:", error);
        res.status(constants.HTTP_STATUS_INTERNAL_SERVER_ERROR).send(apiResp);
      }
    }
  };
}
