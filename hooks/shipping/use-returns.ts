'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchReturnsAction,
  fetchReturnByIdAction,
  createReturnRequestAction,
  approveReturnAction,
  rejectReturnAction,
  markReturnReceivedAction,
  syncReturnInventoryAction,
  completeReturnAction,
} from '@/actions/returns.actions';
import { ReturnFilters } from '@/types/shipping.types';

export const returnKeys = {
  all: ['returns'] as const,
  list: (filters: ReturnFilters) => ['returns', 'list', filters] as const,
  detail: (id: string) => ['returns', 'detail', id] as const,
};

export function useReturns(filters: ReturnFilters = {}) {
  return useQuery({
    queryKey: returnKeys.list(filters),
    queryFn: async () => {
      const res = await fetchReturnsAction(filters as any);
      if (!res.success) throw new Error(res.error);
      return res.data;
    },
    staleTime: 30_000,
  });
}

export function useReturnDetail(returnId: string | undefined) {
  return useQuery({
    queryKey: returnKeys.detail(returnId ?? ''),
    queryFn: async () => {
      const res = await fetchReturnByIdAction(returnId!);
      if (!res.success) throw new Error(res.error);
      return res.data;
    },
    enabled: !!returnId,
    staleTime: 15_000,
  });
}

export function useCreateReturn() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: any) => {
      const res = await createReturnRequestAction(input);
      if (!res.success) throw new Error(res.error);
      return res.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: returnKeys.all }),
  });
}

export function useApproveReturn() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (returnId: string) => {
      const res = await approveReturnAction(returnId);
      if (!res.success) throw new Error(res.error);
      return res.data;
    },
    onSuccess: (_, returnId) => {
      qc.invalidateQueries({ queryKey: returnKeys.all });
      qc.invalidateQueries({ queryKey: returnKeys.detail(returnId) });
    },
  });
}

export function useRejectReturn() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ returnId, reason }: { returnId: string; reason: string }) => {
      const res = await rejectReturnAction(returnId, reason);
      if (!res.success) throw new Error(res.error);
      return res.data;
    },
    onSuccess: (_, { returnId }) => {
      qc.invalidateQueries({ queryKey: returnKeys.all });
      qc.invalidateQueries({ queryKey: returnKeys.detail(returnId) });
    },
  });
}

export function useMarkReturnReceived() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (returnId: string) => {
      const res = await markReturnReceivedAction(returnId);
      if (!res.success) throw new Error(res.error);
      return res.data;
    },
    onSuccess: (_, returnId) => {
      qc.invalidateQueries({ queryKey: returnKeys.all });
      qc.invalidateQueries({ queryKey: returnKeys.detail(returnId) });
    },
  });
}

export function useSyncReturnInventory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (returnId: string) => {
      const res = await syncReturnInventoryAction(returnId);
      if (!res.success) throw new Error(res.error);
      return res.data;
    },
    onSuccess: (_, returnId) => {
      qc.invalidateQueries({ queryKey: returnKeys.all });
      qc.invalidateQueries({ queryKey: returnKeys.detail(returnId) });
    },
  });
}

export function useCompleteReturn() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (returnId: string) => {
      const res = await completeReturnAction(returnId);
      if (!res.success) throw new Error(res.error);
      return res.data;
    },
    onSuccess: (_, returnId) => {
      qc.invalidateQueries({ queryKey: returnKeys.all });
      qc.invalidateQueries({ queryKey: returnKeys.detail(returnId) });
    },
  });
}
