type HostType = "localhost" | "";

const hostname: HostType = window.location.hostname as HostType;

export const BASE_URL = "http://localhost:5173";

export const API_URL =
  hostname == "localhost"
    ? "http://localhost:5201/api/v1"
    : "";

export const FILE_URL =
  hostname == "localhost"
    ? "http://localhost:5201/uploads"
    : "";
