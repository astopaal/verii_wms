import { useQuery } from '@tanstack/react-query';
import { goodsReceiptApi } from '../api/goods-receipt-api';

export function useProducts() {
  return useQuery({
    queryKey: ['products'],
    queryFn: () => goodsReceiptApi.getProducts(),
    staleTime: 2 * 60 * 60 * 1000,
  });
}

