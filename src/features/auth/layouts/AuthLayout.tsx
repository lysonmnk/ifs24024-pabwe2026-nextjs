"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/hooks/redux";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { authUser, isPreload } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (!isPreload && authUser) {
      router.replace("/");
    }
  }, [authUser, isPreload, router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col justify-center items-center p-4">
      <main className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
        <div className="flex flex-col items-center mb-6 text-center">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white font-bold text-2xl shadow-lg shadow-blue-500/30 mb-3">
            P
          </div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Delcom Posts</h1>
          <p className="text-sm text-gray-600 mt-1">Platform Linimasa Mahasiswa PABWE 2026</p>
        </div>
        {children}
      </main>
      <footer className="mt-6 text-xs text-gray-600">
        © 2026 Delcom Open API • ifs24024
      </footer>
    </div>
  );
}
