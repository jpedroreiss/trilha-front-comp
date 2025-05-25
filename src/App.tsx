import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoginPage from "./pages/Login";
import './App.css'
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Dashboard from "./pages/Dashboard";
import { PrivateRoute } from "./components/PrivateRoute";
import { AuthProvider } from "./components/AuthContext";
import NewMembers from "./pages/NewMembers";
import Budget from "./pages/Budget";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/recuperar-senha" element={<ForgotPassword />} />
        <Route path="/redefinir-senha" element={<ResetPassword />} />
        <Route path="/dashboard" element={  <PrivateRoute>
            <Dashboard />
          </PrivateRoute> } />
           <Route path="/dashboard-membros" element={  <PrivateRoute>
            <NewMembers />
          </PrivateRoute> } />
          <Route path="/dashboard-orcamento" element={  <PrivateRoute>
            <Budget />
          </PrivateRoute> } />
      </Routes>
    </BrowserRouter>
    </AuthProvider>
  );
}

export default App
