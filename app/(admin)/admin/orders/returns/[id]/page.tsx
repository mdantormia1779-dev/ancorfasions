"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { 
  useReturnDetail, 
  useApproveReturn, 
  useRejectReturn, 
  useMarkReturnReceived, 
  useSyncReturnInventory, 
  useCompleteReturn, 
  useProcessReturnRefund 
} from "@/hooks/shipping/use-returns";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";
import Image from "next/image";

export default function AdminReturnDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { data: returnReq, isLoading, error } = useReturnDetail(id);

  const approveReturn = useApproveReturn();
  const rejectReturn = useRejectReturn();
  const markReceived = useMarkReturnReceived();
  const syncInventory = useSyncReturnInventory();
  const completeReturn = useCompleteReturn();
  const processRefund = useProcessReturnRefund();

  const [isProcessing, setIsProcessing] = useState(false);

  if (isLoading) return <div className="p-6">Loading return details...</div>;
  if (error || !returnReq) return <div className="p-6 text-red-500">Error loading return details</div>;

  const handleAction = async (actionFn: any, payload?: any, successMessage = "Action completed") => {
    setIsProcessing(true);
    try {
      await actionFn.mutateAsync(payload ?? id);
      toast.success(successMessage);
    } catch (err: any) {
      toast.error(err.message || "Action failed");
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "requested": return <Badge variant="secondary">Requested</Badge>;
      case "approved": return <Badge variant="default">Approved</Badge>;
      case "rejected": return <Badge variant="destructive">Rejected</Badge>;
      case "received": return <Badge variant="outline">Received</Badge>;
      case "inventory_synced": return <Badge variant="outline">Inventory Synced</Badge>;
      case "completed": return <Badge variant="outline" className="bg-green-100 text-green-800">Completed</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6 p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Return #{returnReq.return_number}</h1>
          <p className="text-muted-foreground mt-1">
            Order: {returnReq.order_id} • Created: {new Date(returnReq.created_at).toLocaleString()}
          </p>
        </div>
        <div>{getStatusBadge(returnReq.status)}</div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Return Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {returnReq.items?.map((item: any) => (
                  <div key={item.id} className="flex justify-between items-center p-4 border rounded-lg bg-gray-50/50">
                    <div>
                      <p className="font-medium">{item.product_name}</p>
                      <p className="text-sm text-muted-foreground">SKU: {item.sku} • Qty: {item.quantity}</p>
                      <p className="text-sm text-muted-foreground mt-1">Condition: <span className="capitalize">{item.condition}</span></p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">৳{item.refund_amount?.toFixed(2) || "0.00"}</p>
                      {item.restocked && <Badge variant="outline" className="mt-2 text-xs">Restocked</Badge>}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {returnReq.photo_urls && returnReq.photo_urls.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Photo Proof</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4 overflow-x-auto pb-4">
                  {returnReq.photo_urls.map((url: string, idx: number) => (
                    <div key={idx} className="relative w-48 h-48 flex-shrink-0 border rounded-lg overflow-hidden">
                      <Image src={url} alt={`Proof ${idx + 1}`} fill className="object-cover" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Customer Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-muted p-4 rounded-md text-sm whitespace-pre-wrap">
                {returnReq.customer_note || returnReq.notes || "No notes provided."}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
              <CardDescription>Progress the return lifecycle.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {returnReq.status === "requested" && (
                <>
                  <Button 
                    className="w-full" 
                    disabled={isProcessing}
                    onClick={() => handleAction(approveReturn, id, "Return approved")}
                  >
                    Approve Request
                  </Button>
                  <Button 
                    className="w-full" 
                    variant="destructive"
                    disabled={isProcessing}
                    onClick={() => {
                      const reason = window.prompt("Rejection reason:");
                      if (reason) handleAction(rejectReturn, { returnId: id, reason }, "Return rejected");
                    }}
                  >
                    Reject Request
                  </Button>
                </>
              )}

              {(returnReq.status === "approved" || returnReq.status === "picked_up" || returnReq.status === "in_transit") && (
                <Button 
                  className="w-full" 
                  disabled={isProcessing}
                  onClick={() => handleAction(markReceived, id, "Return marked as received")}
                >
                  Mark Received at Warehouse
                </Button>
              )}

              {returnReq.status === "received" && (
                <Button 
                  className="w-full" 
                  disabled={isProcessing}
                  onClick={() => {
                    // In a real flow, you'd have a modal to select condition for each item. 
                    // For simplicity, we just pass an empty obj to use existing item conditions.
                    handleAction(syncInventory, id, "Inventory synced");
                  }}
                >
                  Inspect & Sync Inventory
                </Button>
              )}

              {(returnReq.status === "inventory_synced" || (returnReq.status !== "completed" && returnReq.refund_status !== "PROCESSED" && returnReq.status !== "requested" && returnReq.status !== "rejected" && returnReq.status !== "cancelled")) && (
                <Button 
                  className="w-full" 
                  variant="outline"
                  disabled={isProcessing}
                  onClick={() => handleAction(processRefund, id, "Refund processed")}
                >
                  Process Refund (৳{returnReq.refund_amount})
                </Button>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Financials</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between text-sm">
                <span>Requested Refund:</span>
                <span className="font-medium">৳{returnReq.refund_amount?.toFixed(2) || "0.00"}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Refund Method:</span>
                <span className="font-medium capitalize">{returnReq.refund_method?.replace("_", " ")}</span>
              </div>
              <Separator />
              <div className="flex flex-col gap-2">
                <span className="text-sm text-muted-foreground">Status:</span>
                {returnReq.refund_status === "PROCESSED" ? (
                  <Badge variant="outline" className="bg-green-100 text-green-800 w-max">Processed</Badge>
                ) : returnReq.refund_status === "PENDING" ? (
                  <Badge variant="secondary" className="w-max">Pending</Badge>
                ) : (
                  <Badge variant="outline" className="w-max">{returnReq.refund_status || "Not Started"}</Badge>
                )}
              </div>
              {returnReq.internal_note && (
                <div className="mt-4 p-3 bg-gray-50 border rounded text-xs text-muted-foreground">
                  <strong>System Note:</strong><br/>
                  {returnReq.internal_note}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
