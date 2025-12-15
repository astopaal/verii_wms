import { api } from '@/lib/axios';
import type { ApiResponse, PagedParams, PagedResponse } from '@/types/api';
import type { Order, OrderItem, GoodsReceiptFormData, SelectedOrderItem, SelectedStockItem, GrHeader, GrLine, GrImportLine, BulkCreateRequest } from '../types/goods-receipt';
import { erpCommonApi } from '@/services/erp-common-api';
import { buildGoodsReceiptBulkCreateRequest } from '../utils/goods-receipt-create';

export const goodsReceiptApi = {
  getCustomers: erpCommonApi.getCustomers,
  getProjects: erpCommonApi.getProjects,
  getWarehouses: erpCommonApi.getWarehouses,
  getProducts: erpCommonApi.getProducts,

  getOrdersByCustomer: async (customerCode: string): Promise<Order[]> => {
    const response = await api.get(`/api/GoodReciptFunctions/headers/customer/${customerCode}`) as ApiResponse<Order[]>;
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.message || 'Siparişler yüklenemedi');
  },

  getOrderItems: async (customerCode: string, siparisNoCsv: string): Promise<OrderItem[]> => {
    const response = await api.get(`/api/GoodReciptFunctions/lines/customer/${customerCode}/orders/${siparisNoCsv}`) as ApiResponse<OrderItem[]>;
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.message || 'Sipariş kalemleri yüklenemedi');
  },

  createGoodsReceipt: async (formData: GoodsReceiptFormData, selectedItems: (SelectedOrderItem | SelectedStockItem)[], isStockBased: boolean = false): Promise<number> => {
    const request = buildGoodsReceiptBulkCreateRequest(formData, selectedItems, isStockBased);
    const response = await api.post('/api/GrHeader/bulkCreate', request) as ApiResponse<number>;
    if (response.success) {
      return response.data || 0;
    }
    throw new Error(response.message || 'Mal kabul oluşturulamadı');
  },

  getGrHeadersPaged: async (params: PagedParams = {}): Promise<PagedResponse<GrHeader>> => {
    const { pageNumber = 1, pageSize = 10, sortBy = 'Id', sortDirection = 'desc', filters = [] } = params;

    const requestBody = {
      pageNumber,
      pageSize,
      sortBy,
      sortDirection,
      filters,
    };

    const response = await api.post('/api/GrHeader/paged', requestBody) as ApiResponse<PagedResponse<GrHeader>>;
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.message || 'Mal kabul listesi yüklenemedi');
  },

  getGrHeaderById: async (id: number): Promise<GrHeader> => {
    const response = await api.get(`/api/GrHeader/${id}`) as ApiResponse<GrHeader>;
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.message || 'Mal kabul detayı yüklenemedi');
  },

  getGrLines: async (headerId: number): Promise<GrLine[]> => {
    const response = await api.get(`/api/GrLine/by-header/${headerId}`) as ApiResponse<GrLine[]>;
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.message || 'Mal kabul satırları yüklenemedi');
  },

  getGrImportLinesWithRoutes: async (headerId: number): Promise<GrImportLine[]> => {
    const response = await api.get(`/api/GrImportL/by-header-with-routes/${headerId}`) as ApiResponse<GrImportLine[]>;
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.message || 'Mal kabul içerik satırları yüklenemedi');
  },
};
