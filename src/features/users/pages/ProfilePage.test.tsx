import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { screen, waitFor, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "@/test-utils";
import ProfilePage from "./ProfilePage";
import * as usersActions from "../states/action";
import * as toolsHelper from "@/helpers/toolsHelper";

describe("ProfilePage", () => {
  const authUser = {
    id: 1,
    name: "Giva Pardede",
    email: "giva@delcom.org",
    photo: "https://open-api.delcom.org/photo.png",
    created_at: "2024-10-05T03:26:57.000000Z",
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(usersActions, "asyncReceiveProfile").mockReturnValue((() => {}) as any);
    vi.spyOn(toolsHelper, "showError").mockImplementation((() => {}) as any);
  });

  it("should fetch profile on mount and populate input fields", () => {
    renderWithProviders(<ProfilePage />, {
      preloadedState: {
        auth: { authUser, isPreload: false },
      },
    });

    expect(usersActions.asyncReceiveProfile).toHaveBeenCalledTimes(1);
    expect(screen.getByDisplayValue("Giva Pardede")).toBeInTheDocument();
    expect(screen.getByDisplayValue("giva@delcom.org")).toBeInTheDocument();
  });

  it("should update profile info when form is submitted", async () => {
    const user = userEvent.setup();
    vi.spyOn(usersActions, "asyncUpdateProfile").mockReturnValue(
      (() => Promise.resolve(true)) as any
    );

    renderWithProviders(<ProfilePage />, {
      preloadedState: {
        auth: { authUser, isPreload: false },
      },
    });

    const nameInput = screen.getByLabelText(/Nama Lengkap/i);
    await user.clear(nameInput);
    await user.type(nameInput, "Giva Manik");

    const submitBtn = screen.getByRole("button", { name: /Simpan Perubahan/i });
    await user.click(submitBtn);

    await waitFor(() => {
      expect(usersActions.asyncUpdateProfile).toHaveBeenCalledWith({
        name: "Giva Manik",
        email: "giva@delcom.org",
      });
    });
  });

  it("should handle photo selection and upload", async () => {
    const user = userEvent.setup();
    vi.spyOn(usersActions, "asyncChangePhoto").mockReturnValue(
      (() => Promise.resolve(true)) as any
    );

    renderWithProviders(<ProfilePage />, {
      preloadedState: {
        auth: { authUser, isPreload: false },
      },
    });

    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    const testFile = new File(["dummy"], "avatar.png", { type: "image/png" });

    fireEvent.change(fileInput, { target: { files: [testFile] } });

    const savePhotoBtn = await screen.findByRole("button", { name: /Simpan Foto Baru/i });
    await user.click(savePhotoBtn);

    await waitFor(() => {
      expect(usersActions.asyncChangePhoto).toHaveBeenCalledWith(testFile);
    });
  });

  it("should validate passwords before submitting password change", async () => {
    const user = userEvent.setup();
    renderWithProviders(<ProfilePage />, {
      preloadedState: {
        auth: { authUser, isPreload: false },
      },
    });

    const oldPassInput = screen.getByLabelText(/Kata Sandi Lama/i);
    const newPassInput = screen.getByLabelText(/^Kata Sandi Baru/i);
    const confirmPassInput = screen.getByLabelText(/Konfirmasi Kata Sandi Baru/i);
    const changePassBtn = screen.getByRole("button", { name: /Perbarui Kata Sandi/i });

    // Test mismatched passwords
    await user.type(oldPassInput, "oldpass");
    await user.type(newPassInput, "newpassword");
    await user.type(confirmPassInput, "differentpass");
    await user.click(changePassBtn);

    expect(toolsHelper.showError).toHaveBeenCalledWith("Konfirmasi kata sandi tidak cocok!");

    // Test short password
    await user.clear(newPassInput);
    await user.clear(confirmPassInput);
    await user.type(newPassInput, "123");
    await user.type(confirmPassInput, "123");
    await user.click(changePassBtn);

    expect(toolsHelper.showError).toHaveBeenCalledWith("Kata sandi baru minimal 6 karakter!");

    // Test valid password change
    vi.spyOn(usersActions, "asyncChangePassword").mockReturnValue(
      (() => Promise.resolve(true)) as any
    );

    await user.clear(newPassInput);
    await user.clear(confirmPassInput);
    await user.type(newPassInput, "validpassword");
    await user.type(confirmPassInput, "validpassword");
    await user.click(changePassBtn);

    await waitFor(() => {
      expect(usersActions.asyncChangePassword).toHaveBeenCalledWith({
        password: "oldpass",
        new_password: "validpassword",
        new_password_confirmation: "validpassword",
      });
    });
  });

  it("should not submit profile if name or email is empty", () => {
    vi.spyOn(usersActions, "asyncUpdateProfile");
    renderWithProviders(<ProfilePage />, {
      preloadedState: {
        auth: { authUser: { id: 1, name: "", email: "" }, isPreload: false },
      },
    });

    const forms = document.querySelectorAll("form");
    fireEvent.submit(forms[0]);

    expect(usersActions.asyncUpdateProfile).not.toHaveBeenCalled();
  });

  it("should render fallback initial U when user has no name or photo", () => {
    renderWithProviders(<ProfilePage />, {
      preloadedState: {
        auth: {
          authUser: { id: 1, name: "", email: "", photo: null },
          isPreload: false,
        },
      },
    });

    expect(screen.getByText("U")).toBeInTheDocument();
  });
});
