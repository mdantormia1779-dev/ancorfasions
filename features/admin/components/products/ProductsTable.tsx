"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  MoreHorizontal, 
  Plus, 
  Search, 
  Copy, 
  Trash2, 
  Edit2, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  AlertCircle
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Product } from "@/types/catalog.types";
import { 
  deleteAdminProductAction, 
  duplicateAdminProductAction, 
  bulkUpdateProductStatusAction,
  bulkDeleteProductsAction
} from "@/lib/actions/admin/products.actions";

export function ProductsTable({ 
  initialProducts, 
  totalCount 
}: { 
  initialProducts: Product[];
  totalCount: number;
}) {
  const router = useRouter();
  const [products, setProducts] = useState(initialProducts);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [isDuplicating, setIsDuplicating] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const formatCurrency = (val: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(products.map(p => p.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedIds(prev => [...prev, id]);
    } else {
      setSelectedIds(prev => prev.filter(selectedId => selectedId !== id));
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    setIsDeleting(id);
    const res = await deleteAdminProductAction({ id });
    if (res.success) {
      toast.success("Product deleted successfully");
      setProducts(prev => prev.filter(p => p.id !== id));
    } else {
      toast.error(res.error || "Failed to delete product");
    }
    setIsDeleting(null);
  };

  const handleDuplicate = async (id: string) => {
    setIsDuplicating(id);
    const res = await duplicateAdminProductAction({ id });
    if (res.success && res.data) {
      toast.success("Product duplicated");
      router.push(`/admin/products/${res.data.id}/edit`);
    } else {
      toast.error(res.error || "Failed to duplicate product");
      setIsDuplicating(null);
    }
  };

  const handleBulkAction = async (action: 'publish' | 'archive' | 'delete') => {
    if (selectedIds.length === 0) return;
    
    if (action === 'delete') {
      if (!confirm(`Are you sure you want to delete ${selectedIds.length} products?`)) return;
      const res = await bulkDeleteProductsAction({ ids: selectedIds });
      if (res.success) {
        toast.success(`Deleted ${res.data?.count} products`);
        setProducts(prev => prev.filter(p => !selectedIds.includes(p.id)));
        setSelectedIds([]);
      } else {
        toast.error(res.error || "Failed to delete products");
      }
    } else {
      const status = action === 'publish' ? 'ACTIVE' : 'ARCHIVED';
      const res = await bulkUpdateProductStatusAction({ ids: selectedIds, status });
      if (res.success) {
        toast.success(`Updated ${res.data?.count} products`);
        setProducts(prev => prev.map(p => selectedIds.includes(p.id) ? { ...p, status } : p));
        setSelectedIds([]);
      } else {
        toast.error(res.error || "Failed to update products");
      }
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              type="search"
              placeholder="Search products..."
              className="w-full pl-9 bg-white"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  router.push(`/admin/products?search=${encodeURIComponent(searchQuery)}`);
                }
              }}
            />
          </div>
          {searchQuery && (
            <Button variant="ghost" onClick={() => { setSearchQuery(""); router.push("/admin/products"); }}>
              Clear
            </Button>
          )}
        </div>
        <div className="flex items-center gap-2">
          {selectedIds.length > 0 ? (
            <>
              <span className="text-sm text-slate-500 mr-2">{selectedIds.length} selected</span>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">Bulk Actions</Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => handleBulkAction('publish')}>
                    <CheckCircle2 className="mr-2 h-4 w-4 text-emerald-500" /> Publish Selected
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleBulkAction('archive')}>
                    <EyeOff className="mr-2 h-4 w-4 text-amber-500" /> Archive Selected
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => handleBulkAction('delete')} className="text-red-600">
                    <Trash2 className="mr-2 h-4 w-4" /> Delete Selected
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <Link href="/admin/products/new">
              <Button className="bg-slate-900 text-white hover:bg-slate-800">
                <Plus className="mr-2 h-4 w-4" /> Add Product
              </Button>
            </Link>
          )}
        </div>
      </div>

      <div className="rounded-md border border-slate-200 bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12 pl-4">
                <Checkbox 
                  checked={selectedIds.length > 0 && selectedIds.length === products.length}
                  onCheckedChange={handleSelectAll}
                />
              </TableHead>
              <TableHead>Product</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Inventory</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Category</TableHead>
              <TableHead className="text-right pr-4">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  No products found.
                </TableCell>
              </TableRow>
            ) : (
              products.map((product) => (
                <TableRow key={product.id}>
                  <TableCell className="pl-4">
                    <Checkbox 
                      checked={selectedIds.includes(product.id)}
                      onCheckedChange={(checked) => handleSelectOne(product.id, checked as boolean)}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium text-slate-900">{product.name}</span>
                      <span className="text-xs text-slate-500">SKU: {product.sku || 'N/A'}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {product.status === 'ACTIVE' && <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">Active</Badge>}
                    {product.status === 'DRAFT' && <Badge variant="outline" className="bg-slate-100 text-slate-700 border-slate-200">Draft</Badge>}
                    {product.status === 'ARCHIVED' && <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">Archived</Badge>}
                  </TableCell>
                  <TableCell>
                    {/* Assuming we calculate total inventory from variants, or just placeholder for now */}
                    <span className="text-sm text-slate-600">Tracked</span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm font-medium text-slate-900">{formatCurrency(product.basePrice)}</span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-slate-600">{(product as any).category?.name || 'Uncategorized'}</span>
                  </TableCell>
                  <TableCell className="text-right pr-4">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/admin/products/${product.id}/edit`}>
                            <Edit2 className="mr-2 h-4 w-4" /> Edit
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <a href={`/products/${product.slug}`} target="_blank" rel="noopener noreferrer">
                            <Eye className="mr-2 h-4 w-4" /> View in Store
                          </a>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDuplicate(product.id)} disabled={isDuplicating === product.id}>
                          <Copy className="mr-2 h-4 w-4" /> Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleDelete(product.id)} disabled={isDeleting === product.id} className="text-red-600 focus:text-red-600">
                          <Trash2 className="mr-2 h-4 w-4" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      <div className="text-xs text-slate-500 text-center">
        Showing {products.length} of {totalCount} products
      </div>
    </div>
  );
}
