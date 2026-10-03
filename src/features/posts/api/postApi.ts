import { apiHelper } from "@/helpers/apiHelper";
import { ApiResult, Post } from "@/types";

export interface CreatePostResponse {
  post_id: number;
}

export const postApi = {
  async getAllPosts(isMe: boolean = false): Promise<ApiResult<{ posts: Post[] }>> {
    const endpoint = isMe ? "/posts?is_me=1" : "/posts";
    return apiHelper.get<ApiResult<{ posts: Post[] }>>(endpoint);
  },

  async getPostDetail(id: number | string): Promise<ApiResult<{ post: Post }>> {
    return apiHelper.get<ApiResult<{ post: Post }>>(`/posts/${id}`);
  },

  async createPost(description: string): Promise<ApiResult<CreatePostResponse>> {
    return apiHelper.post<ApiResult<CreatePostResponse>>("/posts", { description });
  },

  async updatePost(id: number | string, description: string): Promise<ApiResult> {
    return apiHelper.put<ApiResult>(`/posts/${id}`, { description });
  },

  async changeCover(id: number | string, coverFile: File): Promise<ApiResult> {
    const formData = new FormData();
    formData.append("cover", coverFile);
    return apiHelper.upload<ApiResult>(`/posts/${id}/cover`, formData);
  },

  async deletePost(id: number | string): Promise<ApiResult> {
    return apiHelper.delete<ApiResult>(`/posts/${id}`);
  },

  async deleteAllPosts(): Promise<ApiResult> {
    return apiHelper.delete<ApiResult>("/posts");
  },

  async toggleLike(id: number | string, like: number): Promise<ApiResult> {
    return apiHelper.post<ApiResult>(`/posts/${id}/likes`, { like });
  },

  async addComment(id: number | string, comment: string): Promise<ApiResult> {
    return apiHelper.post<ApiResult>(`/posts/${id}/comments`, { comment });
  },

  async deleteComment(id: number | string): Promise<ApiResult> {
    return apiHelper.delete<ApiResult>(`/posts/${id}/comments`);
  },
};
