import { type ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import { useFormContext } from 'react-hook-form';
import { useQuery } from '@tanstack/react-query';
import { goodsReceiptApi } from '../../api/goods-receipt-api';
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { GoodsReceiptFormData } from '../../types/goods-receipt';

const warehouses = [
  { id: '1', name: 'Ana Depo', code: 'DEPO-001' },
  { id: '2', name: 'Yan Depo', code: 'DEPO-002' },
  { id: '3', name: 'Soğuk Hava Deposu', code: 'DEPO-003' },
];

export function Step1BasicInfo(): ReactElement {
  const { t } = useTranslation();
  const { control, watch } = useFormContext<GoodsReceiptFormData>();
  const { data: customers, isLoading: customersLoading } = useQuery({
    queryKey: ['customers'],
    queryFn: () => goodsReceiptApi.getCustomers(),
  });

  const selectedCustomerId = watch('customerId');
  const selectedCustomer = customers?.find((c) => c.id === selectedCustomerId);

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <FormField
        control={control}
        name="receiptDate"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t('goodsReceipt.step1.receiptDate')} *</FormLabel>
            <FormControl>
              <Input type="date" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="documentNo"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t('goodsReceipt.step1.documentNo')} *</FormLabel>
            <FormControl>
              <Input placeholder={t('goodsReceipt.step1.documentNoPlaceholder')} {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="warehouseId"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t('goodsReceipt.step1.warehouse')} *</FormLabel>
            <Select onValueChange={field.onChange} value={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder={t('goodsReceipt.step1.selectWarehouse')} />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {warehouses.map((warehouse) => (
                  <SelectItem key={warehouse.id} value={warehouse.id}>
                    {warehouse.name} ({warehouse.code})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="projectCode"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t('goodsReceipt.step1.projectCode')}</FormLabel>
            <Select
              onValueChange={(value) => {
                field.onChange(value === 'none' ? '' : value);
              }}
              value={field.value || 'none'}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder={t('goodsReceipt.step1.selectProjectCode')} />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="none">{t('goodsReceipt.step1.noProject')}</SelectItem>
                <SelectItem value="PROJ-001">Proje 1 (PROJ-001)</SelectItem>
                <SelectItem value="PROJ-002">Proje 2 (PROJ-002)</SelectItem>
                <SelectItem value="PROJ-003">Proje 3 (PROJ-003)</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="customerId"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t('goodsReceipt.step1.customer')} *</FormLabel>
            <Select
              onValueChange={field.onChange}
              value={field.value}
              disabled={customersLoading}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder={t('goodsReceipt.step1.selectCustomer')} />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {customers?.map((customer) => (
                  <SelectItem key={customer.id} value={customer.id}>
                    {customer.name} {customer.code && `(${customer.code})`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="isInvoice"
        render={({ field }) => (
          <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4">
            <FormControl>
              <input
                type="checkbox"
                checked={field.value}
                onChange={field.onChange}
                className="h-4 w-4 rounded border-gray-300"
              />
            </FormControl>
            <div className="space-y-1 leading-none">
              <FormLabel>{t('goodsReceipt.step1.isInvoice')}</FormLabel>
              <p className="text-sm text-muted-foreground">
                {t('goodsReceipt.step1.isInvoiceDescription')}
              </p>
            </div>
          </FormItem>
        )}
      />

      {selectedCustomer && (
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>{t('goodsReceipt.step1.selectedCustomer')}</CardTitle>
            <CardDescription>{selectedCustomer.name}</CardDescription>
          </CardHeader>
        </Card>
      )}

      <FormField
        control={control}
        name="notes"
        render={({ field }) => (
          <FormItem className="md:col-span-2">
            <FormLabel>{t('goodsReceipt.step1.notes')}</FormLabel>
            <FormControl>
              <Input placeholder={t('goodsReceipt.step1.notesPlaceholder')} {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}

