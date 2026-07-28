// src/core/App.jsx
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../features/auth";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { appRoutes } from "./routes/routeConfig";
import { LoginPage } from "../features/auth";
import { RoleGuard } from "@/shared/components/layout";
function App() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-slate-900">
      <ToastContainer position="top-right" autoClose={3000} theme="dark" />

      <Routes>
        {/* Route Publique : Connexion */}
        <Route
          path="/login"
          element={!user ? <LoginPage /> : <Navigate to="/dashboard" replace />}
        />
        {appRoutes.map((route) => (
          <Route
            key={route.path}
            element={
              <RoleGuard requiredPermission={route.requiredPermission} />
            }
          >
            <Route path={route.path} element={route.element} />
          </Route>
        ))}
        <Route
          path="*"
          element={<Navigate to={user ? "/dashboard" : "/login"} replace />}
        />
      </Routes>
    </div>
  );
}

export default App;
