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

export type CustomerLifecycleStage = 'PROSPECT' | 'FIRST_TIME_BUYER' | 'REPEAT_CUSTOMER' | 'LOYAL' | 'AT_RISK' | 'CHURNED';

export interface CrmCustomer {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  is_vip: boolean;
  customer_lifecycle_stage: CustomerLifecycleStage;
  health_score: number;
  total_support_tickets: number;
  last_interaction_at: string;
}

interface CustomersListProps {
  customers?: CrmCustomer[];
}

export const CustomersList = ({ customers = [] }: CustomersListProps) => {
  return (
    <div className="rounded-md border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Customer</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Lifecycle Stage</TableHead>
            <TableHead className="text-right">Health Score</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {customers.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="text-center py-6 text-muted-foreground">
                No customers found.
              </TableCell>
            </TableRow>
          ) : (
            customers.map((customer) => (
              <TableRow key={customer.id}>
                <TableCell>
                  <div className="font-medium">{customer.first_name} {customer.last_name}</div>
                  <div className="text-sm text-muted-foreground">{customer.email}</div>
                </TableCell>
                <TableCell>
                  {customer.is_vip ? (
                    <Badge variant="default" className="bg-amber-500 hover:bg-amber-600">VIP</Badge>
                  ) : (
                    <Badge variant="outline">Standard</Badge>
                  )}
                </TableCell>
                <TableCell>
                  <Badge variant="secondary" className="capitalize">
                    {customer.customer_lifecycle_stage.replace(/_/g, ' ').toLowerCase()}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <span className={`font-semibold ${customer.health_score > 75 ? 'text-green-600' : customer.health_score < 50 ? 'text-red-600' : 'text-yellow-600'}`}>
                    {customer.health_score}/100
                  </span>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};
