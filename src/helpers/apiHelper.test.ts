import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  getAccessToken,
  putAccessToken,
  removeAccessToken,
  fetchWithToken,
  apiHelper,
} from "./apiHelper";

describe("apiHelper", () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    localStorage.clear();
    if (typeof document !== "undefined") {
      document.cookie = "token=; max-age=0";
      document.cookie = "access_token=; max-age=0";
    }
    vi.clearAllMocks();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  describe("token management", () => {
    it("should return null if no token is stored", () => {
      expect(getAccessToken()).toBeNull();
    });

    it("should store and retrieve token", () => {
      putAccessToken("sample-token-123");
      expect(getAccessToken()).toBe("sample-token-123");
    });

    it("should remove token", () => {
      putAccessToken("sample-token-123");
      removeAccessToken();
      expect(getAccessToken()).toBeNull();
    });

    it("should handle SSR when window is undefined", () => {
      const originalWindow = global.window;
      // @ts-ignore
      delete (global as any).window;

      expect(getAccessToken()).toBeNull();
      putAccessToken("token");
      removeAccessToken();

      (global as any).window = originalWindow;
    });
  });

  describe("fetchWithToken", () => {
    it("should attach Authorization header when token is present", async () => {
      putAccessToken("my-secret-token");
      const mockFetch = vi.fn().mockResolvedValue(new Response(JSON.stringify({ ok: true })));
      global.fetch = mockFetch;

      await fetchWithToken("https://api.test.com/test", { method: "GET" });

      expect(mockFetch).toHaveBeenCalledTimes(1);
      const calledUrl = mockFetch.mock.calls[0][0];
      const calledOptions = mockFetch.mock.calls[0][1];

      expect(calledUrl).toBe("https://api.test.com/test");
      expect(calledOptions.headers.get("Authorization")).toBe("Bearer my-secret-token");
    });

    it("should not attach Authorization header when token is absent", async () => {
      const mockFetch = vi.fn().mockResolvedValue(new Response(JSON.stringify({ ok: true })));
      global.fetch = mockFetch;

      await fetchWithToken("https://api.test.com/test", { method: "GET" });

      expect(mockFetch).toHaveBeenCalledTimes(1);
      const calledOptions = mockFetch.mock.calls[0][1];
      expect(calledOptions.headers.get("Authorization")).toBeNull();
    });
  });

  describe("apiHelper CRUD methods", () => {
    it("should perform GET request and return parsed JSON", async () => {
      const mockResponse = { status: "success", data: [1, 2, 3] };
      global.fetch = vi.fn().mockResolvedValue({
        json: async () => mockResponse,
      });

      const res = await apiHelper.get("/test-get");
      expect(res).toEqual(mockResponse);
    });

    it("should perform POST request with and without body", async () => {
      const mockResponse = { status: "success", message: "Created" };
      const mockFetch = vi.fn().mockResolvedValue({
        json: async () => mockResponse,
      });
      global.fetch = mockFetch;

      const resWithBody = await apiHelper.post("/test-post", { title: "Hello" });
      expect(resWithBody).toEqual(mockResponse);

      const resWithoutBody = await apiHelper.post("/test-post");
      expect(resWithoutBody).toEqual(mockResponse);
    });

    it("should perform PUT request with and without body", async () => {
      const mockResponse = { status: "success", message: "Updated" };
      const mockFetch = vi.fn().mockResolvedValue({
        json: async () => mockResponse,
      });
      global.fetch = mockFetch;

      const res = await apiHelper.put("/test-put", { title: "Updated" });
      expect(res).toEqual(mockResponse);

      const resNoBody = await apiHelper.put("/test-put");
      expect(resNoBody).toEqual(mockResponse);
    });

    it("should perform DELETE request with and without body", async () => {
      const mockResponse = { status: "success", message: "Deleted" };
      const mockFetch = vi.fn().mockResolvedValue({
        json: async () => mockResponse,
      });
      global.fetch = mockFetch;

      const res = await apiHelper.delete("/test-delete");
      expect(res).toEqual(mockResponse);

      const resWithBody = await apiHelper.delete("/test-delete", { id: 1 });
      expect(resWithBody).toEqual(mockResponse);
    });

    it("should perform upload request with FormData", async () => {
      const mockResponse = { status: "success", message: "Uploaded" };
      const mockFetch = vi.fn().mockResolvedValue({
        json: async () => mockResponse,
      });
      global.fetch = mockFetch;

      const formData = new FormData();
      formData.append("file", new Blob(["test"], { type: "text/plain" }));

      const res = await apiHelper.upload("/test-upload", formData);
      expect(res).toEqual(mockResponse);
      expect(mockFetch.mock.calls[0][1].body).toBe(formData);
    });
  });
});
