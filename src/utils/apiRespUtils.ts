import { ApiResp, NoPayload } from "../models/api/ApiResp";

export class ApiRespCreator {
  public static createErrCustom(error: string): ApiResp<NoPayload> {
    return { error: error };
  }

  public static createErrInvalidBody(): ApiResp<NoPayload> {
    return { error: "Invalid request body" };
  }

  public static createErrUnexpected(): ApiResp<NoPayload> {
    return { error: "Unexpected error in server; Please try again" };
  }

  public static createErrResourceNotFound(
    resource: string
  ): ApiResp<NoPayload> {
    return { error: `Requested ${resource} not found` };
  }

  public static createErrBadQueryParam(
    expected: string,
    got: any
  ): ApiResp<NoPayload> {
    return { error: `Query params must be: ${expected}; got: ${got}` };
  }

  public static createErrUserAgent(): ApiResp<NoPayload> {
    return { error: "user-agent in request header is undefined " };
  }

  public static createErrIp(): ApiResp<NoPayload> {
    return { error: "ip in request is undefined " };
  }

  public static createSuccessResponse<T>(payload: T): ApiResp<T> {
    return { payload: payload };
  }
}
