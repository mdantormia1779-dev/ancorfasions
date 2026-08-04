import { Metadata } from "next";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Shield, Settings, Check, X } from "lucide-react";

export const metadata: Metadata = {
  title: "Roles & Permissions | Anchor Fashion",
};

const roles = [
  {
    id: "super-admin",
    name: "Super Admin",
    description: "Full access to all modules and system settings.",
    usersCount: 2,
    permissions: {
      sales: true,
      inventory: true,
      marketing: true,
      users: true,
      settings: true,
    },
  },
  {
    id: "admin",
    name: "System Admin",
    description: "Access to most operational modules, restricted settings.",
    usersCount: 5,
    permissions: {
      sales: true,
      inventory: true,
      marketing: true,
      users: true,
      settings: false,
    },
  },
  {
    id: "finance",
    name: "Finance Manager",
    description: "Access to sales, reports, and expenses only.",
    usersCount: 3,
    permissions: {
      sales: true,
      inventory: false,
      marketing: false,
      users: false,
      settings: false,
    },
  },
  {
    id: "marketing",
    name: "Marketing Manager",
    description: "Access to promotions, newsletters, and CMS.",
    usersCount: 4,
    permissions: {
      sales: false,
      inventory: false,
      marketing: true,
      users: false,
      settings: false,
    },
  },
];

export default function PermissionsPage() {
  return (
    <div className="space-y-6 p-8 pt-6">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Roles & Permissions</h1>
          <p className="text-muted-foreground">
            Define access control policies and manage role permissions.
          </p>
        </div>
        <Button>
          <Shield className="mr-2 h-4 w-4" />
          Create Role
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Role-Based Access Control</CardTitle>
          <CardDescription>
            Overview of standard roles and their module-level access.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-1/4">Role</TableHead>
                  <TableHead className="text-center">Sales & Finance</TableHead>
                  <TableHead className="text-center">Inventory</TableHead>
                  <TableHead className="text-center">Marketing & CMS</TableHead>
                  <TableHead className="text-center">Users</TableHead>
                  <TableHead className="text-center">Sys Settings</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {roles.map((role) => (
                  <TableRow key={role.id}>
                    <TableCell>
                      <div className="font-medium">{role.name}</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {role.usersCount} users assigned
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      {role.permissions.sales ? (
                        <Check className="mx-auto h-4 w-4 text-emerald-500" />
                      ) : (
                        <X className="mx-auto h-4 w-4 text-muted-foreground/30" />
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      {role.permissions.inventory ? (
                        <Check className="mx-auto h-4 w-4 text-emerald-500" />
                      ) : (
                        <X className="mx-auto h-4 w-4 text-muted-foreground/30" />
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      {role.permissions.marketing ? (
                        <Check className="mx-auto h-4 w-4 text-emerald-500" />
                      ) : (
                        <X className="mx-auto h-4 w-4 text-muted-foreground/30" />
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      {role.permissions.users ? (
                        <Check className="mx-auto h-4 w-4 text-emerald-500" />
                      ) : (
                        <X className="mx-auto h-4 w-4 text-muted-foreground/30" />
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      {role.permissions.settings ? (
                        <Check className="mx-auto h-4 w-4 text-emerald-500" />
                      ) : (
                        <X className="mx-auto h-4 w-4 text-muted-foreground/30" />
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon">
                        <Settings className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
