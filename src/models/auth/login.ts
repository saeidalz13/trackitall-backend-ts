export interface ReqLogin {
  email: string;
  password: string;
}

export interface RespLoginPayload {
  user_id: string;
  email: string;
}
