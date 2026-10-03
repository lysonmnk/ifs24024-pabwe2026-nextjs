import { AppDispatch } from "@/store";
import { User } from "@/types";
import {
  userApi,
  UpdateProfilePayload,
  ChangePasswordPayload,
} from "../api/userApi";
import { setAuthUserActionCreator } from "@/features/auth/states/action";
import { showError, showSuccess } from "@/helpers/toolsHelper";

export const ActionType = {
  RECEIVE_USERS: "users/receiveUsers",
  RECEIVE_PROFILE: "users/receiveProfile",
  UPDATE_PROFILE: "users/updateProfile",
} as const;

export function receiveUsersActionCreator(users: User[]) {
  return {
    type: ActionType.RECEIVE_USERS,
    payload: { users },
  };
}

export function receiveProfileActionCreator(profile: User | null) {
  return {
    type: ActionType.RECEIVE_PROFILE,
    payload: { profile },
  };
}

export function updateProfileActionCreator(profile: User) {
  return {
    type: ActionType.UPDATE_PROFILE,
    payload: { profile },
  };
}

export function asyncReceiveUsers() {
  return async (dispatch: AppDispatch) => {
    try {
      const response = await userApi.getAllUsers();
      if (response.status === "success" && response.data) {
        dispatch(receiveUsersActionCreator(response.data.users));
      }
    } catch (error: any) {
      showError(error.message || "Gagal memuat daftar pengguna");
    }
  };
}

export function asyncReceiveProfile() {
  return async (dispatch: AppDispatch) => {
    try {
      const response = await userApi.getProfile();
      if (response.status === "success" && response.data) {
        dispatch(receiveProfileActionCreator(response.data.user));
        dispatch(setAuthUserActionCreator(response.data.user));
      }
    } catch (error: any) {
      showError(error.message || "Gagal memuat profil pengguna");
    }
  };
}

export function asyncUpdateProfile(payload: UpdateProfilePayload) {
  return async (dispatch: AppDispatch) => {
    try {
      const response = await userApi.updateProfile(payload);
      if (response.status === "success" && response.data) {
        dispatch(updateProfileActionCreator(response.data.user));
        dispatch(setAuthUserActionCreator(response.data.user));
        showSuccess(response.message || "Profil berhasil diperbarui!");
        return true;
      } else {
        showError(response.message || "Gagal memperbarui profil");
        return false;
      }
    } catch (error: any) {
      showError(error.message || "Terjadi kesalahan saat memperbarui profil");
      return false;
    }
  };
}

export function asyncChangePhoto(photoFile: File) {
  return async (dispatch: AppDispatch) => {
    try {
      const response = await userApi.changePhoto(photoFile);
      if (response.status === "success" && response.data) {
        dispatch(updateProfileActionCreator(response.data.user));
        dispatch(setAuthUserActionCreator(response.data.user));
        showSuccess(response.message || "Foto profil berhasil diperbarui!");
        return true;
      } else {
        showError(response.message || "Gagal memperbarui foto profil");
        return false;
      }
    } catch (error: any) {
      showError(error.message || "Terjadi kesalahan saat mengunggah foto profil");
      return false;
    }
  };
}

export function asyncChangePassword(payload: ChangePasswordPayload) {
  return async () => {
    try {
      const response = await userApi.changePassword(payload);
      if (response.status === "success") {
        showSuccess(response.message || "Kata sandi berhasil diperbarui!");
        return true;
      } else {
        showError(response.message || "Gagal memperbarui kata sandi");
        return false;
      }
    } catch (error: any) {
      showError(error.message || "Terjadi kesalahan saat mengubah kata sandi");
      return false;
    }
  };
}
