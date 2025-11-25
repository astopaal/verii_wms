import { z } from 'zod';

export const goodsReceiptFormSchema = z.object({
  receiptDate: z.string().min(1, 'Tarih zorunludur'),
  documentNo: z.string().min(1, 'Belge No zorunludur'),
  warehouseId: z.string().min(1, 'Depo seçimi zorunludur'),
  projectCode: z.string().optional(),
  isInvoice: z.boolean(),
  customerId: z.string().min(1, 'Cari seçimi zorunludur'),
  notes: z.string().optional(),
});

export type GoodsReceiptFormData = z.infer<typeof goodsReceiptFormSchema>;

export interface Customer {
  id: string;
  name: string;
  code?: string;
}

export interface Order {
  id: string;
  orderNo: string;
  orderDate: string;
  totalAmount: number;
  status: string;
}

export interface OrderItem {
  id: string;
  productCode: string;
  productName: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  totalPrice: number;
}

export interface SelectedOrderItem extends OrderItem {
  receiptQuantity: number;
  isSelected: boolean;
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

