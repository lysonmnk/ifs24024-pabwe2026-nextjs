import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  ActionType,
  setAuthUserActionCreator,
  unsetAuthUserActionCreator,
  setIsPreloadActionCreator,
  asyncRegister,
  asyncSetAuthUser,
  asyncUnsetAuthUser,
  asyncPreloadProcess,
} from "./action";
import { authApi } from "../api/authApi";
import { userApi } from "@/features/users/api/userApi";
import * as apiHelper from "@/helpers/apiHelper";
import * as toolsHelper from "@/helpers/toolsHelper";

vi.mock("../api/authApi");
vi.mock("@/features/users/api/userApi");
vi.mock("@/helpers/toolsHelper");
vi.mock("@/helpers/apiHelper", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/helpers/apiHelper")>();
  return {
    ...actual,
    getAccessToken: vi.fn(),
    putAccessToken: vi.fn(),
    removeAccessToken: vi.fn(),
  };
});

describe("auth actions", () => {
  const dispatch = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("action creators", () => {
    it("should create SET_AUTH_USER action", () => {
      const user = { id: 1, name: "Test", email: "test@delcom.org" };
      const action = setAuthUserActionCreator(user);
      expect(action).toEqual({
        type: ActionType.SET_AUTH_USER,
        payload: { authUser: user },
      });
    });

    it("should create UNSET_AUTH_USER action", () => {
      const action = unsetAuthUserActionCreator();
      expect(action).toEqual({
        type: ActionType.UNSET_AUTH_USER,
        payload: { authUser: null },
      });
    });

    it("should create SET_IS_PRELOAD action", () => {
      const action = setIsPreloadActionCreator(false);
      expect(action).toEqual({
        type: ActionType.SET_IS_PRELOAD,
        payload: { isPreload: false },
      });
    });
  });

  describe("asyncRegister", () => {
    const payload = { name: "A", email: "a@delcom.org", password: "pass" };

    it("should return true and show success on successful registration", async () => {
      vi.mocked(authApi.register).mockResolvedValueOnce({
        status: "success",
        message: "Registrasi berhasil",
      });

      const thunk = asyncRegister(payload);
      const res = await thunk();

      expect(res).toBe(true);
      expect(toolsHelper.showSuccess).toHaveBeenCalledWith("Registrasi berhasil");
    });

    it("should return false and show error on failed registration", async () => {
      vi.mocked(authApi.register).mockResolvedValueOnce({
        status: "fail",
        message: "Email sudah terdaftar",
      });

      const thunk = asyncRegister(payload);
      const res = await thunk();

      expect(res).toBe(false);
      expect(toolsHelper.showError).toHaveBeenCalledWith("Email sudah terdaftar");
    });

    it("should return false and show error when register throws an exception", async () => {
      vi.mocked(authApi.register).mockRejectedValueOnce(new Error("Network error"));

      const thunk = asyncRegister(payload);
      const res = await thunk();

      expect(res).toBe(false);
      expect(toolsHelper.showError).toHaveBeenCalledWith("Network error");
    });
  });

  describe("asyncSetAuthUser", () => {
    const payload = { email: "a@delcom.org", password: "pass" };
    const user = { id: 1, name: "A", email: "a@delcom.org" };

    it("should store token, dispatch setAuthUser, and show success on login", async () => {
      vi.mocked(authApi.login).mockResolvedValueOnce({
        status: "success",
        message: "Login berhasil",
        data: { user, token: "token123" },
      });

      const thunk = asyncSetAuthUser(payload);
      const res = await thunk(dispatch);

      expect(res).toBe(true);
      expect(apiHelper.putAccessToken).toHaveBeenCalledWith("token123");
      expect(dispatch).toHaveBeenCalledWith(setAuthUserActionCreator(user));
      expect(toolsHelper.showSuccess).toHaveBeenCalledWith("Login berhasil");
    });

    it("should return false and show error when login response fails", async () => {
      vi.mocked(authApi.login).mockResolvedValueOnce({
        status: "fail",
        message: "Kredensial salah",
      });

      const thunk = asyncSetAuthUser(payload);
      const res = await thunk(dispatch);

      expect(res).toBe(false);
      expect(toolsHelper.showError).toHaveBeenCalledWith("Kredensial salah");
    });

    it("should return false and show error when login throws", async () => {
      vi.mocked(authApi.login).mockRejectedValueOnce(new Error("Fetch failed"));

      const thunk = asyncSetAuthUser(payload);
      const res = await thunk(dispatch);

      expect(res).toBe(false);
      expect(toolsHelper.showError).toHaveBeenCalled();
    });
  });

  describe("asyncUnsetAuthUser", () => {
    it("should call logout, remove token, and dispatch unsetAuthUser", async () => {
      vi.mocked(authApi.logout).mockResolvedValueOnce({ status: "success", message: "ok" });

      const thunk = asyncUnsetAuthUser();
      await thunk(dispatch);

      expect(apiHelper.removeAccessToken).toHaveBeenCalled();
      expect(dispatch).toHaveBeenCalledWith(unsetAuthUserActionCreator());
      expect(toolsHelper.showSuccess).toHaveBeenCalledWith("Berhasil logout!");
    });

    it("should still clean token and dispatch even if logout API throws", async () => {
      vi.mocked(authApi.logout).mockRejectedValueOnce(new Error("Network fail"));

      const thunk = asyncUnsetAuthUser();
      await thunk(dispatch);

      expect(apiHelper.removeAccessToken).toHaveBeenCalled();
      expect(dispatch).toHaveBeenCalledWith(unsetAuthUserActionCreator());
    });
  });

  describe("asyncPreloadProcess", () => {
    it("should set authUser to null if no token is found", async () => {
      vi.mocked(apiHelper.getAccessToken).mockReturnValueOnce(null);

      const thunk = asyncPreloadProcess();
      await thunk(dispatch);

      expect(dispatch).toHaveBeenCalledWith(setAuthUserActionCreator(null));
      expect(dispatch).toHaveBeenCalledWith(setIsPreloadActionCreator(false));
    });

    it("should set authUser if token is valid and profile is retrieved", async () => {
      const user = { id: 1, name: "Preloaded", email: "p@delcom.org" };
      vi.mocked(apiHelper.getAccessToken).mockReturnValueOnce("valid-token");
      vi.mocked(userApi.getProfile).mockResolvedValueOnce({
        status: "success",
        message: "ok",
        data: { user },
      });

      const thunk = asyncPreloadProcess();
      await thunk(dispatch);

      expect(dispatch).toHaveBeenCalledWith(setAuthUserActionCreator(user));
      expect(dispatch).toHaveBeenCalledWith(setIsPreloadActionCreator(false));
    });

    it("should remove token and set null if profile fetch is not successful", async () => {
      vi.mocked(apiHelper.getAccessToken).mockReturnValueOnce("invalid-token");
      vi.mocked(userApi.getProfile).mockResolvedValueOnce({
        status: "fail",
        message: "unauthenticated",
      });

      const thunk = asyncPreloadProcess();
      await thunk(dispatch);

      expect(apiHelper.removeAccessToken).toHaveBeenCalled();
      expect(dispatch).toHaveBeenCalledWith(setAuthUserActionCreator(null));
      expect(dispatch).toHaveBeenCalledWith(setIsPreloadActionCreator(false));
    });

    it("should remove token and set null if profile fetch throws", async () => {
      vi.mocked(apiHelper.getAccessToken).mockReturnValueOnce("invalid-token");
      vi.mocked(userApi.getProfile).mockRejectedValueOnce(new Error("Timeout"));

      const thunk = asyncPreloadProcess();
      await thunk(dispatch);

      expect(apiHelper.removeAccessToken).toHaveBeenCalled();
      expect(dispatch).toHaveBeenCalledWith(setAuthUserActionCreator(null));
      expect(dispatch).toHaveBeenCalledWith(setIsPreloadActionCreator(false));
    });
  });
});
