import { type ReactElement, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useCollectedBarcodes } from '../hooks/useCollectedBarcodes';
import { useDeleteRoute } from '../hooks/useDeleteRoute';
import { ArrowLeft, Loader2, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export function CollectedBarcodesPage(): ReactElement {
  const { headerId } = useParams<{ headerId: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const headerIdNum = headerId ? parseInt(headerId, 10) : 0;
  const { data: collectedData, isLoading } = useCollectedBarcodes(headerIdNum);
  const deleteRouteMutation = useDeleteRoute();

  const handleDeleteBarcode = (routeId: number) => {
    deleteRouteMutation.mutate(routeId, {
      onSuccess: (response) => {
        if (response.success) {
          toast.success(t('transfer.collection.deleteSuccess', 'Barkod başarıyla silindi'));
        } else {
          toast.error(response.message || t('transfer.collection.deleteError', 'Barkod silinemedi'));
        }
      },
      onError: (error: Error) => {
        toast.error(error.message || t('transfer.collection.deleteError', 'Barkod silinemedi'));
      },
    });
  };

  const allCollectedBarcodes = useMemo(() => {
    if (!collectedData?.data) return [];
    
    return collectedData.data.flatMap((item) =>
      item.routes.map((route) => ({
        routeId: route.id,
        barcode: route.scannedBarcode,
        stockCode: route.stockCode,
        stockName: item.importLine.stockName,
        yapKod: route.yapKod,
        quantity: route.quantity,
        serialNo: route.serialNo,
        serialNo2: route.serialNo2,
        serialNo3: route.serialNo3,
        serialNo4: route.serialNo4,
        sourceCellCode: route.sourceCellCode,
        targetCellCode: route.targetCellCode,
        createdDate: route.createdDate,
      }))
    );
  }, [collectedData?.data]);

  return (
    <div className="flex flex-col h-[calc(100vh-10rem)] overflow-hidden">
      <div className="shrink-0 p-4 space-y-4 border-b bg-background">
        <div className="flex items-center justify-between gap-2">
          <Button variant="outline" size="sm" onClick={() => navigate(`/transfer/collection/${headerId}`)}>
            <ArrowLeft className="size-4 mr-2" />
            {t('common.back', 'Geri')}
          </Button>
          <div className="text-sm text-muted-foreground">
            {t('transfer.collection.totalCollected', 'Toplam')} {allCollectedBarcodes.length} {t('transfer.collection.itemsCollected', 'adet ürün toplandı')}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <Card>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="size-8 animate-spin text-muted-foreground" />
              </div>
            ) : allCollectedBarcodes.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('transfer.collection.barcode', 'Barkod')}</TableHead>
                    <TableHead>{t('transfer.collection.stockCode', 'Stok Kodu')}</TableHead>
                    <TableHead>{t('transfer.collection.stockName', 'Stok Adı')}</TableHead>
                    <TableHead>{t('transfer.collection.yapKod', 'Yapı')}</TableHead>
                    <TableHead className="text-right">{t('transfer.collection.quantity', 'Miktar')}</TableHead>
                    <TableHead className="text-right">{t('common.actions', 'İşlemler')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {allCollectedBarcodes.map((item) => (
                    <TableRow key={item.routeId}>
                      <TableCell>
                        <Badge variant="outline" className="font-mono">
                          {item.barcode}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{item.stockCode}</Badge>
                      </TableCell>
                      <TableCell className="max-w-xs truncate">{item.stockName}</TableCell>
                      <TableCell>
                        {item.yapKod && (
                          <Badge variant="outline" className="text-xs">
                            {item.yapKod}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right font-semibold">{item.quantity}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteBarcode(item.routeId)}
                          disabled={deleteRouteMutation.isPending}
                          className="text-destructive hover:text-destructive"
                        >
                          {deleteRouteMutation.isPending ? (
                            <Loader2 className="size-4 animate-spin" />
                          ) : (
                            <Trash2 className="size-4" />
                          )}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground">
                  {t('transfer.collection.noCollectedBarcodes', 'Henüz toplanan barkod bulunmuyor')}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
