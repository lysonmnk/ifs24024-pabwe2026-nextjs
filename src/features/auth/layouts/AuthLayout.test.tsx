import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { screen } from "@testing-library/react";
import { renderWithProviders } from "@/test-utils";
import AuthLayout from "./AuthLayout";
import * as navigation from "next/navigation";

describe("AuthLayout", () => {
  const replaceMock = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(navigation, "useRouter").mockReturnValue({
      replace: replaceMock,
      push: vi.fn(),
      prefetch: vi.fn(),
      back: vi.fn(),
      forward: vi.fn(),
    } as any);
  });

  it("should render children when user is not logged in", () => {
    renderWithProviders(
      <AuthLayout>
        <div data-testid="auth-child">Form Content</div>
      </AuthLayout>,
      {
        preloadedState: {
          auth: { authUser: null, isPreload: false },
        },
      }
    );

    expect(screen.getByTestId("auth-child")).toBeInTheDocument();
    expect(screen.getByText("Delcom Posts")).toBeInTheDocument();
    expect(replaceMock).not.toHaveBeenCalled();
  });

  it("should redirect to / if user is authenticated and preload finished", () => {
    renderWithProviders(
      <AuthLayout>
        <div>Content</div>
      </AuthLayout>,
      {
        preloadedState: {
          auth: {
            authUser: { id: 1, name: "Logged In", email: "user@delcom.org" },
            isPreload: false,
          },
        },
      }
    );

    expect(replaceMock).toHaveBeenCalledWith("/");
  });

  it("should not redirect while preloading", () => {
    renderWithProviders(
      <AuthLayout>
        <div>Content</div>
      </AuthLayout>,
      {
        preloadedState: {
          auth: {
            authUser: { id: 1, name: "Logged In", email: "user@delcom.org" },
            isPreload: true,
          },
        },
      }
    );

    expect(replaceMock).not.toHaveBeenCalled();
  });
});
