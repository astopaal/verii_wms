import { useQuery } from '@tanstack/react-query';
import { subcontractingApi } from '../api/subcontracting-api';

export function useSubcontractingReceiptHeaders() {
  return useQuery({
    queryKey: ['subcontracting-receipt-headers'],
    queryFn: () => subcontractingApi.getReceiptHeaders(),
    staleTime: 2 * 60 * 1000,
  });
}

export function useSubcontractingIssueHeaders() {
  return useQuery({
    queryKey: ['subcontracting-issue-headers'],
    queryFn: () => subcontractingApi.getIssueHeaders(),
    staleTime: 2 * 60 * 1000,
  });
}

