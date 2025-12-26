import { type ReactElement, useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useUIStore } from '@/stores/ui-store';
import { usePPackage } from '../hooks/usePPackage';
import { usePLinesByPackage } from '../hooks/usePLinesByPackage';
import { useDeletePPackage } from '../hooks/useDeletePPackage';
import { useCreatePLine } from '../hooks/useCreatePLine';
import { useDeletePLine } from '../hooks/useDeletePLine';
import { pLineFormSchema, type PLineFormData } from '../types/package';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
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
import { Trash2, Plus, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import type { PLineDto } from '../types/package';

const getStatusBadgeColor = (status: string): string => {
  switch (status) {
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

export function PackagePackageDetailPage(): ReactElement {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { setPageTitle } = useUIStore();
  const packageId = id ? parseInt(id, 10) : undefined;
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [lineDialogOpen, setLineDialogOpen] = useState(false);

  const { data: packageData, isLoading: isLoadingPackage } = usePPackage(packageId);
  const { data: lines, isLoading: isLoadingLines } = usePLinesByPackage(packageId);
  const deleteMutation = useDeletePPackage();
  const createLineMutation = useCreatePLine();
  const deleteLineMutation = useDeletePLine();

  const lineSchema = useMemo(() => pLineFormSchema(t), [t]);

  const lineForm = useForm<PLineFormData>({
    resolver: zodResolver(lineSchema),
    defaultValues: {
      packingHeaderId: packageData?.packingHeaderId || 0,
      packageId: packageId || 0,
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
    if (packageData) {
      lineForm.setValue('packingHeaderId', packageData.packingHeaderId);
      lineForm.setValue('packageId', packageData.id);
    }
  }, [packageData, lineForm]);

  useEffect(() => {
    if (packageData) {
      setPageTitle(t('package.packageDetail.title', 'Paket Detayı') + ' - ' + packageData.packageNo);
    } else {
      setPageTitle(t('package.packageDetail.title', 'Paket Detayı'));
    }
    return () => {
      setPageTitle(null);
    };
  }, [t, setPageTitle, packageData]);

  const handleDelete = async (): Promise<void> => {
    if (!packageId || !packageData) return;

    try {
      await deleteMutation.mutateAsync(packageId);
      toast.success(t('package.packageDetail.deleteSuccess', 'Paket başarıyla silindi'));
      navigate(`/package/detail/${packageData.packingHeaderId}`);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : t('package.packageDetail.deleteError', 'Paket silinirken bir hata oluştu')
      );
    }
  };

  const handleDeleteLine = async (lineId: number): Promise<void> => {
    try {
      await deleteLineMutation.mutateAsync(lineId);
      toast.success(t('package.packageDetail.lineDeleteSuccess', 'Satır başarıyla silindi'));
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : t('package.packageDetail.lineDeleteError', 'Satır silinirken bir hata oluştu')
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
      toast.success(t('package.packageDetail.lineAddSuccess', 'Satır başarıyla eklendi'));
      setLineDialogOpen(false);
      lineForm.reset();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : t('package.packageDetail.lineAddError', 'Satır eklenirken bir hata oluştu')
      );
    }
  };

  if (isLoadingPackage) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">{t('common.loading')}</p>
      </div>
    );
  }

  if (!packageData) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-destructive">{t('package.packageDetail.notFound', 'Paket bulunamadı')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle>{t('package.packageDetail.title', 'Paket Detayı')}</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">{packageData.packageNo}</p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={() => navigate(`/package/detail/${packageData.packingHeaderId}`)}>
                <ArrowLeft className="size-4 mr-2" />
                {t('package.packageDetail.backToHeader', 'Paketlemeye Dön')}
              </Button>
              <Button variant="destructive" onClick={() => setDeleteDialogOpen(true)}>
                <Trash2 className="size-4 mr-2" />
                {t('common.delete')}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                {t('package.packageDetail.status', 'Durum')}
              </p>
              <Badge className={getStatusBadgeColor(packageData.status)}>
                {t(`package.packageStatus.${packageData.status.toLowerCase()}`, packageData.status)}
              </Badge>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                {t('package.packageDetail.packageType', 'Paket Tipi')}
              </p>
              <p className="text-base">{packageData.packageType}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                {t('package.packageDetail.barcode', 'Barkod')}
              </p>
              <p className="text-base">{packageData.barcode || '-'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                {t('package.packageDetail.length', 'Uzunluk')}
              </p>
              <p className="text-base">{packageData.length || '-'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                {t('package.packageDetail.width', 'Genişlik')}
              </p>
              <p className="text-base">{packageData.width || '-'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                {t('package.packageDetail.height', 'Yükseklik')}
              </p>
              <p className="text-base">{packageData.height || '-'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                {t('package.packageDetail.volume', 'Hacim')}
              </p>
              <p className="text-base">{packageData.volume || '-'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                {t('package.packageDetail.netWeight', 'Net Ağırlık')}
              </p>
              <p className="text-base">{packageData.netWeight || '-'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                {t('package.packageDetail.grossWeight', 'Brüt Ağırlık')}
              </p>
              <p className="text-base">{packageData.grossWeight || '-'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                {t('package.packageDetail.isMixed', 'Karışık')}
              </p>
              <p className="text-base">{packageData.isMixed ? t('common.yes') : t('common.no')}</p>
            </div>
          </div>

          <div className="flex justify-end mb-4">
            <Button onClick={() => setLineDialogOpen(true)}>
              <Plus className="size-4 mr-2" />
              {t('package.packageDetail.addLine', 'Yeni Satır Ekle')}
            </Button>
          </div>

          {isLoadingLines ? (
            <p className="text-muted-foreground">{t('common.loading')}</p>
          ) : lines && lines.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                    <TableRow>
                      <TableHead>{t('package.packageDetail.barcode', 'Barkod')}</TableHead>
                      <TableHead>{t('package.packageDetail.stockCode', 'Stok Kodu')}</TableHead>
                      <TableHead>{t('package.packageDetail.stockName', 'Stok Adı')}</TableHead>
                      <TableHead>{t('package.packageDetail.yapKod', 'Yap Kodu')}</TableHead>
                      <TableHead>{t('package.packageDetail.yapAcik', 'Yap Açıklama')}</TableHead>
                      <TableHead>{t('package.packageDetail.quantity', 'Miktar')}</TableHead>
                      <TableHead>{t('package.packageDetail.serialNo', 'Seri No')}</TableHead>
                      <TableHead>{t('package.packageDetail.actions', 'İşlemler')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {lines.map((line: PLineDto) => (
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
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteLine(line.id)}
                            disabled={deleteLineMutation.isPending}
                          >
                            <Trash2 className="size-4" />
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
              {t('package.packageDetail.noLines', 'Satır bulunamadı')}
            </p>
          )}
        </CardContent>
      </Card>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('package.packageDetail.deleteConfirm', 'Paketi Sil')}</DialogTitle>
            <DialogDescription>
              {t('package.packageDetail.deleteConfirmMessage', 'Bu paketi silmek istediğinizden emin misiniz?')}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleteMutation.isPending}>
              {deleteMutation.isPending ? t('common.loading') : t('common.delete')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={lineDialogOpen} onOpenChange={setLineDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t('package.packageDetail.addLine', 'Yeni Satır Ekle')}</DialogTitle>
            <DialogDescription>
              {t('package.packageDetail.addLineDescription', 'Yeni bir satır ekleyin')}
            </DialogDescription>
          </DialogHeader>
          <Form {...lineForm}>
            <form onSubmit={lineForm.handleSubmit(handleLineSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

