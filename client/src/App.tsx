import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import LoginPage from '@/pages/Login';
import DashboardPage from '@/pages/Dashboard';
import ForgotPasswordPage from '@/pages/ForgotPassword';
import CedentesPage from '@/pages/Cedentes';
import EsteiraPage from '@/pages/Esteira';
import CalculadoraPage from '@/pages/Calculadora';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />

          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/cedentes" element={<CedentesPage />} />
            <Route path="/esteira" element={<EsteiraPage />} />
            <Route path="/calculadora" element={<CalculadoraPage />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
