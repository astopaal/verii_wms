import { z } from 'zod';
import type { ApiResponse } from '@/types/api';
import type { TFunction } from 'i18next';

export const createSubcontractingFormSchema = (t: TFunction) => z.object({
  transferDate: z.string().min(1, t('subcontracting.validation.transferDateRequired', 'Tarih zorunludur')),
  documentNo: z.string().min(1, t('subcontracting.validation.documentNoRequired', 'Belge No zorunludur')),
  projectCode: z.string().optional(),
  customerId: z.string().min(1, t('subcontracting.validation.customerRequired', 'Cari seçimi zorunludur')),
  sourceWarehouse: z.string().min(1, t('subcontracting.validation.sourceWarehouseRequired', 'Çıkış deposu zorunludur')),
  targetWarehouse: z.string().min(1, t('subcontracting.validation.targetWarehouseRequired', 'Varış deposu zorunludur')),
  notes: z.string().optional(),
});

export type SubcontractingFormData = z.infer<ReturnType<typeof createSubcontractingFormSchema>>;

export interface SubcontractingOrder {
  mode: string;
  siparisNo: string;
  orderID: number;
  customerCode: string;
  customerName: string;
  branchCode: number;
  targetWh: number;
  projectCode: string | null;
  orderDate: string;
  orderedQty: number;
  deliveredQty: number;
  remainingHamax: number;
  plannedQtyAllocated: number;
  remainingForImport: number;
}

export interface SubcontractingOrderItem {
  id?: string;
  mode: string;
  siparisNo: string;
  orderID: number;
  stockCode: string;
  stockName: string;
  yapKod?: string;
  yapAcik?: string;
  customerCode: string;
  customerName: string;
  branchCode: number;
  targetWh: number;
  projectCode: string;
  orderDate: string;
  orderedQty: number;
  deliveredQty: number;
  remainingHamax: number;
  plannedQtyAllocated: number;
  remainingForImport: number;
}

export interface SelectedSubcontractingOrderItem extends SubcontractingOrderItem {
  transferQuantity: number;
  isSelected: boolean;
  serialNo?: string;
  serialNo2?: string;
  lotNo?: string;
  batchNo?: string;
  configCode?: string;
  sourceWarehouse?: number;
  sourceCellCode?: string;
  targetCellCode?: string;
}

export interface SubcontractingGenerateRequest {
  header: {
    branchCode: string;
    projectCode: string;
    orderId: string;
    documentType: string;
    yearCode: string;
    description1: string;
    description2: string;
    priorityLevel: number;
    plannedDate: string;
    isPlanned: boolean;
    isCompleted: boolean;
    completedDate: string;
    documentNo: string;
    documentDate: string;
    customerCode: string;
    customerName: string;
    sourceWarehouse: string;
    targetWarehouse: string;
    priority: string;
    type: number;
  };
  lines: {
    clientKey: string;
    clientGuid: string;
    stockCode: string;
    stockName?: string;
    yapKod: string;
    yapAcik?: string;
    orderId: number;
    quantity: number;
    unit: string;
    erpOrderNo: string;
    erpOrderId: string;
    erpLineReference: string;
    description: string;
  }[];
  lineSerials: {
    quantity: number;
    serialNo: string;
    serialNo2: string;
    serialNo3: string;
    serialNo4: string;
    sourceCellCode: string;
    targetCellCode: string;
    lineClientKey: string;
    lineGroupGuid: string;
  }[];
  terminalLines: {
    terminalUserId: number;
  }[];
}

export type SubcontractingOrdersResponse = ApiResponse<SubcontractingOrder[]>;
export type SubcontractingOrderItemsResponse = ApiResponse<SubcontractingOrderItem[]>;

export interface SubcontractingHeader {
  id: number;
  branchCode: string;
  projectCode: string;
  documentNo: string;
  documentDate: string;
  documentType: string;
  customerCode: string;
  customerName: string;
  sourceWarehouse: string;
  targetWarehouse: string;
  priority: string;
  yearCode: string;
  description1: string;
  description2: string;
  priorityLevel: number;
  type: number;
  createdBy: string;
  createdDate: string;
  updatedBy: string;
  updatedDate: string;
  isDeleted: boolean;
  deletedBy: string;
  deletedDate: string;
  completionDate: string;
  isCompleted: boolean;
  isPendingApproval: boolean;
  approvalStatus: boolean;
  approvedByUserId: number;
  approvalDate: string;
  isERPIntegrated: boolean;
  erpReferenceNumber: string;
  erpIntegrationDate: string;
  erpIntegrationStatus: string;
  erpErrorMessage: string;
  createdByFullUser: string;
  updatedByFullUser: string;
  deletedByFullUser: string;
}

export interface SubcontractingLine {
  id: number;
  createdDate: string;
  updatedDate: string;
  deletedDate: string;
  isDeleted: boolean;
  createdBy: number;
  updatedBy: number;
  deletedBy: number;
  createdByFullUser: string;
  updatedByFullUser: string;
  deletedByFullUser: string;
  stockCode: string;
  stockName: string;
  yapKod: string;
  yapAcik: string;
  quantity: number;
  unit: string;
  erpOrderNo: string;
  erpOrderId: string;
  description: string;
  headerId: number;
  orderId: number;
  erpLineReference: string;
}

export interface SubcontractingLineSerial {
  id: number;
  createdDate: string;
  updatedDate: string;
  deletedDate: string;
  isDeleted: boolean;
  createdBy: number;
  updatedBy: number;
  deletedBy: number;
  createdByFullUser: string;
  updatedByFullUser: string;
  deletedByFullUser: string;
  quantity: number;
  serialNo: string;
  serialNo2: string;
  serialNo3: string;
  serialNo4: string;
  sourceCellCode: string;
  targetCellCode: string;
  lineId: number;
}

export type SubcontractingHeadersResponse = ApiResponse<SubcontractingHeader[]>;
export type SubcontractingLinesResponse = ApiResponse<SubcontractingLine[]>;
export type SubcontractingLineSerialsResponse = ApiResponse<SubcontractingLineSerial[]>;

