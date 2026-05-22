import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AppShell } from '@/components/layout/AppShell';
import { ProtectedRoute } from './ProtectedRoute';
import { LoginPage } from '@/pages/auth/LoginPage';
import { DashboardPage } from '@/pages/dashboard/DashboardPage';
import { PlaceholderPage } from '@/pages/PlaceholderPage';
import { NotFoundPage } from '@/pages/NotFoundPage';
import InventoryListPage from '@/pages/inventory/InventoryListPage';
import ItemDetailPage from '@/pages/inventory/ItemDetailPage';
import ItemFormPage from '@/pages/inventory/ItemFormPage';
import CategoryListPage from '@/pages/categories/CategoryListPage';
import StorageLocationListPage from '@/pages/storage-locations/StorageLocationListPage';
import VendorListPage from '@/pages/vendors/VendorListPage';
import VendorDetailPage from '@/pages/vendors/VendorDetailPage';
import VendorFormPage from '@/pages/vendors/VendorFormPage';

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

      // Inventory / Items
      { path: 'inventory', element: <InventoryListPage /> },
      { path: 'inventory/new', element: <ItemFormPage /> },
      { path: 'inventory/:id', element: <ItemDetailPage /> },
      { path: 'inventory/:id/edit', element: <ItemFormPage /> },

      // Master Data — categories & storage
      { path: 'categories', element: <CategoryListPage /> },
      { path: 'storage-locations', element: <StorageLocationListPage /> },

      // Vendors
      { path: 'vendors', element: <VendorListPage /> },
      { path: 'vendors/new', element: <VendorFormPage /> },
      { path: 'vendors/:id', element: <VendorDetailPage /> },
      { path: 'vendors/:id/edit', element: <VendorFormPage /> },

      // Placeholder routes for later phases
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
