import { useQuery } from '@tanstack/react-query';
import { transferApi } from '../api/transfer-api';

export function useTransferLines(headerId: number | null) {
  return useQuery({
    queryKey: ['transferLines', headerId],
    queryFn: () => {
      if (!headerId) throw new Error('Header ID is required');
      return transferApi.getLines(headerId);
    },
    enabled: !!headerId,
    staleTime: 2 * 60 * 1000,
  });
}

