import { api } from '@/lib/axios';
import { DocumentType } from '@/types/document-type';
import type { ApiResponse, PagedParams, PagedResponse } from '@/types/api';
import type { Order, OrderItem, GoodsReceiptFormData, SelectedOrderItem, SelectedStockItem, GrHeader, GrLine, GrImportLine } from '../types/goods-receipt';
import { erpCommonApi } from '@/services/erp-common-api';

interface BulkCreateRequest {
  header: {
    branchCode: string;
    projectCode?: string;
    orderId?: string;
    documentType: string;
    yearCode: string;
    description1?: string;
    description2?: string;
    priorityLevel?: number;
    plannedDate: string;
    isPlanned: boolean;
    customerCode: string;
    returnCode: boolean;
    ocrSource: boolean;
    description3?: string;
    description4?: string;
    description5?: string;
  };
  documents?: Array<{ base64: string }> | null;
  lines?: Array<{
    clientKey: string;
    stockCode: string;
    quantity: number;
    unit?: string;
    erpOrderNo?: string;
    erpOrderId?: string;
    description?: string;
  }>;
  importLines?: Array<{
    lineClientKey: string | null;
    clientKey: string;
    stockCode: string;
    configurationCode?: string;
    description1?: string;
    description2?: string;
  }>;
  serialLines?: Array<{
    importLineClientKey: string;
    serialNo: string;
    quantity: number;
    sourceCellCode?: string;
    targetCellCode?: string;
    serialNo2?: string;
    serialNo3?: string;
    serialNo4?: string;
  }>;
  routes?: Array<{
    importLineClientKey: string;
    scannedBarcode: string;
    quantity: number;
    description?: string;
    serialNo?: string;
    serialNo2?: string;
    serialNo3?: string;
    serialNo4?: string;
    sourceWarehouse?: number;
    targetWarehouse?: number;
    sourceCellCode?: string;
    targetCellCode?: string;
  }>;
}

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
    const generateGuid = (): string => {
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0;
        const v = c === 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      });
    };

    const currentYear = new Date().getFullYear().toString();
    const plannedDate = formData.receiptDate ? new Date(formData.receiptDate).toISOString() : new Date().toISOString();

    const lines = isStockBased ? [] : selectedItems.map((item) => {
      const clientKey = generateGuid();
      return {
        clientKey,
        stockCode: item.stockCode || item.productCode || '',
        quantity: item.orderedQty || 0,
        unit: item.unit || undefined,
        erpOrderNo: item.siparisNo || undefined,
        erpOrderId: item.orderID?.toString() || undefined,
        description: item.stockName || item.productName || undefined,
      };
    });

    const importLines = selectedItems.map((item) => {
      const clientKey = generateGuid();
      const correspondingLine = isStockBased ? null : lines.find((line) => {
        const itemStockCode = 'stockCode' in item ? item.stockCode : (item.productCode || '');
        return line.stockCode === itemStockCode;
      });
      const stockCode = 'stockCode' in item ? item.stockCode : (item.productCode || '');
      const stockName = 'stockName' in item ? item.stockName : (item.productName || '');
      return {
        lineClientKey: correspondingLine?.clientKey || null,
        clientKey,
        stockCode,
        configurationCode: item.configCode || undefined,
        description1: stockName || undefined,
        description2: undefined,
      };
    });

    const serialLines = selectedItems
      .map((item, index) => {
        if (!item.serialNo && !item.lotNo && !item.batchNo && !item.configCode) {
          return null;
        }
        const importLine = importLines[index];
        if (!importLine) return null;
        return {
          importLineClientKey: importLine.clientKey,
          serialNo: item.serialNo || '',
          quantity: item.receiptQuantity || 0,
          sourceCellCode: undefined,
          targetCellCode: undefined,
          serialNo2: item.lotNo,
          serialNo3: item.batchNo,
          serialNo4: item.configCode,
        };
      })
      .filter((line): line is NonNullable<typeof line> => line !== null);

    const routes = selectedItems
      .map((item, index) => {
        const importLine = importLines[index];
        if (!importLine || !item.receiptQuantity || item.receiptQuantity <= 0) return null;
        const stockName = 'stockName' in item ? item.stockName : (item.productName || '');
        return {
          importLineClientKey: importLine.clientKey,
          scannedBarcode: '',
          quantity: item.receiptQuantity,
          description: stockName || undefined,
          serialNo: item.serialNo,
          serialNo2: item.lotNo,
          serialNo3: item.batchNo,
          serialNo4: item.configCode,
          sourceWarehouse: undefined,
          targetWarehouse: item.warehouseId,
          sourceCellCode: undefined,
          targetCellCode: undefined,
        };
      })
      .filter((route): route is NonNullable<typeof route> => route !== null);

    const request: BulkCreateRequest = {
      header: {
        branchCode: '',
        projectCode: formData.projectCode || undefined,
        orderId: isStockBased ? undefined : (selectedItems[0] && 'siparisNo' in selectedItems[0] ? selectedItems[0].siparisNo : undefined),
        documentType: DocumentType.GR,
        yearCode: currentYear,
        description1: formData.documentNo || undefined,
        description2: formData.notes || undefined,
        priorityLevel: 0,
        plannedDate,
        isPlanned: false,
        customerCode: formData.customerId || '',
        returnCode: false,
        ocrSource: false,
        description3: undefined,
        description4: undefined,
        description5: undefined,
      },
      documents: null,
      lines: lines.length > 0 ? lines : undefined,
      importLines: importLines.length > 0 ? importLines : undefined,
      serialLines: serialLines.length > 0 ? serialLines : undefined,
      routes: routes.length > 0 ? routes : undefined,
    };

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
