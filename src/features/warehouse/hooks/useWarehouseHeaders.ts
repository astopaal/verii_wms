import { useQuery } from '@tanstack/react-query';
import { warehouseApi } from '../api/warehouse-api';

export function useWarehouseInboundHeaders() {
  return useQuery({
    queryKey: ['warehouse-inbound-headers'],
    queryFn: () => warehouseApi.getInboundHeaders(),
    staleTime: 2 * 60 * 1000,
  });
}

export function useWarehouseOutboundHeaders() {
  return useQuery({
    queryKey: ['warehouse-outbound-headers'],
    queryFn: () => warehouseApi.getOutboundHeaders(),
    staleTime: 2 * 60 * 1000,
  });
}

