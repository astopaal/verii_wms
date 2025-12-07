import { api } from '@/lib/axios';
import { DocumentType } from '@/types/document-type';
import type {
  SubcontractingOrdersResponse,
  SubcontractingOrderItemsResponse,
  SubcontractingGenerateRequest,
  SubcontractingFormData,
  SelectedSubcontractingOrderItem,
  SubcontractingHeadersResponse,
  SubcontractingLinesResponse,
  SubcontractingLineSerialsResponse,
} from '../types/subcontracting';
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
    const now = new Date().toISOString();
    const lines: SubcontractingGenerateRequest['lines'] = [];
    const lineSerials: SubcontractingGenerateRequest['lineSerials'] = [];

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

    const request: SubcontractingGenerateRequest = {
      header: {
        branchCode: '0',
        projectCode: formData.projectCode || '',
        orderId: '',
        documentType: DocumentType.SIT,
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
        sourceWarehouse: formData.sourceWarehouse,
        targetWarehouse: formData.targetWarehouse,
        priority: '',
        type: 0,
      },
      lines,
      lineSerials,
      terminalLines: [
        {
          terminalUserId: 2,
        },
      ],
    };

    const response = await api.post('/api/SitHeader/generate', request) as ApiResponse<unknown>;
    return response;
  },

  createSubcontractingReceipt: async (
    formData: SubcontractingFormData,
    selectedItems: SelectedSubcontractingOrderItem[]
  ): Promise<ApiResponse<unknown>> => {
    const now = new Date().toISOString();
    const lines: SubcontractingGenerateRequest['lines'] = [];
    const lineSerials: SubcontractingGenerateRequest['lineSerials'] = [];

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

    const request: SubcontractingGenerateRequest = {
      header: {
        branchCode: '0',
        projectCode: formData.projectCode || '',
        orderId: '',
        documentType: DocumentType.SRT,
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
        sourceWarehouse: formData.sourceWarehouse,
        targetWarehouse: formData.targetWarehouse,
        priority: '',
        type: 0,
      },
      lines,
      lineSerials,
      terminalLines: [
        {
          terminalUserId: 2,
        },
      ],
    };

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

