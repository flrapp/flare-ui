import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './providers/ProtectedRoute';
import { LoginPage } from '@/pages/login/LoginPage';
import { ProjectsPage } from '@/pages/projects/ProjectsPage';
import { ProjectDetailPage } from '@/pages/project-detail/ProjectDetailPage';
import { ScopesPage } from '@/pages/scopes/ScopesPage';
import { FlagsPage } from '@/pages/flags/FlagsPage';
import { UsersPage } from '@/pages/users/UsersPage';
import { GlobalUsersPage } from '@/pages/global-users/GlobalUsersPage';

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/projects" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/projects"
        element={
          <ProtectedRoute>
            <ProjectsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/projects/:projectId"
        element={
          <ProtectedRoute>
            <ProjectDetailPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/projects/:projectId/scopes"
        element={
          <ProtectedRoute>
            <ScopesPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/projects/:projectId/flags"
        element={
          <ProtectedRoute>
            <FlagsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/projects/:projectId/users"
        element={
          <ProtectedRoute>
            <UsersPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/users"
        element={
          <ProtectedRoute>
            <GlobalUsersPage />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}
