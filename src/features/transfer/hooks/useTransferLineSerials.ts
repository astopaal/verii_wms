import { useQuery } from '@tanstack/react-query';
import { transferApi } from '../api/transfer-api';

export function useTransferLineSerials(lineId: number | null) {
  return useQuery({
    queryKey: ['transferLineSerials', lineId],
    queryFn: () => {
      if (!lineId) throw new Error('Line ID is required');
      return transferApi.getLineSerials(lineId);
    },
    enabled: !!lineId,
    staleTime: 2 * 60 * 1000,
  });
}

