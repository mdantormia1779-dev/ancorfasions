'use server';

// ============================================================================
// Returns Server Actions
// ============================================================================

import { revalidatePath } from 'next/cache';
import { ReturnsService } from '@/services/shipping/returns.service';
import {
  createReturnSchema,
  approveReturnSchema,
  rejectReturnSchema,
  returnFiltersSchema,
} from '@/schemas/shipping.schema';
import { createClient } from '@/lib/supabase/server-client';

type ActionResponse<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };

async function getCurrentUser() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  } catch {
    return null;
  }
}

export async function createReturnRequestAction(
  raw: Record<string, any>
): Promise<ActionResponse<{ returnId: string; returnNumber: string }>> {
  const parse = createReturnSchema.safeParse(raw);
  if (!parse.success) {
    return { success: false, error: parse.error.errors[0]?.message ?? 'Validation failed' };
  }

  try {
    const user = await getCurrentUser();
    const service = new ReturnsService();
    const returnRecord = await service.createReturnRequest(
      parse.data as any,
      user?.id,
      user?.id
    );

    revalidatePath('/admin/shipping/returns');
    revalidatePath(`/admin/orders/${parse.data.orderId}`);

    return {
      success: true,
      data: { returnId: returnRecord.id, returnNumber: returnRecord.return_number },
    };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function approveReturnAction(
  returnId: string
): Promise<ActionResponse<{ returnId: string }>> {
  const parse = approveReturnSchema.safeParse({ returnId });
  if (!parse.success) {
    return { success: false, error: 'Invalid return ID' };
  }

  try {
    const user = await getCurrentUser();
    const service = new ReturnsService();
    await service.approveReturn(returnId, user?.id);

    revalidatePath('/admin/shipping/returns');
    revalidatePath(`/admin/shipping/returns/${returnId}`);

    return { success: true, data: { returnId } };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function rejectReturnAction(
  returnId: string,
  reason: string
): Promise<ActionResponse<{ returnId: string }>> {
  const parse = rejectReturnSchema.safeParse({ returnId, reason });
  if (!parse.success) {
    return { success: false, error: parse.error.errors[0]?.message ?? 'Validation failed' };
  }

  try {
    const user = await getCurrentUser();
    const service = new ReturnsService();
    await service.rejectReturn(returnId, reason, user?.id);

    revalidatePath('/admin/shipping/returns');
    revalidatePath(`/admin/shipping/returns/${returnId}`);

    return { success: true, data: { returnId } };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function fetchReturnsAction(
  rawFilters: Record<string, any> = {}
): Promise<ActionResponse<any>> {
  const parse = returnFiltersSchema.safeParse(rawFilters);
  if (!parse.success) {
    return { success: false, error: 'Invalid filters' };
  }

  try {
    const service = new ReturnsService();
    const result = await service.listReturns(parse.data as any);
    return { success: true, data: result };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function fetchReturnByIdAction(
  returnId: string
): Promise<ActionResponse<any>> {
  try {
    const service = new ReturnsService();
    const returnRecord = await service.getReturnWithItems(returnId);

    if (!returnRecord) return { success: false, error: 'Return not found' };
    return { success: true, data: returnRecord };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function markReturnReceivedAction(
  returnId: string
): Promise<ActionResponse<{ returnId: string }>> {
  try {
    const service = new ReturnsService();
    await service.markReturnReceived(returnId);

    revalidatePath('/admin/shipping/returns');
    revalidatePath(`/admin/shipping/returns/${returnId}`);

    return { success: true, data: { returnId } };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function syncReturnInventoryAction(
  returnId: string
): Promise<ActionResponse<{ returnId: string }>> {
  try {
    const service = new ReturnsService();
    await service.syncReturnInventory(returnId);

    revalidatePath('/admin/shipping/returns');
    revalidatePath(`/admin/shipping/returns/${returnId}`);

    return { success: true, data: { returnId } };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function completeReturnAction(
  returnId: string
): Promise<ActionResponse<{ returnId: string }>> {
  try {
    const service = new ReturnsService();
    await service.completeReturn(returnId);

    revalidatePath('/admin/shipping/returns');
    revalidatePath(`/admin/shipping/returns/${returnId}`);

    return { success: true, data: { returnId } };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
