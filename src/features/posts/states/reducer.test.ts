import { describe, it, expect } from "vitest";
import {
  postsReducer,
  postDetailReducer,
  initialPostsState,
  initialPostDetailState,
} from "./reducer";
import { ActionType } from "./action";

describe("posts and postDetail reducers", () => {
  describe("postsReducer", () => {
    it("should return initial state when called with undefined", () => {
      const state = postsReducer(undefined, { type: "UNKNOWN" });
      expect(state).toEqual(initialPostsState);
    });

    it("should return current state on unknown action", () => {
      const current = { posts: [], filter: "me" as const, searchQuery: "hello" };
      const state = postsReducer(current, { type: "UNKNOWN" });
      expect(state).toEqual(current);
    });

    it("should handle RECEIVE_POSTS", () => {
      const posts = [{ id: 1, likes: [] }] as any;
      const state = postsReducer(initialPostsState, {
        type: ActionType.RECEIVE_POSTS,
        payload: { posts },
      });
      expect(state.posts).toEqual(posts);
    });

    it("should handle SET_POST_FILTER", () => {
      const state = postsReducer(initialPostsState, {
        type: ActionType.SET_POST_FILTER,
        payload: { filter: "me" },
      });
      expect(state.filter).toBe("me");
    });

    it("should handle SET_SEARCH_QUERY", () => {
      const state = postsReducer(initialPostsState, {
        type: ActionType.SET_SEARCH_QUERY,
        payload: { query: "tech" },
      });
      expect(state.searchQuery).toBe("tech");
    });

    it("should handle TOGGLE_LIKE_POST (like and unlike)", () => {
      const initialWithPosts = {
        ...initialPostsState,
        posts: [
          { id: 1, likes: [] } as any,
          { id: 2, likes: [99] } as any,
        ],
      };

      // Like post 1
      let state = postsReducer(initialWithPosts, {
        type: ActionType.TOGGLE_LIKE_POST,
        payload: { postId: 1, userId: 99 },
      });
      expect(state.posts[0].likes).toEqual([99]);

      // Unlike post 2
      state = postsReducer(state, {
        type: ActionType.TOGGLE_LIKE_POST,
        payload: { postId: 2, userId: 99 },
      });
      expect(state.posts[1].likes).toEqual([]);
    });
  });

  describe("postDetailReducer", () => {
    it("should return initial state when called with undefined", () => {
      const state = postDetailReducer(undefined, { type: "UNKNOWN" });
      expect(state).toEqual(initialPostDetailState);
    });

    it("should return current state on unknown action", () => {
      const current = { id: 1 } as any;
      const state = postDetailReducer(current, { type: "UNKNOWN" });
      expect(state).toEqual(current);
    });

    it("should handle RECEIVE_POST_DETAIL and CLEAR_POST_DETAIL", () => {
      const post = { id: 1 } as any;
      let state = postDetailReducer(null, {
        type: ActionType.RECEIVE_POST_DETAIL,
        payload: { post },
      });
      expect(state).toEqual(post);

      state = postDetailReducer(state, {
        type: ActionType.CLEAR_POST_DETAIL,
      });
      expect(state).toBeNull();
    });

    it("should handle TOGGLE_LIKE_POST on post detail", () => {
      // When state is null
      let state = postDetailReducer(null, {
        type: ActionType.TOGGLE_LIKE_POST,
        payload: { postId: 1, userId: 99 },
      });
      expect(state).toBeNull();

      // When state postId does not match
      const current = { id: 2, likes: [] } as any;
      state = postDetailReducer(current, {
        type: ActionType.TOGGLE_LIKE_POST,
        payload: { postId: 1, userId: 99 },
      });
      expect(state).toEqual(current);

      // When state matches - add like
      state = postDetailReducer(current, {
        type: ActionType.TOGGLE_LIKE_POST,
        payload: { postId: 2, userId: 99 },
      });
      expect(state?.likes).toEqual([99]);

      // When state matches - remove like
      state = postDetailReducer(state, {
        type: ActionType.TOGGLE_LIKE_POST,
        payload: { postId: 2, userId: 99 },
      });
      expect(state?.likes).toEqual([]);
    });
  });
});
