import { FILE_URL } from "../constants";

export function addUrlToFile(img?: string | null, url?: string) {
  if (!img || typeof img !== "string") return "";
  if (
    img.startsWith("http://") ||
    img.startsWith("https://") ||
    img.startsWith("blob:") ||
    img.startsWith("data:")
  ) {
    return img;
  }
  if (img.includes("drive.google.com") || img.includes("api.lamikraft.com")) return img;
  if (img.startsWith("/")) return img;
  if (url) return `${url}/${img}`;
  return `${FILE_URL}/${img}`;
}

export function getFileType(url: string): string | null {
  const parts = url.split(".");
  return parts.length > 1 ? (parts.pop()?.toLowerCase() ?? null) : null;
}

export function getMediaType(url: string): "image" | "video" | "unknown" {
  const extension = getFileType(url);
  const imageTypes = ["jpg", "jpeg", "png", "gif", "webp"];
  const videoTypes = ["mp4", "webm", "mov", "avi"];

  if (!extension) return "unknown";

  if (imageTypes.includes(extension)) return "image";
  if (videoTypes.includes(extension)) return "video";
  return "unknown";
}
