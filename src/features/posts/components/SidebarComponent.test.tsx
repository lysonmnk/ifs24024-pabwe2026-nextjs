import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "@/test-utils";
import SidebarComponent from "./SidebarComponent";
import * as toolsHelper from "@/helpers/toolsHelper";
import * as postsActions from "../states/action";

describe("SidebarComponent", () => {
  const onClose = vi.fn();
  const onOpenAddModal = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render navigation links and actions", () => {
    renderWithProviders(
      <SidebarComponent
        isOpen={false}
        onClose={onClose}
        onOpenAddModal={onOpenAddModal}
      />
    );

    expect(screen.getByText("Linimasa")).toBeInTheDocument();
    expect(screen.getByText("Pengguna")).toBeInTheDocument();
    expect(screen.getByText("Profil Saya")).toBeInTheDocument();
    expect(screen.getByText("Buat Postingan")).toBeInTheDocument();
    expect(screen.getByText("Hapus Semua Post")).toBeInTheDocument();
  });

  it("should trigger onOpenAddModal and onClose when clicking Buat Postingan", async () => {
    const user = userEvent.setup();
    renderWithProviders(
      <SidebarComponent
        isOpen={true}
        onClose={onClose}
        onOpenAddModal={onOpenAddModal}
      />
    );

    const createBtn = screen.getByRole("button", { name: /Buat Postingan/i });
    await user.click(createBtn);

    expect(onClose).toHaveBeenCalled();
    expect(onOpenAddModal).toHaveBeenCalledTimes(1);
  });

  it("should trigger onClose when clicking mobile backdrop", async () => {
    const user = userEvent.setup();
    renderWithProviders(
      <SidebarComponent
        isOpen={true}
        onClose={onClose}
        onOpenAddModal={onOpenAddModal}
      />
    );

    const backdrop = screen.getByTestId("sidebar-backdrop");
    await user.click(backdrop);

    expect(onClose).toHaveBeenCalled();
  });

  it("should handle Delete All Posts when user confirms", async () => {
    const user = userEvent.setup();
    vi.spyOn(toolsHelper, "showConfirm").mockResolvedValueOnce(true);
    vi.spyOn(postsActions, "asyncDeleteAllPosts").mockReturnValue((() => {}) as any);

    renderWithProviders(
      <SidebarComponent
        isOpen={false}
        onClose={onClose}
        onOpenAddModal={onOpenAddModal}
      />
    );

    const deleteBtn = screen.getByRole("button", { name: /Hapus Semua Post/i });
    await user.click(deleteBtn);

    await waitFor(() => {
      expect(toolsHelper.showConfirm).toHaveBeenCalled();
      expect(postsActions.asyncDeleteAllPosts).toHaveBeenCalled();
    });
  });

  it("should not delete all posts when user declines confirmation", async () => {
    const user = userEvent.setup();
    vi.spyOn(toolsHelper, "showConfirm").mockResolvedValueOnce(false);
    vi.spyOn(postsActions, "asyncDeleteAllPosts");

    renderWithProviders(
      <SidebarComponent
        isOpen={false}
        onClose={onClose}
        onOpenAddModal={onOpenAddModal}
      />
    );

    const deleteBtn = screen.getByRole("button", { name: /Hapus Semua Post/i });
    await user.click(deleteBtn);

    await waitFor(() => {
      expect(postsActions.asyncDeleteAllPosts).not.toHaveBeenCalled();
    });
  });
});
