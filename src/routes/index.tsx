import { createBrowserRouter } from 'react-router-dom';
import { ProtectedRoute } from '@/components/shared/ProtectedRoute';
import { MainLayout } from '@/components/shared/MainLayout';
import AuthLayout from '@/layouts/AuthLayout';
import { LoginPage } from '@/features/auth';
import { DashboardPage } from '@/features/dashboard';
import {
  GoodsReceiptCreatePage,
  GoodsReceiptListPage,
  AssignedGrListPage,
  GoodsReceiptCollectionPage,
} from '@/features/goods-receipt';
import {
  TransferCreatePage,
  TransferListPage,
  AssignedTransferListPage,
  TransferCollectionPage,
  CollectedBarcodesPage,
} from '@/features/transfer';
import {
  SubcontractingIssueCreatePage,
  SubcontractingReceiptCreatePage,
  SubcontractingReceiptListPage,
  SubcontractingIssueListPage,
  AssignedSitListPage,
  AssignedSrtListPage,
  SitCollectionPage,
  SrtCollectionPage,
} from '@/features/subcontracting';
import {
  WarehouseInboundCreatePage,
  WarehouseOutboundCreatePage,
  WarehouseInboundListPage,
  WarehouseOutboundListPage,
  AssignedWarehouseInboundListPage,
  AssignedWarehouseOutboundListPage,
} from '@/features/warehouse';
import { ShipmentCreatePage, ShipmentListPage, AssignedShipmentListPage, ShipmentCollectionPage } from '@/features/shipment';
import { Warehouse3dPage } from '@/features/inventory/3d-warehouse';

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
          {
            path: 'assigned',
            element: <AssignedGrListPage />,
          },
          {
            path: 'collection/:headerId',
            element: <GoodsReceiptCollectionPage />,
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
          {
            path: 'assigned',
            element: <AssignedTransferListPage />,
          },
          {
            path: 'collection/:headerId',
            element: <TransferCollectionPage />,
          },
          {
            path: 'collected/:headerId',
            element: <CollectedBarcodesPage />,
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
              {
                path: 'assigned',
                element: <AssignedSitListPage />,
              },
              {
                path: 'collection/:headerId',
                element: <SitCollectionPage />,
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
              {
                path: 'assigned',
                element: <AssignedSrtListPage />,
              },
              {
                path: 'collection/:headerId',
                element: <SrtCollectionPage />,
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
              {
                path: 'assigned',
                element: <AssignedWarehouseInboundListPage />,
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
              {
                path: 'assigned',
                element: <AssignedWarehouseOutboundListPage />,
              },
            ],
          },
        ],
      },
      {
        path: 'shipment',
        children: [
          {
            path: 'create',
            element: <ShipmentCreatePage />,
          },
          {
            path: 'list',
            element: <ShipmentListPage />,
          },
          {
            path: 'assigned',
            element: <AssignedShipmentListPage />,
          },
          {
            path: 'collection/:headerId',
            element: <ShipmentCollectionPage />,
          },
        ],
      },
      {
        path: 'inventory',
        children: [
          {
            path: '3d-warehouse',
            element: <Warehouse3dPage />,
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
