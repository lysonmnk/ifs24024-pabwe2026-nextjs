"use client";

import React, { useState, useRef } from "react";
import { useAppDispatch } from "@/hooks/redux";
import { asyncCreatePost } from "../states/action";
import { IconPhoto, IconX } from "@tabler/icons-react";

export interface AddModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AddModal({ isOpen, onClose }: AddModalProps) {
  const dispatch = useAppDispatch();
  const [description, setDescription] = useState("");
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverFile(file);
      setCoverPreview(URL.createObjectURL(file));
    }
  };

  const handleRemoveCover = () => {
    setCoverFile(null);
    setCoverPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;

    setIsSubmitting(true);
    const success = await dispatch(asyncCreatePost(description, coverFile || undefined));
    setIsSubmitting(false);

    if (success) {
      setDescription("");
      handleRemoveCover();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900 text-lg">Buat Postingan Baru</h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup modal"
            className="p-1 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition"
          >
            <IconX className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <textarea
              required
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Apa yang sedang Anda pikirkan?"
              className="w-full p-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          {coverPreview ? (
            <div className="relative rounded-xl overflow-hidden border border-gray-200 max-h-56">
              <img
                src={coverPreview}
                alt="Pratinjau cover"
                className="w-full h-48 object-cover"
              />
              <button
                type="button"
                onClick={handleRemoveCover}
                aria-label="Hapus gambar"
                className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-black/80 text-white rounded-full transition"
                title="Hapus gambar"
              >
                <IconX className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-xs font-medium text-gray-600 hover:bg-gray-50 transition"
              >
                <IconPhoto className="w-4 h-4 text-blue-600" />
                <span>Tambah Foto Cover</span>
              </button>
            </div>
          )}

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
          />

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !description.trim()}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg shadow-sm transition"
            >
              {isSubmitting ? "Mempublikasikan..." : "Publikasikan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
