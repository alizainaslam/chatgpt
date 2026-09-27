import { Navigate, Route, Routes } from "react-router-dom";

import { Home, Login, Signup } from "../pages";

const getAuthCookie = () => {
  const cookies = document.cookie.split(";");

  const authCookieNames = ["token"];

  return cookies.some((cookie) => {
    const [name, value] = cookie.trim().split("=");
    return authCookieNames.includes(name) && value && value !== "undefined";
  });
};

const isAuthenticated = () => getAuthCookie();

const ProtectedRoute = ({ children }: { children: any }) => {
  return isAuthenticated() ? children : <Navigate to="/login" replace />;
};

const PublicRoute = ({ children }: { children: any }) => {
  return isAuthenticated() ? <Navigate to="/" replace /> : children;
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        }
      />

      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />

      <Route
        path="/signup"
        element={
          <PublicRoute>
            <Signup />
          </PublicRoute>
        }
      />

      <Route
        path="*"
        element={<Navigate to={isAuthenticated() ? "/" : "/login"} replace />}
      />
    </Routes>
  );
};

export default AppRoutes;
