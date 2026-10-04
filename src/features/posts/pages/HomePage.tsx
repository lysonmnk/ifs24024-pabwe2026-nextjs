"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import {
  asyncReceivePosts,
  setPostFilterActionCreator,
  asyncDeletePost,
  asyncToggleLike,
} from "../states/action";
import { formatDate, showConfirm } from "@/helpers/toolsHelper";
import ChangeModal from "../modals/ChangeModal";
import ChangeCoverModal from "../modals/ChangeCoverModal";
import {
  IconHeart,
  IconHeartFilled,
  IconMessageCircle,
  IconEdit,
  IconPhoto,
  IconTrash,
  IconMoodEmpty,
} from "@tabler/icons-react";

export default function HomePage() {
  const dispatch = useAppDispatch();
  const { posts, filter, searchQuery } = useAppSelector((state) => state.posts);
  const authUser = useAppSelector((state) => state.auth.authUser);

  const [activeEditPost, setActiveEditPost] = useState<{ id: number; desc: string } | null>(null);
  const [activeCoverPost, setActiveCoverPost] = useState<{ id: number; cover?: string | null } | null>(null);

  useEffect(() => {
    dispatch(asyncReceivePosts(filter === "me"));
  }, [dispatch, filter]);

  const handleTabChange = (newFilter: "all" | "me") => {
    dispatch(setPostFilterActionCreator(newFilter));
  };

  const handleDeletePost = async (postId: number) => {
    const confirmed = await showConfirm(
      "Apakah Anda yakin ingin menghapus postingan ini?",
      "Hapus Postingan"
    );
    if (confirmed) {
      dispatch(asyncDeletePost(postId));
    }
  };

  const handleLike = (postId: number, likes: number[]) => {
    if (!authUser) return;
    const isLiked = likes.includes(authUser.id);
    dispatch(asyncToggleLike(postId, isLiked));
  };

  const filteredPosts = posts.filter((p) => {
    const query = searchQuery.toLowerCase();
    const descMatch = p.description.toLowerCase().includes(query);
    const authorMatch = p.author?.name ? p.author.name.toLowerCase().includes(query) : false;
    return descMatch || authorMatch;
  });

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="sr-only">Linimasa Postingan</h1>

      {/* Filter Tabs */}
      <div className="flex bg-gray-100 p-1 rounded-xl">
        <button
          type="button"
          onClick={() => handleTabChange("all")}
          className={`flex-1 py-2 text-sm font-semibold rounded-lg transition ${
            filter === "all"
              ? "bg-white text-blue-600 shadow-xs"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          Semua Postingan
        </button>
        <button
          type="button"
          onClick={() => handleTabChange("me")}
          className={`flex-1 py-2 text-sm font-semibold rounded-lg transition ${
            filter === "me"
              ? "bg-white text-blue-600 shadow-xs"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          Postingan Saya
        </button>
      </div>

      {/* Post List */}
      {filteredPosts.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100 shadow-xs">
          <IconMoodEmpty className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-700 font-medium">Belum ada postingan yang sesuai</p>
          <p className="text-xs text-gray-600 mt-1">
            {searchQuery
              ? "Coba gunakan kata kunci pencarian yang lain."
              : "Mulai bagikan cerita Anda dengan membuat postingan baru!"}
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {filteredPosts.map((post) => {
            const isOwner = authUser && post.user_id === authUser.id;
            const isLiked = authUser ? post.likes.includes(authUser.id) : false;

            return (
              <article
                key={post.id}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition"
              >
                {/* Header */}
                <div className="p-4 sm:p-5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {post.author?.photo ? (
                      <img
                        src={post.author.photo}
                        alt=""
                        aria-hidden="true"
                        className="w-10 h-10 rounded-full object-cover border border-gray-200"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm">
                        {post.author?.name ? post.author.name.charAt(0).toUpperCase() : "U"}
                      </div>
                    )}
                    <div>
                      <h2 className="font-semibold text-gray-900 text-sm">{post.author?.name}</h2>
                      <p className="text-xs text-gray-600">{formatDate(post.created_at)}</p>
                    </div>
                  </div>

                  {isOwner && (
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() =>
                          setActiveCoverPost({ id: post.id, cover: post.cover })
                        }
                        className="p-1.5 text-gray-600 hover:text-blue-600 rounded-lg transition"
                        title="Ganti cover"
                        aria-label="Ganti cover"
                      >
                        <IconPhoto className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setActiveEditPost({ id: post.id, desc: post.description })
                        }
                        className="p-1.5 text-gray-600 hover:text-amber-600 rounded-lg transition"
                        title="Ubah postingan"
                        aria-label="Ubah postingan"
                      >
                        <IconEdit className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeletePost(post.id)}
                        className="p-1.5 text-gray-600 hover:text-red-600 rounded-lg transition"
                        title="Hapus postingan"
                        aria-label="Hapus postingan"
                      >
                        <IconTrash className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="px-4 sm:px-5 pb-3">
                  <p className="text-gray-800 text-sm whitespace-pre-line leading-relaxed">
                    {post.description}
                  </p>
                </div>

                {/* Cover Image */}
                {post.cover && (
                  <div className="mt-2 bg-gray-100 max-h-96 overflow-hidden">
                    <img
                      src={post.cover}
                      alt="Cover postingan"
                      className="w-full h-auto object-cover max-h-96"
                    />
                  </div>
                )}

                {/* Footer Interaction Bar */}
                <div className="p-4 sm:p-5 border-t border-gray-50 flex items-center gap-6">
                  <button
                    type="button"
                    onClick={() => handleLike(post.id, post.likes)}
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

                  <Link
                    href={`/posts/${post.id}`}
                    className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 hover:text-blue-600 transition"
                  >
                    <IconMessageCircle className="w-4 h-4" />
                    <span>{post.comments.length} Komentar</span>
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* Modals */}
      {activeEditPost && (
        <ChangeModal
          isOpen={true}
          onClose={() => setActiveEditPost(null)}
          postId={activeEditPost.id}
          initialDescription={activeEditPost.desc}
        />
      )}

      {activeCoverPost && (
        <ChangeCoverModal
          isOpen={true}
          onClose={() => setActiveCoverPost(null)}
          postId={activeCoverPost.id}
          currentCover={activeCoverPost.cover}
        />
      )}
    </div>
  );
}
