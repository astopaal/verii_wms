import { api } from '@/lib/axios';
import type {
  SubcontractingOrdersResponse,
  SubcontractingOrderItemsResponse,
  SubcontractingFormData,
  SelectedSubcontractingOrderItem,
  SubcontractingHeadersResponse,
  SubcontractingLinesResponse,
  SubcontractingLineSerialsResponse,
} from '../types/subcontracting';
import { buildSubcontractingIssueRequest, buildSubcontractingReceiptRequest } from '../utils/subcontracting-generate';
import type { ApiResponse } from '@/types/api';

export const subcontractingApi = {
  getReceiptOrdersByCustomer: async (customerCode: string): Promise<SubcontractingOrdersResponse> => {
    const response = await api.get(`/api/SrtFunction/headers/${customerCode}`) as SubcontractingOrdersResponse;
    return response;
  },

  getReceiptOrderItems: async (orderNumbers: string): Promise<SubcontractingOrderItemsResponse> => {
    const response = await api.get(`/api/SrtFunction/lines/${orderNumbers}`) as SubcontractingOrderItemsResponse;
    return response;
  },

  getIssueOrdersByCustomer: async (customerCode: string): Promise<SubcontractingOrdersResponse> => {
    const response = await api.get(`/api/SitFunction/headers/${customerCode}`) as SubcontractingOrdersResponse;
    return response;
  },

  getIssueOrderItems: async (orderNumbers: string): Promise<SubcontractingOrderItemsResponse> => {
    const response = await api.get(`/api/SitFunction/lines/${orderNumbers}`) as SubcontractingOrderItemsResponse;
    return response;
  },

  createSubcontractingIssue: async (
    formData: SubcontractingFormData,
    selectedItems: SelectedSubcontractingOrderItem[]
  ): Promise<ApiResponse<unknown>> => {
    const request = buildSubcontractingIssueRequest(formData, selectedItems);
    const response = await api.post('/api/SitHeader/generate', request) as ApiResponse<unknown>;
    return response;
  },

  createSubcontractingReceipt: async (
    formData: SubcontractingFormData,
    selectedItems: SelectedSubcontractingOrderItem[]
  ): Promise<ApiResponse<unknown>> => {
    const request = buildSubcontractingReceiptRequest(formData, selectedItems);
    const response = await api.post('/api/SrtHeader/generate', request) as ApiResponse<unknown>;
    return response;
  },

  getReceiptHeaders: async (): Promise<SubcontractingHeadersResponse> => {
    const response = await api.get('/api/SrtHeader') as SubcontractingHeadersResponse;
    return response;
  },

  getIssueHeaders: async (): Promise<SubcontractingHeadersResponse> => {
    const response = await api.get('/api/SitHeader') as SubcontractingHeadersResponse;
    return response;
  },

  getReceiptLines: async (headerId: number): Promise<SubcontractingLinesResponse> => {
    const response = await api.get(`/api/SrtLine/header/${headerId}`) as SubcontractingLinesResponse;
    return response;
  },

  getIssueLines: async (headerId: number): Promise<SubcontractingLinesResponse> => {
    const response = await api.get(`/api/SitLine/header/${headerId}`) as SubcontractingLinesResponse;
    return response;
  },

  getReceiptLineSerials: async (lineId: number): Promise<SubcontractingLineSerialsResponse> => {
    const response = await api.get(`/api/SrtLineSerial/line/${lineId}`) as SubcontractingLineSerialsResponse;
    return response;
  },

  getIssueLineSerials: async (lineId: number): Promise<SubcontractingLineSerialsResponse> => {
    const response = await api.get(`/api/SitLineSerial/line/${lineId}`) as SubcontractingLineSerialsResponse;
    return response;
  },
};

