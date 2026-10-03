import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "@/test-utils";
import NavbarComponent from "./NavbarComponent";
import * as toolsHelper from "@/helpers/toolsHelper";
import * as authActions from "@/features/auth/states/action";

describe("NavbarComponent", () => {
  const onToggleMobileSidebar = vi.fn();
  const authUser = {
    id: 1,
    name: "Giva Pardede",
    email: "giva@delcom.org",
    photo: "https://open-api.delcom.org/photo.png",
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render branding and search input and user photo", () => {
    renderWithProviders(
      <NavbarComponent onToggleMobileSidebar={onToggleMobileSidebar} />,
      {
        preloadedState: {
          auth: { authUser, isPreload: false },
          posts: { posts: [], filter: "all", searchQuery: "" },
        },
      }
    );

    expect(screen.getByText("Delcom Posts")).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Cari postingan atau penulis.../i)).toBeInTheDocument();
    expect(screen.getByText("Giva Pardede")).toBeInTheDocument();
  });

  it("should render fallback initial if user photo is absent", () => {
    renderWithProviders(
      <NavbarComponent onToggleMobileSidebar={onToggleMobileSidebar} />,
      {
        preloadedState: {
          auth: {
            authUser: { id: 2, name: "Budi", email: "budi@delcom.org", photo: null },
            isPreload: false,
          },
          posts: { posts: [], filter: "all", searchQuery: "" },
        },
      }
    );

    expect(screen.getByText("B")).toBeInTheDocument();
  });

  it("should trigger mobile sidebar toggle on menu click", async () => {
    const user = userEvent.setup();
    renderWithProviders(
      <NavbarComponent onToggleMobileSidebar={onToggleMobileSidebar} />,
      {
        preloadedState: {
          auth: { authUser, isPreload: false },
        },
      }
    );

    const toggleBtn = screen.getByLabelText(/Buka menu navigasi/i);
    await user.click(toggleBtn);
    expect(onToggleMobileSidebar).toHaveBeenCalledTimes(1);
  });

  it("should update search query in redux store", async () => {
    const user = userEvent.setup();
    const { store } = renderWithProviders(
      <NavbarComponent onToggleMobileSidebar={onToggleMobileSidebar} />,
      {
        preloadedState: {
          auth: { authUser, isPreload: false },
        },
      }
    );

    const input = screen.getByPlaceholderText(/Cari postingan atau penulis.../i);
    await user.type(input, "Next.js");

    expect(store.getState().posts.searchQuery).toBe("Next.js");
  });

  it("should handle logout flow when confirmed", async () => {
    const user = userEvent.setup();
    vi.spyOn(toolsHelper, "showConfirm").mockResolvedValueOnce(true);
    vi.spyOn(authActions, "asyncUnsetAuthUser").mockReturnValue((() => {}) as any);

    renderWithProviders(
      <NavbarComponent onToggleMobileSidebar={onToggleMobileSidebar} />,
      {
        preloadedState: {
          auth: { authUser, isPreload: false },
        },
      }
    );

    const logoutBtn = screen.getByTitle(/Keluar/i);
    await user.click(logoutBtn);

    await waitFor(() => {
      expect(toolsHelper.showConfirm).toHaveBeenCalled();
      expect(authActions.asyncUnsetAuthUser).toHaveBeenCalled();
    });
  });

  it("should cancel logout when user declines confirmation", async () => {
    const user = userEvent.setup();
    vi.spyOn(toolsHelper, "showConfirm").mockResolvedValueOnce(false);
    vi.spyOn(authActions, "asyncUnsetAuthUser");

    renderWithProviders(
      <NavbarComponent onToggleMobileSidebar={onToggleMobileSidebar} />,
      {
        preloadedState: {
          auth: { authUser, isPreload: false },
        },
      }
    );

    const logoutBtn = screen.getByTitle(/Keluar/i);
    await user.click(logoutBtn);

    await waitFor(() => {
      expect(authActions.asyncUnsetAuthUser).not.toHaveBeenCalled();
    });
  });
});
