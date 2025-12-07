import { useQuery } from '@tanstack/react-query';
import { subcontractingApi } from '../api/subcontracting-api';

export function useSubcontractingLines(headerId: number | null, documentType: string | null) {
  return useQuery({
    queryKey: ['subcontracting-lines', headerId, documentType],
    queryFn: () => {
      if (!headerId || !documentType) return Promise.resolve({ success: true, data: [] });
      if (documentType === 'SRT') {
        return subcontractingApi.getReceiptLines(headerId);
      }
      return subcontractingApi.getIssueLines(headerId);
    },
    enabled: !!headerId && !!documentType,
    staleTime: 2 * 60 * 1000,
  });
}

