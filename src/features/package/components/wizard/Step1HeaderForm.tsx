import { type ReactElement, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCustomers } from '@/features/goods-receipt/hooks/useCustomers';
import { useWarehouses } from '@/features/goods-receipt/hooks/useWarehouses';
import { SearchableSelect } from '@/features/goods-receipt/components/steps/components/SearchableSelect';
import { pHeaderFormSchema, CargoCompany, type PHeaderFormData, type PHeaderDto } from '../../types/package';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { Customer, Warehouse } from '@/features/goods-receipt/types/goods-receipt';

interface Step1HeaderFormProps {
  initialData?: PHeaderDto;
  onSubmit: (data: PHeaderFormData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export function Step1HeaderForm({
  initialData,
  onSubmit,
  onCancel,
  isLoading = false,
}: Step1HeaderFormProps): ReactElement {
  const { t } = useTranslation();
  const { data: customers, isLoading: isLoadingCustomers } = useCustomers();
  const { data: warehouses, isLoading: isLoadingWarehouses } = useWarehouses();

  const schema = useMemo(() => pHeaderFormSchema(t), [t]);

  const cargoCompanyOptions = useMemo(() => {
    return Object.entries(CargoCompany)
      .filter(([key]) => isNaN(Number(key)))
      .map(([key, value]) => ({
        value: value as number,
        label: t(`package.cargoCompany.${key}`, key),
      }));
  }, [t]);

  const form = useForm<PHeaderFormData>({
    resolver: zodResolver(schema),
    defaultValues: initialData
      ? {
          packingNo: initialData.packingNo,
          packingDate: initialData.packingDate ? initialData.packingDate.split('T')[0] : new Date().toISOString().split('T')[0],
          warehouseCode: initialData.warehouseCode || '',
          customerCode: initialData.customerCode || '',
          customerAddress: initialData.customerAddress || '',
          status: initialData.status || 'Draft',
          carrierId: initialData.carrierId,
          carrierServiceType: initialData.carrierServiceType || '',
          trackingNo: initialData.trackingNo || '',
        }
      : {
          packingNo: '',
          packingDate: new Date().toISOString().split('T')[0],
          warehouseCode: '',
          customerCode: '',
          customerAddress: '',
          status: 'Draft',
          carrierId: undefined,
          carrierServiceType: '',
          trackingNo: '',
        },
  });

  const handleSubmit = async (data: PHeaderFormData): Promise<void> => {
    await onSubmit(data);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('package.wizard.step1.title', '1. Paketleme Başlığı')}</CardTitle>
        <CardDescription>
          {t('package.wizard.step1.description', 'Paketleme başlık bilgilerini giriniz')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="packingNo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t('package.form.packingNo', 'Paketleme No')} <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="PKG-2025-000001" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="packingDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('package.form.packingDate', 'Paketleme Tarihi')}</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="warehouseCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('package.form.warehouseCode', 'Depo')}</FormLabel>
                    <FormControl>
                      <SearchableSelect<Warehouse>
                        value={field.value}
                        onValueChange={field.onChange}
                        options={warehouses || []}
                        getOptionValue={(opt) => opt.depoKodu.toString()}
                        getOptionLabel={(opt) => `${opt.depoIsmi} (${opt.depoKodu})`}
                        placeholder={t('package.form.selectWarehouse', 'Depo seçiniz')}
                        searchPlaceholder={t('common.search', 'Ara...')}
                        emptyText={t('common.notFound', 'Bulunamadı')}
                        isLoading={isLoadingWarehouses}
                        itemLimit={100}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="customerCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('package.form.customerCode', 'Cari')}</FormLabel>
                    <FormControl>
                      <SearchableSelect<Customer>
                        value={field.value}
                        onValueChange={field.onChange}
                        options={customers || []}
                        getOptionValue={(opt) => opt.cariKod}
                        getOptionLabel={(opt) => `${opt.cariIsim} (${opt.cariKod})`}
                        placeholder={t('package.form.selectCustomer', 'Cari seçiniz')}
                        searchPlaceholder={t('common.search', 'Ara...')}
                        emptyText={t('common.notFound', 'Bulunamadı')}
                        isLoading={isLoadingCustomers}
                        itemLimit={100}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="carrierId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('package.form.carrierId', 'Kargo Firması')}</FormLabel>
                    <Select
                      value={field.value?.toString() || ''}
                      onValueChange={(value) => field.onChange(value ? parseInt(value, 10) : undefined)}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={t('package.form.selectCarrier', 'Kargo Firması Seçin')} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {cargoCompanyOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value.toString()}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('package.form.status', 'Durum')}</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange} disabled>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Draft">{t('package.status.draft', 'Taslak')}</SelectItem>
                        <SelectItem value="Packing">{t('package.status.packing', 'Paketleniyor')}</SelectItem>
                        <SelectItem value="Packed">{t('package.status.packed', 'Paketlendi')}</SelectItem>
                        <SelectItem value="Shipped">{t('package.status.shipped', 'Gönderildi')}</SelectItem>
                        <SelectItem value="Cancelled">{t('package.status.cancelled', 'İptal Edildi')}</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="carrierServiceType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('package.form.carrierServiceType', 'Kargo Servis Tipi')}</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="trackingNo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('package.form.trackingNo', 'Takip No')}</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="customerAddress"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('package.form.customerAddress', 'Cari Adresi')}</FormLabel>
                  <FormControl>
                    <Textarea {...field} rows={3} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                {t('common.cancel')}
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-md hover:bg-primary/90 disabled:opacity-50"
              >
                {isLoading ? t('common.saving') : t('package.wizard.nextStep', 'Sonraki Adım')}
              </button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

