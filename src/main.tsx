import { createRoot } from "react-dom/client";
import App from "./App";
import { BrowserRouter } from "react-router-dom";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer } from "react-toastify";

import "react-date-range/dist/styles.css"; // main style file
import "react-date-range/dist/theme/default.css"; // theme css file

createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <App />
    <ToastContainer />
  </BrowserRouter>
);
