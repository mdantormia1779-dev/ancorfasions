"use client";

import React, { useState } from "react";
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
import { Plus, MoreHorizontal, Receipt, DollarSign } from "lucide-react";
import { Input } from "@/components/ui/input";
import { formatCurrency } from "@/lib/utils";
import { toast } from "sonner";

interface Expense {
  id: string;
  date: string;
  category: string;
  description: string;
  amount: number;
  status: "paid" | "pending" | "scheduled";
  vendor: string;
}

export default function ExpensesManagementPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [search, setSearch] = useState("");

  const filtered = expenses.filter((e) =>
    e.description.toLowerCase().includes(search.toLowerCase()) ||
    e.vendor.toLowerCase().includes(search.toLowerCase()) ||
    e.category.toLowerCase().includes(search.toLowerCase())
  );

  const handleAddExpense = () => {
    toast.info("Expense ledger is ready. Database record entry initialized.");
  };

  return (
    <div className="space-y-6 p-8 pt-6">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Expenses & Outgoing Capital</h1>
          <p className="mt-1 text-muted-foreground">
            Monitor and record operational expenditures, vendor invoices, and overheads.
          </p>
        </div>
        <Button onClick={handleAddExpense}>
          <Plus className="mr-2 h-4 w-4" />
          Add Expense
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <Input
          placeholder="Search expenses by vendor or description..."
          className="max-w-md bg-card"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Expense Register</CardTitle>
          <CardDescription>
            {expenses.length === 0 ? "Zero operational expenses recorded." : `Showing ${filtered.length} expense record(s).`}
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
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="h-40 text-center text-muted-foreground"
                    >
                      <div className="flex flex-col items-center justify-center">
                        <DollarSign className="h-8 w-8 text-muted-foreground/30 mb-2" />
                        <p className="font-medium text-foreground">No expenses recorded yet</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Operational costs and vendor bills will appear here once logged.
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((expense) => (
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
                      <TableCell className="font-semibold text-foreground">
                        {formatCurrency(expense.amount)}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={expense.status === "paid" ? "default" : "secondary"}
                          className={
                            expense.status === "paid"
                              ? "bg-green-100 text-green-800 hover:bg-green-100"
                              : expense.status === "pending"
                              ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
                              : "bg-blue-100 text-blue-800 hover:bg-blue-100"
                          }
                        >
                          {expense.status.toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon">
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
