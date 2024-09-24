import { Request, Response, NextFunction } from "express";
import { constants } from "http2";
import { COOKIE_NAME } from "../constants/serverConsts";
import jwt from "jsonwebtoken";
import { User } from "../entity/user";
import { ApiJwtPayload } from "../models/auth/auth";
import { ApiRespCreator } from "../utils/apiRespUtils";
import Token from "../entity/token";
import { ApiLogger } from "../utils/serverUtils";

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
            next();
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
}
