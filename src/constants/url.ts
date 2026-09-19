const isLocalhost =
  typeof window !== "undefined" &&
  (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1");

const rawApiUrl =
  (import.meta.env.VITE_API_URL as string) || "https://colin-mclean-api.esta-dev.com/api/v1";

const rawFileUrl =
  (import.meta.env.VITE_FILE_URL as string) ||
  (isLocalhost ? "/uploads" : "https://colin-mclean-api.esta-dev.com/uploads");

export const BASE_URL = "http://localhost:5173";

export const API_URL = rawApiUrl.replace(/\/+$/, "");

export const FILE_URL = rawFileUrl.replace(/\/+$/, "");


