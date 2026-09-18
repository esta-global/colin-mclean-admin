const hostname = window.location.hostname;
const isLocalhost = hostname === "localhost" || hostname === "127.0.0.1";

export const BASE_URL = "http://localhost:5173";

export const API_URL =
  isLocalhost ? "http://localhost:5201/api/v1" : "https://colin-mclean-api.esta-dev.com//api/v1";

export const FILE_URL =
  isLocalhost ? "http://localhost:5201/uploads" : "https://colin-mclean-api.esta-dev.com//uploads";
