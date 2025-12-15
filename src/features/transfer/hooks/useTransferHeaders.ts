import { useQuery } from '@tanstack/react-query';
import { transferApi } from '../api/transfer-api';
import { TRANSFER_QUERY_KEYS } from '../utils/query-keys';

export function useTransferHeaders() {
  return useQuery({
    queryKey: [TRANSFER_QUERY_KEYS.HEADERS],
    queryFn: () => transferApi.getHeaders(),
    staleTime: 2 * 60 * 1000,
  });
}

