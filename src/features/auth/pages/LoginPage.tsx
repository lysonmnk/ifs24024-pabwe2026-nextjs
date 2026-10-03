"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useInput } from "@/hooks/useInput";
import { useAppDispatch } from "@/hooks/redux";
import { asyncSetAuthUser } from "../states/action";

export default function LoginPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const [email, onEmailChange] = useInput("");
  const [password, onPasswordChange] = useInput("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setIsLoading(true);
    const success = await dispatch(asyncSetAuthUser({ email, password }));
    setIsLoading(false);

    if (success) {
      router.push("/");
    }
  };

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-800 mb-6 text-center">Masuk ke Akun Anda</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="email">
            Alamat Email
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={onEmailChange}
            placeholder="nama@delcom.org"
            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="password">
            Kata Sandi
          </label>
          <input
            id="password"
            type="password"
            required
            value={password}
            onChange={onPasswordChange}
            placeholder="Minimal 6 karakter"
            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition text-sm"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium rounded-lg shadow-md transition duration-150 ease-in-out text-sm"
        >
          {isLoading ? "Sedang Memproses..." : "Masuk"}
        </button>
      </form>

      <div className="mt-6 text-center text-sm text-gray-600">
        Belum punya akun?{" "}
        <Link href="/auth/register" className="font-semibold text-blue-600 hover:text-blue-500">
          Daftar sekarang
        </Link>
      </div>
    </div>
  );
}
