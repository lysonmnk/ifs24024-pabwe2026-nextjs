import { apiHelper } from "@/helpers/apiHelper";
import { ApiResult, User } from "@/types";

export interface UpdateProfilePayload {
  name: string;
  email: string;
}

export interface ChangePasswordPayload {
  password: string;
  new_password: string;
  new_password_confirmation: string;
}

export const userApi = {
  async getAllUsers(): Promise<ApiResult<{ users: User[] }>> {
    return apiHelper.get<ApiResult<{ users: User[] }>>("/users");
  },

  async getUserById(id: number | string): Promise<ApiResult<{ user: User }>> {
    return apiHelper.get<ApiResult<{ user: User }>>(`/users/${id}`);
  },

  async getProfile(): Promise<ApiResult<{ user: User }>> {
    return apiHelper.get<ApiResult<{ user: User }>>("/users/me");
  },

  async updateProfile(payload: UpdateProfilePayload): Promise<ApiResult<{ user: User }>> {
    return apiHelper.put<ApiResult<{ user: User }>>("/users/me", payload);
  },

  async changePhoto(photoFile: File): Promise<ApiResult<{ user: User }>> {
    const formData = new FormData();
    formData.append("photo", photoFile);
    return apiHelper.upload<ApiResult<{ user: User }>>("/users/me/photo", formData);
  },

  async changePassword(payload: ChangePasswordPayload): Promise<ApiResult> {
    try {
      return await apiHelper.put<ApiResult>("/users/password", payload);
    } catch {
      return await apiHelper.put<ApiResult>("/users/me/password", payload);
    }
  },
};
