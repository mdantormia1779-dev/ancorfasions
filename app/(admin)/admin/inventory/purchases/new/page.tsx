"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  createProcurementOrder, 
  getSupplierProfiles, 
  getWarehouses,
  getVariants
} from "@/app/actions/admin/procurement.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

export default function NewPurchaseOrderPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [variants, setVariants] = useState<any[]>([]);
  
  const [items, setItems] = useState([{ variant_id: "", quantity_ordered: 1, unit_cost: 0 }]);

  useEffect(() => {
    async function fetchData() {
      const [suppliersRes, warehousesRes, variantsRes] = await Promise.all([
        getSupplierProfiles(),
        getWarehouses(),
        getVariants()
      ]);
      if (suppliersRes.success && suppliersRes.data) setSuppliers(suppliersRes.data);
      if (warehousesRes.success && warehousesRes.data) setWarehouses(warehousesRes.data);
      if (variantsRes.success && variantsRes.data) setVariants(variantsRes.data);
    }
    fetchData();
  }, []);

  const handleAddItem = () => {
    setItems([...items, { variant_id: "", quantity_ordered: 1, unit_cost: 0 }]);
  };

  const handleRemoveItem = (index: number) => {
    const newItems = [...items];
    newItems.splice(index, 1);
    setItems(newItems);
  };

  const handleItemChange = (index: number, field: string, value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    
    // Auto fill unit cost if variant is selected
    if (field === "variant_id") {
      const selectedVariant = variants.find(v => v.id === value);
      if (selectedVariant && selectedVariant.price) {
        newItems[index].unit_cost = selectedVariant.price * 0.6; // Assuming cost is 60% of retail price
      }
    }
    
    setItems(newItems);
  };

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const supplier_id = formData.get("supplier_id") as string;
    const destination_warehouse_id = formData.get("destination_warehouse_id") as string;
    
    if (!supplier_id) {
      toast.error("Please select a supplier. If none are available, please add one first.");
      setLoading(false);
      return;
    }
    if (!destination_warehouse_id) {
      toast.error("Please select a destination warehouse.");
      setLoading(false);
      return;
    }

    // Filter out invalid items
    const validItems = items.filter(i => i.variant_id.trim() !== "" && i.quantity_ordered > 0);
    
    if (validItems.length === 0) {
      toast.error("Please add at least one valid item with a selected product and quantity to the order.");
      setLoading(false);
      return;
    }

    const totalAmount = validItems.reduce((acc, item) => acc + (item.quantity_ordered * item.unit_cost), 0);
    const expectedDelivery = formData.get("expected_delivery_date") as string;

    const poData = {
      po_number: `PO-${Date.now().toString().slice(-6)}`,
      supplier_id,
      destination_warehouse_id,
      total_amount: totalAmount,
      expected_delivery_date: expectedDelivery || undefined
    };

    const res = await createProcurementOrder(poData, validItems);
    setLoading(false);

    if (res.success) {
      toast.success("Purchase Order created successfully");
      router.push("/admin/inventory/purchases");
    } else {
      toast.error(res.error || "Failed to create PO");
    }
  }

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto w-full pb-20">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/inventory/purchases">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">New Purchase Order</h1>
          <p className="text-muted-foreground">Draft a new procurement order for your suppliers.</p>
        </div>
      </div>

      <form onSubmit={onSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Order Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="supplier_id">Supplier <span className="text-destructive">*</span></Label>
                {suppliers.length > 0 ? (
                  <Select name="supplier_id" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select supplier..." />
                    </SelectTrigger>
                    <SelectContent>
                      {suppliers.map(s => (
                        <SelectItem key={s.id} value={s.id}>{s.company_name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <div className="text-sm text-muted-foreground border border-dashed rounded-md p-3 text-center">
                    No suppliers found. <br />
                    <Link href="/admin/inventory/suppliers" className="text-primary hover:underline font-medium">Add Supplier</Link>
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="destination_warehouse_id">Destination Warehouse <span className="text-destructive">*</span></Label>
                <Select name="destination_warehouse_id" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select warehouse..." />
                  </SelectTrigger>
                  <SelectContent>
                    {warehouses.map(w => (
                      <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="expected_delivery_date">Expected Delivery Date</Label>
              <Input id="expected_delivery_date" name="expected_delivery_date" type="date" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Order Items</CardTitle>
            <Button type="button" variant="outline" size="sm" onClick={handleAddItem}>
              <Plus className="mr-2 h-4 w-4" />
              Add Item
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {items.map((item, index) => (
              <div key={index} className="flex flex-col md:flex-row gap-4 items-start md:items-end p-4 border rounded-md relative">
                <div className="space-y-2 flex-1 w-full">
                  <Label>Product Variant</Label>
                  <Select 
                    value={item.variant_id}
                    onValueChange={(val) => handleItemChange(index, "variant_id", val)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a product variant..." />
                    </SelectTrigger>
                    <SelectContent>
                      {variants.map(v => (
                        <SelectItem key={v.id} value={v.id}>
                          {v.name} ({v.sku})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2 w-full md:w-32">
                  <Label>Quantity</Label>
                  <Input 
                    type="number" 
                    required 
                    min="1" 
                    value={item.quantity_ordered}
                    onChange={(e) => handleItemChange(index, "quantity_ordered", parseInt(e.target.value))}
                  />
                </div>
                <div className="space-y-2 w-full md:w-32">
                  <Label>Unit Cost (BDT)</Label>
                  <Input 
                    type="number" 
                    required 
                    min="0" 
                    step="0.01" 
                    value={item.unit_cost}
                    onChange={(e) => handleItemChange(index, "unit_cost", parseFloat(e.target.value))}
                  />
                </div>
                {items.length > 1 && (
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="icon" 
                    className="text-destructive md:mb-0.5 absolute top-2 right-2 md:relative md:top-0 md:right-0"
                    onClick={() => handleRemoveItem(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="flex justify-end gap-2">
          <Button variant="outline" type="button" asChild>
            <Link href="/admin/inventory/purchases">Cancel</Link>
          </Button>
          <Button type="submit" disabled={loading || suppliers.length === 0}>
            {loading ? "Creating..." : "Create Purchase Order"}
          </Button>
        </div>
      </form>
    </div>
  );
}
