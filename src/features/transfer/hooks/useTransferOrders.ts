import { useQuery } from '@tanstack/react-query';
import { transferApi } from '../api/transfer-api';

export const useTransferOrders = (customerCode: string | undefined) => {
  return useQuery({
    queryKey: ['transfer-orders', customerCode],
    queryFn: () => transferApi.getOrdersByCustomer(customerCode!),
    enabled: !!customerCode,
    staleTime: 5 * 60 * 1000,
  });
};

