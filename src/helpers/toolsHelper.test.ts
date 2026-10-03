import { describe, it, expect, vi, beforeEach } from "vitest";
import Swal from "sweetalert2";
import {
  showSuccess,
  showError,
  showConfirm,
  showLoading,
  closeLoading,
  formatDate,
} from "./toolsHelper";

vi.mock("sweetalert2", () => ({
  default: {
    fire: vi.fn(),
    close: vi.fn(),
    showLoading: vi.fn(),
  },
}));

describe("toolsHelper", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("showSuccess", () => {
    it("should call Swal.fire with success icon and default title", () => {
      showSuccess("Data tersimpan");
      expect(Swal.fire).toHaveBeenCalledWith({
        icon: "success",
        title: "Berhasil!",
        text: "Data tersimpan",
        timer: 2000,
        showConfirmButton: false,
      });
    });

    it("should call Swal.fire with custom title", () => {
      showSuccess("Data tersimpan", "Mantap!");
      expect(Swal.fire).toHaveBeenCalledWith({
        icon: "success",
        title: "Mantap!",
        text: "Data tersimpan",
        timer: 2000,
        showConfirmButton: false,
      });
    });
  });

  describe("showError", () => {
    it("should call Swal.fire with error icon and default title", () => {
      showError("Gagal memproses");
      expect(Swal.fire).toHaveBeenCalledWith({
        icon: "error",
        title: "Oops...",
        text: "Gagal memproses",
        confirmButtonColor: "#3085d6",
      });
    });

    it("should call Swal.fire with custom title", () => {
      showError("Gagal memproses", "Terjadi Masalah");
      expect(Swal.fire).toHaveBeenCalledWith({
        icon: "error",
        title: "Terjadi Masalah",
        text: "Gagal memproses",
        confirmButtonColor: "#3085d6",
      });
    });
  });

  describe("showConfirm", () => {
    it("should return true when user confirms", async () => {
      vi.mocked(Swal.fire).mockResolvedValueOnce({
        isConfirmed: true,
        isDenied: false,
        isDismissed: false,
      } as any);

      const res = await showConfirm("Yakin hapus?");
      expect(res).toBe(true);
      expect(Swal.fire).toHaveBeenCalledWith({
        title: "Apakah Anda yakin?",
        text: "Yakin hapus?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        confirmButtonText: "Ya, lanjutkan!",
        cancelButtonText: "Batal",
      });
    });

    it("should return false when user cancels", async () => {
      vi.mocked(Swal.fire).mockResolvedValueOnce({
        isConfirmed: false,
        isDenied: false,
        isDismissed: true,
      } as any);

      const res = await showConfirm("Yakin hapus?", "Konfirmasi Hapus");
      expect(res).toBe(false);
    });
  });

  describe("showLoading and closeLoading", () => {
    it("should trigger Swal.fire with loading options and didOpen callback", () => {
      showLoading("Tunggu sebentar...");
      expect(Swal.fire).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "Tunggu sebentar...",
          allowOutsideClick: false,
          didOpen: expect.any(Function),
        })
      );

      const callArgs = vi.mocked(Swal.fire).mock.calls[0][0] as any;
      callArgs.didOpen();
      expect(Swal.showLoading).toHaveBeenCalledTimes(1);
    });

    it("should call Swal.close on closeLoading", () => {
      closeLoading();
      expect(Swal.close).toHaveBeenCalledTimes(1);
    });
  });

  describe("formatDate", () => {
    it("should format valid ISO date string correctly", () => {
      const formatted = formatDate("2024-10-05T03:07:11.000000Z");
      expect(formatted).toBeTruthy();
      expect(formatted).toContain("2024");
      expect(formatted).toContain("Oktober");
    });

    it("should return '-' for null, undefined, or empty string", () => {
      expect(formatDate(null)).toBe("-");
      expect(formatDate(undefined)).toBe("-");
      expect(formatDate("")).toBe("-");
    });

    it("should return '-' for invalid date strings", () => {
      expect(formatDate("invalid-date-string")).toBe("-");
    });

    it("should return '-' if Intl formatting throws an error", () => {
      vi.spyOn(Intl, "DateTimeFormat").mockImplementationOnce(() => {
        throw new Error("Intl error");
      });
      expect(formatDate("2024-10-05T03:07:11.000000Z")).toBe("-");
    });
  });
});
