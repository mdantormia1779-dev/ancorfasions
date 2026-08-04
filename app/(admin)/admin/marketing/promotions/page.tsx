import { Search, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { PromotionRepository } from "@/lib/repositories/marketing/promotion.repository";

export const metadata = {
  title: "Promotions | Marketing | Anchor Fashion Enterprise",
};

export default async function AdminPromotionsPage() {
  const promotions = await PromotionRepository.getPromotions();

  return (
    <div className="flex flex-col gap-6 p-8 pt-6">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Promotions</h1>
          <p className="text-muted-foreground">
            Manage discount campaigns and sales events.
          </p>
        </div>
        <div className="flex gap-2">
          <Button>
            <Plus className="mr-2 h-4 w-4" /> Create Promotion
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative w-full md:w-64">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search promotions..."
            className="pl-8 bg-card"
          />
        </div>
      </div>

      <div className="rounded-md border bg-card text-card-foreground">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Promotion Name</TableHead>
              <TableHead className="text-right">Discount</TableHead>
              <TableHead>Start Date</TableHead>
              <TableHead>End Date</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {promotions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                  <div className="flex flex-col items-center justify-center gap-1">
                    <p>No promotions created yet.</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              promotions.map((promo: any) => {
                const now = new Date();
                const start = new Date(promo.start_date);
                const end = new Date(promo.end_date);
                const isUpcoming = now < start;
                const isExpired = now > end;
                const isActive = promo.is_active && !isUpcoming && !isExpired;

                return (
                  <TableRow key={promo.id}>
                    <TableCell className="font-medium">{promo.name}</TableCell>
                    <TableCell className="text-right">{promo.discount_percentage}%</TableCell>
                    <TableCell className="text-muted-foreground">
                      {start.toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {end.toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {isActive ? (
                        <Badge variant="default" className="bg-emerald-600 hover:bg-emerald-700">Active</Badge>
                      ) : isUpcoming ? (
                        <Badge variant="secondary">Upcoming</Badge>
                      ) : (
                        <Badge variant="outline">Expired</Badge>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
