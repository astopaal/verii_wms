import { api } from '@/lib/axios';
import type {
  ShipmentOrdersResponse,
  ShipmentOrderItemsResponse,
  ShipmentFormData,
  SelectedShipmentOrderItem,
  ShipmentHeadersResponse,
  ShipmentLinesResponse,
  ShipmentLineSerialsResponse,
} from '../types/shipment';
import { buildShipmentGenerateRequest } from '../utils/shipment-generate';
import type { ApiResponse } from '@/types/api';

export const shipmentApi = {
  getOrdersByCustomer: async (customerCode: string): Promise<ShipmentOrdersResponse> => {
    const response = await api.get(`/api/ShFunction/headers/${customerCode}`) as ShipmentOrdersResponse;
    return response;
  },

  getOrderItems: async (orderNumbers: string): Promise<ShipmentOrderItemsResponse> => {
    const response = await api.get(`/api/ShFunction/lines/${orderNumbers}`) as ShipmentOrderItemsResponse;
    return response;
  },

  getHeaders: async (): Promise<ShipmentHeadersResponse> => {
    const response = await api.get('/api/ShHeader') as ShipmentHeadersResponse;
    return response;
  },

  getLines: async (headerId: number): Promise<ShipmentLinesResponse> => {
    const response = await api.get(`/api/ShLine/header/${headerId}`) as ShipmentLinesResponse;
    return response;
  },

  getLineSerials: async (lineId: number): Promise<ShipmentLineSerialsResponse> => {
    const response = await api.get(`/api/ShLineSerial/line/${lineId}`) as ShipmentLineSerialsResponse;
    return response;
  },

  createShipment: async (
    formData: ShipmentFormData,
    selectedItems: SelectedShipmentOrderItem[],
  ): Promise<ApiResponse<unknown>> => {
    const request = buildShipmentGenerateRequest(formData, selectedItems);
    const response = await api.post('/api/ShHeader/generate', request) as ApiResponse<unknown>;
    return response;
  },
};
