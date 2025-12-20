import { type ReactElement, useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useUIStore } from '@/stores/ui-store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useStokBarcode } from '../hooks/useStokBarcode';
import { useAddBarcode } from '../hooks/useAddBarcode';
import { useCollectedBarcodes } from '../hooks/useCollectedBarcodes';
import { useAssignedTransferOrderLines } from '../hooks/useAssignedTransferOrderLines';
import { Barcode, Package, ArrowLeft, Loader2, CheckCircle2, List } from 'lucide-react';
import { toast } from 'sonner';
import type { StokBarcodeDto } from '../types/transfer';

export function TransferCollectionPage(): ReactElement {
  const { headerId } = useParams<{ headerId: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { setPageTitle } = useUIStore();
  const [barcodeInput, setBarcodeInput] = useState('');
  const [searchBarcode, setSearchBarcode] = useState('');
  const [enableSearch, setEnableSearch] = useState(false);
  const [selectedStock, setSelectedStock] = useState<StokBarcodeDto | null>(null);
  const [quantity, setQuantity] = useState<number>(1);

  const headerIdNum = headerId ? parseInt(headerId, 10) : 0;

  const { data: orderLinesData } = useAssignedTransferOrderLines(headerIdNum);
  const { data: collectedData, isLoading: isLoadingCollected } = useCollectedBarcodes(headerIdNum);
  const { data: barcodeData, isLoading: isSearching } = useStokBarcode(searchBarcode, '1', enableSearch);
  const addBarcodeMutation = useAddBarcode();

  useEffect(() => {
    setPageTitle(t('transfer.collection.title', 'Transfer Toplama'));
    return () => {
      setPageTitle(null);
    };
  }, [t, setPageTitle]);

  useEffect(() => {
    if (barcodeData?.success && barcodeData.data && barcodeData.data.length > 0) {
      setSelectedStock(barcodeData.data[0]);
      setEnableSearch(false);
    } else if (barcodeData && !barcodeData.success) {
      toast.error(t('transfer.collection.stockNotFound', 'Stok bulunamadı'));
      setEnableSearch(false);
    }
  }, [barcodeData, t]);

  const handleBarcodeSearch = () => {
    if (!barcodeInput.trim()) {
      toast.error(t('transfer.collection.enterBarcode', 'Lütfen barkod giriniz'));
      return;
    }
    setSearchBarcode(barcodeInput);
    setEnableSearch(true);
  };

  const handleCollect = () => {
    if (!selectedStock) {
      toast.error(t('transfer.collection.noStockSelected', 'Lütfen önce stok bilgisi getirin'));
      return;
    }

    if (quantity <= 0) {
      toast.error(t('transfer.collection.invalidQuantity', 'Geçersiz miktar'));
      return;
    }

    const matchingLine = orderLinesData?.data?.lines.find(
      (line) => line.stockCode === selectedStock.stokKodu
    );

    if (!matchingLine) {
      toast.error(t('transfer.collection.stockNotInOrder', 'Bu stok transfer emrinde bulunmuyor'));
      return;
    }

    addBarcodeMutation.mutate(
      {
        headerId: headerIdNum,
        lineId: matchingLine.id,
        barcode: selectedStock.barkod,
        stockCode: selectedStock.stokKodu,
        stockName: selectedStock.stokAdi,
        yapKod: selectedStock.yapKod || '',
        yapAcik: selectedStock.yapAcik || '',
        quantity: quantity,
        serialNo: '',
        serialNo2: '',
        serialNo3: '',
        serialNo4: '',
        sourceCellCode: '',
        targetCellCode: '',
      },
      {
        onSuccess: (response) => {
          if (response.success) {
            toast.success(t('transfer.collection.collected', 'Ürün toplandı'));
            setBarcodeInput('');
            setSelectedStock(null);
            setQuantity(1);
          } else {
            toast.error(response.message || t('transfer.collection.collectError', 'Toplama hatası'));
          }
        },
        onError: (error: Error) => {
          toast.error(error.message || t('transfer.collection.collectError', 'Toplama hatası'));
        },
      }
    );
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleBarcodeSearch();
    }
  };

  const totalCollectedCount = useMemo(() => {
    if (!collectedData?.data) return 0;
    return collectedData.data.reduce((total, item) => total + item.routes.length, 0);
  }, [collectedData?.data]);

  const orderLinesWithCollected = useMemo(() => {
    if (!orderLinesData?.data?.lines) return [];
    
    const collectedMap: Record<number, number> = {};
    
    if (collectedData?.data) {
      collectedData.data.forEach((item) => {
        const lineId = item.importLine.lineId;
        const totalCollected = item.routes.reduce((sum, route) => sum + route.quantity, 0);
        
        if (collectedMap[lineId]) {
          collectedMap[lineId] += totalCollected;
        } else {
          collectedMap[lineId] = totalCollected;
        }
      });
    }

    return orderLinesData.data.lines.map((line) => ({
      ...line,
      collectedQuantity: collectedMap[line.id] || 0,
      remainingQuantity: line.quantity - (collectedMap[line.id] || 0),
    }));
  }, [orderLinesData?.data?.lines, collectedData?.data]);

  return (
    <div className="flex md:w-1/2 flex-col h-[calc(100vh-10rem)] overflow-hidden">
      <div className="shrink-0 p-4 space-y-4 border-b bg-background">
        <div className="flex items-center justify-between gap-2">
          <Button variant="outline" size="sm" onClick={() => navigate('/transfer/assigned')}>
            <ArrowLeft className="size-4 mr-2" />
            {t('common.back', 'Geri')}
          </Button>
          <Button variant="outline" size="sm" onClick={() => navigate(`/transfer/collected/${headerId}`)}>
            <List className="size-4 mr-2" />
            {t('transfer.collection.viewCollected', 'Toplananlar')} ({totalCollectedCount})
          </Button>
        </div>

        <Card className='py-0'>
          <CardContent className="p-3 space-y-3">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Barcode className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-muted-foreground size-4" />
                <Input
                  placeholder={t('transfer.collection.barcodePlaceholder', 'Barkod okutun veya yazın')}
                  value={barcodeInput}
                  onChange={(e) => setBarcodeInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="pl-9 h-10"
                />
              </div>
              <Button onClick={handleBarcodeSearch} disabled={isSearching} size="default">
                {isSearching ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  t('common.search', 'Ara')
                )}
              </Button>
            </div>

            {selectedStock && (
              <div className="border rounded-lg p-3 space-y-2 bg-muted/50">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <Badge variant="outline" className="mb-1 text-xs">
                      {selectedStock.stokKodu}
                    </Badge>
                    <p className="text-sm font-medium line-clamp-1">{selectedStock.stokAdi}</p>
                  </div>
                  <Badge variant="secondary" className="shrink-0">
                    <Package className="size-3 mr-1" />
                    {selectedStock.olcuAdi}
                  </Badge>
                </div>
                <div className="flex items-end gap-2">
                  <div className="flex-1">
                    <Input
                      type="number"
                      min="1"
                      value={quantity}
                      onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                      className="h-9"
                      placeholder={t('transfer.collection.quantity', 'Miktar')}
                    />
                  </div>
                  <Button
                    onClick={handleCollect}
                    disabled={addBarcodeMutation.isPending}
                    className="bg-emerald-500 hover:bg-emerald-600 text-white h-9"
                  >
                    {addBarcodeMutation.isPending ? (
                      <Loader2 className="size-4 animate-spin mr-1" />
                    ) : null}
                    {t('transfer.collection.collect', 'Topla')}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-hide p-4 space-y-2 border border-#fee rounded-md">
        {orderLinesWithCollected.length > 0 ? (
          orderLinesWithCollected.map((line) => (
            <Card key={line.id} className="border py-2">
              <CardContent className="px-3">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex-1 min-w-0">
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4">
                      {line.stockCode}
                    </Badge>
                    <p className="text-xs font-medium line-clamp-2 mt-1">{line.stockName}</p>
                    {line.yapKod && (
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        {t('transfer.collection.yapKod', 'Yapı')}: {line.yapKod}
                      </p>
                    )}
                  </div>
                  {line.remainingQuantity === 0 && (
                    <CheckCircle2 className="size-4 text-emerald-500 shrink-0" />
                  )}
                </div>

                <div className="grid grid-cols-3 gap-1.5 mb-1.5">
                  <div className="text-center">
                    <p className="text-[10px] text-muted-foreground mb-0.5">
                      {t('transfer.collection.total', 'Toplam')}
                    </p>
                    <p className="text-sm font-bold leading-none">
                      {line.quantity}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-[10px] text-muted-foreground mb-0.5">
                      {t('transfer.collection.collected', 'Toplanan')}
                    </p>
                    <p className="text-sm font-bold text-emerald-600 leading-none">
                      {line.collectedQuantity}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-[10px] text-muted-foreground mb-0.5">
                      {t('transfer.collection.remaining', 'Kalan')}
                    </p>
                    <p className={`text-sm font-bold leading-none ${line.remainingQuantity === 0 ? 'text-emerald-600' : 'text-orange-600'}`}>
                      {line.remainingQuantity}
                    </p>
                  </div>
                </div>

                <div className="w-full bg-gray-200 rounded-full h-1">
                  <div
                    className="bg-emerald-500 h-1 rounded-full transition-all duration-300"
                    style={{ width: `${(line.collectedQuantity / line.quantity) * 100}%` }}
                  />
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="text-center py-8">
            <p className="text-sm text-muted-foreground">
              {t('transfer.collection.noOrderLines', 'Transfer emri kalemleri bulunamadı')}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
