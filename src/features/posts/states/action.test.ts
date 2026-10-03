import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  ActionType,
  receivePostsActionCreator,
  receivePostDetailActionCreator,
  clearPostDetailActionCreator,
  setPostFilterActionCreator,
  setSearchQueryActionCreator,
  toggleLikePostActionCreator,
  asyncReceivePosts,
  asyncReceivePostDetail,
  asyncCreatePost,
  asyncUpdatePost,
  asyncChangeCover,
  asyncDeletePost,
  asyncDeleteAllPosts,
  asyncToggleLike,
  asyncAddComment,
  asyncDeleteComment,
} from "./action";
import { postApi } from "../api/postApi";
import * as toolsHelper from "@/helpers/toolsHelper";

vi.mock("../api/postApi");
vi.mock("@/helpers/toolsHelper");

describe("posts actions", () => {
  const dispatch = vi.fn();
  const getState = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    getState.mockReturnValue({
      posts: { filter: "all" },
      auth: { authUser: { id: 1 } },
    });
  });

  describe("action creators", () => {
    it("should create correct actions", () => {
      expect(receivePostsActionCreator([])).toEqual({
        type: ActionType.RECEIVE_POSTS,
        payload: { posts: [] },
      });
      expect(receivePostDetailActionCreator(null)).toEqual({
        type: ActionType.RECEIVE_POST_DETAIL,
        payload: { post: null },
      });
      expect(clearPostDetailActionCreator()).toEqual({
        type: ActionType.CLEAR_POST_DETAIL,
      });
      expect(setPostFilterActionCreator("me")).toEqual({
        type: ActionType.SET_POST_FILTER,
        payload: { filter: "me" },
      });
      expect(setSearchQueryActionCreator("query")).toEqual({
        type: ActionType.SET_SEARCH_QUERY,
        payload: { query: "query" },
      });
      expect(toggleLikePostActionCreator(10, 1)).toEqual({
        type: ActionType.TOGGLE_LIKE_POST,
        payload: { postId: 10, userId: 1 },
      });
    });
  });

  describe("asyncReceivePosts and asyncReceivePostDetail", () => {
    it("should fetch posts successfully", async () => {
      vi.mocked(postApi.getAllPosts).mockResolvedValueOnce({
        status: "success",
        message: "ok",
        data: { posts: [] },
      });

      const thunk = asyncReceivePosts(true);
      await thunk(dispatch);

      expect(postApi.getAllPosts).toHaveBeenCalledWith(true);
      expect(dispatch).toHaveBeenCalledWith(receivePostsActionCreator([]));
    });

    it("should handle error in asyncReceivePosts", async () => {
      vi.mocked(postApi.getAllPosts).mockRejectedValueOnce(new Error("Fetch error"));

      const thunk = asyncReceivePosts();
      await thunk(dispatch);

      expect(toolsHelper.showError).toHaveBeenCalledWith("Fetch error");
    });

    it("should fetch post detail successfully", async () => {
      const mockPost = { id: 1 } as any;
      vi.mocked(postApi.getPostDetail).mockResolvedValueOnce({
        status: "success",
        message: "ok",
        data: { post: mockPost },
      });

      const thunk = asyncReceivePostDetail(1);
      await thunk(dispatch);

      expect(dispatch).toHaveBeenCalledWith(clearPostDetailActionCreator());
      expect(dispatch).toHaveBeenCalledWith(receivePostDetailActionCreator(mockPost));
    });

    it("should handle error in asyncReceivePostDetail", async () => {
      vi.mocked(postApi.getPostDetail).mockRejectedValueOnce(new Error("Detail error"));

      const thunk = asyncReceivePostDetail(1);
      await thunk(dispatch);

      expect(toolsHelper.showError).toHaveBeenCalledWith("Detail error");
    });
  });

  describe("asyncCreatePost", () => {
    it("should create post without cover", async () => {
      vi.mocked(postApi.createPost).mockResolvedValueOnce({
        status: "success",
        message: "Created",
        data: { post_id: 5 },
      });

      const thunk = asyncCreatePost("Post content");
      const res = await thunk(dispatch, getState);

      expect(res).toBe(true);
      expect(toolsHelper.showSuccess).toHaveBeenCalledWith("Postingan berhasil dibuat!");
    });

    it("should create post with cover upload", async () => {
      const file = new File(["dummy"], "cover.jpg");
      vi.mocked(postApi.createPost).mockResolvedValueOnce({
        status: "success",
        message: "Created",
        data: { post_id: 5 },
      });
      vi.mocked(postApi.changeCover).mockResolvedValueOnce({ status: "success", message: "ok" });

      const thunk = asyncCreatePost("Post content", file);
      const res = await thunk(dispatch, getState);

      expect(res).toBe(true);
      expect(postApi.changeCover).toHaveBeenCalledWith(5, file);
    });

    it("should handle failure response and error thrown in asyncCreatePost", async () => {
      vi.mocked(postApi.createPost).mockResolvedValueOnce({ status: "fail", message: "Error" });
      let res = await asyncCreatePost("Desc")(dispatch, getState);
      expect(res).toBe(false);
      expect(toolsHelper.showError).toHaveBeenCalledWith("Error");

      vi.mocked(postApi.createPost).mockRejectedValueOnce(new Error("Net error"));
      res = await asyncCreatePost("Desc")(dispatch, getState);
      expect(res).toBe(false);
      expect(toolsHelper.showError).toHaveBeenCalledWith("Net error");
    });
  });

  describe("asyncUpdatePost and asyncChangeCover", () => {
    it("should update post successfully and handle errors", async () => {
      vi.mocked(postApi.updatePost).mockResolvedValueOnce({ status: "success", message: "Updated" });
      let res = await asyncUpdatePost(1, "New desc")(dispatch, getState);
      expect(res).toBe(true);

      vi.mocked(postApi.updatePost).mockResolvedValueOnce({ status: "fail", message: "Fail" });
      res = await asyncUpdatePost(1, "New desc")(dispatch, getState);
      expect(res).toBe(false);

      vi.mocked(postApi.updatePost).mockRejectedValueOnce(new Error("Err"));
      res = await asyncUpdatePost(1, "New desc")(dispatch, getState);
      expect(res).toBe(false);
    });

    it("should change cover successfully and handle errors", async () => {
      const file = new File(["dummy"], "cover.jpg");
      vi.mocked(postApi.changeCover).mockResolvedValueOnce({ status: "success", message: "Cover ok" });
      let res = await asyncChangeCover(1, file)(dispatch, getState);
      expect(res).toBe(true);

      vi.mocked(postApi.changeCover).mockResolvedValueOnce({ status: "fail", message: "Fail" });
      res = await asyncChangeCover(1, file)(dispatch, getState);
      expect(res).toBe(false);

      vi.mocked(postApi.changeCover).mockRejectedValueOnce(new Error("Err"));
      res = await asyncChangeCover(1, file)(dispatch, getState);
      expect(res).toBe(false);
    });
  });

  describe("asyncDeletePost and asyncDeleteAllPosts", () => {
    it("should delete post successfully and handle errors", async () => {
      vi.mocked(postApi.deletePost).mockResolvedValueOnce({ status: "success", message: "Deleted" });
      let res = await asyncDeletePost(1)(dispatch, getState);
      expect(res).toBe(true);

      vi.mocked(postApi.deletePost).mockResolvedValueOnce({ status: "fail", message: "Fail" });
      res = await asyncDeletePost(1)(dispatch, getState);
      expect(res).toBe(false);

      vi.mocked(postApi.deletePost).mockRejectedValueOnce(new Error("Err"));
      res = await asyncDeletePost(1)(dispatch, getState);
      expect(res).toBe(false);
    });

    it("should delete all posts successfully and handle errors", async () => {
      vi.mocked(postApi.deleteAllPosts).mockResolvedValueOnce({ status: "success", message: "All deleted" });
      let res = await asyncDeleteAllPosts()(dispatch);
      expect(res).toBe(true);
      expect(dispatch).toHaveBeenCalledWith(receivePostsActionCreator([]));

      vi.mocked(postApi.deleteAllPosts).mockResolvedValueOnce({ status: "fail", message: "Fail" });
      res = await asyncDeleteAllPosts()(dispatch);
      expect(res).toBe(false);

      vi.mocked(postApi.deleteAllPosts).mockRejectedValueOnce(new Error("Err"));
      res = await asyncDeleteAllPosts()(dispatch);
      expect(res).toBe(false);
    });
  });

  describe("asyncToggleLike", () => {
    it("should return false if authUser is null", async () => {
      getState.mockReturnValueOnce({ auth: { authUser: null } });
      const res = await asyncToggleLike(10, false)(dispatch, getState);
      expect(res).toBe(false);
    });

    it("should toggle like and handle API success", async () => {
      vi.mocked(postApi.toggleLike).mockResolvedValueOnce({ status: "success", message: "ok" });
      const res = await asyncToggleLike(10, false)(dispatch, getState);
      expect(res).toBe(true);
      expect(postApi.toggleLike).toHaveBeenCalledWith(10, 1);
    });

    it("should rollback toggle on API failure response", async () => {
      vi.mocked(postApi.toggleLike).mockResolvedValueOnce({ status: "fail", message: "fail" });
      const res = await asyncToggleLike(10, true)(dispatch, getState);
      expect(res).toBe(false);
      expect(dispatch).toHaveBeenCalledTimes(2); // First toggle, then rollback
      expect(toolsHelper.showError).toHaveBeenCalledWith("fail");
    });

    it("should rollback toggle on exception thrown", async () => {
      vi.mocked(postApi.toggleLike).mockRejectedValueOnce(new Error("Network err"));
      const res = await asyncToggleLike(10, false)(dispatch, getState);
      expect(res).toBe(false);
      expect(dispatch).toHaveBeenCalledTimes(2);
      expect(toolsHelper.showError).toHaveBeenCalledWith("Network err");
    });
  });

  describe("comments: asyncAddComment and asyncDeleteComment", () => {
    it("should add comment and handle errors", async () => {
      vi.mocked(postApi.addComment).mockResolvedValueOnce({ status: "success", message: "Comment added" });
      let res = await asyncAddComment(1, "Nice")(dispatch);
      expect(res).toBe(true);

      vi.mocked(postApi.addComment).mockResolvedValueOnce({ status: "fail", message: "Fail" });
      res = await asyncAddComment(1, "Nice")(dispatch);
      expect(res).toBe(false);

      vi.mocked(postApi.addComment).mockRejectedValueOnce(new Error("Err"));
      res = await asyncAddComment(1, "Nice")(dispatch);
      expect(res).toBe(false);
    });

    it("should delete comment and handle errors", async () => {
      vi.mocked(postApi.deleteComment).mockResolvedValueOnce({ status: "success", message: "Deleted" });
      let res = await asyncDeleteComment(1)(dispatch);
      expect(res).toBe(true);

      vi.mocked(postApi.deleteComment).mockResolvedValueOnce({ status: "fail", message: "Fail" });
      res = await asyncDeleteComment(1)(dispatch);
      expect(res).toBe(false);

      vi.mocked(postApi.deleteComment).mockRejectedValueOnce(new Error("Err"));
      res = await asyncDeleteComment(1)(dispatch);
      expect(res).toBe(false);
    });
  });
});
