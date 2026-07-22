// src/core/App.jsx
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../features/auth"; // Utilisation de ton hook personnalisé[cite: 11]
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { appRoutes } from "./routes/routeConfig"; //
import { LoginPage } from "../features/auth"; //[cite: 10]
import { RoleGuard } from "@/shared/components/layout"; // Import direct depuis l'alias défini dans vite.config.js[cite: 10]

function App() {
  const { user } = useAuth(); // Ton hook gère déjà le chargement et le state global[cite: 11]

  return (
    <div className="min-h-screen bg-slate-900">
      <ToastContainer position="top-right" autoClose={3000} theme="dark" />

      <Routes>
        {/* Route Publique : Connexion */}
        <Route
          path="/login"
          element={!user ? <LoginPage /> : <Navigate to="/dashboard" replace />}
        />

        {/* ⚡ Orchestration dynamique de toutes les routes de l'application */}
        {appRoutes.map((route) => (
          <Route
            key={route.path}
            // On passe l'objet de droit requis défini dans routeConfig
            element={
              <RoleGuard requiredPermission={route.requiredPermission} />
            }
          >
            <Route path={route.path} element={route.element} />
          </Route>
        ))}

        {/* Redirection globale pour les URL inconnues */}
        <Route
          path="*"
          element={<Navigate to={user ? "/dashboard" : "/login"} replace />}
        />
      </Routes>
    </div>
  );
}

export default App;
