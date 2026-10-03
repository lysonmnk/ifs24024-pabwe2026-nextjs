import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "@/test-utils";
import RegisterPage from "./RegisterPage";
import * as navigation from "next/navigation";
import * as authActions from "../states/action";

describe("RegisterPage", () => {
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

  it("should render name, email, password inputs and register button", () => {
    renderWithProviders(<RegisterPage />);

    expect(screen.getByLabelText(/Nama Lengkap/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Alamat Email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Kata Sandi/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^Daftar$/i })).toBeInTheDocument();
  });

  it("should submit form and redirect to /auth/login on successful registration", async () => {
    const user = userEvent.setup();
    vi.spyOn(authActions, "asyncRegister").mockReturnValue(
      (() => Promise.resolve(true)) as any
    );

    renderWithProviders(<RegisterPage />);

    await user.type(screen.getByLabelText(/Nama Lengkap/i), "Giva Pardede");
    await user.type(screen.getByLabelText(/Alamat Email/i), "giva@delcom.org");
    await user.type(screen.getByLabelText(/Kata Sandi/i), "password123");
    await user.click(screen.getByRole("button", { name: /^Daftar$/i }));

    await waitFor(() => {
      expect(authActions.asyncRegister).toHaveBeenCalledWith({
        name: "Giva Pardede",
        email: "giva@delcom.org",
        password: "password123",
      });
      expect(pushMock).toHaveBeenCalledWith("/auth/login");
    });
  });

  it("should not redirect if registration fails", async () => {
    const user = userEvent.setup();
    vi.spyOn(authActions, "asyncRegister").mockReturnValue(
      (() => Promise.resolve(false)) as any
    );

    renderWithProviders(<RegisterPage />);

    await user.type(screen.getByLabelText(/Nama Lengkap/i), "Giva");
    await user.type(screen.getByLabelText(/Alamat Email/i), "duplicate@delcom.org");
    await user.type(screen.getByLabelText(/Kata Sandi/i), "pass");
    await user.click(screen.getByRole("button", { name: /^Daftar$/i }));

    await waitFor(() => {
      expect(pushMock).not.toHaveBeenCalled();
    });
  });

  it("should not submit if required inputs are empty", () => {
    vi.spyOn(authActions, "asyncRegister");
    renderWithProviders(<RegisterPage />);

    fireEvent.submit(screen.getByRole("button", { name: /^Daftar$/i }));
    expect(authActions.asyncRegister).not.toHaveBeenCalled();
  });
});
