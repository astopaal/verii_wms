import { api } from '@/lib/axios';
import type { ApiResponse } from '@/types/api';
import type { Customer, Order, OrderItem, Project, Warehouse, GoodsReceiptFormData, SelectedOrderItem } from '../types/goods-receipt';

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
    lineClientKey: string;
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
  getCustomers: async (): Promise<Customer[]> => {
    const response = await api.get('/api/Erp/getAllCustomers') as ApiResponse<Customer[]>;
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.message || 'Cariler yüklenemedi');
  },

  getProjects: async (): Promise<Project[]> => {
    const response = await api.get('/api/Erp/getAllProjects') as ApiResponse<Project[]>;
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.message || 'Projeler yüklenemedi');
  },

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

  getWarehouses: async (depoKodu?: number): Promise<Warehouse[]> => {
    const url = depoKodu 
      ? `/api/Erp/getAllWarehouses?depoKodu=${depoKodu}`
      : '/api/Erp/getAllWarehouses';
    const response = await api.get(url) as ApiResponse<Warehouse[]>;
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.message || 'Depolar yüklenemedi');
  },

  createGoodsReceipt: async (formData: GoodsReceiptFormData, selectedItems: SelectedOrderItem[]): Promise<number> => {
    const generateGuid = (): string => {
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0;
        const v = c === 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      });
    };

    const currentYear = new Date().getFullYear().toString();
    const plannedDate = formData.receiptDate ? new Date(formData.receiptDate).toISOString() : new Date().toISOString();

    const lines = selectedItems.map((item) => {
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

    const importLines = selectedItems.map((item, index) => {
      const clientKey = generateGuid();
      const correspondingLine = lines[index];
      return {
        lineClientKey: correspondingLine?.clientKey || '',
        clientKey,
        stockCode: item.stockCode || item.productCode || '',
        configurationCode: item.configCode || undefined,
        description1: item.stockName || item.productName || undefined,
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
        return {
          importLineClientKey: importLine.clientKey,
          scannedBarcode: '',
          quantity: item.receiptQuantity,
          description: item.stockName || item.productName || undefined,
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
        orderId: selectedItems[0]?.siparisNo || undefined,
        documentType: formData.isInvoice ? 'E-İrsaliye' : 'Mal Kabul',
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
};

