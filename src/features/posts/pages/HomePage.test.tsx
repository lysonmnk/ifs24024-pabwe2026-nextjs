import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "@/test-utils";
import HomePage from "./HomePage";
import * as postsActions from "../states/action";
import * as toolsHelper from "@/helpers/toolsHelper";

describe("HomePage", () => {
  const authUser = { id: 1, name: "Giva Pardede", email: "giva@delcom.org" };

  const mockPosts = [
    {
      id: 10,
      user_id: 1,
      cover: "https://example.com/cover1.jpg",
      description: "My first post about Next.js",
      created_at: "2024-10-05T03:07:11.000000Z",
      updated_at: "2024-10-05T03:07:11.000000Z",
      author: { name: "Giva Pardede", photo: null },
      likes: [1, 2],
      comments: [1],
    },
    {
      id: 20,
      user_id: 2,
      cover: null,
      description: "Another post by someone else",
      created_at: "2024-10-05T04:00:00.000000Z",
      updated_at: "2024-10-05T04:00:00.000000Z",
      author: { name: "Budi", photo: "https://example.com/budi.jpg" },
      likes: [],
      comments: [],
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(postsActions, "asyncReceivePosts").mockReturnValue((() => {}) as any);
  });

  it("should render posts list on mount", () => {
    renderWithProviders(<HomePage />, {
      preloadedState: {
        auth: { authUser, isPreload: false },
        posts: { posts: mockPosts, filter: "all", searchQuery: "" },
      },
    });

    expect(postsActions.asyncReceivePosts).toHaveBeenCalledWith(false);
    expect(screen.getByText("My first post about Next.js")).toBeInTheDocument();
    expect(screen.getByText("Another post by someone else")).toBeInTheDocument();
    expect(screen.getByText("2 Suka")).toBeInTheDocument();
    expect(screen.getByText("0 Suka")).toBeInTheDocument();
  });

  it("should switch tabs to Postingan Saya", async () => {
    const user = userEvent.setup();
    const { store } = renderWithProviders(<HomePage />, {
      preloadedState: {
        auth: { authUser, isPreload: false },
        posts: { posts: mockPosts, filter: "all", searchQuery: "" },
      },
    });

    const myPostsTab = screen.getByRole("button", { name: "Postingan Saya" });
    await user.click(myPostsTab);

    expect(store.getState().posts.filter).toBe("me");
  });

  it("should filter posts based on searchQuery", () => {
    renderWithProviders(<HomePage />, {
      preloadedState: {
        auth: { authUser, isPreload: false },
        posts: { posts: mockPosts, filter: "all", searchQuery: "Next.js" },
      },
    });

    expect(screen.getByText("My first post about Next.js")).toBeInTheDocument();
    expect(screen.queryByText("Another post by someone else")).not.toBeInTheDocument();
  });

  it("should display empty state when no posts match", () => {
    renderWithProviders(<HomePage />, {
      preloadedState: {
        auth: { authUser, isPreload: false },
        posts: { posts: [], filter: "all", searchQuery: "" },
      },
    });

    expect(screen.getByText("Belum ada postingan yang sesuai")).toBeInTheDocument();
  });

  it("should toggle like when clicking like button", async () => {
    const user = userEvent.setup();
    vi.spyOn(postsActions, "asyncToggleLike").mockReturnValue((() => {}) as any);

    renderWithProviders(<HomePage />, {
      preloadedState: {
        auth: { authUser, isPreload: false },
        posts: { posts: mockPosts, filter: "all", searchQuery: "" },
      },
    });

    // Post 10 is liked by authUser (id: 1)
    const likeBtn = screen.getByText("2 Suka").closest("button")!;
    await user.click(likeBtn);

    expect(postsActions.asyncToggleLike).toHaveBeenCalledWith(10, true);
  });

  it("should open edit modal and change cover modal for owned posts", async () => {
    const user = userEvent.setup();
    renderWithProviders(<HomePage />, {
      preloadedState: {
        auth: { authUser, isPreload: false },
        posts: { posts: mockPosts, filter: "all", searchQuery: "" },
      },
    });

    const editBtn = screen.getByTitle("Ubah postingan");
    await user.click(editBtn);
    expect(screen.getByText("Ubah Postingan")).toBeInTheDocument();

    const cancelEditBtn = screen.getByRole("button", { name: /Batal/i });
    await user.click(cancelEditBtn);

    const coverBtn = screen.getByTitle("Ganti cover");
    await user.click(coverBtn);
    expect(screen.getByText("Ubah Cover Postingan")).toBeInTheDocument();

    const cancelCoverBtn = screen.getByRole("button", { name: /Batal/i });
    await user.click(cancelCoverBtn);
    expect(screen.queryByText("Ubah Cover Postingan")).not.toBeInTheDocument();
  });

  it("should handle deleting post with confirm and cancel", async () => {
    const user = userEvent.setup();
    vi.spyOn(postsActions, "asyncDeletePost").mockReturnValue((() => {}) as any);

    renderWithProviders(<HomePage />, {
      preloadedState: {
        auth: { authUser, isPreload: false },
        posts: { posts: mockPosts, filter: "all", searchQuery: "" },
      },
    });

    const deleteBtn = screen.getByTitle("Hapus postingan");

    // Decline
    vi.spyOn(toolsHelper, "showConfirm").mockResolvedValueOnce(false);
    await user.click(deleteBtn);
    expect(postsActions.asyncDeletePost).not.toHaveBeenCalled();

    // Confirm
    vi.spyOn(toolsHelper, "showConfirm").mockResolvedValueOnce(true);
    await user.click(deleteBtn);
    await waitFor(() => {
      expect(postsActions.asyncDeletePost).toHaveBeenCalledWith(10);
    });
  });

  it("should not toggle like if user is not logged in", async () => {
    const user = userEvent.setup();
    vi.spyOn(postsActions, "asyncToggleLike");
    renderWithProviders(<HomePage />, {
      preloadedState: {
        auth: { authUser: null, isPreload: false },
        posts: { posts: mockPosts, filter: "all", searchQuery: "" },
      },
    });

    const likeBtn = screen.getByText("2 Suka").closest("button")!;
    await user.click(likeBtn);
    expect(postsActions.asyncToggleLike).not.toHaveBeenCalled();
  });

  it("should filter posts when post author name is empty or undefined", () => {
    const postsWithoutAuthor = [
      {
        id: 99,
        user_id: 99,
        cover: null,
        description: "Post without author name",
        created_at: "2024-10-05T03:07:11.000000Z",
        updated_at: "2024-10-05T03:07:11.000000Z",
        author: { name: "", photo: null },
        likes: [],
        comments: [],
      },
    ];
    renderWithProviders(<HomePage />, {
      preloadedState: {
        auth: { authUser, isPreload: false },
        posts: { posts: postsWithoutAuthor, filter: "all", searchQuery: "sample" },
      },
    });
    expect(screen.getByText("Belum ada postingan yang sesuai")).toBeInTheDocument();
  });
});
