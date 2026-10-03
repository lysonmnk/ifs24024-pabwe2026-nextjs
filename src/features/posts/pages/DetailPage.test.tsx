import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { screen, waitFor, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "@/test-utils";
import DetailPage from "./DetailPage";
import * as postsActions from "../states/action";
import * as toolsHelper from "@/helpers/toolsHelper";

describe("DetailPage", () => {
  const authUser = { id: 1, name: "Giva Pardede", email: "giva@delcom.org" };

  const mockPostDetail = {
    id: 5,
    user_id: 2,
    cover: "https://example.com/cover.jpg",
    description: "Detailed discussion about Web Architecture",
    created_at: "2024-10-05T03:07:45.000000Z",
    updated_at: "2024-10-05T03:07:45.000000Z",
    author: { name: "Abdullah Ubaid", photo: null },
    likes: [1],
    comments: [
      {
        id: 101,
        comment: "Sangat informatif!",
        created_at: "2024-10-05T03:49:59.000000Z",
        updated_at: "2024-10-05T03:49:59.000000Z",
      },
    ],
    my_comment: {
      id: 101,
      comment: "Sangat informatif!",
      created_at: "2024-10-05T03:49:59.000000Z",
      updated_at: "2024-10-05T03:49:59.000000Z",
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(postsActions, "asyncReceivePostDetail").mockReturnValue((() => {}) as any);
  });

  it("should show loading spinner when postDetail is null", () => {
    renderWithProviders(<DetailPage postId={5} />, {
      preloadedState: {
        auth: { authUser, isPreload: false },
        postDetail: null,
      },
    });

    expect(screen.getByText("Memuat detail postingan...")).toBeInTheDocument();
  });

  it("should render post detail and comments when loaded", () => {
    renderWithProviders(<DetailPage postId={5} />, {
      preloadedState: {
        auth: { authUser, isPreload: false },
        postDetail: mockPostDetail,
      },
    });

    expect(postsActions.asyncReceivePostDetail).toHaveBeenCalledWith(5);
    expect(
      screen.getByText("Detailed discussion about Web Architecture")
    ).toBeInTheDocument();
    expect(screen.getByText("Sangat informatif!")).toBeInTheDocument();
    expect(screen.getByText("1 Suka")).toBeInTheDocument();
  });

  it("should toggle like on post", async () => {
    const user = userEvent.setup();
    vi.spyOn(postsActions, "asyncToggleLike").mockReturnValue((() => {}) as any);

    renderWithProviders(<DetailPage postId={5} />, {
      preloadedState: {
        auth: { authUser, isPreload: false },
        postDetail: mockPostDetail,
      },
    });

    const likeBtn = screen.getByText("1 Suka").closest("button")!;
    await user.click(likeBtn);

    expect(postsActions.asyncToggleLike).toHaveBeenCalledWith(5, true);
  });

  it("should submit new comment", async () => {
    const user = userEvent.setup();
    vi.spyOn(postsActions, "asyncAddComment").mockReturnValue(
      (() => Promise.resolve(true)) as any
    );

    renderWithProviders(<DetailPage postId={5} />, {
      preloadedState: {
        auth: { authUser, isPreload: false },
        postDetail: mockPostDetail,
      },
    });

    const input = screen.getByPlaceholderText(/Tulis tanggapan Anda.../i);
    await user.type(input, "Keren banget!");

    const submitBtn = screen.getByRole("button", { name: /Kirim/i });
    await user.click(submitBtn);

    await waitFor(() => {
      expect(postsActions.asyncAddComment).toHaveBeenCalledWith(5, "Keren banget!");
      expect(input).toHaveValue("");
    });
  });

  it("should handle deleting own comment with confirm and cancel", async () => {
    const user = userEvent.setup();
    vi.spyOn(postsActions, "asyncDeleteComment").mockReturnValue((() => {}) as any);

    renderWithProviders(<DetailPage postId={5} />, {
      preloadedState: {
        auth: { authUser, isPreload: false },
        postDetail: mockPostDetail,
      },
    });

    const deleteCommentBtn = screen.getByTitle("Hapus komentar saya");

    // Decline
    vi.spyOn(toolsHelper, "showConfirm").mockResolvedValueOnce(false);
    await user.click(deleteCommentBtn);
    expect(postsActions.asyncDeleteComment).not.toHaveBeenCalled();

    // Confirm
    vi.spyOn(toolsHelper, "showConfirm").mockResolvedValueOnce(true);
    await user.click(deleteCommentBtn);
    await waitFor(() => {
      expect(postsActions.asyncDeleteComment).toHaveBeenCalledWith(5);
    });
  });

  it("should not like post if authUser is null", async () => {
    const user = userEvent.setup();
    vi.spyOn(postsActions, "asyncToggleLike");
    renderWithProviders(<DetailPage postId={5} />, {
      preloadedState: {
        auth: { authUser: null, isPreload: false },
        postDetail: mockPostDetail,
      },
    });

    const likeBtn = screen.getByText("1 Suka").closest("button")!;
    await user.click(likeBtn);
    expect(postsActions.asyncToggleLike).not.toHaveBeenCalled();
  });

  it("should not submit comment if commentText is empty", () => {
    vi.spyOn(postsActions, "asyncAddComment");
    renderWithProviders(<DetailPage postId={5} />, {
      preloadedState: {
        auth: { authUser, isPreload: false },
        postDetail: mockPostDetail,
      },
    });

    const form = document.querySelector("form")!;
    fireEvent.submit(form);
    expect(postsActions.asyncAddComment).not.toHaveBeenCalled();
  });

  it("should render empty state message when comments array is empty and no my_comment", () => {
    const postWithoutComments = {
      ...mockPostDetail,
      comments: [],
      my_comment: null,
    };
    renderWithProviders(<DetailPage postId={5} />, {
      preloadedState: {
        auth: { authUser, isPreload: false },
        postDetail: postWithoutComments,
      },
    });

    expect(
      screen.getByText("Belum ada komentar. Jadilah yang pertama berkomentar!")
    ).toBeInTheDocument();
  });

  it("should render author photo when provided", () => {
    const postWithPhoto = {
      ...mockPostDetail,
      author: { name: "Abdullah", photo: "https://example.com/avatar.jpg" },
    };
    renderWithProviders(<DetailPage postId={5} />, {
      preloadedState: {
        auth: { authUser, isPreload: false },
        postDetail: postWithPhoto,
      },
    });

    expect(screen.getByAltText("Abdullah")).toBeInTheDocument();
  });
});
