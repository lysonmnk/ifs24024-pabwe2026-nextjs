import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "@/test-utils";
import UsersPage from "./UsersPage";
import * as usersActions from "../states/action";

describe("UsersPage", () => {
  const mockUsers = [
    {
      id: 1,
      name: "Abdullah Ubaid",
      email: "abdullah@delcom.org",
      photo: "https://open-api.delcom.org/photo.png",
      created_at: "2024-10-05T03:26:57.000000Z",
    },
    {
      id: 2,
      name: "Delcom Testing",
      email: "testing@delcom.org",
      photo: null,
      created_at: "2024-10-05T02:53:38.000000Z",
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(usersActions, "asyncReceiveUsers").mockReturnValue((() => {}) as any);
  });

  it("should fetch users on mount and display user cards", () => {
    renderWithProviders(<UsersPage />, {
      preloadedState: {
        users: mockUsers,
      },
    });

    expect(usersActions.asyncReceiveUsers).toHaveBeenCalledTimes(1);
    expect(screen.getByText("Abdullah Ubaid")).toBeInTheDocument();
    expect(screen.getByText("Delcom Testing")).toBeInTheDocument();
    expect(screen.getByText("testing@delcom.org")).toBeInTheDocument();
  });

  it("should filter users by search input", async () => {
    const user = userEvent.setup();
    renderWithProviders(<UsersPage />, {
      preloadedState: {
        users: mockUsers,
      },
    });

    const searchInput = screen.getByPlaceholderText(/Cari pengguna.../i);
    await user.type(searchInput, "testing");

    expect(screen.getByText("Delcom Testing")).toBeInTheDocument();
    expect(screen.queryByText("Abdullah Ubaid")).not.toBeInTheDocument();
  });

  it("should display empty state when search finds no match", async () => {
    const user = userEvent.setup();
    renderWithProviders(<UsersPage />, {
      preloadedState: {
        users: mockUsers,
      },
    });

    const searchInput = screen.getByPlaceholderText(/Cari pengguna.../i);
    await user.type(searchInput, "nonexistent");

    expect(screen.getByText("Tidak ada pengguna ditemukan")).toBeInTheDocument();
  });
});
