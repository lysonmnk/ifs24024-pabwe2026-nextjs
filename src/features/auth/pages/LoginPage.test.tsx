import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "@/test-utils";
import LoginPage from "./LoginPage";
import * as navigation from "next/navigation";
import * as authActions from "../states/action";

describe("LoginPage", () => {
  const pushMock = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(navigation, "useRouter").mockReturnValue({
      push: pushMock,
      replace: vi.fn(),
      prefetch: vi.fn(),
      back: vi.fn(),
      forward: vi.fn(),
    } as any);
  });

  it("should render email and password inputs and submit button", () => {
    renderWithProviders(<LoginPage />);

    expect(screen.getByLabelText(/Alamat Email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Kata Sandi/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^Masuk$/i })).toBeInTheDocument();
  });

  it("should submit form and redirect to / on successful login", async () => {
    const user = userEvent.setup();
    vi.spyOn(authActions, "asyncSetAuthUser").mockReturnValue(
      (() => Promise.resolve(true)) as any
    );

    renderWithProviders(<LoginPage />);

    const emailInput = screen.getByLabelText(/Alamat Email/i);
    const passwordInput = screen.getByLabelText(/Kata Sandi/i);
    const submitBtn = screen.getByRole("button", { name: /^Masuk$/i });

    await user.type(emailInput, "test@delcom.org");
    await user.type(passwordInput, "password123");
    await user.click(submitBtn);

    await waitFor(() => {
      expect(authActions.asyncSetAuthUser).toHaveBeenCalledWith({
        email: "test@delcom.org",
        password: "password123",
      });
      expect(pushMock).toHaveBeenCalledWith("/");
    });
  });

  it("should not redirect if login fails", async () => {
    const user = userEvent.setup();
    vi.spyOn(authActions, "asyncSetAuthUser").mockReturnValue(
      (() => Promise.resolve(false)) as any
    );

    renderWithProviders(<LoginPage />);

    await user.type(screen.getByLabelText(/Alamat Email/i), "wrong@delcom.org");
    await user.type(screen.getByLabelText(/Kata Sandi/i), "wrongpass");
    await user.click(screen.getByRole("button", { name: /^Masuk$/i }));

    await waitFor(() => {
      expect(pushMock).not.toHaveBeenCalled();
    });
  });

  it("should not submit if required inputs are empty", () => {
    vi.spyOn(authActions, "asyncSetAuthUser");
    renderWithProviders(<LoginPage />);

    fireEvent.submit(screen.getByRole("button", { name: /^Masuk$/i }));
    expect(authActions.asyncSetAuthUser).not.toHaveBeenCalled();
  });
});
