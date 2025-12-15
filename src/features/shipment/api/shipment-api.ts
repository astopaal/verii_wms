import { api } from '@/lib/axios';
import { DocumentType } from '@/types/document-type';
import type {
  ShipmentOrdersResponse,
  ShipmentOrderItemsResponse,
  ShipmentGenerateRequest,
  ShipmentFormData,
  SelectedShipmentOrderItem,
  ShipmentHeadersResponse,
  ShipmentLinesResponse,
  ShipmentLineSerialsResponse,
} from '../types/shipment';
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
    const now = new Date().toISOString();
    const lines: ShipmentGenerateRequest['lines'] = [];
    const lineSerials: ShipmentGenerateRequest['lineSerials'] = [];

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

    const request: ShipmentGenerateRequest = {
      header: {
        branchCode: '0',
        projectCode: formData.projectCode || '',
        orderId: '',
        documentType: DocumentType.SH,
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
        targetWarehouse: '',
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

    const response = await api.post('/api/ShHeader/generate', request) as ApiResponse<unknown>;
    return response;
  },
};
