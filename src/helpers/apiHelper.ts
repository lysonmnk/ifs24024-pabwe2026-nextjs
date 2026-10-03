import { CONFIG } from "@/lib/config";

const ACCESS_TOKEN_KEY = "token";

export function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  const local = localStorage.getItem(ACCESS_TOKEN_KEY);
  if (local) return local;
  if (typeof document !== "undefined" && document.cookie) {
    const match = document.cookie.match(/(?:^|; )(?:token|access_token)=([^;]*)/);
    return match ? decodeURIComponent(match[1]) : null;
  }
  return null;
}

export function putAccessToken(token: string): void {
  if (typeof window !== "undefined") {
    localStorage.setItem(ACCESS_TOKEN_KEY, token);
    if (typeof document !== "undefined") {
      document.cookie = `token=${encodeURIComponent(token)}; path=/; max-age=86400; SameSite=Lax`;
      document.cookie = `access_token=${encodeURIComponent(token)}; path=/; max-age=86400; SameSite=Lax`;
    }
  }
}

export function removeAccessToken(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    if (typeof document !== "undefined") {
      document.cookie = "token=; path=/; max-age=0; SameSite=Lax";
      document.cookie = "access_token=; path=/; max-age=0; SameSite=Lax";
    }
  }
}

export async function fetchWithToken(url: string, options: RequestInit = {}): Promise<Response> {
  const token = getAccessToken();
  const headers = new Headers(options.headers || {});

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  return fetch(url, {
    ...options,
    headers,
  });
}

export const apiHelper = {
  async get<T = unknown>(endpoint: string): Promise<T> {
    const url = `${CONFIG.DELCOM_BASEURL}${endpoint}`;
    const response = await fetchWithToken(url, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    });
    const result = await response.json();
    return result as T;
  },

  async post<T = unknown>(endpoint: string, body?: unknown): Promise<T> {
    const url = `${CONFIG.DELCOM_BASEURL}${endpoint}`;
    const response = await fetchWithToken(url, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: body ? JSON.stringify(body) : undefined,
    });
    const result = await response.json();
    return result as T;
  },

  async put<T = unknown>(endpoint: string, body?: unknown): Promise<T> {
    const url = `${CONFIG.DELCOM_BASEURL}${endpoint}`;
    const response = await fetchWithToken(url, {
      method: "PUT",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: body ? JSON.stringify(body) : undefined,
    });
    const result = await response.json();
    return result as T;
  },

  async delete<T = unknown>(endpoint: string, body?: unknown): Promise<T> {
    const url = `${CONFIG.DELCOM_BASEURL}${endpoint}`;
    const response = await fetchWithToken(url, {
      method: "DELETE",
      headers: {
        Accept: "application/json",
        ...(body ? { "Content-Type": "application/json" } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    });
    const result = await response.json();
    return result as T;
  },

  async upload<T = unknown>(endpoint: string, formData: FormData): Promise<T> {
    const url = `${CONFIG.DELCOM_BASEURL}${endpoint}`;
    const response = await fetchWithToken(url, {
      method: "POST",
      headers: {
        Accept: "application/json",
      },
      body: formData,
    });
    const result = await response.json();
    return result as T;
  },
};
