import { Request, Response, NextFunction } from "express";

export const logRequest = (req: Request, res: Response, next: NextFunction) => {
    console.log(`incoming req => url: ${req.originalUrl}\t ip: ${req.ip}`)
    next();
};
