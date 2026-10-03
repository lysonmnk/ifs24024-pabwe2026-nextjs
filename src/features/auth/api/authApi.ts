import { apiHelper } from "@/helpers/apiHelper";
import { ApiResult, User } from "@/types";

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginData {
  user: User;
  token: string;
}

export const authApi = {
  async register(payload: RegisterPayload): Promise<ApiResult> {
    return apiHelper.post<ApiResult>("/auth/register", payload);
  },

  async login(payload: LoginPayload): Promise<ApiResult<LoginData>> {
    return apiHelper.post<ApiResult<LoginData>>("/auth/login", payload);
  },

  async logout(): Promise<ApiResult> {
    return apiHelper.post<ApiResult>("/auth/logout");
  },
};
