import { useLocation } from "react-router-dom";
import { AuthLayout, MainLayout } from "./components/layoutes";
import "@flaticon/flaticon-uicons/css/all/all.css";

export default function App() {
  const location = useLocation();

  // Paths where Header and Footer should be hidden
  const hideHeaderFooterPaths = [
    "/login",
    "/forgot-password",
    "/verify-otp",
    "/create-password",
    "/create-new-password",
  ];

  const shouldHideHeaderFooter = hideHeaderFooterPaths.includes(
    location.pathname
  );

  return !shouldHideHeaderFooter ? <MainLayout /> : <AuthLayout />;
}
