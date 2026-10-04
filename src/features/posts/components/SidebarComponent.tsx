"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAppDispatch } from "@/hooks/redux";
import { asyncDeleteAllPosts } from "../states/action";
import { showConfirm } from "@/helpers/toolsHelper";
import {
  IconHome,
  IconUsers,
  IconUser,
  IconPlus,
  IconTrash,
  IconX,
} from "@tabler/icons-react";

export interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenAddModal: () => void;
}

export default function SidebarComponent({
  isOpen,
  onClose,
  onOpenAddModal,
}: SidebarProps) {
  const pathname = usePathname();
  const dispatch = useAppDispatch();

  const navItems = [
    { label: "Linimasa", href: "/", icon: IconHome },
    { label: "Pengguna", href: "/users", icon: IconUsers },
    { label: "Profil Saya", href: "/profile", icon: IconUser },
  ];

  const handleDeleteAll = async () => {
    const confirmed = await showConfirm(
      "Apakah Anda yakin ingin menghapus seluruh postingan milik Anda? Tindakan ini tidak dapat dibatalkan!",
      "Hapus Semua Postingan"
    );
    if (confirmed) {
      dispatch(asyncDeleteAllPosts());
    }
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          data-testid="sidebar-backdrop"
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/40 lg:hidden backdrop-blur-xs transition-opacity"
        />
      )}

      {/* Sidebar Drawer */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-white border-r border-gray-200 p-5 flex flex-col justify-between transition-transform duration-200 ease-in-out lg:static lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div>
          {/* Header on mobile */}
          <div className="flex items-center justify-between lg:hidden mb-6">
            <span className="font-bold text-gray-900 text-lg">Menu</span>
            <button
              type="button"
              onClick={onClose}
              aria-label="Tutup menu navigasi"
              className="p-1 rounded-lg text-gray-600 hover:bg-gray-100"
            >
              <IconX className="w-5 h-5" />
            </button>
          </div>

          {/* Create Post Button */}
          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenAddModal();
            }}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl shadow-md shadow-blue-500/20 transition mb-6"
          >
            <IconPlus className="w-5 h-5" />
            <span>Buat Postingan</span>
          </button>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-xl font-medium text-sm transition ${
                    isActive
                      ? "bg-blue-50 text-blue-600"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Delete All Posts Button */}
        <div className="border-t border-gray-100 pt-4">
          <button
            type="button"
            onClick={handleDeleteAll}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl font-medium text-sm text-red-600 hover:bg-red-50 transition"
          >
            <IconTrash className="w-5 h-5" />
            <span>Hapus Semua Post</span>
          </button>
        </div>
      </aside>
    </>
  );
}
