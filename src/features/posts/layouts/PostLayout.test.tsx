import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "@/test-utils";
import PostLayout from "./PostLayout";
import * as navigation from "next/navigation";
import * as authActions from "@/features/auth/states/action";

describe("PostLayout", () => {
  const replaceMock = vi.fn();
  const authUser = {
    id: 1,
    name: "Giva Pardede",
    email: "giva@delcom.org",
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(navigation, "useRouter").mockReturnValue({
      replace: replaceMock,
      push: vi.fn(),
      prefetch: vi.fn(),
      back: vi.fn(),
      forward: vi.fn(),
    } as any);
    vi.spyOn(authActions, "asyncPreloadProcess").mockReturnValue((() => {}) as any);
  });

  it("should show loading screen while preloading", () => {
    renderWithProviders(
      <PostLayout>
        <div data-testid="dashboard-content">Dashboard</div>
      </PostLayout>,
      {
        preloadedState: {
          auth: { authUser: null, isPreload: true },
        },
      }
    );

    expect(screen.getByText("Memuat aplikasi...")).toBeInTheDocument();
    expect(screen.queryByTestId("dashboard-content")).not.toBeInTheDocument();
  });

  it("should redirect to /auth/login if preload finished and no authUser", () => {
    renderWithProviders(
      <PostLayout>
        <div>Dashboard</div>
      </PostLayout>,
      {
        preloadedState: {
          auth: { authUser: null, isPreload: false },
        },
      }
    );

    expect(replaceMock).toHaveBeenCalledWith("/auth/login");
  });

  it("should render content, navbar, and sidebar when authenticated", () => {
    renderWithProviders(
      <PostLayout>
        <div data-testid="dashboard-content">Dashboard Content</div>
      </PostLayout>,
      {
        preloadedState: {
          auth: { authUser, isPreload: false },
        },
      }
    );

    expect(screen.getByTestId("dashboard-content")).toBeInTheDocument();
    expect(screen.getByText("Delcom Posts")).toBeInTheDocument();
    expect(screen.getByText("Linimasa")).toBeInTheDocument();
  });

  it("should open AddModal from sidebar trigger", async () => {
    const user = userEvent.setup();
    renderWithProviders(
      <PostLayout>
        <div>Content</div>
      </PostLayout>,
      {
        preloadedState: {
          auth: { authUser, isPreload: false },
        },
      }
    );

    const createBtn = screen.getByRole("button", { name: /Buat Postingan/i });
    await user.click(createBtn);

    expect(screen.getByText("Buat Postingan Baru")).toBeInTheDocument();

    const cancelModalBtn = screen.getByRole("button", { name: /Batal/i });
    await user.click(cancelModalBtn);
    expect(screen.queryByText("Buat Postingan Baru")).not.toBeInTheDocument();
  });

  it("should toggle mobile sidebar open and closed", async () => {
    const user = userEvent.setup();
    renderWithProviders(
      <PostLayout>
        <div>Content</div>
      </PostLayout>,
      {
        preloadedState: {
          auth: { authUser, isPreload: false },
        },
      }
    );

    const menuBtn = screen.getByLabelText(/Buka menu navigasi/i);
    await user.click(menuBtn);

    const backdrop = screen.getByTestId("sidebar-backdrop");
    expect(backdrop).toBeInTheDocument();

    await user.click(backdrop);
    expect(screen.queryByTestId("sidebar-backdrop")).not.toBeInTheDocument();
  });
});
