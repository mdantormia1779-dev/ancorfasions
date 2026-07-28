import { useQuery } from '@tanstack/react-query';
import { fetchOrdersAction } from '@/app/actions/oms/order.actions';

export function useOrders(params: { customerId?: string; status?: any; page?: number; limit?: number }) {
  return useQuery({
    queryKey: ['orders', params],
    queryFn: async () => {
      const response = await fetchOrdersAction(params);
      if (!response.success) {
        throw new Error(response.error);
      }
      return response.data;
    },
  });
}
