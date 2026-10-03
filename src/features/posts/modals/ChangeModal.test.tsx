import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { screen, waitFor, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "@/test-utils";
import ChangeModal from "./ChangeModal";
import * as postsActions from "../states/action";

describe("ChangeModal", () => {
  const onClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render nothing when isOpen is false", () => {
    const { container } = renderWithProviders(
      <ChangeModal
        isOpen={false}
        onClose={onClose}
        postId={1}
        initialDescription="Initial"
      />
    );
    expect(container).toBeEmptyDOMElement();
  });

  it("should render initial description and update it on submit", async () => {
    const user = userEvent.setup();
    vi.spyOn(postsActions, "asyncUpdatePost").mockReturnValue(
      (() => Promise.resolve(true)) as any
    );

    renderWithProviders(
      <ChangeModal
        isOpen={true}
        onClose={onClose}
        postId={10}
        initialDescription="Old description"
      />
    );

    const textarea = screen.getByLabelText(/Deskripsi Postingan/i);
    expect(textarea).toHaveValue("Old description");

    await user.clear(textarea);
    await user.type(textarea, "New description");

    const submitBtn = screen.getByRole("button", { name: /Simpan Perubahan/i });
    await user.click(submitBtn);

    await waitFor(() => {
      expect(postsActions.asyncUpdatePost).toHaveBeenCalledWith(10, "New description");
      expect(onClose).toHaveBeenCalled();
    });
  });

  it("should close modal when clicking cancel button", async () => {
    const user = userEvent.setup();
    renderWithProviders(
      <ChangeModal
        isOpen={true}
        onClose={onClose}
        postId={10}
        initialDescription="Initial"
      />
    );

    const cancelBtn = screen.getByRole("button", { name: /Batal/i });
    await user.click(cancelBtn);

    expect(onClose).toHaveBeenCalled();
  });

  it("should not submit update if description is empty", async () => {
    vi.spyOn(postsActions, "asyncUpdatePost");

    renderWithProviders(
      <ChangeModal
        isOpen={true}
        onClose={onClose}
        postId={10}
        initialDescription=""
      />
    );

    const form = document.querySelector("form")!;
    fireEvent.submit(form);

    expect(postsActions.asyncUpdatePost).not.toHaveBeenCalled();
  });
});
