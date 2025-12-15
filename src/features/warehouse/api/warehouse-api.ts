import { api } from '@/lib/axios';
import type {
  WarehouseOrdersResponse,
  WarehouseOrderItemsResponse,
  WarehouseFormData,
  SelectedWarehouseOrderItem,
  WarehouseHeadersResponse,
  WarehouseLinesResponse,
  WarehouseLineSerialsResponse,
} from '../types/warehouse';
import { buildWarehouseInboundRequest, buildWarehouseOutboundRequest } from '../utils/warehouse-generate';
import type { ApiResponse } from '@/types/api';

export const warehouseApi = {
  getInboundOrdersByCustomer: async (customerCode: string): Promise<WarehouseOrdersResponse> => {
    const response = await api.get(`/api/WiFunction/headers/${customerCode}`) as WarehouseOrdersResponse;
    return response;
  },

  getInboundOrderItems: async (orderNumbers: string): Promise<WarehouseOrderItemsResponse> => {
    const response = await api.get(`/api/WiFunction/lines/${orderNumbers}`) as WarehouseOrderItemsResponse;
    return response;
  },

  getOutboundOrdersByCustomer: async (customerCode: string): Promise<WarehouseOrdersResponse> => {
    const response = await api.get(`/api/WoFunction/headers/${customerCode}`) as WarehouseOrdersResponse;
    return response;
  },

  getOutboundOrderItems: async (orderNumbers: string): Promise<WarehouseOrderItemsResponse> => {
    const response = await api.get(`/api/WoFunction/lines/${orderNumbers}`) as WarehouseOrderItemsResponse;
    return response;
  },

  createWarehouseInbound: async (
    formData: WarehouseFormData,
    selectedItems: SelectedWarehouseOrderItem[]
  ): Promise<ApiResponse<unknown>> => {
    const request = buildWarehouseInboundRequest(formData, selectedItems);
    const response = await api.post('/api/WiHeader/generate', request) as ApiResponse<unknown>;
    return response;
  },

  createWarehouseOutbound: async (
    formData: WarehouseFormData,
    selectedItems: SelectedWarehouseOrderItem[]
  ): Promise<ApiResponse<unknown>> => {
    const request = buildWarehouseOutboundRequest(formData, selectedItems);
    const response = await api.post('/api/WoHeader/generate', request) as ApiResponse<unknown>;
    return response;
  },

  getInboundHeaders: async (): Promise<WarehouseHeadersResponse> => {
    const response = await api.get('/api/WiHeader') as WarehouseHeadersResponse;
    return response;
  },

  getOutboundHeaders: async (): Promise<WarehouseHeadersResponse> => {
    const response = await api.get('/api/WoHeader') as WarehouseHeadersResponse;
    return response;
  },

  getInboundLines: async (headerId: number): Promise<WarehouseLinesResponse> => {
    const response = await api.get(`/api/WiLine/header/${headerId}`) as WarehouseLinesResponse;
    return response;
  },

  getOutboundLines: async (headerId: number): Promise<WarehouseLinesResponse> => {
    const response = await api.get(`/api/WoLine/header/${headerId}`) as WarehouseLinesResponse;
    return response;
  },

  getInboundLineSerials: async (lineId: number): Promise<WarehouseLineSerialsResponse> => {
    const response = await api.get(`/api/WiLineSerial/line/${lineId}`) as WarehouseLineSerialsResponse;
    return response;
  },

  getOutboundLineSerials: async (lineId: number): Promise<WarehouseLineSerialsResponse> => {
    const response = await api.get(`/api/WoLineSerial/line/${lineId}`) as WarehouseLineSerialsResponse;
    return response;
  },
};

