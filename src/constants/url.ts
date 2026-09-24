const isLocalhost =
  typeof window !== "undefined" &&
  (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1");

const defaultProductionApiUrl = "https://colin-mclean-api.esta-dev.com/api/v1";
const defaultLocalApiUrl = "http://localhost:5900/api/v1";

const defaultProductionFileUrl = "https://colin-mclean-api.esta-dev.com/uploads";
const defaultLocalFileUrl = "http://localhost:5900/uploads";

const rawApiUrl =
  (import.meta.env.VITE_API_URL as string) ||
  (isLocalhost
    ? (import.meta.env.VITE_LOCAL_API_URL as string) || defaultLocalApiUrl
    : defaultProductionApiUrl);

const rawFileUrl =
  (import.meta.env.VITE_FILE_URL as string) ||
  (isLocalhost
    ? (import.meta.env.VITE_LOCAL_FILE_URL as string) || defaultLocalFileUrl
    : defaultProductionFileUrl);

export const BASE_URL =
  typeof window !== "undefined"
    ? window.location.origin
    : "http://localhost:5175";

export const API_URL = rawApiUrl.replace(/\/+$/, "");
export const FILE_URL = rawFileUrl.replace(/\/+$/, "");


