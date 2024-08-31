import { Request, Response } from "express";
import { constants } from "http2";

// Adding a point system to the course

const getHome = (req: Request, res: Response) => {
  console.log(req.cookies);

  console.log(req.body)
  res.status(constants.HTTP_STATUS_OK).send("salam!");
};

export const homeController = { getHome };
