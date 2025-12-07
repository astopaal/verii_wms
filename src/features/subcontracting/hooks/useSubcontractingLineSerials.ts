import { useQuery } from '@tanstack/react-query';
import { subcontractingApi } from '../api/subcontracting-api';

export function useSubcontractingLineSerials(lineId: number | null, documentType: string | null) {
  return useQuery({
    queryKey: ['subcontracting-line-serials', lineId, documentType],
    queryFn: () => {
      if (!lineId || !documentType) return Promise.resolve({ success: true, data: [] });
      if (documentType === 'SRT') {
        return subcontractingApi.getReceiptLineSerials(lineId);
      }
      return subcontractingApi.getIssueLineSerials(lineId);
    },
    enabled: !!lineId && !!documentType,
    staleTime: 2 * 60 * 1000,
  });
}

