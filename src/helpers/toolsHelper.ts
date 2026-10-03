import Swal from "sweetalert2";

export function showSuccess(message: string, title: string = "Berhasil!") {
  return Swal.fire({
    icon: "success",
    title,
    text: message,
    timer: 2000,
    showConfirmButton: false,
  });
}

export function showError(message: string, title: string = "Oops...") {
  return Swal.fire({
    icon: "error",
    title,
    text: message,
    confirmButtonColor: "#3085d6",
  });
}

export async function showConfirm(
  message: string,
  title: string = "Apakah Anda yakin?"
): Promise<boolean> {
  const result = await Swal.fire({
    title,
    text: message,
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#d33",
    cancelButtonColor: "#3085d6",
    confirmButtonText: "Ya, lanjutkan!",
    cancelButtonText: "Batal",
  });
  return result.isConfirmed;
}

export function showLoading(title: string = "Memproses...") {
  Swal.fire({
    title,
    allowOutsideClick: false,
    didOpen: () => {
      Swal.showLoading();
    },
  });
}

export function closeLoading() {
  Swal.close();
}

export function formatDate(dateString?: string | null): string {
  if (!dateString) return "-";
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "-";
    return new Intl.DateTimeFormat("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  } catch {
    return "-";
  }
}
