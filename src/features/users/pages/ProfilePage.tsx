"use client";

import React, { useEffect, useState, useRef } from "react";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import {
  asyncReceiveProfile,
  asyncUpdateProfile,
  asyncChangePhoto,
  asyncChangePassword,
} from "../states/action";
import { useInput } from "@/hooks/useInput";
import { formatDate, showError } from "@/helpers/toolsHelper";
import { IconCamera, IconLock, IconUser, IconMail } from "@tabler/icons-react";

export default function ProfilePage() {
  const dispatch = useAppDispatch();
  const authUser = useAppSelector((state) => state.auth.authUser);

  const [name, onNameChange, setName] = useInput("");
  const [email, onEmailChange, setEmail] = useInput("");

  const [oldPassword, onOldPasswordChange, setOldPassword] = useInput("");
  const [newPassword, onNewPasswordChange, setNewPassword] = useInput("");
  const [confirmPassword, onConfirmPasswordChange, setConfirmPassword] = useInput("");

  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [selectedPhoto, setSelectedPhoto] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isUpdatingPhoto, setIsUpdatingPhoto] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  useEffect(() => {
    dispatch(asyncReceiveProfile());
  }, [dispatch]);

  useEffect(() => {
    if (authUser) {
      setName(authUser.name || "");
      setEmail(authUser.email || "");
    }
  }, [authUser, setName, setEmail]);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) return;

    setIsUpdatingProfile(true);
    await dispatch(asyncUpdateProfile({ name, email }));
    setIsUpdatingProfile(false);
  };

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedPhoto(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handlePhotoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPhoto) return;

    setIsUpdatingPhoto(true);
    const success = await dispatch(asyncChangePhoto(selectedPhoto));
    setIsUpdatingPhoto(false);
    if (success) {
      setSelectedPhoto(null);
      setPhotoPreview(null);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      showError("Konfirmasi kata sandi tidak cocok!");
      return;
    }
    if (newPassword.length < 6) {
      showError("Kata sandi baru minimal 6 karakter!");
      return;
    }

    setIsUpdatingPassword(true);
    const success = await dispatch(
      asyncChangePassword({
        password: oldPassword,
        new_password: newPassword,
        new_password_confirmation: confirmPassword,
      })
    );
    setIsUpdatingPassword(false);

    if (success) {
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Pengaturan Profil</h1>
        <p className="text-sm text-gray-600">Kelola informasi pribadi, foto avatar, dan keamanan akun Anda</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* User Card & Photo */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center text-center">
          <div className="relative mb-4">
            {photoPreview || authUser?.photo ? (
              <img
                src={photoPreview || authUser?.photo || ""}
                alt=""
                aria-hidden="true"
                className="w-28 h-28 rounded-full object-cover border-4 border-white shadow-md"
              />
            ) : (
              <div className="w-28 h-28 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-3xl shadow-inner">
                {authUser?.name ? authUser.name.charAt(0).toUpperCase() : "U"}
              </div>
            )}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-0 right-0 p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 shadow transition"
              title="Pilih foto"
              aria-label="Pilih foto"
            >
              <IconCamera className="w-4 h-4" />
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handlePhotoSelect}
              accept="image/*"
              className="hidden"
            />
          </div>

          <h2 className="font-bold text-lg text-gray-900">{authUser?.name}</h2>
          <p className="text-sm text-gray-600">{authUser?.email}</p>
          <span className="mt-2 text-xs bg-gray-100 text-gray-600 px-3 py-1 rounded-full">
            Bergabung {formatDate(authUser?.created_at)}
          </span>

          {selectedPhoto && (
            <button
              onClick={handlePhotoSubmit}
              disabled={isUpdatingPhoto}
              className="mt-4 w-full py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg transition"
            >
              {isUpdatingPhoto ? "Menyimpan Foto..." : "Simpan Foto Baru"}
            </button>
          )}
        </div>

        {/* Profile Info Form */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <IconUser className="w-5 h-5 text-blue-600" />
              Informasi Pribadi
            </h3>
            <form onSubmit={handleProfileSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1" htmlFor="name">
                  Nama Lengkap
                </label>
                <input
                  id="name"
                  type="text"
                  required
                  value={name}
                  onChange={onNameChange}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1" htmlFor="email">
                  Alamat Email
                </label>
                <div className="relative">
                  <IconMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={onEmailChange}
                    className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isUpdatingProfile}
                className="py-2 px-5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition"
              >
                {isUpdatingProfile ? "Menyimpan..." : "Simpan Perubahan"}
              </button>
            </form>
          </div>

          {/* Change Password Form */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <IconLock className="w-5 h-5 text-blue-600" />
              Keamanan & Kata Sandi
            </h3>
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1" htmlFor="oldPassword">
                  Kata Sandi Lama
                </label>
                <input
                  id="oldPassword"
                  type="password"
                  required
                  value={oldPassword}
                  onChange={onOldPasswordChange}
                  placeholder="Masukkan kata sandi saat ini"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1" htmlFor="newPassword">
                    Kata Sandi Baru
                  </label>
                  <input
                    id="newPassword"
                    type="password"
                    required
                    value={newPassword}
                    onChange={onNewPasswordChange}
                    placeholder="Minimal 6 karakter"
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1" htmlFor="confirmPassword">
                    Konfirmasi Kata Sandi Baru
                  </label>
                  <input
                    id="confirmPassword"
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={onConfirmPasswordChange}
                    placeholder="Ulangi kata sandi baru"
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isUpdatingPassword}
                className="py-2 px-5 bg-gray-800 hover:bg-gray-900 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition"
              >
                {isUpdatingPassword ? "Memperbarui..." : "Perbarui Kata Sandi"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
