import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AppShell } from '@/components/layout/AppShell';
import { ProtectedRoute } from './ProtectedRoute';
import { LoginPage } from '@/pages/auth/LoginPage';
import { DashboardPage } from '@/pages/dashboard/DashboardPage';
import { PlaceholderPage } from '@/pages/PlaceholderPage';
import { NotFoundPage } from '@/pages/NotFoundPage';

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <AppShell />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },
      { path: 'dashboard', element: <DashboardPage /> },
      { path: 'inventory', element: <PlaceholderPage /> },
      { path: 'vendors', element: <PlaceholderPage /> },
      { path: 'procurement', element: <PlaceholderPage /> },
      { path: 'approvals', element: <PlaceholderPage /> },
      { path: 'stock-ops', element: <PlaceholderPage /> },
      { path: 'finance', element: <PlaceholderPage /> },
      { path: 'reports', element: <PlaceholderPage /> },
      { path: 'settings', element: <PlaceholderPage /> },
    ],
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
]);
