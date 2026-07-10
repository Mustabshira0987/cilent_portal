import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { PortalProvider } from './context/PortalContext';
import { DashboardLayout } from './layouts/DashboardLayout';
import { useAuth } from './hooks/useAuth';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  return user ? <>{children}</> : <Navigate to="/login" replace />;
};

// Pages import
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { AgencyDashboard } from './pages/AgencyDashboard';
import { CreateProjectPage } from './pages/CreateProjectPage';
import { DeliverablesPage } from './pages/DeliverablesPage';
import { NotificationsPage } from './pages/NotificationsPage';
import { SettingsPage } from './pages/SettingsPage';
import { ClientDashboard } from './pages/ClientDashboard';
import { ProjectDetailsPage } from './pages/ProjectDetailsPage';
import { ProjectsListPage } from './pages/ProjectsListPage';

export default function App() {
  return (
    <PortalProvider>
      <BrowserRouter>
        <Routes>
          {/* Guest routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />

          {/* Connected Authenticated Portal Layout */}
          <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
            {/* Agency specific sub-routes */}
            <Route path="/agency" element={<AgencyDashboard />} />
            <Route path="/create-project" element={<CreateProjectPage />} />
            
            {/* Client specific dashboard */}
            <Route path="/client" element={<ClientDashboard />} />

            {/* Shared workspace utilities */}
            <Route path="/projects" element={<ProjectsListPage />} />
            <Route path="/projects/:id" element={<ProjectDetailsPage />} />
            <Route path="/deliverables" element={<DeliverablesPage />} />
            <Route path="/notifications" element={<NotificationsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>

          {/* Catch-all fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </PortalProvider>
  );
}
