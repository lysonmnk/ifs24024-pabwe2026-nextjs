import { Post } from "@/types";
import { ActionType } from "./action";

export interface PostsState {
  posts: Post[];
  filter: "all" | "me";
  searchQuery: string;
}

export const initialPostsState: PostsState = {
  posts: [],
  filter: "all",
  searchQuery: "",
};

export function postsReducer(
  state: PostsState = initialPostsState,
  action: { type: string; payload?: any } = { type: "" }
): PostsState {
  switch (action.type) {
    case ActionType.RECEIVE_POSTS:
      return {
        ...state,
        posts: action.payload.posts,
      };
    case ActionType.SET_POST_FILTER:
      return {
        ...state,
        filter: action.payload.filter,
      };
    case ActionType.SET_SEARCH_QUERY:
      return {
        ...state,
        searchQuery: action.payload.query,
      };
    case ActionType.TOGGLE_LIKE_POST: {
      const { postId, userId } = action.payload;
      return {
        ...state,
        posts: state.posts.map((post) => {
          if (post.id === postId) {
            const hasLiked = post.likes.includes(userId);
            return {
              ...post,
              likes: hasLiked
                ? post.likes.filter((id) => id !== userId)
                : [...post.likes, userId],
            };
          }
          return post;
        }),
      };
    }
    default:
      return state;
  }
}

export const initialPostDetailState: Post | null = null;

export function postDetailReducer(
  state: Post | null = initialPostDetailState,
  action: { type: string; payload?: any } = { type: "" }
): Post | null {
  switch (action.type) {
    case ActionType.RECEIVE_POST_DETAIL:
      return action.payload.post;
    case ActionType.CLEAR_POST_DETAIL:
      return null;
    case ActionType.TOGGLE_LIKE_POST: {
      if (!state || state.id !== action.payload.postId) return state;
      const { userId } = action.payload;
      const hasLiked = state.likes.includes(userId);
      return {
        ...state,
        likes: hasLiked
          ? state.likes.filter((id) => id !== userId)
          : [...state.likes, userId],
      };
    }
    default:
      return state;
  }
}
