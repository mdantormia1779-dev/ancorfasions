import React from "react";
import { getLeadsAction } from "@/actions/crm.actions";
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
import { Plus, MoreHorizontal, Mail, Phone } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";

export const metadata = {
  title: "Leads Management | CRM | Anchor Fashion Enterprise",
};

export default async function LeadsManagementPage() {
  const { data: leads, error } = await getLeadsAction();

  if (error) {
    return <div className="p-8 text-red-500">Failed to load leads: {error}</div>;
  }

  return (
    <div className="space-y-6 p-8 pt-6">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Leads</h1>
          <p className="mt-1 text-muted-foreground">
            Track and convert prospective customers.
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Lead
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <Input
          placeholder="Search leads by name, email, or company..."
          className="max-w-md bg-card"
        />
        <Button variant="outline">Filter</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Leads</CardTitle>
          <CardDescription>
            Showing {leads?.length || 0} active and historical leads.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Contact Info</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Last Updated</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {!leads || leads.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="h-32 text-center text-muted-foreground"
                    >
                      No leads found. Add a lead to get started.
                    </TableCell>
                  </TableRow>
                ) : (
                  leads.map((lead: any) => (
                    <TableRow key={lead.id}>
                      <TableCell className="font-medium">
                        {lead.first_name} {lead.last_name}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1 text-xs text-muted-foreground">
                          {lead.email && (
                            <span className="flex items-center gap-1">
                              <Mail className="h-3 w-3" /> {lead.email}
                            </span>
                          )}
                          {lead.phone && (
                            <span className="flex items-center gap-1">
                              <Phone className="h-3 w-3" /> {lead.phone}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{lead.company_name || "-"}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            lead.status === "new"
                              ? "default"
                              : lead.status === "contacted"
                              ? "secondary"
                              : lead.status === "qualified"
                              ? "outline"
                              : lead.status === "converted"
                              ? "default"
                              : "destructive"
                          }
                          className={
                            lead.status === "converted"
                              ? "bg-emerald-600 hover:bg-emerald-700"
                              : ""
                          }
                        >
                          {lead.status.toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground capitalize">
                        {lead.source || "Direct"}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(lead.updated_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger render={
                            <Button variant="ghost" className="h-8 w-8 p-0" />
                          }>
                              <span className="sr-only">Open menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem render={
                              <Link href={`/admin/crm/leads/${lead.id}`} />
                            }>
                                View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem>Log Communication</DropdownMenuItem>
                            {lead.status !== "converted" && (
                              <DropdownMenuItem className="text-emerald-600">
                                Convert to Customer
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
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
