import { api } from '@/lib/axios';
import { DocumentType } from '@/types/document-type';
import type {
  TransferOrdersResponse,
  TransferOrderItemsResponse,
  TransferGenerateRequest,
  TransferFormData,
  SelectedTransferOrderItem,
  SelectedTransferStockItem,
  TransferHeadersResponse,
  TransferLinesResponse,
  TransferLineSerialsResponse,
} from '../types/transfer';
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

  createTransfer: async (
    formData: TransferFormData,
    selectedItems: (SelectedTransferOrderItem | SelectedTransferStockItem)[],
    isFreeTransfer: boolean
  ): Promise<ApiResponse<unknown>> => {
    const now = new Date().toISOString();
    const lines: TransferGenerateRequest['lines'] = [];
    const lineSerials: TransferGenerateRequest['lineSerials'] = [];

    selectedItems.forEach((item) => {
      const clientKey = crypto.randomUUID();
      const clientGuid = crypto.randomUUID();

      lines.push({
        clientKey,
        clientGuid,
        stockCode: item.stockCode,
        yapKod: '',
        orderId: 0,
        quantity: item.transferQuantity,
        unit: 'unit' in item ? item.unit : '',
        erpOrderNo: '',
        erpOrderId: '',
        erpLineReference: '',
        description: '',
      });

      lineSerials.push({
        quantity: item.transferQuantity,
        serialNo: item.serialNo || '',
        serialNo2: item.serialNo2 || '',
        serialNo3: item.lotNo || '',
        serialNo4: item.batchNo || '',
        sourceCellCode: '',
        targetCellCode: '',
        lineClientKey: clientKey,
        lineGroupGuid: clientGuid,
      });
    });

    const firstItemSourceWarehouse = selectedItems.length > 0 && 'sourceWarehouse' in selectedItems[0] 
      ? selectedItems[0].sourceWarehouse 
      : undefined;

    const request: TransferGenerateRequest = {
      header: {
        branchCode: '0',
        projectCode: formData.projectCode || '',
        orderId: '',
        documentType: DocumentType.WT,
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
        customerCode: isFreeTransfer ? '' : (formData.customerId || ''),
        customerName: '',
        sourceWarehouse: isFreeTransfer ? (formData.sourceWarehouse || '') : (firstItemSourceWarehouse ? String(firstItemSourceWarehouse) : ''),
        targetWarehouse: formData.targetWarehouse,
        priority: '',
        type: isFreeTransfer ? 1 : 0,
      },
      lines,
      lineSerials,
      terminalLines: [
        {
          terminalUserId: 2,
        },
      ],
    };

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

