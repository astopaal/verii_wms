import { api } from '@/lib/axios';
import type { Customer, Order, OrderItem } from '../types/goods-receipt';

export const goodsReceiptApi = {
  getCustomers: async (): Promise<Customer[]> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([
          { id: '1', name: 'ABC Ticaret Ltd.', code: 'ABC001' },
          { id: '2', name: 'XYZ Sanayi A.Ş.', code: 'XYZ002' },
          { id: '3', name: 'DEF Gıda Ltd.', code: 'DEF003' },
        ]);
      }, 500);
    });
  },

  getOrdersByCustomer: async (customerId: string): Promise<Order[]> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([
          {
            id: '1',
            orderNo: 'SIP-2024-001',
            orderDate: '2024-01-15',
            totalAmount: 15000,
            status: 'Beklemede',
          },
          {
            id: '2',
            orderNo: 'SIP-2024-002',
            orderDate: '2024-01-20',
            totalAmount: 25000,
            status: 'Kısmen Teslim',
          },
          {
            id: '3',
            orderNo: 'SIP-2024-003',
            orderDate: '2024-01-25',
            totalAmount: 18000,
            status: 'Beklemede',
          },
        ]);
      }, 500);
    });
  },

  getOrderItems: async (orderId: string): Promise<OrderItem[]> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([
          {
            id: '1',
            productCode: 'PRD-001',
            productName: 'Ürün 1',
            quantity: 100,
            unit: 'Adet',
            unitPrice: 50,
            totalPrice: 5000,
          },
          {
            id: '2',
            productCode: 'PRD-002',
            productName: 'Ürün 2',
            quantity: 50,
            unit: 'Adet',
            unitPrice: 100,
            totalPrice: 5000,
          },
          {
            id: '3',
            productCode: 'PRD-003',
            productName: 'Ürün 3',
            quantity: 200,
            unit: 'Adet',
            unitPrice: 25,
            totalPrice: 5000,
          },
        ]);
      }, 500);
    });
  },

  createGoodsReceipt: async (data: unknown): Promise<{ id: string }> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ id: 'GR-' + Date.now() });
      }, 1000);
    });
  },
};

