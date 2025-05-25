import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import type { JSX } from "react";


export function PrivateRoute({ children }: { children: JSX.Element }) {
  const { isAuthenticated } = useAuth();
  
  // Renderiza se autenticado, redireciona para raiz se não
  return isAuthenticated ? children : <Navigate to="/" />;
}