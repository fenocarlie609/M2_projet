import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../features/auth";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { appRoutes } from "./routes/routeConfig";
import { LoginPage } from "../features/auth";

const ProtectedLayout = ({ user }) => {
  if (!user) return <Navigate to="/login" replace />;
  return <Outlet />;
};

const AdminLayout = ({ user }) => {
  const hasAdminAccess = ["ADMIN", "SUPERADMIN"].includes(user?.role);
  if (!hasAdminAccess) return <Navigate to="/dashboard" replace />;
  return <Outlet />;
};

const SuperAdminLayout = ({ user }) => {
  const isSuperAdmin = user?.role === "SUPERADMIN";
  if (!isSuperAdmin) return <Navigate to="/dashboard" replace />;
  return <Outlet />;
};

function App() {
  const { user } = useContext(AuthContext);

  return (
    <div className="min-h-screen bg-nano-dark">
      <ToastContainer position="top-right" autoClose={3000} theme="dark" />

      <Routes>
        <Route
          path="/login"
          element={!user ? <LoginPage /> : <Navigate to="/dashboard" replace />}
        />

        <Route element={<ProtectedLayout user={user} />}>
          {appRoutes
            .filter((route) => route.access === "protected")
            .map((route) => (
              <Route
                key={route.path}
                path={route.path}
                element={route.element}
              />
            ))}

          <Route element={<AdminLayout user={user} />}>
            {appRoutes
              .filter((route) => route.access === "admin")
              .map((route) => (
                <Route
                  key={route.path}
                  path={route.path}
                  element={route.element}
                />
              ))}
          </Route>

          <Route element={<SuperAdminLayout user={user} />}>
            {appRoutes
              .filter((route) => route.access === "superadmin")
              .map((route) => (
                <Route
                  key={route.path}
                  path={route.path}
                  element={route.element}
                />
              ))}
          </Route>
        </Route>

        <Route
          path="*"
          element={<Navigate to={user ? "/dashboard" : "/login"} replace />}
        />
      </Routes>
    </div>
  );
}

export default App;
