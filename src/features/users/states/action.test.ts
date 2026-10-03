import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  ActionType,
  receiveUsersActionCreator,
  receiveProfileActionCreator,
  updateProfileActionCreator,
  asyncReceiveUsers,
  asyncReceiveProfile,
  asyncUpdateProfile,
  asyncChangePhoto,
  asyncChangePassword,
} from "./action";
import { userApi } from "../api/userApi";
import * as toolsHelper from "@/helpers/toolsHelper";
import { setAuthUserActionCreator } from "@/features/auth/states/action";

vi.mock("../api/userApi");
vi.mock("@/helpers/toolsHelper");

describe("users actions", () => {
  const dispatch = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("action creators", () => {
    it("should create RECEIVE_USERS action", () => {
      const users = [{ id: 1, name: "U1", email: "u1@delcom.org" }];
      const action = receiveUsersActionCreator(users);
      expect(action).toEqual({
        type: ActionType.RECEIVE_USERS,
        payload: { users },
      });
    });

    it("should create RECEIVE_PROFILE action", () => {
      const profile = { id: 1, name: "U1", email: "u1@delcom.org" };
      const action = receiveProfileActionCreator(profile);
      expect(action).toEqual({
        type: ActionType.RECEIVE_PROFILE,
        payload: { profile },
      });
    });

    it("should create UPDATE_PROFILE action", () => {
      const profile = { id: 1, name: "U1", email: "u1@delcom.org" };
      const action = updateProfileActionCreator(profile);
      expect(action).toEqual({
        type: ActionType.UPDATE_PROFILE,
        payload: { profile },
      });
    });
  });

  describe("asyncReceiveUsers", () => {
    it("should fetch users and dispatch receiveUsers", async () => {
      const users = [{ id: 1, name: "U1", email: "u1@delcom.org" }];
      vi.mocked(userApi.getAllUsers).mockResolvedValueOnce({
        status: "success",
        message: "ok",
        data: { users },
      });

      const thunk = asyncReceiveUsers();
      await thunk(dispatch);

      expect(dispatch).toHaveBeenCalledWith(receiveUsersActionCreator(users));
    });

    it("should show error on exception in asyncReceiveUsers", async () => {
      vi.mocked(userApi.getAllUsers).mockRejectedValueOnce(new Error("Network failed"));

      const thunk = asyncReceiveUsers();
      await thunk(dispatch);

      expect(toolsHelper.showError).toHaveBeenCalledWith("Network failed");
    });
  });

  describe("asyncReceiveProfile", () => {
    it("should fetch profile and dispatch receiveProfile and setAuthUser", async () => {
      const user = { id: 1, name: "Me", email: "me@delcom.org" };
      vi.mocked(userApi.getProfile).mockResolvedValueOnce({
        status: "success",
        message: "ok",
        data: { user },
      });

      const thunk = asyncReceiveProfile();
      await thunk(dispatch);

      expect(dispatch).toHaveBeenCalledWith(receiveProfileActionCreator(user));
      expect(dispatch).toHaveBeenCalledWith(setAuthUserActionCreator(user));
    });

    it("should show error on exception in asyncReceiveProfile", async () => {
      vi.mocked(userApi.getProfile).mockRejectedValueOnce(new Error("Auth fail"));

      const thunk = asyncReceiveProfile();
      await thunk(dispatch);

      expect(toolsHelper.showError).toHaveBeenCalledWith("Auth fail");
    });
  });

  describe("asyncUpdateProfile", () => {
    const payload = { name: "New Name", email: "new@delcom.org" };
    const user = { id: 1, ...payload };

    it("should update profile successfully and dispatch update actions", async () => {
      vi.mocked(userApi.updateProfile).mockResolvedValueOnce({
        status: "success",
        message: "Profil updated",
        data: { user },
      });

      const thunk = asyncUpdateProfile(payload);
      const res = await thunk(dispatch);

      expect(res).toBe(true);
      expect(dispatch).toHaveBeenCalledWith(updateProfileActionCreator(user));
      expect(dispatch).toHaveBeenCalledWith(setAuthUserActionCreator(user));
      expect(toolsHelper.showSuccess).toHaveBeenCalledWith("Profil updated");
    });

    it("should handle failure response from updateProfile", async () => {
      vi.mocked(userApi.updateProfile).mockResolvedValueOnce({
        status: "fail",
        message: "Email invalid",
      });

      const thunk = asyncUpdateProfile(payload);
      const res = await thunk(dispatch);

      expect(res).toBe(false);
      expect(toolsHelper.showError).toHaveBeenCalledWith("Email invalid");
    });

    it("should handle exception thrown during updateProfile", async () => {
      vi.mocked(userApi.updateProfile).mockRejectedValueOnce(new Error("Server error"));

      const thunk = asyncUpdateProfile(payload);
      const res = await thunk(dispatch);

      expect(res).toBe(false);
      expect(toolsHelper.showError).toHaveBeenCalledWith("Server error");
    });
  });

  describe("asyncChangePhoto", () => {
    const file = new File(["dummy"], "p.png");
    const user = { id: 1, name: "Me", email: "me@delcom.org", photo: "new_url" };

    it("should upload photo and dispatch updates on success", async () => {
      vi.mocked(userApi.changePhoto).mockResolvedValueOnce({
        status: "success",
        message: "Foto updated",
        data: { user },
      });

      const thunk = asyncChangePhoto(file);
      const res = await thunk(dispatch);

      expect(res).toBe(true);
      expect(dispatch).toHaveBeenCalledWith(updateProfileActionCreator(user));
      expect(dispatch).toHaveBeenCalledWith(setAuthUserActionCreator(user));
      expect(toolsHelper.showSuccess).toHaveBeenCalledWith("Foto updated");
    });

    it("should handle failure response from changePhoto", async () => {
      vi.mocked(userApi.changePhoto).mockResolvedValueOnce({
        status: "fail",
        message: "Ukuran file terlalu besar",
      });

      const thunk = asyncChangePhoto(file);
      const res = await thunk(dispatch);

      expect(res).toBe(false);
      expect(toolsHelper.showError).toHaveBeenCalledWith("Ukuran file terlalu besar");
    });

    it("should handle exception thrown during changePhoto", async () => {
      vi.mocked(userApi.changePhoto).mockRejectedValueOnce(new Error("Upload failed"));

      const thunk = asyncChangePhoto(file);
      const res = await thunk(dispatch);

      expect(res).toBe(false);
      expect(toolsHelper.showError).toHaveBeenCalledWith("Upload failed");
    });
  });

  describe("asyncChangePassword", () => {
    const payload = { password: "1", new_password: "2", new_password_confirmation: "2" };

    it("should change password successfully", async () => {
      vi.mocked(userApi.changePassword).mockResolvedValueOnce({
        status: "success",
        message: "Sandi berhasil diubah",
      });

      const thunk = asyncChangePassword(payload);
      const res = await thunk();

      expect(res).toBe(true);
      expect(toolsHelper.showSuccess).toHaveBeenCalledWith("Sandi berhasil diubah");
    });

    it("should handle failure response in changePassword", async () => {
      vi.mocked(userApi.changePassword).mockResolvedValueOnce({
        status: "fail",
        message: "Sandi lama salah",
      });

      const thunk = asyncChangePassword(payload);
      const res = await thunk();

      expect(res).toBe(false);
      expect(toolsHelper.showError).toHaveBeenCalledWith("Sandi lama salah");
    });

    it("should handle exception thrown in changePassword", async () => {
      vi.mocked(userApi.changePassword).mockRejectedValueOnce(new Error("Connection error"));

      const thunk = asyncChangePassword(payload);
      const res = await thunk();

      expect(res).toBe(false);
      expect(toolsHelper.showError).toHaveBeenCalledWith("Connection error");
    });
  });
});
