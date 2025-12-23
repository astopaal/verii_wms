import { api } from '@/lib/axios';
import type {
  SubcontractingOrdersResponse,
  SubcontractingOrderItemsResponse,
  SubcontractingFormData,
  SelectedSubcontractingOrderItem,
  SubcontractingHeadersResponse,
  SubcontractingLinesResponse,
  SubcontractingLineSerialsResponse,
  AssignedSubcontractingOrderLinesResponse,
  StokBarcodeResponse,
  AddBarcodeRequest,
  AddBarcodeResponse,
  CollectedBarcodesResponse,
} from '../types/subcontracting';
import { buildSubcontractingIssueRequest, buildSubcontractingReceiptRequest } from '../utils/subcontracting-generate';
import type { ApiResponse } from '@/types/api';

export const subcontractingApi = {
  getReceiptOrdersByCustomer: async (customerCode: string): Promise<SubcontractingOrdersResponse> => {
    return await api.get<SubcontractingOrdersResponse>(`/api/SrtFunction/headers/${customerCode}`);
  },

  getReceiptOrderItems: async (orderNumbers: string): Promise<SubcontractingOrderItemsResponse> => {
    return await api.get<SubcontractingOrderItemsResponse>(`/api/SrtFunction/lines/${orderNumbers}`);
  },

  getIssueOrdersByCustomer: async (customerCode: string): Promise<SubcontractingOrdersResponse> => {
    return await api.get<SubcontractingOrdersResponse>(`/api/SitFunction/headers/${customerCode}`);
  },

  getIssueOrderItems: async (orderNumbers: string): Promise<SubcontractingOrderItemsResponse> => {
    return await api.get<SubcontractingOrderItemsResponse>(`/api/SitFunction/lines/${orderNumbers}`);
  },

  getAssignedSitHeaders: async (userId: number): Promise<SubcontractingHeadersResponse> => {
    return await api.get<SubcontractingHeadersResponse>(`/api/SitHeader/assigned/${userId}`);
  },

  getAssignedSrtHeaders: async (userId: number): Promise<SubcontractingHeadersResponse> => {
    return await api.get<SubcontractingHeadersResponse>(`/api/SrtHeader/assigned/${userId}`);
  },

  getAssignedSitOrderLines: async (headerId: number): Promise<AssignedSubcontractingOrderLinesResponse> => {
    return await api.get<AssignedSubcontractingOrderLinesResponse>(`/api/SitHeader/getAssignedOrderLines/${headerId}`);
  },

  getAssignedSrtOrderLines: async (headerId: number): Promise<AssignedSubcontractingOrderLinesResponse> => {
    return await api.get<AssignedSubcontractingOrderLinesResponse>(`/api/SrtHeader/getAssignedOrderLines/${headerId}`);
  },

  getStokBarcode: async (barcode: string, barcodeGroup: string = '1'): Promise<StokBarcodeResponse> => {
    return await api.get<StokBarcodeResponse>('/api/Erp/getStokBarcode', {
      params: { bar: barcode, barkodGrubu: barcodeGroup }
    });
  },

  addSitBarcodeToOrder: async (request: AddBarcodeRequest): Promise<AddBarcodeResponse> => {
    return await api.post<AddBarcodeResponse>('/api/SitImportLine/addBarcodeBasedonAssignedOrder', request);
  },

  addSrtBarcodeToOrder: async (request: AddBarcodeRequest): Promise<AddBarcodeResponse> => {
    return await api.post<AddBarcodeResponse>('/api/SrtImportLine/addBarcodeBasedonAssignedOrder', request);
  },

  getSitCollectedBarcodes: async (headerId: number): Promise<CollectedBarcodesResponse> => {
    return await api.get<CollectedBarcodesResponse>(`/api/SitImportLine/warehouseShipmentOrderCollectedBarcodes/${headerId}`);
  },

  getSrtCollectedBarcodes: async (headerId: number): Promise<CollectedBarcodesResponse> => {
    return await api.get<CollectedBarcodesResponse>(`/api/SrtImportLine/warehouseShipmentOrderCollectedBarcodes/${headerId}`);
  },

  completeSit: async (headerId: number): Promise<ApiResponse<unknown>> => {
    return await api.post<ApiResponse<unknown>>(`/api/SitHeader/complete/${headerId}`);
  },

  completeSrt: async (headerId: number): Promise<ApiResponse<unknown>> => {
    return await api.post<ApiResponse<unknown>>(`/api/SrtHeader/complete/${headerId}`);
  },

  createSubcontractingIssue: async (
    formData: SubcontractingFormData,
    selectedItems: SelectedSubcontractingOrderItem[]
  ): Promise<ApiResponse<unknown>> => {
    const request = buildSubcontractingIssueRequest(formData, selectedItems);
    return await api.post<ApiResponse<unknown>>('/api/SitHeader/generate', request);
  },

  createSubcontractingReceipt: async (
    formData: SubcontractingFormData,
    selectedItems: SelectedSubcontractingOrderItem[]
  ): Promise<ApiResponse<unknown>> => {
    const request = buildSubcontractingReceiptRequest(formData, selectedItems);
    return await api.post<ApiResponse<unknown>>('/api/SrtHeader/generate', request);
  },

  getReceiptHeaders: async (): Promise<SubcontractingHeadersResponse> => {
    return await api.get<SubcontractingHeadersResponse>('/api/SrtHeader');
  },

  getIssueHeaders: async (): Promise<SubcontractingHeadersResponse> => {
    return await api.get<SubcontractingHeadersResponse>('/api/SitHeader');
  },

  getReceiptLines: async (headerId: number): Promise<SubcontractingLinesResponse> => {
    return await api.get<SubcontractingLinesResponse>(`/api/SrtLine/header/${headerId}`);
  },

  getIssueLines: async (headerId: number): Promise<SubcontractingLinesResponse> => {
    return await api.get<SubcontractingLinesResponse>(`/api/SitLine/header/${headerId}`);
  },

  getReceiptLineSerials: async (lineId: number): Promise<SubcontractingLineSerialsResponse> => {
    return await api.get<SubcontractingLineSerialsResponse>(`/api/SrtLineSerial/line/${lineId}`);
  },

  getIssueLineSerials: async (lineId: number): Promise<SubcontractingLineSerialsResponse> => {
    return await api.get<SubcontractingLineSerialsResponse>(`/api/SitLineSerial/line/${lineId}`);
  },
};

