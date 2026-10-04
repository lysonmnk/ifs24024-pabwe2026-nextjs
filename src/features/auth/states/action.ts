import { AppDispatch } from "@/store";
import { User } from "@/types";
import { authApi, LoginPayload, RegisterPayload } from "../api/authApi";
import { userApi } from "@/features/users/api/userApi";
import {
  getAccessToken,
  putAccessToken,
  removeAccessToken,
} from "@/helpers/apiHelper";
import { showError, showSuccess } from "@/helpers/toolsHelper";

export const ActionType = {
  SET_AUTH_USER: "auth/setAuthUser",
  UNSET_AUTH_USER: "auth/unsetAuthUser",
  SET_IS_PRELOAD: "auth/setIsPreload",
} as const;

export function setAuthUserActionCreator(authUser: User | null) {
  return {
    type: ActionType.SET_AUTH_USER,
    payload: { authUser },
  };
}

export function unsetAuthUserActionCreator() {
  return {
    type: ActionType.UNSET_AUTH_USER,
    payload: { authUser: null },
  };
}

export function setIsPreloadActionCreator(isPreload: boolean) {
  return {
    type: ActionType.SET_IS_PRELOAD,
    payload: { isPreload },
  };
}

export function asyncRegister(payload: RegisterPayload) {
  return async () => {
    try {
      const response = await authApi.register(payload);
      if (response.status === "success") {
        showSuccess(response.message || "Pendaftaran akun berhasil!");
        return true;
      } else {
        showError(response.message || "Pendaftaran gagal");
        return false;
      }
    } catch (error: any) {
      showError(error.message || "Terjadi kesalahan saat registrasi");
      return false;
    }
  };
}

export function asyncSetAuthUser(payload: LoginPayload) {
  return async (dispatch: AppDispatch) => {
    try {
      const response = await authApi.login(payload);
      if (response.status === "success" && response.data) {
        putAccessToken(response.data.token);
        const user = response.data.user || (response.data as any);
        dispatch(setAuthUserActionCreator(user));
        dispatch(setIsPreloadActionCreator(false));
        showSuccess(response.message || "Login berhasil");
        return true;
      } else {
        showError(response.message || "Login gagal");
        return false;
      }
    } catch (error: any) {
      showError(error.message || "Kredensial tidak valid");
      return false;
    }
  };
}

export function asyncUnsetAuthUser() {
  return async (dispatch: AppDispatch) => {
    try {
      await authApi.logout();
    } catch {
      // Ignore logout API failures
    } finally {
      removeAccessToken();
      dispatch(unsetAuthUserActionCreator());
      showSuccess("Berhasil logout!");
    }
  };
}

export function asyncPreloadProcess() {
  return async (dispatch: AppDispatch) => {
    try {
      const token = getAccessToken();
      if (!token) {
        dispatch(setAuthUserActionCreator(null));
        return;
      }
      const response = await userApi.getProfile();
      if (
        response.status === "success" &&
        (response.data?.user || (response.data as any)?.id || (response.data as any)?.email)
      ) {
        dispatch(setAuthUserActionCreator(response.data?.user || (response.data as any)));
      } else {
        removeAccessToken();
        dispatch(setAuthUserActionCreator(null));
      }
    } catch {
      removeAccessToken();
      dispatch(setAuthUserActionCreator(null));
    } finally {
      dispatch(setIsPreloadActionCreator(false));
    }
  };
}
