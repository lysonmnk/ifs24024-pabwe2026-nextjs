"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import {
  asyncReceivePostDetail,
  asyncToggleLike,
  asyncAddComment,
  asyncDeleteComment,
} from "../states/action";
import { formatDate, showConfirm } from "@/helpers/toolsHelper";
import { PostComment } from "@/types";
import {
  IconArrowLeft,
  IconHeart,
  IconHeartFilled,
  IconMessageCircle,
  IconTrash,
  IconSend,
} from "@tabler/icons-react";

export interface DetailPageProps {
  postId: number | string;
}

export default function DetailPage({ postId }: DetailPageProps) {
  const dispatch = useAppDispatch();
  const post = useAppSelector((state) => state.postDetail);
  const authUser = useAppSelector((state) => state.auth.authUser);

  const [commentText, setCommentText] = useState("");
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  useEffect(() => {
    dispatch(asyncReceivePostDetail(postId));
  }, [dispatch, postId]);

  const handleLike = () => {
    if (!post || !authUser) return;
    const isLiked = post.likes.includes(authUser.id);
    dispatch(asyncToggleLike(post.id, isLiked));
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    setIsSubmittingComment(true);
    const success = await dispatch(asyncAddComment(postId, commentText));
    setIsSubmittingComment(false);

    if (success) {
      setCommentText("");
    }
  };

  const handleDeleteComment = async () => {
    const confirmed = await showConfirm(
      "Apakah Anda yakin ingin menghapus komentar Anda?",
      "Hapus Komentar"
    );
    if (confirmed) {
      dispatch(asyncDeleteComment(postId));
    }
  };

  if (!post) {
    return (
      <div className="max-w-2xl mx-auto py-12 text-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm text-gray-500">Memuat detail postingan...</p>
      </div>
    );
  }

  const isLiked = authUser ? post.likes.includes(authUser.id) : false;
  const commentsList = (post.comments || []) as PostComment[];
  const hasMyComment = !!post.my_comment;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Back button */}
      <div>
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-blue-600 transition"
        >
          <IconArrowLeft className="w-4 h-4" />
          <span>Kembali ke Linimasa</span>
        </Link>
      </div>

      {/* Main Post Card */}
      <article className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Header */}
        <div className="p-5 flex items-center gap-3">
          {post.author?.photo ? (
            <img
              src={post.author.photo}
              alt={post.author.name}
              className="w-11 h-11 rounded-full object-cover border border-gray-200"
            />
          ) : (
            <div className="w-11 h-11 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-base">
              {post.author?.name ? post.author.name.charAt(0).toUpperCase() : "U"}
            </div>
          )}
          <div>
            <h3 className="font-semibold text-gray-900">{post.author?.name}</h3>
            <p className="text-xs text-gray-400">{formatDate(post.created_at)}</p>
          </div>
        </div>

        {/* Content */}
        <div className="px-5 pb-4">
          <p className="text-gray-800 text-base whitespace-pre-line leading-relaxed">
            {post.description}
          </p>
        </div>

        {/* Cover */}
        {post.cover && (
          <div className="bg-gray-100 max-h-[450px] overflow-hidden">
            <img
              src={post.cover}
              alt="Cover postingan"
              className="w-full h-auto object-cover max-h-[450px]"
            />
          </div>
        )}

        {/* Actions */}
        <div className="p-4 sm:p-5 border-t border-gray-50 flex items-center gap-6">
          <button
            type="button"
            onClick={handleLike}
            aria-label={isLiked ? "Hapus suka postingan" : "Sukai postingan"}
            className={`flex items-center gap-1.5 text-xs font-semibold transition ${
              isLiked ? "text-red-600" : "text-gray-600 hover:text-red-600"
            }`}
          >
            {isLiked ? (
              <IconHeartFilled className="w-4 h-4 text-red-600" />
            ) : (
              <IconHeart className="w-4 h-4" />
            )}
            <span>{post.likes.length} Suka</span>
          </button>

          <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-500">
            <IconMessageCircle className="w-4 h-4" />
            <span>{post.comments.length} Komentar</span>
          </div>
        </div>
      </article>

      {/* Comments Section */}
      <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-6">
        <h4 className="font-semibold text-gray-900 text-base">
          Komentar ({post.comments.length})
        </h4>

        {/* Add Comment Form */}
        <form onSubmit={handleAddComment} className="flex gap-2">
          <input
            type="text"
            required
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="Tulis tanggapan Anda..."
            className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            disabled={isSubmittingComment || !commentText.trim()}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl transition flex items-center gap-1 text-sm font-semibold"
          >
            <IconSend className="w-4 h-4" />
            <span className="hidden sm:inline">Kirim</span>
          </button>
        </form>

        {/* Comments List */}
        <div className="space-y-3 pt-2">
          {commentsList.length === 0 ? (
            <p className="text-xs text-gray-600 text-center py-4">
              Belum ada komentar. Jadilah yang pertama berkomentar!
            </p>
          ) : (
            commentsList.map((c) => {
              const isMyComment = post.my_comment?.id === c.id;
              return (
                <div
                  key={c.id}
                  className="p-3.5 bg-gray-50 rounded-xl flex items-start justify-between gap-3"
                >
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-gray-800">
                      {isMyComment ? "Anda" : "Pengguna"}
                    </p>
                    <p className="text-sm text-gray-700">{c.comment}</p>
                    <p className="text-[11px] text-gray-600">{formatDate(c.created_at)}</p>
                  </div>

                  {isMyComment && (
                    <button
                      type="button"
                      onClick={handleDeleteComment}
                      aria-label="Hapus komentar saya"
                      className="p-1 text-gray-600 hover:text-red-600 transition"
                      title="Hapus komentar saya"
                    >
                      <IconTrash className="w-4 h-4" />
                    </button>
                  )}
                </div>
              );
            })
          )}
        </div>
      </section>
    </div>
  );
}
