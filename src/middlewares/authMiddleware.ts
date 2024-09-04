import { Request, Response, NextFunction } from "express";
import { constants } from "http2";
import { COOKIE_NAME } from "../constants/serverConsts";
import jwt, { TokenExpiredError } from "jsonwebtoken";
import { User } from "../entity/user";
import { ApiJwtPayload } from "../models/auth/auth";
import { ApiRespCreator } from "../utils/apiRespUtils";

export default class AuthMiddleware {
  jwtSecret: string;

  constructor(jwtSecret: string) {
    this.jwtSecret = jwtSecret;
  }

  public authenticate = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
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
          
          console.log("Valid request; Forwarding...")
          next();
          return;
        }
      }

      res.sendStatus(constants.HTTP_STATUS_UNAUTHORIZED);
    } catch (error) {
      console.log(error);
      res.sendStatus(constants.HTTP_STATUS_UNAUTHORIZED);
    }
  };
}
