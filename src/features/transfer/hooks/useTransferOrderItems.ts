import { useQuery } from '@tanstack/react-query';
import { transferApi } from '../api/transfer-api';

export const useTransferOrderItems = (orderNumbers: string | undefined) => {
  return useQuery({
    queryKey: ['transfer-order-items', orderNumbers],
    queryFn: () => transferApi.getOrderItems(orderNumbers!),
    enabled: !!orderNumbers,
    staleTime: 5 * 60 * 1000,
  });
};

