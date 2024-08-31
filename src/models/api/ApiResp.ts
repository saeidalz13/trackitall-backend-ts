export interface ApiResp<T> {
  payload: T;
  error?: string;
}
