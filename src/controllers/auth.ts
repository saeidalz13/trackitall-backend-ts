import { Request, Response } from "express";
import { constants } from "http2";
import { ApiResp } from "../models/api/ApiResp";
import { ReqSignup, RespSignupPayload } from "../models/auth/signup";
import { DataSource } from "typeorm";

export class AuthController {
  private dataSource: DataSource;

  constructor(dataSource: DataSource) {
    this.dataSource = dataSource;
  }

  public postSignup(req: Request, res: Response) {
    const reqBody: ReqSignup = req.body;

    const hashedPw = Bun.password.hashSync(reqBody.password, {
      algorithm: "bcrypt",
      cost: 10,
    });

    const apiResp: ApiResp<RespSignupPayload> = {
      payload: {
        email: reqBody.email,
        user_id: "fdsg34",
      },
    };

    res.status(constants.HTTP_STATUS_OK).send(apiResp);
  }
}
