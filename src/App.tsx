import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './auth/AuthContext';
import ProtectedRoute from './auth/ProtectedRoute';
import { PortalProvider } from './context/PortalContext';
import { TaskProvider } from './context/TaskContext';
import { DashboardLayout } from './layouts/DashboardLayout';

// Auth pages
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';

// App pages
import { LandingPage } from './pages/LandingPage';
import { AgencyDashboard } from './pages/AgencyDashboard';
import { CreateProjectPage } from './pages/CreateProjectPage';
import { DeliverablesPage } from './pages/DeliverablesPage';
import { NotificationsPage } from './pages/NotificationsPage';
import { SettingsPage } from './pages/SettingsPage';
import { ClientDashboard } from './pages/ClientDashboard';
import { ProjectDetailsPage } from './pages/ProjectDetailsPage';
import { ProjectsListPage } from './pages/ProjectsListPage';
import { AssignTaskPage } from './pages/AssignTaskPage';
import { TaskManagementPage } from './pages/TaskManagementPage';
import { ClientTasksPage } from './pages/ClientTasksPage';

export default function App() {
  return (
    <AuthProvider>
      <PortalProvider>
        <TaskProvider>
          <BrowserRouter>
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: 'rgba(15,23,42,0.95)',
                color: '#E2E8F0',
                border: '1px solid rgba(99,102,241,0.3)',
                borderRadius: '12px',
                fontSize: '13px',
              },
            }}
          />
          <Routes>
            {/* Public */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />

            {/* Protected */}
            <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
              <Route path="/agency" element={<AgencyDashboard />} />
              <Route path="/create-project" element={<CreateProjectPage />} />
              <Route path="/client" element={<ClientDashboard />} />
              <Route path="/projects" element={<ProjectsListPage />} />
              <Route path="/projects/:id" element={<ProjectDetailsPage />} />
              <Route path="/deliverables" element={<DeliverablesPage />} />
              <Route path="/notifications" element={<NotificationsPage />} />
              <Route path="/assign-task" element={<AssignTaskPage />} />
              <Route path="/task-management" element={<TaskManagementPage />} />
              <Route path="/my-tasks" element={<ClientTasksPage />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          </BrowserRouter>
        </TaskProvider>
      </PortalProvider>
    </AuthProvider>
  );
}
