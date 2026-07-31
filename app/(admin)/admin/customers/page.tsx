import {
  Users,
  UserPlus,
  Activity,
  Trophy,
  ArrowUpRight,
  ArrowDownRight,
  Search,
  Filter,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CustomerSegmentsTable } from "@/features/crm/components/CustomerSegmentsTable";
import { CustomersList } from "@/features/crm/components/CustomersList";
import { LoyaltyTiers } from "@/features/crm/components/LoyaltyTiers";
import {
  fetchCustomersAction,
  fetchCustomerSegmentsAction,
  fetchLoyaltyStatsAction,
  fetchCRMSummaryAction,
} from "@/app/actions/crm/customer.actions";

export default async function CRMDashboardPage() {
  const [customersRes, segmentsRes, loyaltyRes, summaryRes] = await Promise.all(
    [
      fetchCustomersAction(),
      fetchCustomerSegmentsAction(),
      fetchLoyaltyStatsAction(),
      fetchCRMSummaryAction(),
    ]
  );

  const summary = summaryRes.data;

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Customer Relationship Management
          </h1>
          <p className="mt-1 text-muted-foreground">
            Manage your customers, segments, and loyalty programs.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Filter className="mr-2 h-4 w-4" />
            Filters
          </Button>
          <Button>Export Data</Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Customers
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {summary.totalCustomers.toLocaleString()}
            </div>
            <p className="mt-1 flex items-center text-xs text-emerald-500 text-muted-foreground">
              <ArrowUpRight className="mr-1 h-3 w-3" />
              Real-time DB Sync
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              New Customers (30d)
            </CardTitle>
            <UserPlus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {summary.newCustomers.toLocaleString()}
            </div>
            <p className="mt-1 flex items-center text-xs text-emerald-500 text-muted-foreground">
              <ArrowUpRight className="mr-1 h-3 w-3" />
              Real-time DB Sync
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Avg Lifetime Value
            </CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${summary.avgLifetimeValue.toLocaleString()}
            </div>
            <p className="mt-1 flex items-center text-xs text-muted-foreground">
              Estimated Value
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Loyalty Members
            </CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {summary.loyaltyMembers.toLocaleString()}
            </div>
            <p className="mt-1 flex items-center text-xs text-emerald-500 text-muted-foreground">
              <ArrowUpRight className="mr-1 h-3 w-3" />
              Real-time DB Sync
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search customers by name, email, or ID..."
            className="bg-background pl-8"
          />
        </div>
      </div>

      <Tabs defaultValue="customers" className="space-y-4">
        <TabsList>
          <TabsTrigger value="customers">All Customers</TabsTrigger>
          <TabsTrigger value="segments">Segments</TabsTrigger>
          <TabsTrigger value="loyalty">Loyalty & Tiers</TabsTrigger>
        </TabsList>
        <TabsContent value="customers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Customer Directory</CardTitle>
              <CardDescription>
                View and manage all customer profiles and histories.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CustomersList customers={customersRes.data || []} />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="segments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Dynamic Segmentation</CardTitle>
              <CardDescription>
                Manage AI-driven and rule-based customer segments.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CustomerSegmentsTable segments={segmentsRes.data || []} />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="loyalty" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Loyalty Program</CardTitle>
              <CardDescription>
                Configure tiers, point multipliers, and VIP benefits.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <LoyaltyTiers tiers={loyaltyRes.data || []} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
