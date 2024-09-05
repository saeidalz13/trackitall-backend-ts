import { Request, Response, NextFunction } from "express";
import { ApiLogger } from "../utils/serverUtils";

export const logRequest = (req: Request, res: Response, next: NextFunction) => {
  ApiLogger.log(`incoming req => url: ${req.originalUrl}\t ip: ${req.ip}`);
  next();
};
