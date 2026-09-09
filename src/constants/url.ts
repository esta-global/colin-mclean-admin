const hostname = window.location.hostname;
const isLocalhost = hostname === "localhost" || hostname === "127.0.0.1";

export const BASE_URL = "http://localhost:5173";

export const API_URL =
  isLocalhost ? "http://localhost:5200/api/v1" : "https://ifma-api.esta-dev.com/api/v1";

export const FILE_URL =
  isLocalhost ? "http://localhost:5200/uploads" : "https://ifma-api.esta-dev.com/api/v1/uploads";
