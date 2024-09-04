import { ApiResp, NoPayload } from "../models/api/ApiResp";

export class ApiRespCreator {
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

  public static createErrBadQueryParam(expected: string, got: any): ApiResp<NoPayload> {
    return {error: `Query params must be: ${expected}; got: ${got}`}
  }

  public static createSuccessResponse<T>(payload: T): ApiResp<T> {
    return { payload: payload };
  }

}
