import { createBrowserRouter } from 'react-router-dom';
import { ProtectedRoute } from '@/components/shared/ProtectedRoute';
import { MainLayout } from '@/components/shared/MainLayout';

// Layouts
import AuthLayout from '@/layouts/AuthLayout';

// Pages
import { LoginPage } from '@/features/auth';
import { DashboardPage } from '@/features/dashboard';
import {
  GoodsReceiptCreatePage,
  GoodsReceiptListPage,
} from '@/features/goods-receipt';
// import { InventoryPage } from '@/features/inventory';

export const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <MainLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <DashboardPage />,
      },
      {
        path: 'goods-receipt',
        children: [
          {
            path: 'create',
            element: <GoodsReceiptCreatePage />,
          },
          {
            path: 'list',
            element: <GoodsReceiptListPage />,
          },
        ],
      },
      // {
      //   path: 'inventory',
      //   element: <InventoryPage />,
      // },
    ],
  },
  {
    path: '/auth',
    element: <AuthLayout />,
    children: [
      {
        path: 'login',
        element: <LoginPage />,
      },
    ],
  },
]);

