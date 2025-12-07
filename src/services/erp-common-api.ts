import { api } from '@/lib/axios';
import type { ApiResponse } from '@/types/api';
import type { Customer, Project, Warehouse, Product } from '@/features/goods-receipt/types/goods-receipt';

export const erpCommonApi = {
  getCustomers: async (): Promise<Customer[]> => {
    const response = await api.get('/api/Erp/getAllCustomers') as ApiResponse<Customer[]>;
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.message || 'Cariler yüklenemedi');
  },

  getProjects: async (): Promise<Project[]> => {
    const response = await api.get('/api/Erp/getAllProjects') as ApiResponse<Project[]>;
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.message || 'Projeler yüklenemedi');
  },

  getWarehouses: async (depoKodu?: number): Promise<Warehouse[]> => {
    const url = depoKodu 
      ? `/api/Erp/getAllWarehouses?depoKodu=${depoKodu}`
      : '/api/Erp/getAllWarehouses';
    const response = await api.get(url) as ApiResponse<Warehouse[]>;
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.message || 'Depolar yüklenemedi');
  },

  getProducts: async (): Promise<Product[]> => {
    const response = await api.get('/api/Erp/getAllProducts') as ApiResponse<Product[]>;
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.message || 'Stoklar yüklenemedi');
  },
};

