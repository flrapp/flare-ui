import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './providers/ProtectedRoute';
import { LoginPage } from '@/pages/login/LoginPage';
import { ProjectsPage } from '@/pages/projects/ProjectsPage';
import { ProjectDetailPage } from '@/pages/project-detail/ProjectDetailPage';
import { ScopesPage } from '@/pages/scopes/ScopesPage';
import { FlagEditPage } from '@/pages/flag-edit/FlagEditPage';
import { UsersPage } from '@/pages/users/UsersPage';
import { ProjectSettingsPage } from '@/pages/project-settings/ProjectSettingsPage';
import { GlobalUsersPage } from '@/pages/global-users/GlobalUsersPage';
import { SegmentsPage } from '@/pages/segments/SegmentsPage';
import { SegmentDetailPage } from '@/pages/segment-detail/SegmentDetailPage';

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
        path="/projects/:projectId/settings"
        element={
          <ProtectedRoute>
            <ProjectSettingsPage />
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
        path="/projects/:projectId/flags/:flagId/edit"
        element={
          <ProtectedRoute>
            <FlagEditPage />
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
        path="/projects/:projectId/segments"
        element={
          <ProtectedRoute>
            <SegmentsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/projects/:projectId/segments/:segmentId"
        element={
          <ProtectedRoute>
            <SegmentDetailPage />
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
