import { api } from '@/lib/axios';
import { DocumentType } from '@/types/document-type';
import type {
  WarehouseOrdersResponse,
  WarehouseOrderItemsResponse,
  WarehouseGenerateRequest,
  WarehouseFormData,
  SelectedWarehouseOrderItem,
  WarehouseHeadersResponse,
  WarehouseLinesResponse,
  WarehouseLineSerialsResponse,
} from '../types/warehouse';
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
    const now = new Date().toISOString();
    const lines: WarehouseGenerateRequest['lines'] = [];
    const lineSerials: WarehouseGenerateRequest['lineSerials'] = [];

    selectedItems.forEach((item) => {
      const clientKey = crypto.randomUUID();
      const clientGuid = crypto.randomUUID();

      lines.push({
        clientKey,
        clientGuid,
        stockCode: item.stockCode,
        stockName: item.stockName,
        yapKod: item.yapKod || '',
        yapAcik: item.yapAcik || '',
        orderId: item.orderID || 0,
        quantity: item.transferQuantity,
        unit: '',
        erpOrderNo: item.siparisNo || '',
        erpOrderId: String(item.orderID || ''),
        erpLineReference: '',
        description: '',
      });

      lineSerials.push({
        quantity: item.transferQuantity,
        serialNo: item.serialNo || '',
        serialNo2: item.serialNo2 || '',
        serialNo3: item.lotNo || '',
        serialNo4: item.batchNo || '',
        sourceCellCode: item.sourceCellCode || '',
        targetCellCode: item.targetCellCode || '',
        lineClientKey: clientKey,
        lineGroupGuid: clientGuid,
      });
    });

    const request: WarehouseGenerateRequest = {
      header: {
        branchCode: '0',
        projectCode: formData.projectCode || '',
        orderId: '',
        documentType: DocumentType.WI,
        yearCode: new Date().getFullYear().toString(),
        description1: formData.notes || '',
        description2: '',
        priorityLevel: 0,
        plannedDate: formData.transferDate,
        isPlanned: true,
        isCompleted: true,
        completedDate: now,
        documentNo: formData.documentNo,
        documentDate: formData.transferDate,
        customerCode: formData.customerId || '',
        customerName: '',
        sourceWarehouse: '',
        targetWarehouse: formData.targetWarehouse || '',
        priority: '',
        inboundType: formData.operationType || '',
      },
      lines,
      lineSerials,
      terminalLines: [
        {
          terminalUserId: 2,
        },
      ],
    };

    const response = await api.post('/api/WiHeader/generate', request) as ApiResponse<unknown>;
    return response;
  },

  createWarehouseOutbound: async (
    formData: WarehouseFormData,
    selectedItems: SelectedWarehouseOrderItem[]
  ): Promise<ApiResponse<unknown>> => {
    const now = new Date().toISOString();
    const lines: WarehouseGenerateRequest['lines'] = [];
    const lineSerials: WarehouseGenerateRequest['lineSerials'] = [];

    selectedItems.forEach((item) => {
      const clientKey = crypto.randomUUID();
      const clientGuid = crypto.randomUUID();

      lines.push({
        clientKey,
        clientGuid,
        stockCode: item.stockCode,
        stockName: item.stockName,
        yapKod: item.yapKod || '',
        yapAcik: item.yapAcik || '',
        orderId: item.orderID || 0,
        quantity: item.transferQuantity,
        unit: '',
        erpOrderNo: item.siparisNo || '',
        erpOrderId: String(item.orderID || ''),
        erpLineReference: '',
        description: '',
      });

      lineSerials.push({
        quantity: item.transferQuantity,
        serialNo: item.serialNo || '',
        serialNo2: item.serialNo2 || '',
        serialNo3: item.lotNo || '',
        serialNo4: item.batchNo || '',
        sourceCellCode: item.sourceCellCode || '',
        targetCellCode: item.targetCellCode || '',
        lineClientKey: clientKey,
        lineGroupGuid: clientGuid,
      });
    });

    const request: WarehouseGenerateRequest = {
      header: {
        branchCode: '0',
        projectCode: formData.projectCode || '',
        orderId: '',
        documentType: DocumentType.WO,
        yearCode: new Date().getFullYear().toString(),
        description1: formData.notes || '',
        description2: '',
        priorityLevel: 0,
        plannedDate: formData.transferDate,
        isPlanned: true,
        isCompleted: false,
        completedDate: now,
        documentNo: formData.documentNo,
        documentDate: formData.transferDate,
        customerCode: formData.customerId || '',
        customerName: '',
        sourceWarehouse: formData.sourceWarehouse || '',
        targetWarehouse: '',
        priority: '',
        outboundType: formData.operationType || '',
      },
      lines,
      lineSerials,
      terminalLines: [
        {
          terminalUserId: 2,
        },
      ],
    };

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

