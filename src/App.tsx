/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { Shell } from './components/layout/Shell';
import Login from './pages/Login';
import AdminDashboard from './pages/admin/Dashboard';
import AdminEventos from './pages/admin/Eventos';
import AdminParticipantes from './pages/admin/Participantes';
import AdminAReceber from './pages/admin/AReceber';
import OrganizadorDashboard from './pages/organizador/Dashboard';
import OrganizadorEventos from './pages/organizador/Eventos';
import OrganizadorParticipantes from './pages/organizador/Participantes';
import OrganizadorRelatorios from './pages/organizador/Relatorios';
import LeitorQRPage from './pages/organizador/LeitorQR';
import TotemPage from './pages/totem/TotemPage';
import DeliveryPanelPage from './pages/DeliveryPanel';

function AppRoutes() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-900">
        <div className="text-center">
           <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
           <p className="text-neutral-400 font-mono text-sm tracking-widest uppercase">Inicializando reirakits...</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/totem/:slug" element={<TotemPage />} />
      <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
      <Route
        path="/*"
        element={
          user ? (
            <Shell>
              <Routes>
                <Route
                  path="/"
                  element={
                    user.tipo === 'ADMIN' ? (
                      <Navigate to="/admin/dashboard" />
                    ) : (
                      <Navigate to="/organizador/dashboard" />
                    )
                  }
                />
                <Route path="/admin/dashboard" element={user.tipo === 'ADMIN' ? <AdminDashboard /> : <Navigate to="/" />} />
                <Route path="/admin/eventos" element={user.tipo === 'ADMIN' ? <AdminEventos /> : <Navigate to="/" />} />
                <Route path="/admin/eventos/:id/participantes" element={user.tipo === 'ADMIN' ? <AdminParticipantes /> : <Navigate to="/" />} />
                <Route path="/admin/a-receber" element={user.tipo === 'ADMIN' ? <AdminAReceber /> : <Navigate to="/" />} />
                
                <Route path="/organizador/dashboard" element={user.tipo === 'ORGANIZADOR' ? <OrganizadorDashboard /> : <Navigate to="/" />} />
                <Route path="/organizador/eventos" element={user.tipo === 'ORGANIZADOR' ? <OrganizadorEventos /> : <Navigate to="/" />} />
                <Route path="/organizador/eventos/:id/participantes" element={user.tipo === 'ORGANIZADOR' ? <OrganizadorParticipantes /> : <Navigate to="/" />} />
                <Route path="/organizador/relatorios" element={user.tipo === 'ORGANIZADOR' ? <OrganizadorRelatorios /> : <Navigate to="/" />} />
                <Route path="/organizador/leitor-qr" element={user.tipo === 'ORGANIZADOR' ? <LeitorQRPage /> : <Navigate to="/" />} />
                
                <Route path="/painel-entrega" element={<DeliveryPanelPage />} />
                
                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
            </Shell>
          ) : (
            <Navigate to="/login" />
          )
        }
      />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}
