import { Request, Response, NextFunction } from "express";

const authenticateReq = (req: Request, res: Response, next: NextFunction) => {
  // TODO: put authentication of jobs, courses, and LeetCode
  next();
};

export const authMiddleware = { authenticateReq };
