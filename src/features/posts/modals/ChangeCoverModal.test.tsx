import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { screen, waitFor, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "@/test-utils";
import ChangeCoverModal from "./ChangeCoverModal";
import * as postsActions from "../states/action";

describe("ChangeCoverModal", () => {
  const onClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render nothing when isOpen is false", () => {
    const { container } = renderWithProviders(
      <ChangeCoverModal isOpen={false} onClose={onClose} postId={1} />
    );
    expect(container).toBeEmptyDOMElement();
  });

  it("should render current cover if provided", () => {
    renderWithProviders(
      <ChangeCoverModal
        isOpen={true}
        onClose={onClose}
        postId={1}
        currentCover="https://example.com/cover.jpg"
      />
    );

    expect(screen.getByAltText("Pratinjau cover")).toHaveAttribute(
      "src",
      "https://example.com/cover.jpg"
    );
  });

  it("should handle new file selection and submission", async () => {
    const user = userEvent.setup();
    vi.spyOn(postsActions, "asyncChangeCover").mockReturnValue(
      (() => Promise.resolve(true)) as any
    );

    renderWithProviders(
      <ChangeCoverModal isOpen={true} onClose={onClose} postId={5} />
    );

    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    const testFile = new File(["dummy"], "new-cover.jpg", { type: "image/jpeg" });

    fireEvent.change(fileInput, { target: { files: [testFile] } });

    expect(screen.getByAltText("Pratinjau cover")).toBeInTheDocument();

    const submitBtn = screen.getByRole("button", { name: /Simpan Cover/i });
    await user.click(submitBtn);

    await waitFor(() => {
      expect(postsActions.asyncChangeCover).toHaveBeenCalledWith(5, testFile);
      expect(onClose).toHaveBeenCalled();
    });
  });

  it("should close modal when cancel is clicked", async () => {
    const user = userEvent.setup();
    renderWithProviders(
      <ChangeCoverModal isOpen={true} onClose={onClose} postId={1} />
    );

    const cancelBtn = screen.getByRole("button", { name: /Batal/i });
    await user.click(cancelBtn);

    expect(onClose).toHaveBeenCalled();
  });

  it("should not submit if no file selected", async () => {
    vi.spyOn(postsActions, "asyncChangeCover");
    renderWithProviders(
      <ChangeCoverModal isOpen={true} onClose={onClose} postId={5} />
    );
    const form = document.querySelector("form")!;
    fireEvent.submit(form);
    expect(postsActions.asyncChangeCover).not.toHaveBeenCalled();
  });
});
