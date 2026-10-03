import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { screen, waitFor, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "@/test-utils";
import AddModal from "./AddModal";
import * as postsActions from "../states/action";

describe("AddModal", () => {
  const onClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render nothing when isOpen is false", () => {
    const { container } = renderWithProviders(
      <AddModal isOpen={false} onClose={onClose} />
    );
    expect(container).toBeEmptyDOMElement();
  });

  it("should render modal elements when isOpen is true", () => {
    renderWithProviders(<AddModal isOpen={true} onClose={onClose} />);

    expect(screen.getByText("Buat Postingan Baru")).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText(/Apa yang sedang Anda pikirkan\?/i)
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Publikasikan/i })).toBeInTheDocument();
  });

  it("should handle cover image selection and removal", async () => {
    const user = userEvent.setup();
    renderWithProviders(<AddModal isOpen={true} onClose={onClose} />);

    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    const testFile = new File(["dummy"], "cover.jpg", { type: "image/jpeg" });

    fireEvent.change(fileInput, { target: { files: [testFile] } });

    expect(screen.getByAltText("Pratinjau cover")).toBeInTheDocument();

    const removeBtn = screen.getByTitle("Hapus gambar");
    await user.click(removeBtn);

    expect(screen.queryByAltText("Pratinjau cover")).not.toBeInTheDocument();
  });

  it("should not submit post if description is empty", async () => {
    vi.spyOn(postsActions, "asyncCreatePost");
    renderWithProviders(<AddModal isOpen={true} onClose={onClose} />);

    const form = document.querySelector("form")!;
    fireEvent.submit(form);

    expect(postsActions.asyncCreatePost).not.toHaveBeenCalled();
  });

  it("should submit post and call onClose upon success", async () => {
    const user = userEvent.setup();
    vi.spyOn(postsActions, "asyncCreatePost").mockReturnValue(
      (() => Promise.resolve(true)) as any
    );

    renderWithProviders(<AddModal isOpen={true} onClose={onClose} />);

    const textarea = screen.getByPlaceholderText(/Apa yang sedang Anda pikirkan\?/i);
    await user.type(textarea, "Halo dunia!");

    const submitBtn = screen.getByRole("button", { name: /Publikasikan/i });
    await user.click(submitBtn);

    await waitFor(() => {
      expect(postsActions.asyncCreatePost).toHaveBeenCalledWith("Halo dunia!", undefined);
      expect(onClose).toHaveBeenCalled();
    });
  });

  it("should cancel and close modal when clicking Batal", async () => {
    const user = userEvent.setup();
    renderWithProviders(<AddModal isOpen={true} onClose={onClose} />);

    const cancelBtn = screen.getByRole("button", { name: /Batal/i });
    await user.click(cancelBtn);

    expect(onClose).toHaveBeenCalled();
  });
});
