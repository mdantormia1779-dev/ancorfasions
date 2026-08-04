import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Plus, MoreHorizontal, Receipt } from "lucide-react";
import { Input } from "@/components/ui/input";
import { formatCurrency } from "@/lib/utils";

export const metadata = {
  title: "Expenses Management | Finance | Anchor Fashion Enterprise",
};

// Mock data for expenses since the database table is not yet implemented
const mockExpenses = [
  {
    id: "exp_1",
    date: "2026-08-01",
    category: "Marketing",
    description: "Facebook Ads Campaign - Summer Collection",
    amount: 1250.00,
    status: "paid",
    vendor: "Meta Platforms, Inc.",
  },
  {
    id: "exp_2",
    date: "2026-07-28",
    category: "Software",
    description: "Annual Subscription - ERP System",
    amount: 4500.00,
    status: "paid",
    vendor: "SAP",
  },
  {
    id: "exp_3",
    date: "2026-08-03",
    category: "Logistics",
    description: "International Shipping Fees",
    amount: 3200.50,
    status: "pending",
    vendor: "DHL Express",
  },
  {
    id: "exp_4",
    date: "2026-08-02",
    category: "Office Supplies",
    description: "Packaging Materials",
    amount: 850.75,
    status: "paid",
    vendor: "EcoPack Solutions",
  },
  {
    id: "exp_5",
    date: "2026-08-05",
    category: "Payroll",
    description: "Contractor Payments",
    amount: 2100.00,
    status: "scheduled",
    vendor: "Various Contractors",
  },
];

export default function ExpensesManagementPage() {
  return (
    <div className="space-y-6 p-8 pt-6">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Expenses</h1>
          <p className="mt-1 text-muted-foreground">
            Manage operational costs and outgoing payments.
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Expense
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <Input
          placeholder="Search expenses by vendor or description..."
          className="max-w-md bg-card"
        />
        <Button variant="outline">Filter</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Expenses</CardTitle>
          <CardDescription>
            Showing mock data (database integration pending).
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="w-1/3">Description / Vendor</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockExpenses.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="h-32 text-center text-muted-foreground"
                    >
                      No expenses found.
                    </TableCell>
                  </TableRow>
                ) : (
                  mockExpenses.map((expense) => (
                    <TableRow key={expense.id}>
                      <TableCell className="font-medium text-muted-foreground">
                        {new Date(expense.date).toLocaleDateString("en-US")}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-slate-50 text-slate-700">
                          {expense.category}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium text-sm">{expense.description}</div>
                        <div className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                          <Receipt className="h-3 w-3" /> {expense.vendor}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                        {formatCurrency(expense.amount)}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            expense.status === "paid"
                              ? "default"
                              : expense.status === "pending"
                              ? "secondary"
                              : "outline"
                          }
                          className={
                            expense.status === "paid"
                              ? "bg-emerald-600 hover:bg-emerald-700"
                              : ""
                          }
                        >
                          {expense.status.toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
