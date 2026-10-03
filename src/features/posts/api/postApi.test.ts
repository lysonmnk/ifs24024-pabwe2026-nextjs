import { describe, it, expect, vi } from "vitest";
import { postApi } from "./postApi";
import { apiHelper } from "@/helpers/apiHelper";

vi.mock("@/helpers/apiHelper", () => ({
  apiHelper: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
    upload: vi.fn(),
  },
}));

describe("postApi", () => {
  it("should call getAllPosts with default endpoint or is_me query", async () => {
    vi.mocked(apiHelper.get).mockResolvedValue({ status: "success", data: { posts: [] } });

    await postApi.getAllPosts();
    expect(apiHelper.get).toHaveBeenCalledWith("/posts");

    await postApi.getAllPosts(true);
    expect(apiHelper.get).toHaveBeenCalledWith("/posts?is_me=1");
  });

  it("should get post detail", async () => {
    vi.mocked(apiHelper.get).mockResolvedValue({ status: "success", data: { post: {} } });

    await postApi.getPostDetail(5);
    expect(apiHelper.get).toHaveBeenCalledWith("/posts/5");
  });

  it("should create post", async () => {
    vi.mocked(apiHelper.post).mockResolvedValue({
      status: "success",
      data: { post_id: 12 },
    });

    const res = await postApi.createPost("My new post");
    expect(apiHelper.post).toHaveBeenCalledWith("/posts", { description: "My new post" });
    expect(res.data?.post_id).toBe(12);
  });

  it("should update post description", async () => {
    vi.mocked(apiHelper.put).mockResolvedValue({ status: "success" });

    await postApi.updatePost(10, "Updated description");
    expect(apiHelper.put).toHaveBeenCalledWith("/posts/10", { description: "Updated description" });
  });

  it("should change post cover with FormData", async () => {
    const file = new File(["dummy"], "cover.jpg", { type: "image/jpeg" });
    vi.mocked(apiHelper.upload).mockResolvedValue({ status: "success" });

    await postApi.changeCover(10, file);
    expect(apiHelper.upload).toHaveBeenCalledWith("/posts/10/cover", expect.any(FormData));
  });

  it("should delete single post", async () => {
    vi.mocked(apiHelper.delete).mockResolvedValue({ status: "success" });

    await postApi.deletePost(10);
    expect(apiHelper.delete).toHaveBeenCalledWith("/posts/10");
  });

  it("should delete all posts", async () => {
    vi.mocked(apiHelper.delete).mockResolvedValue({ status: "success" });

    await postApi.deleteAllPosts();
    expect(apiHelper.delete).toHaveBeenCalledWith("/posts");
  });

  it("should toggle like", async () => {
    vi.mocked(apiHelper.post).mockResolvedValue({ status: "success" });

    await postApi.toggleLike(10, 1);
    expect(apiHelper.post).toHaveBeenCalledWith("/posts/10/likes", { like: 1 });
  });

  it("should add comment", async () => {
    vi.mocked(apiHelper.post).mockResolvedValue({ status: "success" });

    await postApi.addComment(10, "Great post!");
    expect(apiHelper.post).toHaveBeenCalledWith("/posts/10/comments", { comment: "Great post!" });
  });

  it("should delete comment", async () => {
    vi.mocked(apiHelper.delete).mockResolvedValue({ status: "success" });

    await postApi.deleteComment(10);
    expect(apiHelper.delete).toHaveBeenCalledWith("/posts/10/comments");
  });
});
