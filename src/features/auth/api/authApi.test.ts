import { describe, it, expect, vi } from "vitest";
import { authApi } from "./authApi";
import { apiHelper } from "@/helpers/apiHelper";

vi.mock("@/helpers/apiHelper", () => ({
  apiHelper: {
    post: vi.fn(),
  },
}));

describe("authApi", () => {
  it("should call register endpoint with payload", async () => {
    const payload = { name: "John", email: "john@delcom.org", password: "secretpassword" };
    vi.mocked(apiHelper.post).mockResolvedValueOnce({ status: "success", message: "Registered" });

    const res = await authApi.register(payload);
    expect(apiHelper.post).toHaveBeenCalledWith("/auth/register", payload);
    expect(res).toEqual({ status: "success", message: "Registered" });
  });

  it("should call login endpoint with payload", async () => {
    const payload = { email: "john@delcom.org", password: "secretpassword" };
    const mockRes = {
      status: "success",
      message: "Login successful",
      data: { user: { id: 1, name: "John", email: "john@delcom.org" }, token: "token123" },
    };
    vi.mocked(apiHelper.post).mockResolvedValueOnce(mockRes);

    const res = await authApi.login(payload);
    expect(apiHelper.post).toHaveBeenCalledWith("/auth/login", payload);
    expect(res).toEqual(mockRes);
  });

  it("should call logout endpoint", async () => {
    vi.mocked(apiHelper.post).mockResolvedValueOnce({ status: "success", message: "Logged out" });

    const res = await authApi.logout();
    expect(apiHelper.post).toHaveBeenCalledWith("/auth/logout");
    expect(res).toEqual({ status: "success", message: "Logged out" });
  });
});
