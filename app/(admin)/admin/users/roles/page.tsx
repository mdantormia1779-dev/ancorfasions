"use client";

import { useEffect, useState } from "react";
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
import { Shield, Settings, Check, X } from "lucide-react";
import { fetchRolesAction, toggleRolePermissionAction } from "@/app/actions/admin/roles.actions";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function PermissionsPage() {
  const [roles, setRoles] = useState<any[]>([]);
  const [permissions, setPermissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    const res = await fetchRolesAction();
    if (res.success) {
      setRoles(res.data || []);
      setPermissions(res.allPermissions || []);
    } else {
      toast.error(res.error || "Failed to load roles");
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const togglePermission = async (roleId: string, permissionId: string, currentStatus: boolean) => {
    const res = await toggleRolePermissionAction(roleId, permissionId, !currentStatus);
    if (res.success) {
      toast.success("Permission updated successfully");
      loadData(); // Reload to get fresh state
    } else {
      toast.error(res.error || "Action failed");
    }
  };

  return (
    <div className="space-y-6 p-8 pt-6">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Roles & Permissions</h1>
          <p className="text-muted-foreground">
            Securely define access control policies and manage role permissions.
          </p>
        </div>
        <Button onClick={() => toast.info("Create Role modal coming soon")}>
          <Shield className="mr-2 h-4 w-4" />
          Create Role
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Role-Based Access Control</CardTitle>
          <CardDescription>
            Live database overview of roles and their granular access permissions.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[200px]">Role</TableHead>
                  {permissions.map((p) => (
                    <TableHead key={p.id} className="text-center whitespace-nowrap px-4" title={p.description}>
                      {p.action.replace(/_/g, " ")}
                    </TableHead>
                  ))}
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={permissions.length + 2} className="text-center py-8 text-muted-foreground">
                      Loading secure role data...
                    </TableCell>
                  </TableRow>
                ) : roles.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={permissions.length + 2} className="text-center py-8 text-muted-foreground">
                      No roles found.
                    </TableCell>
                  </TableRow>
                ) : (
                  roles.map((role) => (
                    <TableRow key={role.id}>
                      <TableCell>
                        <div className="font-medium">{role.name}</div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {role.usersCount} users assigned
                        </div>
                      </TableCell>
                      {permissions.map((p) => {
                        const hasPerm = !!role.permissions[p.action];
                        return (
                          <TableCell key={p.id} className="text-center">
                            <button
                              onClick={() => togglePermission(role.id, p.id, hasPerm)}
                              className="rounded-full p-2 hover:bg-slate-100 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-300"
                              title={`Toggle ${p.action} for ${role.name}`}
                            >
                              {hasPerm ? (
                                <Check className="mx-auto h-4 w-4 text-emerald-500" />
                              ) : (
                                <X className="mx-auto h-4 w-4 text-muted-foreground/30" />
                              )}
                            </button>
                          </TableCell>
                        );
                      })}
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger className="flex h-8 w-8 items-center justify-center rounded-md hover:bg-accent hover:text-accent-foreground outline-none ml-auto">
                            <Settings className="h-4 w-4" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => toast.info("Edit Role coming soon")}>
                              Edit Role
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => toast.error("Cannot delete system roles")}>
                              Delete Role
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
        </CardContent>
      </Card>
    </div>
  );
}
