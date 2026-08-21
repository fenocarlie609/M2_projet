import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./features/auth";
import { NotificationProvider } from "@/features/notifications";
import App from "./core/App";
import "./index.css";

// 1. Importation du registre PWA
// import { registerSW } from "virtual:pwa-register";

// 2. Activation immédiate du Service Worker
// registerSW({ immediate: true });

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <NotificationProvider>
          <App />
        </NotificationProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
