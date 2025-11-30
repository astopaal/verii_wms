import { useQuery } from '@tanstack/react-query';
import { goodsReceiptApi } from '../api/goods-receipt-api';
import type { GrHeadersPagedParams } from '../types/goods-receipt';

export function useGrHeaders(params: GrHeadersPagedParams = {}) {
  return useQuery({
    queryKey: ['grHeaders', params],
    queryFn: () => goodsReceiptApi.getGrHeadersPaged(params),
    staleTime: 2 * 60 * 1000,
  });
}

