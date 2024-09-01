import { ApiResp, NoPayload } from "../models/api/ApiResp";

export class ApiRespCreator {
  public static createInvalidBodyResponse(): ApiResp<NoPayload> {
    return { error: "Invalid request body" };
  }

  public static createUnexpectedErrorResponse(): ApiResp<NoPayload> {
    return { error: "Unexpected error in server; Please try again" };
  }

  public static createResourceNotFound(): ApiResp<NoPayload> {
    return { error: "Requested resource not found" };
  }

  public static createSuccessResponse<T>(payload: T): ApiResp<T> {
    return { payload: payload };
  }
}
