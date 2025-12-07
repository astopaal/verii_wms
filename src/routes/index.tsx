import { createBrowserRouter } from 'react-router-dom';
import { ProtectedRoute } from '@/components/shared/ProtectedRoute';
import { MainLayout } from '@/components/shared/MainLayout';
import AuthLayout from '@/layouts/AuthLayout';
import { LoginPage } from '@/features/auth';
import { DashboardPage } from '@/features/dashboard';
import {
  GoodsReceiptCreatePage,
  GoodsReceiptListPage,
} from '@/features/goods-receipt';
import {
  TransferCreatePage,
  TransferListPage,
} from '@/features/transfer';
import {
  SubcontractingIssueCreatePage,
  SubcontractingReceiptCreatePage,
  SubcontractingReceiptListPage,
  SubcontractingIssueListPage,
} from '@/features/subcontracting';
import {
  WarehouseInboundCreatePage,
  WarehouseOutboundCreatePage,
  WarehouseInboundListPage,
  WarehouseOutboundListPage,
} from '@/features/warehouse';

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
      {
        path: 'transfer',
        children: [
          {
            path: 'create',
            element: <TransferCreatePage />,
          },
          {
            path: 'list',
            element: <TransferListPage />,
          },
        ],
      },
      {
        path: 'subcontracting',
        children: [
          {
            path: 'issue',
            children: [
              {
                path: 'create',
                element: <SubcontractingIssueCreatePage />,
              },
              {
                path: 'list',
                element: <SubcontractingIssueListPage />,
              },
            ],
          },
          {
            path: 'receipt',
            children: [
              {
                path: 'create',
                element: <SubcontractingReceiptCreatePage />,
              },
              {
                path: 'list',
                element: <SubcontractingReceiptListPage />,
              },
            ],
          },
        ],
      },
      {
        path: 'warehouse',
        children: [
          {
            path: 'inbound',
            children: [
              {
                path: 'create',
                element: <WarehouseInboundCreatePage />,
              },
              {
                path: 'list',
                element: <WarehouseInboundListPage />,
              },
            ],
          },
          {
            path: 'outbound',
            children: [
              {
                path: 'create',
                element: <WarehouseOutboundCreatePage />,
              },
              {
                path: 'list',
                element: <WarehouseOutboundListPage />,
              },
            ],
          },
        ],
      },
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

