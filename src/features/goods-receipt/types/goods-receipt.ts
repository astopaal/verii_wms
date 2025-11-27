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

export interface GoodsReceiptItem {
  orderItemId: string;
  productCode: string;
  productName: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  totalPrice: number;
}

