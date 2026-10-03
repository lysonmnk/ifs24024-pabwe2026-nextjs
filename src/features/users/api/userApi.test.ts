import { describe, it, expect, vi } from "vitest";
import { userApi } from "./userApi";
import { apiHelper } from "@/helpers/apiHelper";

vi.mock("@/helpers/apiHelper", () => ({
  apiHelper: {
    get: vi.fn(),
    put: vi.fn(),
    upload: vi.fn(),
  },
}));

describe("userApi", () => {
  it("should get all users", async () => {
    const mockUsers = [{ id: 1, name: "User 1", email: "user1@delcom.org" }];
    vi.mocked(apiHelper.get).mockResolvedValueOnce({
      status: "success",
      message: "ok",
      data: { users: mockUsers },
    });

    const res = await userApi.getAllUsers();
    expect(apiHelper.get).toHaveBeenCalledWith("/users");
    expect(res.data?.users).toEqual(mockUsers);
  });

  it("should get user by id", async () => {
    const mockUser = { id: 2, name: "User 2", email: "user2@delcom.org" };
    vi.mocked(apiHelper.get).mockResolvedValueOnce({
      status: "success",
      message: "ok",
      data: { user: mockUser },
    });

    const res = await userApi.getUserById(2);
    expect(apiHelper.get).toHaveBeenCalledWith("/users/2");
    expect(res.data?.user).toEqual(mockUser);
  });

  it("should get current profile", async () => {
    const mockUser = { id: 1, name: "Me", email: "me@delcom.org" };
    vi.mocked(apiHelper.get).mockResolvedValueOnce({
      status: "success",
      message: "ok",
      data: { user: mockUser },
    });

    const res = await userApi.getProfile();
    expect(apiHelper.get).toHaveBeenCalledWith("/users/me");
    expect(res.data?.user).toEqual(mockUser);
  });

  it("should update profile", async () => {
    const payload = { name: "Updated Name", email: "updated@delcom.org" };
    vi.mocked(apiHelper.put).mockResolvedValueOnce({
      status: "success",
      message: "ok",
      data: { user: { id: 1, ...payload } },
    });

    const res = await userApi.updateProfile(payload);
    expect(apiHelper.put).toHaveBeenCalledWith("/users/me", payload);
    expect(res.data?.user.name).toBe("Updated Name");
  });

  it("should upload new photo", async () => {
    const file = new File(["dummy"], "photo.png", { type: "image/png" });
    vi.mocked(apiHelper.upload).mockResolvedValueOnce({
      status: "success",
      message: "ok",
      data: { user: { id: 1, name: "Me", email: "me@delcom.org", photo: "url" } },
    });

    const res = await userApi.changePhoto(file);
    expect(apiHelper.upload).toHaveBeenCalledWith("/users/me/photo", expect.any(FormData));
    expect(res.data?.user.photo).toBe("url");
  });

  it("should change password", async () => {
    const payload = {
      password: "old",
      new_password: "new",
      new_password_confirmation: "new",
    };
    vi.mocked(apiHelper.put).mockResolvedValueOnce({
      status: "success",
      message: "Password changed",
    });

    const res = await userApi.changePassword(payload);
    expect(apiHelper.put).toHaveBeenCalledWith("/users/password", payload);
    expect(res.message).toBe("Password changed");
  });

  it("should fallback to /users/me/password if /users/password fails", async () => {
    const payload = {
      password: "old",
      new_password: "new",
      new_password_confirmation: "new",
    };
    vi.mocked(apiHelper.put)
      .mockRejectedValueOnce(new Error("404"))
      .mockResolvedValueOnce({
        status: "success",
        message: "Password changed on me endpoint",
      });

    const res = await userApi.changePassword(payload);
    expect(apiHelper.put).toHaveBeenCalledWith("/users/me/password", payload);
    expect(res.message).toBe("Password changed on me endpoint");
  });
});
