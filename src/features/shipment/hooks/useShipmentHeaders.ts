import { useQuery } from '@tanstack/react-query';
import { shipmentApi } from '../api/shipment-api';
import { SHIPMENT_QUERY_KEYS } from '../utils/query-keys';

export function useShipmentHeaders() {
  return useQuery({
    queryKey: [SHIPMENT_QUERY_KEYS.HEADERS],
    queryFn: () => shipmentApi.getHeaders(),
    staleTime: 2 * 60 * 1000,
  });
}
