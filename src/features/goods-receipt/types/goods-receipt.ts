import { z } from 'zod';
import type { ApiResponse } from '@/types/api';
import type { TFunction } from 'i18next';

export const createGoodsReceiptFormSchema = (t: TFunction) => z.object({
  receiptDate: z.string().min(1, t('goodsReceipt.validation.receiptDateRequired', 'Tarih zorunludur')),
  documentNo: z.string().min(1, t('goodsReceipt.validation.documentNoRequired', 'Belge No zorunludur')),
  projectCode: z.string().optional(),
  isInvoice: z.boolean(),
  customerId: z.string().min(1, t('goodsReceipt.validation.customerRequired', 'Cari seçimi zorunludur')),
  notes: z.string().optional(),
});

export type GoodsReceiptFormData = z.infer<ReturnType<typeof createGoodsReceiptFormSchema>>;

export interface Customer {
  subeKodu: number;
  isletmeKodu: number;
  cariKod: string;
  cariTel: string;
  cariIl: string;
  ulkeKodu: string;
  cariIsim: string;
  cariTip: string;
  grupKodu: string;
  raporKodu1: string;
  raporKodu2: string;
  raporKodu3: string;
  raporKodu4: string;
  raporKodu5: string;
  cariAdres: string;
  cariIlce: string;
  vergiDairesi: string;
  vergiNumarasi: string;
  fax: string;
  postaKodu: string;
  detayKodu: number;
  nakliyeKatsayisi: number;
  riskSiniri: number;
  teminati: number;
  cariRisk: number;
  ccRisk: number;
  saRisk: number;
  scRisk: number;
  cmBorct: number;
  cmAlact: number;
  cmRapTarih: string;
  kosulKodu: string;
  iskontoOrani: number;
  vadeGunu: number;
  listeFiati: number;
  acik1: string;
  acik2: string;
  acik3: string;
  mKod: string;
  dovizTipi: number;
  dovizTuru: number;
  hesapTutmaSekli: string;
  dovizLimi: string;
}

export interface Project {
  projeKod: string;
  projeAciklama: string;
}

export interface Warehouse {
  depoKodu: number;
  depoIsmi: string;
}

export interface Product {
  subeKodu: number;
  isletmeKodu: number;
  stokKodu: string;
  ureticiKodu: string;
  stokAdi: string;
  grupKodu: string;
  saticiKodu: string;
  olcuBr1: string;
  olcuBr2: string;
  pay1: number;
  kod1: string;
  kod2: string;
  kod3: string;
  kod4: string;
  kod5: string;
}

export type CustomersResponse = ApiResponse<Customer[]>;
export type ProjectsResponse = ApiResponse<Project[]>;
export type OrdersResponse = ApiResponse<Order[]>;
export type OrderItemsResponse = ApiResponse<OrderItem[]>;

export interface Order {
  mode: string;
  siparisNo: string;
  orderID: number | null;
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

export interface OrderItem {
  id?: string;
  mode: string;
  siparisNo: string;
  orderID: number;
  stockCode: string;
  stockName: string;
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
  productCode?: string;
  productName?: string;
  quantity?: number;
  unit?: string;
  unitPrice?: number;
  totalPrice?: number;
}

export interface SelectedOrderItem extends OrderItem {
  receiptQuantity: number;
  isSelected: boolean;
  serialNo?: string;
  lotNo?: string;
  batchNo?: string;
  configCode?: string;
  warehouseId?: number;
}

export interface SelectedStockItem {
  id: string;
  stockCode: string;
  stockName: string;
  unit: string;
  receiptQuantity: number;
  isSelected: boolean;
  serialNo?: string;
  lotNo?: string;
  batchNo?: string;
  configCode?: string;
  warehouseId?: number;
}

export interface GoodsReceiptItem {
  orderItemId: string;
  productCode: string;
  productName: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  totalPrice: number;
}

export interface GrHeader {
  id: number;
  createdDate: string;
  updatedDate: string | null;
  deletedDate: string | null;
  isDeleted: boolean;
  createdBy: number;
  updatedBy: number | null;
  deletedBy: number | null;
  createdByFullUser: string;
  updatedByFullUser: string | null;
  deletedByFullUser: string | null;
  yearCode: string;
  branchCode: string;
  projectCode: string;
  orderId: string;
  plannedDate: string;
  isPlanned: boolean;
  documentType: string;
  description1: string | null;
  description2: string | null;
  priorityLevel: number;
  completionDate: string | null;
  isCompleted: boolean;
  isPendingApproval: boolean;
  approvalStatus: boolean | null;
  approvedByUserId: number | null;
  approvalDate: string | null;
  isERPIntegrated: boolean;
  erpReferenceNumber: string | null;
  erpIntegrationDate: string | null;
  erpIntegrationStatus: string | null;
  erpErrorMessage: string | null;
  customerCode: string;
  returnCode: boolean;
  ocrSource: boolean;
  description3: string | null;
  description4: string | null;
  description5: string | null;
}

export interface PagedResponse<T> {
  data: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface GrHeadersPagedParams {
  pageNumber?: number;
  pageSize?: number;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
}

export interface GrLine {
  headerId: number;
  orderId: number | null;
  stockCode: string;
  yapKod: string | null;
  quantity: number;
  unit: string;
  erpOrderNo: string;
  erpOrderId: string;
  description: string;
  id: number;
  createdDate: string;
  updatedDate: string | null;
  deletedDate: string | null;
  isDeleted: boolean;
  createdBy: number;
  updatedBy: number | null;
  deletedBy: number | null;
  createdByFullUser: string;
  updatedByFullUser: string | null;
  deletedByFullUser: string | null;
}

export interface GrImportRoute {
  importLineId: number;
  lineId: number | null;
  stockCode: string | null;
  stockName: string | null;
  routeCode: string | null;
  description: string;
  scannedBarcode: string;
  quantity: number;
  serialNo: string | null;
  serialNo2: string | null;
  serialNo3: string | null;
  serialNo4: string | null;
  sourceWarehouse: number | null;
  targetWarehouse: number | null;
  sourceCellCode: string | null;
  targetCellCode: string | null;
  id: number;
  createdDate: string;
  updatedDate: string | null;
  deletedDate: string | null;
  isDeleted: boolean;
  createdBy: number;
  updatedBy: number | null;
  deletedBy: number | null;
  createdByFullUser: string | null;
  updatedByFullUser: string | null;
  deletedByFullUser: string | null;
}

export interface GrImportLine {
  routes: GrImportRoute[];
  lineId: number;
  headerId: number;
  stockCode: string;
  yapKod: string | null;
  description1: string | null;
  description2: string | null;
  description: string | null;
  id: number;
  createdDate: string;
  updatedDate: string | null;
  deletedDate: string | null;
  isDeleted: boolean;
  createdBy: number;
  updatedBy: number | null;
  deletedBy: number | null;
  createdByFullUser: string | null;
  updatedByFullUser: string | null;
  deletedByFullUser: string | null;
}

