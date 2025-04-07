// src/components/ProtectedRoute.tsx
import React, { useContext } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { AuthContext, User } from "../context/AuthContext";

interface ProtectedRouteProps {
  // Optionally, provide a list of allowed roles
  allowedRoles?: string[];
}

const ProtectedRoute = ({ allowedRoles }: ProtectedRouteProps) => {
  const auth = useContext(AuthContext);

  if (!auth || !auth.user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && allowedRoles.length > 0) {
    if (!auth.user.role || !allowedRoles.includes(auth.user.role)) {
      return <div style={{ textAlign: "center", marginTop: "2rem" }}>Access Denied</div>;
    }
  }

  return <Outlet />;
};

export default ProtectedRoute;
