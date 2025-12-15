import { api } from '@/lib/axios';
import type {
  TransferOrdersResponse,
  TransferOrderItemsResponse,
  TransferFormData,
  SelectedTransferOrderItem,
  SelectedTransferStockItem,
  TransferHeadersResponse,
  TransferLinesResponse,
  TransferLineSerialsResponse,
  AssignedTransferOrderLinesResponse,
} from '../types/transfer';
import { buildTransferGenerateRequest } from '../utils/transfer-generate';
import type { ApiResponse } from '@/types/api';

export const transferApi = {
  getOrdersByCustomer: async (customerCode: string): Promise<TransferOrdersResponse> => {
    const response = await api.get(`/api/WtFunction/headers/${customerCode}`) as TransferOrdersResponse;
    return response;
  },

  getOrderItems: async (orderNumbers: string): Promise<TransferOrderItemsResponse> => {
    const response = await api.get(`/api/WtFunction/lines/${orderNumbers}`) as TransferOrderItemsResponse;
    return response;
  },

  getAssignedHeaders: async (userId: number): Promise<TransferHeadersResponse> => {
    const response = await api.get(`/api/WtHeader/assigned/${userId}`) as TransferHeadersResponse;
    return response;
  },

  getAssignedOrderLines: async (headerId: number): Promise<AssignedTransferOrderLinesResponse> => {
    const response = await api.get(`/api/WtHeader/getAssignedTransferOrderLines/${headerId}`) as AssignedTransferOrderLinesResponse;
    return response;
  },

  createTransfer: async (
    formData: TransferFormData,
    selectedItems: (SelectedTransferOrderItem | SelectedTransferStockItem)[],
    isFreeTransfer: boolean
  ): Promise<ApiResponse<unknown>> => {
    const request = buildTransferGenerateRequest(formData, selectedItems, isFreeTransfer);
    const response = await api.post('/api/WtHeader/generate', request) as ApiResponse<unknown>;
    return response;
  },

  getHeaders: async (): Promise<TransferHeadersResponse> => {
    const response = await api.get('/api/WtHeader') as TransferHeadersResponse;
    return response;
  },

  getLines: async (headerId: number): Promise<TransferLinesResponse> => {
    const response = await api.get(`/api/WtLine/header/${headerId}`) as TransferLinesResponse;
    return response;
  },

  getLineSerials: async (lineId: number): Promise<TransferLineSerialsResponse> => {
    const response = await api.get(`/api/WtLineSerial/line/${lineId}`) as TransferLineSerialsResponse;
    return response;
  },
};