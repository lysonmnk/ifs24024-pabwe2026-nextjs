"use client";

import React from "react";
import Link from "next/link";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import { setSearchQueryActionCreator } from "../states/action";
import { asyncUnsetAuthUser } from "@/features/auth/states/action";
import { showConfirm } from "@/helpers/toolsHelper";
import { IconSearch, IconMenu2, IconLogout } from "@tabler/icons-react";

export interface NavbarProps {
  onToggleMobileSidebar: () => void;
}

export default function NavbarComponent({ onToggleMobileSidebar }: NavbarProps) {
  const dispatch = useAppDispatch();
  const authUser = useAppSelector((state) => state.auth.authUser);
  const searchQuery = useAppSelector((state) => state.posts.searchQuery);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(setSearchQueryActionCreator(e.target.value));
  };

  const handleLogout = async () => {
    const confirmed = await showConfirm(
      "Apakah Anda yakin ingin keluar dari akun ini?",
      "Konfirmasi Logout"
    );
    if (confirmed) {
      dispatch(asyncUnsetAuthUser());
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-gray-200 shadow-sm h-16 flex items-center justify-between px-4 sm:px-6">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onToggleMobileSidebar}
          className="lg:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 focus:outline-none"
          aria-label="Buka menu navigasi"
        >
          <IconMenu2 className="w-6 h-6" />
        </button>

        <Link href="/" className="flex items-center gap-2">
          <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-sm">
            P
          </div>
          <span className="font-bold text-gray-900 text-lg hidden sm:inline">Delcom Posts</span>
        </Link>
      </div>

      <div className="flex-1 max-w-md mx-4">
        <div className="relative">
          <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="Cari postingan atau penulis..."
            className="w-full pl-9 pr-4 py-1.5 bg-gray-50 border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Link
          href="/profile"
          className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-gray-100 transition"
        >
          {authUser?.photo ? (
            <img
              src={authUser.photo}
              alt=""
              aria-hidden="true"
              className="w-8 h-8 rounded-full object-cover border border-gray-200"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm">
              {authUser?.name ? authUser.name.charAt(0).toUpperCase() : "U"}
            </div>
          )}
          <span className="text-sm font-medium text-gray-700 hidden md:inline truncate max-w-[120px]">
            {authUser?.name || "Pengguna"}
          </span>
        </Link>

        <button
          type="button"
          onClick={handleLogout}
          aria-label="Keluar"
          className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
          title="Keluar"
        >
          <IconLogout className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
}
