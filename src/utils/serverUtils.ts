import { CorsOptions } from "cors";
import { constants } from "http2";

export const newCorsOption = (allowedOrigin: string): CorsOptions => {
  return {
    optionsSuccessStatus: constants.HTTP_STATUS_OK,
    origin: allowedOrigin,
    credentials: true,
  };
};
