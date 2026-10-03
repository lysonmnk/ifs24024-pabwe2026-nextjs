import { AppDispatch, RootState } from "@/store";
import { Post } from "@/types";
import { postApi } from "../api/postApi";
import { showError, showSuccess } from "@/helpers/toolsHelper";

export const ActionType = {
  RECEIVE_POSTS: "posts/receivePosts",
  RECEIVE_POST_DETAIL: "posts/receivePostDetail",
  CLEAR_POST_DETAIL: "posts/clearPostDetail",
  SET_POST_FILTER: "posts/setPostFilter",
  SET_SEARCH_QUERY: "posts/setSearchQuery",
  TOGGLE_LIKE_POST: "posts/toggleLikePost",
} as const;

export function receivePostsActionCreator(posts: Post[]) {
  return {
    type: ActionType.RECEIVE_POSTS,
    payload: { posts },
  };
}

export function receivePostDetailActionCreator(post: Post | null) {
  return {
    type: ActionType.RECEIVE_POST_DETAIL,
    payload: { post },
  };
}

export function clearPostDetailActionCreator() {
  return {
    type: ActionType.CLEAR_POST_DETAIL,
  };
}

export function setPostFilterActionCreator(filter: "all" | "me") {
  return {
    type: ActionType.SET_POST_FILTER,
    payload: { filter },
  };
}

export function setSearchQueryActionCreator(query: string) {
  return {
    type: ActionType.SET_SEARCH_QUERY,
    payload: { query },
  };
}

export function toggleLikePostActionCreator(postId: number, userId: number) {
  return {
    type: ActionType.TOGGLE_LIKE_POST,
    payload: { postId, userId },
  };
}

export function asyncReceivePosts(isMe: boolean = false) {
  return async (dispatch: AppDispatch) => {
    try {
      const response = await postApi.getAllPosts(isMe);
      if (response.status === "success" && response.data) {
        dispatch(receivePostsActionCreator(response.data.posts));
      }
    } catch (error: any) {
      showError(error.message || "Gagal memuat postingan");
    }
  };
}

export function asyncReceivePostDetail(id: number | string) {
  return async (dispatch: AppDispatch) => {
    try {
      dispatch(clearPostDetailActionCreator());
      const response = await postApi.getPostDetail(id);
      if (response.status === "success" && response.data) {
        dispatch(receivePostDetailActionCreator(response.data.post));
      }
    } catch (error: any) {
      showError(error.message || "Gagal memuat detail postingan");
    }
  };
}

export function asyncCreatePost(description: string, coverFile?: File) {
  return async (dispatch: AppDispatch, getState: () => RootState) => {
    try {
      const response = await postApi.createPost(description);
      if (response.status === "success" && response.data) {
        const postId = response.data.post_id;
        if (coverFile) {
          await postApi.changeCover(postId, coverFile);
        }
        showSuccess("Postingan berhasil dibuat!");
        const isMe = getState().posts.filter === "me";
        dispatch(asyncReceivePosts(isMe));
        return true;
      } else {
        showError(response.message || "Gagal membuat postingan");
        return false;
      }
    } catch (error: any) {
      showError(error.message || "Terjadi kesalahan saat membuat postingan");
      return false;
    }
  };
}

export function asyncUpdatePost(id: number | string, description: string) {
  return async (dispatch: AppDispatch, getState: () => RootState) => {
    try {
      const response = await postApi.updatePost(id, description);
      if (response.status === "success") {
        showSuccess(response.message || "Postingan berhasil diperbarui!");
        const isMe = getState().posts.filter === "me";
        dispatch(asyncReceivePosts(isMe));
        dispatch(asyncReceivePostDetail(id));
        return true;
      } else {
        showError(response.message || "Gagal memperbarui postingan");
        return false;
      }
    } catch (error: any) {
      showError(error.message || "Terjadi kesalahan saat memperbarui postingan");
      return false;
    }
  };
}

export function asyncChangeCover(id: number | string, coverFile: File) {
  return async (dispatch: AppDispatch, getState: () => RootState) => {
    try {
      const response = await postApi.changeCover(id, coverFile);
      if (response.status === "success") {
        showSuccess(response.message || "Cover berhasil diperbarui!");
        const isMe = getState().posts.filter === "me";
        dispatch(asyncReceivePosts(isMe));
        dispatch(asyncReceivePostDetail(id));
        return true;
      } else {
        showError(response.message || "Gagal memperbarui cover");
        return false;
      }
    } catch (error: any) {
      showError(error.message || "Terjadi kesalahan saat mengunggah cover");
      return false;
    }
  };
}

export function asyncDeletePost(id: number | string) {
  return async (dispatch: AppDispatch, getState: () => RootState) => {
    try {
      const response = await postApi.deletePost(id);
      if (response.status === "success") {
        showSuccess(response.message || "Postingan berhasil dihapus!");
        const isMe = getState().posts.filter === "me";
        dispatch(asyncReceivePosts(isMe));
        return true;
      } else {
        showError(response.message || "Gagal menghapus postingan");
        return false;
      }
    } catch (error: any) {
      showError(error.message || "Terjadi kesalahan saat menghapus postingan");
      return false;
    }
  };
}

export function asyncDeleteAllPosts() {
  return async (dispatch: AppDispatch) => {
    try {
      const response = await postApi.deleteAllPosts();
      if (response.status === "success") {
        showSuccess(response.message || "Semua postingan berhasil dihapus!");
        dispatch(receivePostsActionCreator([]));
        return true;
      } else {
        showError(response.message || "Gagal menghapus semua postingan");
        return false;
      }
    } catch (error: any) {
      showError(error.message || "Terjadi kesalahan saat menghapus semua postingan");
      return false;
    }
  };
}

export function asyncToggleLike(id: number, isLiked: boolean) {
  return async (dispatch: AppDispatch, getState: () => RootState) => {
    const authUser = getState().auth.authUser;
    if (!authUser) return false;

    dispatch(toggleLikePostActionCreator(id, authUser.id));

    try {
      const likePayload = isLiked ? 0 : 1;
      const response = await postApi.toggleLike(id, likePayload);
      if (response.status !== "success") {
        // Rollback on fail
        dispatch(toggleLikePostActionCreator(id, authUser.id));
        showError(response.message || "Gagal memproses like");
        return false;
      }
      return true;
    } catch (error: any) {
      dispatch(toggleLikePostActionCreator(id, authUser.id));
      showError(error.message || "Terjadi kesalahan pada sistem like");
      return false;
    }
  };
}

export function asyncAddComment(id: number | string, comment: string) {
  return async (dispatch: AppDispatch) => {
    try {
      const response = await postApi.addComment(id, comment);
      if (response.status === "success") {
        showSuccess(response.message || "Komentar berhasil ditambahkan!");
        dispatch(asyncReceivePostDetail(id));
        return true;
      } else {
        showError(response.message || "Gagal menambahkan komentar");
        return false;
      }
    } catch (error: any) {
      showError(error.message || "Terjadi kesalahan saat menambahkan komentar");
      return false;
    }
  };
}

export function asyncDeleteComment(id: number | string) {
  return async (dispatch: AppDispatch) => {
    try {
      const response = await postApi.deleteComment(id);
      if (response.status === "success") {
        showSuccess(response.message || "Komentar berhasil dihapus!");
        dispatch(asyncReceivePostDetail(id));
        return true;
      } else {
        showError(response.message || "Gagal menghapus komentar");
        return false;
      }
    } catch (error: any) {
      showError(error.message || "Terjadi kesalahan saat menghapus komentar");
      return false;
    }
  };
}
