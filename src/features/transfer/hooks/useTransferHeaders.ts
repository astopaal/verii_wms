import { useQuery } from '@tanstack/react-query';
import { transferApi } from '../api/transfer-api';

export function useTransferHeaders() {
  return useQuery({
    queryKey: ['transferHeaders'],
    queryFn: () => transferApi.getHeaders(),
    staleTime: 2 * 60 * 1000,
  });
}

