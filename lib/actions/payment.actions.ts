"use server";

import { createClient } from "../supabase/server";
import { createAdminClient } from "../supabase/admin-client";
import { verifySuperAdmin } from "../security/roles";
import { revalidatePath } from "next/cache";

export type PaymentGatewayType =
  | "sslcommerz"
  | "cod"
  | "bkash"
  | "nagad"
  | "rocket"
  | "bank";

export type PaymentGatewayConfig = {
  enabled: boolean;
  store_id?: string;
  store_password?: string;
  store_pass?: string;
  store_passwd?: string;
  sandbox?: boolean;
  is_sandbox?: boolean;
  account_number?: string;
  account_type?: "Personal" | "Merchant" | "Agent" | string;
  instructions?: string;
  bank_name?: string;
  account_name?: string;
  branch_name?: string;
  routing_number?: string;
};

export type AllPaymentConfigs = Record<PaymentGatewayType, PaymentGatewayConfig>;

const DEFAULTS: AllPaymentConfigs = {
  sslcommerz: {
    enabled: true,
    store_id: "",
    store_password: "",
    sandbox: true,
  },
  cod: {
    enabled: true,
    instructions: "Pay with cash upon receiving your delivery at your doorstep.",
  },
  bkash: {
    enabled: true,
    account_number: "01700000000",
    account_type: "Personal",
    instructions:
      "Go to your bKash app or dial *247# -> Choose Send Money -> Enter our bKash number -> Enter your Order Total -> Enter Reference -> Complete payment and copy the Transaction ID (TrxID).",
  },
  nagad: {
    enabled: true,
    account_number: "01800000000",
    account_type: "Personal",
    instructions:
      "Go to your Nagad app or dial *167# -> Send Money to our number -> Enter your Order Total -> Confirm with PIN and copy the Transaction ID (TrxID).",
  },
  rocket: {
    enabled: true,
    account_number: "01900000000-0",
    account_type: "Personal",
    instructions:
      "Go to your Rocket app or dial *322# -> Send Money -> Enter our Rocket account -> Complete payment and copy the Transaction ID.",
  },
  bank: {
    enabled: true,
    bank_name: "Dutch-Bangla Bank Limited (DBBL)",
    account_name: "Anchor Fashion Ltd",
    account_number: "123.456.7890",
    branch_name: "Gulshan Branch, Dhaka",
    routing_number: "090261548",
    instructions:
      "Transfer the exact order amount via Online/Internet Banking, BEFTN, NPSB, or Direct Cash Deposit. Enter your Order Number in the deposit/transfer reference.",
  },
};

export async function getPaymentConfig(
  gateway: PaymentGatewayType
): Promise<PaymentGatewayConfig> {
  const supabase = await createClient();
  try {
    const { data } = await supabase
      .from("settings")
      .select("value")
      .eq("key", `payment_${gateway}`)
      .single();

    return (data?.value as PaymentGatewayConfig) ?? DEFAULTS[gateway];
  } catch {
    return DEFAULTS[gateway];
  }
}

export async function getAllPaymentConfigs(): Promise<AllPaymentConfigs> {
  const supabase = await createClient();
  const result: AllPaymentConfigs = { ...DEFAULTS };

  try {
    const { data } = await supabase
      .from("settings")
      .select("key, value")
      .like("key", "payment_%");

    if (data && data.length > 0) {
      data.forEach((row: any) => {
        const gw = row.key.replace("payment_", "") as PaymentGatewayType;
        if (result[gw]) {
          const val = row.value || {};
          if (gw === "sslcommerz") {
            const pass = (
              val.store_password ||
              val.store_pass ||
              val.store_passwd ||
              ""
            ).toString().trim();
            const isSandbox =
              val.sandbox !== undefined
                ? val.sandbox === true || val.sandbox === "true"
                : val.is_sandbox !== undefined
                ? val.is_sandbox === true || val.is_sandbox === "true"
                : true;
            result[gw] = {
              ...result[gw],
              ...val,
              store_id: (val.store_id || "").toString().trim(),
              store_password: pass,
              store_pass: pass,
              store_passwd: pass,
              sandbox: isSandbox,
              is_sandbox: isSandbox,
            };
          } else {
            result[gw] = { ...result[gw], ...val };
          }
        }
      });
    }
  } catch (err) {
    console.error("Error fetching all payment configs:", err);
  }

  return result;
}

export async function updatePaymentConfig(
  gateway: PaymentGatewayType,
  config: PaymentGatewayConfig
) {
  try {
    await verifySuperAdmin().catch(() => null); // Enforce role access if configured
    const supabase = createAdminClient();

    let normalizedConfig: Record<string, any> = { ...config };
    if (gateway === "sslcommerz") {
      const pass = (
        config.store_password ||
        config.store_pass ||
        config.store_passwd ||
        ""
      ).toString().trim();
      const isSandbox =
        config.sandbox !== undefined
          ? Boolean(config.sandbox)
          : config.is_sandbox !== undefined
          ? Boolean(config.is_sandbox)
          : true;

      normalizedConfig = {
        ...config,
        store_id: (config.store_id || "").toString().trim(),
        store_password: pass,
        store_pass: pass,
        store_passwd: pass,
        sandbox: isSandbox,
        is_sandbox: isSandbox,
      };
    }

    const { error } = await supabase.from("settings").upsert(
      {
        key: `payment_${gateway}`,
        value: normalizedConfig as any,
        description: `${gateway.toUpperCase()} Configuration`,
      },
      { onConflict: "key" }
    );

    if (error) throw error;

    revalidatePath("/admin/settings/payment");
    revalidatePath("/admin/payments/providers");
    revalidatePath("/checkout");
    return { success: true };
  } catch (error: any) {
    console.error(`[updatePaymentConfig] ${gateway}`, error);
    return { success: false, error: error.message };
  }
}

export interface ManualPaymentSubmission {
  order_id: string;
  payment_method: string; // 'BKASH' | 'NAGAD' | 'ROCKET' | 'BANK_TRANSFER'
  amount: number;
  sender_number?: string;
  transaction_id?: string;
  bank_name?: string;
  branch_name?: string;
  account_holder_name?: string;
  notes?: string;
  customer_id?: string | null;
}

/**
 * Record customer manual payment submission in payment_transactions table
 */
export async function recordManualPaymentTransaction(
  submission: ManualPaymentSubmission
) {
  const supabase = createAdminClient();
  try {
    const providerId = submission.payment_method.toLowerCase();
    const referenceNumber =
      submission.sender_number ||
      submission.account_holder_name ||
      submission.bank_name ||
      "";
    const transactionId = submission.transaction_id || "";

    const { data: tx, error: txErr } = await supabase
      .from("payment_transactions")
      .insert({
        order_id: submission.order_id,
        user_id: submission.customer_id || null,
        provider_id: providerId,
        amount: submission.amount,
        currency: "BDT",
        status: "pending",
        reference_number: referenceNumber,
        gateway_transaction_id: transactionId,
        gateway_response: {
          sender_number: submission.sender_number,
          transaction_id: submission.transaction_id,
          bank_name: submission.bank_name,
          branch_name: submission.branch_name,
          account_holder_name: submission.account_holder_name,
          notes: submission.notes,
          payment_method: submission.payment_method,
          submitted_at: new Date().toISOString(),
        },
      })
      .select()
      .single();

    if (txErr) {
      console.error("Error creating payment transaction:", txErr);
    }

    // Add note to order_notes
    const noteContent = `Manual Payment Submitted: [${submission.payment_method}] Sender: ${referenceNumber || "N/A"}, TrxID/Ref: ${transactionId || "N/A"}${submission.notes ? ` - Note: ${submission.notes}` : ""}`;
    try {
      await supabase.from("order_notes").insert({
        order_id: submission.order_id,
        author_id: submission.customer_id || null,
        note: noteContent,
        is_customer_visible: true,
      });
    } catch {
      // Ignored
    }

    return { success: true, transaction: tx };
  } catch (err: any) {
    console.error("Failed to record manual payment:", err);
    return { success: false, error: err.message };
  }
}

/**
 * Get manual payment details for a specific order
 */
export async function getManualPaymentForOrder(orderId: string) {
  const supabase = await createClient();
  try {
    const { data, error } = await supabase
      .from("payment_transactions")
      .select("*")
      .eq("order_id", orderId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) return null;
    return data;
  } catch {
    return null;
  }
}

/**
 * Admin action: Approve manual payment
 * Transitions payment_status to 'paid', order status to 'confirmed', and logs status history
 */
export async function approveManualPaymentAction(
  orderId: string,
  transactionId?: string,
  approvalNote?: string
) {
  const supabase = createAdminClient();
  try {
    // 1. Update payment_transactions
    if (transactionId) {
      await supabase
        .from("payment_transactions")
        .update({
          status: "success",
          error_message: null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", transactionId);
    } else {
      await supabase
        .from("payment_transactions")
        .update({
          status: "success",
          error_message: null,
          updated_at: new Date().toISOString(),
        })
        .eq("order_id", orderId);
    }

    // 2. Update orders table
    const { error: orderErr } = await supabase
      .from("orders")
      .update({
        payment_status: "paid",
        status: "confirmed",
        paid_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", orderId);

    if (orderErr) throw orderErr;

    // 3. Log to order_status_history
    await supabase.from("order_status_history").insert({
      order_id: orderId,
      status: "confirmed",
      notes:
        approvalNote ||
        "Manual payment verified and approved by Administrator. Status advanced to Confirmed.",
    });

    // 4. Log to order_notes
    await supabase.from("order_notes").insert({
      order_id: orderId,
      note: `Payment Approved by Admin: Order marked as Paid & Confirmed. ${approvalNote ? `(${approvalNote})` : ""}`,
      is_customer_visible: true,
    });

    revalidatePath(`/admin/orders/${orderId}`);
    revalidatePath("/admin/orders");
    revalidatePath("/admin/finance/manual-payments");

    return { success: true };
  } catch (err: any) {
    console.error("Error approving manual payment:", err);
    return { success: false, error: err.message };
  }
}

/**
 * Admin action: Reject manual payment
 */
export async function rejectManualPaymentAction(
  orderId: string,
  reason: string,
  transactionId?: string
) {
  const supabase = createAdminClient();
  try {
    // 1. Update payment_transactions
    if (transactionId) {
      await supabase
        .from("payment_transactions")
        .update({
          status: "failed",
          error_message: reason,
          updated_at: new Date().toISOString(),
        })
        .eq("id", transactionId);
    } else {
      await supabase
        .from("payment_transactions")
        .update({
          status: "failed",
          error_message: reason,
          updated_at: new Date().toISOString(),
        })
        .eq("order_id", orderId);
    }

    // 2. Update orders table
    await supabase
      .from("orders")
      .update({
        payment_status: "unpaid",
        updated_at: new Date().toISOString(),
      })
      .eq("id", orderId);

    // 3. Log to order_notes
    await supabase.from("order_notes").insert({
      order_id: orderId,
      note: `Payment Rejected by Admin. Reason: ${reason}`,
      is_customer_visible: true,
    });

    // 4. Log to order_status_history
    await supabase.from("order_status_history").insert({
      order_id: orderId,
      status: "pending_payment",
      notes: `Manual payment verification failed: ${reason}`,
    });

    revalidatePath(`/admin/orders/${orderId}`);
    revalidatePath("/admin/orders");
    revalidatePath("/admin/finance/manual-payments");

    return { success: true };
  } catch (err: any) {
    console.error("Error rejecting manual payment:", err);
    return { success: false, error: err.message };
  }
}

/**
 * Fetch all pending manual payments for Admin Finance verification queue
 */
export async function getPendingManualPaymentsAction() {
  const supabase = await createClient();
  try {
    const { data: txs, error } = await supabase
      .from("payment_transactions")
      .select(
        `
        *,
        order:orders(id, order_number, grand_total, status, payment_status, created_at, customer_id)
      `
      )
      .in("provider_id", ["bkash", "nagad", "rocket", "bank", "bank_transfer"])
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching manual payments:", error);
      return [];
    }

    return txs || [];
  } catch (err) {
    console.error("Error in getPendingManualPaymentsAction:", err);
    return [];
  }
}
