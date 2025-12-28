import { type ReactElement, useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useUIStore } from '@/stores/ui-store';
import { usePHeader } from '../hooks/usePHeader';
import { usePPackagesByHeader } from '../hooks/usePPackagesByHeader';
import { usePLinesByHeader } from '../hooks/usePLinesByHeader';
import { useCreatePPackage } from '../hooks/useCreatePPackage';
import { useCreatePLine } from '../hooks/useCreatePLine';
import { pPackageFormSchema, pLineFormSchema, type PPackageFormData, type PLineFormData } from '../types/package';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Eye, ArrowLeft, Edit } from 'lucide-react';
import { toast } from 'sonner';
import type { PPackageDto, PLineDto } from '../types/package';

const getStatusBadgeColor = (status: string): string => {
  switch (status) {
    case 'Draft':
      return 'bg-gray-100 text-gray-800';
    case 'Packing':
      return 'bg-blue-100 text-blue-800';
    case 'Packed':
      return 'bg-green-100 text-green-800';
    case 'Shipped':
      return 'bg-purple-100 text-purple-800';
    case 'Cancelled':
      return 'bg-red-100 text-red-800';
    case 'Open':
      return 'bg-yellow-100 text-yellow-800';
    case 'Closed':
      return 'bg-gray-100 text-gray-800';
    case 'Loaded':
      return 'bg-blue-100 text-blue-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export function PackageDetailPage(): ReactElement {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { setPageTitle } = useUIStore();
  
  const headerId = useMemo(() => {
    if (!id) return undefined;
    const parsed = parseInt(id, 10);
    return isNaN(parsed) ? undefined : parsed;
  }, [id]);
  const [packageDialogOpen, setPackageDialogOpen] = useState(false);
  const [lineDialogOpen, setLineDialogOpen] = useState(false);

  const { data: header, isLoading: isLoadingHeader } = usePHeader(headerId);
  const { data: packages, isLoading: isLoadingPackages } = usePPackagesByHeader(headerId);
  const { data: lines, isLoading: isLoadingLines } = usePLinesByHeader(headerId);
  const createPackageMutation = useCreatePPackage();
  const createLineMutation = useCreatePLine();

  const packageSchema = useMemo(() => pPackageFormSchema(t), [t]);
  const lineSchema = useMemo(() => pLineFormSchema(t), [t]);

  const packageForm = useForm<PPackageFormData>({
    resolver: zodResolver(packageSchema),
    defaultValues: {
      packingHeaderId: headerId || 0,
      packageNo: '',
      packageType: 'Box',
      barcode: '',
      length: undefined,
      width: undefined,
      height: undefined,
      volume: undefined,
      netWeight: undefined,
      tareWeight: undefined,
      grossWeight: undefined,
      isMixed: false,
      status: 'Open',
    },
  });

  const lineForm = useForm<PLineFormData>({
    resolver: zodResolver(lineSchema),
    defaultValues: {
      packingHeaderId: headerId || 0,
      packageId: 0,
      barcode: '',
      stockCode: '',
      yapKod: '',
      quantity: 0,
      serialNo: '',
      serialNo2: '',
      serialNo3: '',
      serialNo4: '',
      sourceRouteId: undefined,
    },
  });

  useEffect(() => {
    if (headerId) {
      packageForm.setValue('packingHeaderId', headerId);
      lineForm.setValue('packingHeaderId', headerId);
    }
  }, [headerId, packageForm, lineForm]);

  useEffect(() => {
    if (header) {
      setPageTitle(t('package.detail.title', 'Paketleme Detayı') + ' - ' + header.packingNo);
    } else {
      setPageTitle(t('package.detail.title', 'Paketleme Detayı'));
    }
    return () => {
      setPageTitle(null);
    };
  }, [t, setPageTitle, header]);

  const handlePackageSubmit = async (data: PPackageFormData): Promise<void> => {
    try {
      const packageNoValue = data.packageNo || '';
      await createPackageMutation.mutateAsync({
        packingHeaderId: data.packingHeaderId,
        packageNo: packageNoValue,
        packageType: data.packageType,
        barcode: packageNoValue,
        length: data.length,
        width: data.width,
        height: data.height,
        volume: data.volume,
        netWeight: data.netWeight,
        tareWeight: data.tareWeight,
        grossWeight: data.grossWeight,
        isMixed: data.isMixed,
        status: data.status,
      });
      toast.success(t('package.detail.packageAddSuccess', 'Paket başarıyla eklendi'));
      setPackageDialogOpen(false);
      packageForm.reset();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : t('package.detail.packageAddError', 'Paket eklenirken bir hata oluştu')
      );
    }
  };

  const handleLineSubmit = async (data: PLineFormData): Promise<void> => {
    try {
      await createLineMutation.mutateAsync({
        packingHeaderId: data.packingHeaderId,
        packageId: data.packageId,
        barcode: data.barcode || undefined,
        stockCode: data.stockCode,
        yapKod: data.yapKod,
        quantity: data.quantity,
        serialNo: data.serialNo || undefined,
        serialNo2: data.serialNo2 || undefined,
        serialNo3: data.serialNo3 || undefined,
        serialNo4: data.serialNo4 || undefined,
        sourceRouteId: data.sourceRouteId,
      });
      toast.success(t('package.detail.lineAddSuccess', 'Satır başarıyla eklendi'));
      setLineDialogOpen(false);
      lineForm.reset();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : t('package.detail.lineAddError', 'Satır eklenirken bir hata oluştu')
      );
    }
  };

  const formatDate = (dateString: string | null | undefined): string => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  if (isLoadingHeader) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">{t('common.loading')}</p>
      </div>
    );
  }

  if (!header) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-destructive">{t('package.detail.notFound', 'Paketleme bulunamadı')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle>{t('package.detail.title', 'Paketleme Detayı')}</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">{header.packingNo}</p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={() => navigate('/package/list')}>
                <ArrowLeft className="size-4 mr-2" />
                {t('common.back', 'Geri')}
              </Button>
              <Button variant="outline" onClick={() => navigate(`/package/edit/${headerId}`)}>
                <Edit className="size-4 mr-2" />
                {t('common.edit', 'Düzenle')}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                {t('package.detail.status', 'Durum')}
              </p>
              <Badge className={getStatusBadgeColor(header.status)}>
                {t(`package.status.${header.status.toLowerCase()}`, header.status)}
              </Badge>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                {t('package.detail.packingDate', 'Paketleme Tarihi')}
              </p>
              <p className="text-base">{formatDate(header.packingDate)}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                {t('package.detail.warehouseCode', 'Depo Kodu')}
              </p>
              <p className="text-base">{header.warehouseCode || '-'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                {t('package.list.sourceType', 'Kaynak Tipi')}
              </p>
              {header.sourceType ? (
                <Badge variant="outline">
                  {t(`package.sourceType.${header.sourceType.toUpperCase()}`, header.sourceType.toUpperCase())}
                </Badge>
              ) : (
                <p className="text-base">-</p>
              )}
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                {t('package.list.matchedSource', 'Eşleşen Kaynak')}
              </p>
              <p className="text-base">
                {header.sourceHeaderId ? `#${header.sourceHeaderId}` : '-'}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                {t('package.detail.customerCode', 'Cari Kodu')}
              </p>
              <p className="text-base">{header.customerCode || '-'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                {t('package.detail.customerName', 'Cari Adı')}
              </p>
              <p className="text-base">{header.customerName || '-'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                {t('package.detail.totalPackageCount', 'Toplam Paket')}
              </p>
              <p className="text-base">{header.totalPackageCount || 0}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                {t('package.detail.totalQuantity', 'Toplam Miktar')}
              </p>
              <p className="text-base">{header.totalQuantity || 0}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                {t('package.detail.totalGrossWeight', 'Toplam Brüt Ağırlık')}
              </p>
              <p className="text-base">{header.totalGrossWeight || 0}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                {t('package.detail.trackingNo', 'Takip No')}
              </p>
              <p className="text-base">{header.trackingNo || '-'}</p>
            </div>
          </div>

          <Tabs defaultValue="packages" className="w-full">
            <TabsList>
              <TabsTrigger value="packages">
                {t('package.detail.packages', 'Paketler')} ({packages?.length || 0})
              </TabsTrigger>
              <TabsTrigger value="lines">
                {t('package.detail.lines', 'Satırlar')} ({lines?.length || 0})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="packages" className="mt-4">
              <div className="flex justify-end mb-4">
                <Button onClick={() => setPackageDialogOpen(true)}>
                  <Plus className="size-4 mr-2" />
                  {t('package.detail.addPackage', 'Yeni Paket Ekle')}
                </Button>
              </div>
              {isLoadingPackages ? (
                <p className="text-muted-foreground">{t('common.loading')}</p>
              ) : packages && packages.length > 0 ? (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t('package.detail.packageNo', 'Paket No')}</TableHead>
                        <TableHead>{t('package.detail.packageType', 'Paket Tipi')}</TableHead>
                        <TableHead>{t('package.detail.status', 'Durum')}</TableHead>
                        <TableHead>{t('package.detail.netWeight', 'Net Ağırlık')}</TableHead>
                        <TableHead>{t('package.detail.grossWeight', 'Brüt Ağırlık')}</TableHead>
                        <TableHead>{t('package.detail.volume', 'Hacim')}</TableHead>
                        <TableHead>{t('package.detail.isMixed', 'Karışık')}</TableHead>
                        <TableHead>{t('package.detail.actions', 'İşlemler')}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {packages.map((pkg: PPackageDto) => (
                        <TableRow key={pkg.id}>
                          <TableCell className="font-medium">
                            <Button
                              variant="link"
                              className="p-0 h-auto"
                              onClick={() => navigate(`/package/package-detail/${pkg.id}`)}
                            >
                              {pkg.packageNo}
                            </Button>
                          </TableCell>
                          <TableCell>{pkg.packageType}</TableCell>
                          <TableCell>
                            <Badge className={getStatusBadgeColor(pkg.status)}>
                              {t(`package.packageStatus.${pkg.status.toLowerCase()}`, pkg.status)}
                            </Badge>
                          </TableCell>
                          <TableCell>{pkg.netWeight || '-'}</TableCell>
                          <TableCell>{pkg.grossWeight || '-'}</TableCell>
                          <TableCell>{pkg.volume || '-'}</TableCell>
                          <TableCell>{pkg.isMixed ? t('common.yes') : t('common.no')}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => navigate(`/package/package-detail/${pkg.id}`)}
                              >
                                <Eye className="size-4" />
                                <span className="ml-2">{t('package.detail.viewDetails', 'Detay')}</span>
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">
                  {t('package.detail.noPackages', 'Paket bulunamadı')}
                </p>
              )}
            </TabsContent>

            <TabsContent value="lines" className="mt-4">
              <div className="flex justify-end mb-4">
                <Button onClick={() => setLineDialogOpen(true)}>
                  <Plus className="size-4 mr-2" />
                  {t('package.detail.addLine', 'Yeni Satır Ekle')}
                </Button>
              </div>
              {isLoadingLines ? (
                <p className="text-muted-foreground">{t('common.loading')}</p>
              ) : lines && lines.length > 0 ? (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t('package.detail.barcode', 'Barkod')}</TableHead>
                        <TableHead>{t('package.detail.stockCode', 'Stok Kodu')}</TableHead>
                        <TableHead>{t('package.detail.stockName', 'Stok Adı')}</TableHead>
                        <TableHead>{t('package.detail.yapKod', 'Yap Kodu')}</TableHead>
                        <TableHead>{t('package.detail.yapAcik', 'Yap Açıklama')}</TableHead>
                        <TableHead>{t('package.detail.quantity', 'Miktar')}</TableHead>
                        <TableHead>{t('package.detail.serialNo', 'Seri No')}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {lines.map((line: PLineDto) => {
                        return (
                          <TableRow key={line.id}>
                            <TableCell>{line.barcode || '-'}</TableCell>
                            <TableCell>{line.stockCode}</TableCell>
                            <TableCell>{line.stockName || '-'}</TableCell>
                            <TableCell>{line.yapKod}</TableCell>
                            <TableCell>{line.yapAcik || '-'}</TableCell>
                            <TableCell>{line.quantity}</TableCell>
                            <TableCell>
                              {line.serialNo || line.serialNo2 || line.serialNo3 || line.serialNo4 || '-'}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">
                  {t('package.detail.noLines', 'Satır bulunamadı')}
                </p>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Dialog open={packageDialogOpen} onOpenChange={setPackageDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t('package.detail.addPackage', 'Yeni Paket Ekle')}</DialogTitle>
            <DialogDescription>
              {t('package.detail.addPackageDescription', 'Yeni bir paket ekleyin')}
            </DialogDescription>
          </DialogHeader>
          <Form {...packageForm}>
            <form onSubmit={packageForm.handleSubmit(handlePackageSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={packageForm.control}
                  name="packageNo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {t('package.form.packageNo', 'Paket No')} <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          onChange={(e) => {
                            const value = e.target.value;
                            field.onChange(value);
                            packageForm.setValue('barcode', value);
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={packageForm.control}
                  name="packageType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('package.form.packageType', 'Paket Tipi')}</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Box">{t('package.packageType.box', 'Kutu')}</SelectItem>
                          <SelectItem value="Pallet">{t('package.packageType.pallet', 'Palet')}</SelectItem>
                          <SelectItem value="Bag">{t('package.packageType.bag', 'Çanta')}</SelectItem>
                          <SelectItem value="Custom">{t('package.packageType.custom', 'Özel')}</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={packageForm.control}
                  name="length"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('package.form.length', 'Uzunluk')}</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          value={field.value || ''}
                          onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={packageForm.control}
                  name="width"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('package.form.width', 'Genişlik')}</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          value={field.value || ''}
                          onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={packageForm.control}
                  name="height"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('package.form.height', 'Yükseklik')}</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          value={field.value || ''}
                          onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={packageForm.control}
                  name="volume"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('package.form.volume', 'Hacim')}</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          value={field.value || ''}
                          onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={packageForm.control}
                  name="netWeight"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('package.form.netWeight', 'Net Ağırlık')}</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          value={field.value || ''}
                          onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={packageForm.control}
                  name="tareWeight"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('package.form.tareWeight', 'Dara Ağırlık')}</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          value={field.value || ''}
                          onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={packageForm.control}
                  name="grossWeight"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('package.form.grossWeight', 'Brüt Ağırlık')}</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          value={field.value || ''}
                          onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={packageForm.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('package.form.status', 'Durum')}</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Open">{t('package.packageStatus.open', 'Açık')}</SelectItem>
                          <SelectItem value="Closed">{t('package.packageStatus.closed', 'Kapalı')}</SelectItem>
                          <SelectItem value="Loaded">{t('package.packageStatus.loaded', 'Yüklendi')}</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setPackageDialogOpen(false);
                    packageForm.reset();
                  }}
                >
                  {t('common.cancel')}
                </Button>
                <Button type="submit" disabled={createPackageMutation.isPending}>
                  {createPackageMutation.isPending ? t('common.saving') : t('common.save')}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog open={lineDialogOpen} onOpenChange={setLineDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t('package.detail.addLine', 'Yeni Satır Ekle')}</DialogTitle>
            <DialogDescription>
              {t('package.detail.addLineDescription', 'Yeni bir satır ekleyin')}
            </DialogDescription>
          </DialogHeader>
          <Form {...lineForm}>
            <form onSubmit={lineForm.handleSubmit(handleLineSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={lineForm.control}
                  name="packageId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {t('package.form.package', 'Paket')} <span className="text-destructive">*</span>
                      </FormLabel>
                      <Select
                        value={field.value ? field.value.toString() : ''}
                        onValueChange={(value) => field.onChange(parseInt(value, 10))}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={t('package.form.selectPackage', 'Paket Seçin')} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {packages?.map((pkg) => (
                            <SelectItem key={pkg.id} value={pkg.id.toString()}>
                              {pkg.barcode || pkg.packageNo}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={lineForm.control}
                  name="barcode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('package.form.barcode', 'Barkod')}</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={lineForm.control}
                  name="stockCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {t('package.form.stockCode', 'Stok Kodu')} <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={lineForm.control}
                  name="yapKod"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {t('package.form.yapKod', 'Yap Kodu')} <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={lineForm.control}
                  name="quantity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {t('package.form.quantity', 'Miktar')} <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          {...field}
                          value={field.value || ''}
                          onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={lineForm.control}
                  name="sourceRouteId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('package.form.sourceRouteId', 'Kaynak Rota ID')}</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          value={field.value || ''}
                          onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value, 10) : undefined)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={lineForm.control}
                  name="serialNo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('package.form.serialNo', 'Seri No')}</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={lineForm.control}
                  name="serialNo2"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('package.form.serialNo2', 'Seri No 2')}</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={lineForm.control}
                  name="serialNo3"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('package.form.serialNo3', 'Seri No 3')}</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={lineForm.control}
                  name="serialNo4"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('package.form.serialNo4', 'Seri No 4')}</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setLineDialogOpen(false);
                    lineForm.reset();
                  }}
                >
                  {t('common.cancel')}
                </Button>
                <Button type="submit" disabled={createLineMutation.isPending}>
                  {createLineMutation.isPending ? t('common.saving') : t('common.save')}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

