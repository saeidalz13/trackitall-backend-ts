export interface ApiResp<T> {
  payload?: T;
  error?: string;
}


export type NoPayload = boolean